/**
 * Diaper tracking handlers for the Baby Milk Tracker skill
 * Handles wet, dirty, and mixed diaper changes plus queries
 */

const { appendDiaperChange, getLastDiaper, getTodayDiapers } = require('../utils/diaper');
const { getDeviceTimezone, formatTimeInTimezone } = require('../utils/timezone');
const { getUserContext } = require('../utils/accountLinking');
const logger = require('../utils/logger');

// ===== WET DIAPER =====

const RegistrarPanalMojadoIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'RegistrarPanalMojadoIntent';
  },
  handle(handlerInput) {
    const { t } = handlerInput.attributesManager.getRequestAttributes();

    // Store intent in session for confirmation
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    sessionAttributes.pendingIntent = 'WET_DIAPER';
    handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

    return handlerInput.responseBuilder
      .speak(t('WET_DIAPER_CONFIRM'))
      .reprompt(t('WET_DIAPER_CONFIRM'))
      .getResponse();
  }
};

// ===== DIRTY DIAPER =====

const RegistrarPanalSucioIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'RegistrarPanalSucioIntent';
  },
  handle(handlerInput) {
    const { t } = handlerInput.attributesManager.getRequestAttributes();

    // Store intent in session for confirmation
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    sessionAttributes.pendingIntent = 'DIRTY_DIAPER';
    handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

    return handlerInput.responseBuilder
      .speak(t('DIRTY_DIAPER_CONFIRM'))
      .reprompt(t('DIRTY_DIAPER_CONFIRM'))
      .getResponse();
  }
};

// ===== MIXED DIAPER =====

const RegistrarPanalMixtoIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'RegistrarPanalMixtoIntent';
  },
  handle(handlerInput) {
    const { t } = handlerInput.attributesManager.getRequestAttributes();

    // Store intent in session for confirmation
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    sessionAttributes.pendingIntent = 'MIXED_DIAPER';
    handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

    return handlerInput.responseBuilder
      .speak(t('MIXED_DIAPER_CONFIRM'))
      .reprompt(t('MIXED_DIAPER_CONFIRM'))
      .getResponse();
  }
};

// ===== QUERY LAST DIAPER =====

const ConsultarUltimoPanalIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'ConsultarUltimoPanalIntent';
  },
  async handle(handlerInput) {
    const { t } = handlerInput.attributesManager.getRequestAttributes();

    // Check account linking and get user context
    const userContext = await getUserContext(handlerInput);
    if (!userContext.ready) {
      return userContext.response;
    }

    try {
      const lastDiaper = await getLastDiaper(
        userContext.spreadsheetId,
        userContext.accessToken,
        userContext.locale
      );

      if (!lastDiaper) {
        return handlerInput.responseBuilder
          .speak(t('NO_DIAPERS'))
          .withShouldEndSession(true)
          .getResponse();
      }

      // Get timezone and format time
      const timezone = await getDeviceTimezone(handlerInput);
      const diaperTime = new Date(lastDiaper.timestamp);
      const timeString = formatTimeInTimezone(diaperTime, timezone);

      // Calculate time ago
      const now = new Date();
      const diffMs = now - diaperTime;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);

      let timeAgo;
      if (diffMins < 60) {
        timeAgo = t('TIME_MINUTES_AGO', { minutes: diffMins });
      } else if (diffHours === 1) {
        timeAgo = t('TIME_ONE_HOUR_AGO');
      } else {
        timeAgo = t('TIME_HOURS_AGO', { hours: diffHours });
      }

      // Get diaper type string
      const typeString = lastDiaper.type === 'MOJADO' || lastDiaper.type === 'WET'
        ? t('DIAPER_TYPE_WET')
        : lastDiaper.type === 'SUCIO' || lastDiaper.type === 'DIRTY'
          ? t('DIAPER_TYPE_DIRTY')
          : t('DIAPER_TYPE_MIXED');

      const speechText = t('LAST_DIAPER_RESPONSE', {
        type: typeString,
        time: timeString,
        timeAgo
      });

      return handlerInput.responseBuilder
        .speak(speechText)
        .withShouldEndSession(true)
        .getResponse();

    } catch (error) {
      logger.error('Error getting last diaper:', error);
      return handlerInput.responseBuilder
        .speak(t('ERROR_SHEETS'))
        .withShouldEndSession(true)
        .getResponse();
    }
  }
};

// ===== QUERY TODAY'S DIAPERS =====

const ConsultarPanalesDelDiaIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'ConsultarPanalesDelDiaIntent';
  },
  async handle(handlerInput) {
    const { t } = handlerInput.attributesManager.getRequestAttributes();

    // Check account linking and get user context
    const userContext = await getUserContext(handlerInput);
    if (!userContext.ready) {
      return userContext.response;
    }

    try {
      const timezone = await getDeviceTimezone(handlerInput);

      const todaysDiapers = await getTodayDiapers(
        userContext.spreadsheetId,
        userContext.accessToken,
        timezone,
        userContext.locale
      );

      if (todaysDiapers.count === 0) {
        return handlerInput.responseBuilder
          .speak(t('NO_DIAPERS_TODAY'))
          .withShouldEndSession(true)
          .getResponse();
      }

      // Build detailed summary
      const parts = [];

      // Total count
      parts.push(t('DIAPERS_TODAY_TOTAL', { count: todaysDiapers.count }));

      // Breakdown by type
      if (todaysDiapers.wet > 0) {
        parts.push(t('DIAPERS_WET_COUNT', { count: todaysDiapers.wet }));
      }
      if (todaysDiapers.dirty > 0) {
        parts.push(t('DIAPERS_DIRTY_COUNT', { count: todaysDiapers.dirty }));
      }
      if (todaysDiapers.mixed > 0) {
        parts.push(t('DIAPERS_MIXED_COUNT', { count: todaysDiapers.mixed }));
      }

      const speechText = parts.join(' ');

      return handlerInput.responseBuilder
        .speak(speechText)
        .withShouldEndSession(true)
        .getResponse();

    } catch (error) {
      logger.error('Error getting today\'s diapers:', error);
      return handlerInput.responseBuilder
        .speak(t('ERROR_SHEETS'))
        .withShouldEndSession(true)
        .getResponse();
    }
  }
};

module.exports = {
  RegistrarPanalMojadoIntentHandler,
  RegistrarPanalSucioIntentHandler,
  RegistrarPanalMixtoIntentHandler,
  ConsultarUltimoPanalIntentHandler,
  ConsultarPanalesDelDiaIntentHandler
};
