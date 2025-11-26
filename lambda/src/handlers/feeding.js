/**
 * Feeding registration handlers for the Baby Milk Tracker skill
 * Handles breastfeeding, bottle with human milk, and bottle with formula
 */

const { appendFeeding, getLastFeeding, updateLastFeeding } = require('../utils/sheets');
const { getDeviceTimezone, formatTimeInTimezone } = require('../utils/timezone');
const { getUserContext } = require('../utils/accountLinking');
const { scheduleNextFeedingReminder, shouldAskForPermission, markPermissionAsked, hasReminderPermission } = require('../utils/reminders');
const { getUserData } = require('../utils/dynamodb');
const logger = require('../utils/logger');

// ===== BREASTFEEDING =====

const RegisterBreastfeedingIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'RegistrarTomaDePechoIntent';
  },
  handle(handlerInput) {
    const { t } = handlerInput.attributesManager.getRequestAttributes();

    // Store intent in session for confirmation
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    sessionAttributes.pendingIntent = 'BREASTFEEDING';
    handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

    return handlerInput.responseBuilder
      .speak(t('BREASTFEEDING_CONFIRM'))
      .reprompt(t('BREASTFEEDING_CONFIRM'))
      .getResponse();
  }
};

// ===== BOTTLE WITH HUMAN MILK =====

const RegisterBottleMilkIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'RegistrarBiberonLecheIntent';
  },
  handle(handlerInput) {
    const { t } = handlerInput.attributesManager.getRequestAttributes();
    const { request } = handlerInput.requestEnvelope;

    // Get amount slot if provided
    const amount = request.intent.slots.cantidad?.value;

    // Store intent and amount in session for confirmation
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    sessionAttributes.pendingIntent = 'BOTTLE_MILK';
    sessionAttributes.amount = amount ? parseInt(amount) : null;
    handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

    // Build confirmation message
    const amountText = amount ? t('AMOUNT_ML', { amount }) : '';
    const confirmText = t('BOTTLE_MILK_CONFIRM', { amount: amountText });

    return handlerInput.responseBuilder
      .speak(confirmText)
      .reprompt(confirmText)
      .getResponse();
  }
};

// ===== BOTTLE WITH FORMULA =====

const RegisterBottleFormulaIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'RegistrarBiberonFormulaIntent';
  },
  handle(handlerInput) {
    const { t } = handlerInput.attributesManager.getRequestAttributes();
    const { request } = handlerInput.requestEnvelope;

    // Get amount slot if provided
    const amount = request.intent.slots.cantidad?.value;

    // Store intent and amount in session for confirmation
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    sessionAttributes.pendingIntent = 'BOTTLE_FORMULA';
    sessionAttributes.amount = amount ? parseInt(amount) : null;
    handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

    // Build confirmation message
    const amountText = amount ? t('AMOUNT_ML', { amount }) : '';
    const confirmText = t('BOTTLE_FORMULA_CONFIRM', { amount: amountText });

    return handlerInput.responseBuilder
      .speak(confirmText)
      .reprompt(confirmText)
      .getResponse();
  }
};

// ===== REGURGITATION =====

const RegisterRegurgitacionIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'RegistrarRegurgitacionIntent';
  },
  handle(handlerInput) {
    const { t } = handlerInput.attributesManager.getRequestAttributes();

    // Store intent in session for confirmation
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    sessionAttributes.pendingIntent = 'REGURGITATION';
    handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

    return handlerInput.responseBuilder
      .speak(t('REGURGITATION_CONFIRM'))
      .reprompt(t('REGURGITATION_CONFIRM'))
      .getResponse();
  }
};

// ===== UPDATE LAST ENTRY =====

const UpdateLastEntryIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'ActualizarUltimaEntradaIntent';
  },
  async handle(handlerInput) {
    const { t } = handlerInput.attributesManager.getRequestAttributes();
    const { request } = handlerInput.requestEnvelope;

    // Check account linking and get user context
    const userContext = await getUserContext(handlerInput);
    if (!userContext.ready) {
      return userContext.response;
    }

    // Get amount and duration from slots
    const amount = request.intent.slots.cantidad?.value;
    const duration = request.intent.slots.duracion?.value;

    if (!amount && !duration) {
      return handlerInput.responseBuilder
        .speak(t('FALLBACK'))
        .reprompt(t('HELP_REPROMPT'))
        .getResponse();
    }

    try {
      // Get the last feeding to check what it is
      const lastFeeding = await getLastFeeding(userContext.spreadsheetId, userContext.accessToken);

      if (!lastFeeding) {
        return handlerInput.responseBuilder
          .speak(t('UPDATE_NO_ENTRY'))
          .withShouldEndSession(true)
          .getResponse();
      }

      // Get timezone and format time
      const timezone = await getDeviceTimezone(handlerInput);
      const time = formatTimeInTimezone(new Date(lastFeeding.timestamp), timezone);

      // Validate update type matches feeding type
      if (duration && lastFeeding.type !== 'PECHO') {
        // Duration only makes sense for breastfeeding
        const type = lastFeeding.type === 'BIBERON_LECHE' ? t('TYPE_BOTTLE_MILK') :
                     lastFeeding.type === 'BIBERON_FORMULA' ? t('TYPE_BOTTLE_FORMULA') :
                     t('TYPE_REGURGITATION');
        return handlerInput.responseBuilder
          .speak(t('UPDATE_DURATION_NOT_BREASTFEEDING', { type }))
          .withShouldEndSession(true)
          .getResponse();
      }

      if (amount && (lastFeeding.type !== 'BIBERON_LECHE' && lastFeeding.type !== 'BIBERON_FORMULA')) {
        // Amount only makes sense for bottles
        const type = lastFeeding.type === 'PECHO' ? t('TYPE_BREASTFEEDING') : t('TYPE_REGURGITATION');
        return handlerInput.responseBuilder
          .speak(t('UPDATE_AMOUNT_NOT_BOTTLE', { type }))
          .withShouldEndSession(true)
          .getResponse();
      }

      // Get type string
      let type;
      if (lastFeeding.type === 'PECHO') {
        type = t('TYPE_BREASTFEEDING');
      } else if (lastFeeding.type === 'BIBERON_LECHE') {
        type = t('TYPE_BOTTLE_MILK');
      } else if (lastFeeding.type === 'BIBERON_FORMULA') {
        type = t('TYPE_BOTTLE_FORMULA');
      }

      // Store in session for confirmation
      const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
      sessionAttributes.pendingIntent = 'UPDATE_ENTRY';
      sessionAttributes.updateAmount = amount ? parseInt(amount) : null;
      sessionAttributes.updateDuration = duration ? parseInt(duration) : null;
      sessionAttributes.lastFeeding = lastFeeding;
      handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

      // Ask for confirmation
      let confirmText;
      if (amount) {
        confirmText = t('UPDATE_AMOUNT_CONFIRM', { type, time, amount });
      } else {
        confirmText = t('UPDATE_DURATION_CONFIRM', { type, time, duration });
      }

      return handlerInput.responseBuilder
        .speak(confirmText)
        .reprompt(confirmText)
        .getResponse();

    } catch (error) {
      logger.error('Error preparing update:', error);
      return handlerInput.responseBuilder
        .speak(t('ERROR_SHEETS'))
        .withShouldEndSession(true)
        .getResponse();
    }
  }
};

// ===== YES INTENT (CONFIRMATION) =====

const YesIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.YesIntent';
  },
  async handle(handlerInput) {
    const { t } = handlerInput.attributesManager.getRequestAttributes();
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

    // Check if responding to reminder permission request
    if (sessionAttributes.awaitingReminderPermission) {
      // User said "yes" to enabling reminders
      sessionAttributes.awaitingReminderPermission = false;
      handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

      return handlerInput.responseBuilder
        .speak(t('REMINDER_PERMISSION_GRANTED'))
        .getResponse();
    }

    const pendingIntent = sessionAttributes.pendingIntent;
    const amount = sessionAttributes.amount;

    if (!pendingIntent) {
      // No pending confirmation
      return handlerInput.responseBuilder
        .speak(t('FALLBACK'))
        .reprompt(t('HELP_REPROMPT'))
        .getResponse();
    }

    // Check account linking and get user context
    const userContext = await getUserContext(handlerInput);
    if (!userContext.ready) {
      return userContext.response;
    }

    try {
      let type, responseKey;

      // Determine type and response based on pending intent
      switch (pendingIntent) {
        case 'BREASTFEEDING':
          type = 'PECHO';
          responseKey = 'BREASTFEEDING_REGISTERED';
          await appendFeeding(userContext.spreadsheetId, userContext.accessToken, type, null, null);
          break;

        case 'BOTTLE_MILK':
          type = 'BIBERON_LECHE';
          responseKey = 'BOTTLE_MILK_REGISTERED';
          await appendFeeding(userContext.spreadsheetId, userContext.accessToken, type, amount, null);
          break;

        case 'BOTTLE_FORMULA':
          type = 'BIBERON_FORMULA';
          responseKey = 'BOTTLE_FORMULA_REGISTERED';
          await appendFeeding(userContext.spreadsheetId, userContext.accessToken, type, amount, null);
          break;

        case 'REGURGITATION':
          type = 'REGURGITACION';
          responseKey = 'REGURGITATION_REGISTERED';
          await appendFeeding(userContext.spreadsheetId, userContext.accessToken, type, null, null);
          break;

        case 'UPDATE_ENTRY':
          // Update the last entry with amount or duration
          const updateAmount = sessionAttributes.updateAmount;
          const updateDuration = sessionAttributes.updateDuration;
          await updateLastFeeding(userContext.spreadsheetId, userContext.accessToken, updateAmount, updateDuration);

          // Clear session
          sessionAttributes.pendingIntent = null;
          sessionAttributes.updateAmount = null;
          sessionAttributes.updateDuration = null;
          sessionAttributes.lastFeeding = null;
          handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

          // Build success message
          let updateSpeech;
          if (updateAmount) {
            updateSpeech = t('UPDATE_AMOUNT_SUCCESS', { amount: updateAmount });
          } else {
            updateSpeech = t('UPDATE_DURATION_SUCCESS', { duration: updateDuration });
          }

          return handlerInput.responseBuilder
            .speak(updateSpeech)
            .withShouldEndSession(true)
            .getResponse();

        default:
          throw new Error('Unknown pending intent');
      }

      // Clear session
      sessionAttributes.pendingIntent = null;
      sessionAttributes.amount = null;
      handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

      // Build success response with user's local time
      const timezone = await getDeviceTimezone(handlerInput);
      const time = formatTimeInTimezone(new Date(), timezone);
      const amountText = amount ? t('AMOUNT_ML', { amount }) : '';
      const feedingTime = new Date().toISOString();

      // ===== REMINDER LOGIC =====
      // Check if we should ask for reminder permission (first feeding for new/existing users)
      const userId = userContext.userId;
      const userData = await getUserData(userId);

      let speechText = t(responseKey, { time, amount: amountText });
      let shouldAskPermission = false;

      // Only ask for permission if:
      // 1. We haven't asked before (new users or existing users after feature deployment)
      // 2. User doesn't have permission yet (if they have it, we'll just schedule)
      if (shouldAskForPermission(userData) && !hasReminderPermission(handlerInput)) {
        // Ask for permission after confirming feeding was recorded
        speechText = t('REMINDER_PERMISSION_REQUEST');
        shouldAskPermission = true;

        // Mark that we asked, so we don't ask again
        await markPermissionAsked(userId);

        // Store that we're waiting for permission response
        sessionAttributes.awaitingReminderPermission = true;
        handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
      } else {
        // User either already has permission or already declined
        // Try to schedule reminder (will silently fail if no permission)
        await scheduleNextFeedingReminder(handlerInput, userId, feedingTime);
      }

      const responseBuilder = handlerInput.responseBuilder.speak(speechText);

      // If asking for permission, add the permission card and keep session open
      if (shouldAskPermission) {
        responseBuilder
          .withAskForPermissionsConsentCard(['alexa::alerts:reminders:skill:readwrite'])
          .reprompt(t('REMINDER_PERMISSION_REPROMPT'))
          .withShouldEndSession(false);
      } else {
        responseBuilder.withShouldEndSession(true);
      }

      return responseBuilder.getResponse();

    } catch (error) {
      logger.error('Error saving feeding:', error);

      return handlerInput.responseBuilder
        .speak(t('ERROR_SHEETS'))
        .reprompt(t('HELP_REPROMPT'))
        .getResponse();
    }
  }
};

// ===== NO INTENT (CANCELLATION) =====

const NoIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.NoIntent';
  },
  handle(handlerInput) {
    const { t } = handlerInput.attributesManager.getRequestAttributes();
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

    // Check if responding to reminder permission request
    if (sessionAttributes.awaitingReminderPermission) {
      // User said "no" to enabling reminders
      sessionAttributes.awaitingReminderPermission = false;
      handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

      return handlerInput.responseBuilder
        .speak(t('REMINDER_PERMISSION_DECLINED'))
        .getResponse();
    }

    const pendingIntent = sessionAttributes.pendingIntent;

    if (!pendingIntent) {
      // No pending confirmation
      return handlerInput.responseBuilder
        .speak(t('FALLBACK'))
        .reprompt(t('HELP_REPROMPT'))
        .getResponse();
    }

    // Clear session
    sessionAttributes.pendingIntent = null;
    sessionAttributes.amount = null;
    handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

    // Determine cancellation message
    let responseKey;
    switch (pendingIntent) {
      case 'BREASTFEEDING':
        responseKey = 'BREASTFEEDING_CANCELLED';
        break;
      case 'BOTTLE_MILK':
        responseKey = 'BOTTLE_MILK_CANCELLED';
        break;
      case 'BOTTLE_FORMULA':
        responseKey = 'BOTTLE_FORMULA_CANCELLED';
        break;
      case 'REGURGITATION':
        responseKey = 'REGURGITATION_CANCELLED';
        break;
      case 'UPDATE_ENTRY':
        responseKey = 'UPDATE_CANCELLED';
        break;
      default:
        responseKey = 'FALLBACK';
    }

    return handlerInput.responseBuilder
      .speak(t(responseKey))
      .reprompt(t('HELP_REPROMPT'))
      .getResponse();
  }
};

module.exports = {
  RegisterBreastfeedingIntentHandler,
  RegisterBottleMilkIntentHandler,
  RegisterBottleFormulaIntentHandler,
  RegisterRegurgitacionIntentHandler,
  UpdateLastEntryIntentHandler,
  YesIntentHandler,
  NoIntentHandler
};
