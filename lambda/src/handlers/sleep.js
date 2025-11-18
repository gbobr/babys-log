/**
 * Sleep tracking intent handlers
 * Handles sleep session start, end, and queries
 */

const { getUserData } = require('../utils/dynamodb');
const { getAccessToken } = require('../utils/accountLinking');
const {
  startSleepSession,
  endSleepSession,
  getLastSleep,
  getTodaySleep,
  formatDuration
} = require('../utils/sleep');
const logger = require('../utils/logger');

/**
 * RegistrarInicioSueñoIntent - Start sleep session
 */
const RegistrarInicioSueñoIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'RegistrarInicioSueñoIntent';
  },
  async handle(handlerInput) {
    const { attributesManager } = handlerInput;
    const sessionAttributes = attributesManager.getSessionAttributes();
    const t = handlerInput.t;

    try {
      // Store intent in session for confirmation
      sessionAttributes.pendingIntent = 'RegistrarInicioSueñoIntent';
      attributesManager.setSessionAttributes(sessionAttributes);

      // Check if there's already an active sleep session
      const userContext = handlerInput.requestEnvelope.context.System.user;
      const userId = userContext.userId;
      const userData = await getUserData(userId);

      if (userData && userData.activeSleepSessionStart) {
        // Format time for speech
        const startTime = new Date(userData.activeSleepSessionStart);
        const timeString = startTime.toLocaleTimeString(
          sessionAttributes.locale || 'es-ES',
          { hour: '2-digit', minute: '2-digit' }
        );

        const speechText = t('SLEEP_ALREADY_ACTIVE', { time: timeString });
        return handlerInput.responseBuilder
          .speak(speechText)
          .reprompt(t('WELCOME_REPROMPT'))
          .getResponse();
      }

      const speechText = t('SLEEP_START_CONFIRM');
      return handlerInput.responseBuilder
        .speak(speechText)
        .reprompt(speechText)
        .getResponse();

    } catch (error) {
      logger.error('Error in RegistrarInicioSueñoIntent:', error);
      const speechText = t('ERROR');
      return handlerInput.responseBuilder
        .speak(speechText)
        .getResponse();
    }
  }
};

/**
 * RegistrarFinSueñoIntent - End sleep session
 */
const RegistrarFinSueñoIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'RegistrarFinSueñoIntent';
  },
  async handle(handlerInput) {
    const { attributesManager } = handlerInput;
    const sessionAttributes = attributesManager.getSessionAttributes();
    const t = handlerInput.t;

    try {
      const userContext = handlerInput.requestEnvelope.context.System.user;
      const userId = userContext.userId;
      const userData = await getUserData(userId);

      // Check if there's an active sleep session
      if (!userData || !userData.activeSleepSessionStart) {
        const speechText = t('SLEEP_NO_ACTIVE_SESSION');
        return handlerInput.responseBuilder
          .speak(speechText)
          .reprompt(t('WELCOME_REPROMPT'))
          .getResponse();
      }

      // Calculate duration to warn about very short naps
      const startTime = new Date(userData.activeSleepSessionStart);
      const now = new Date();
      const durationMinutes = Math.round((now - startTime) / 1000 / 60);

      // Store for confirmation
      sessionAttributes.pendingIntent = 'RegistrarFinSueñoIntent';
      attributesManager.setSessionAttributes(sessionAttributes);

      // Warn if nap is very short (less than 15 minutes)
      if (durationMinutes < 15) {
        const durationText = formatDuration(durationMinutes, sessionAttributes.locale || 'es-ES');
        const speechText = t('SLEEP_SHORT_WARNING', { duration: durationText });
        return handlerInput.responseBuilder
          .speak(speechText)
          .reprompt(speechText)
          .getResponse();
      }

      const speechText = t('SLEEP_END_CONFIRM');
      return handlerInput.responseBuilder
        .speak(speechText)
        .reprompt(speechText)
        .getResponse();

    } catch (error) {
      logger.error('Error in RegistrarFinSueñoIntent:', error);
      const speechText = t('ERROR');
      return handlerInput.responseBuilder
        .speak(speechText)
        .getResponse();
    }
  }
};

/**
 * ConsultarUltimoSueñoIntent - Query last sleep session
 */
const ConsultarUltimoSueñoIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'ConsultarUltimoSueñoIntent';
  },
  async handle(handlerInput) {
    const { attributesManager } = handlerInput;
    const sessionAttributes = attributesManager.getSessionAttributes();
    const t = handlerInput.t;

    try {
      const userContext = handlerInput.requestEnvelope.context.System.user;
      const userId = userContext.userId;
      const userData = await getUserData(userId);

      if (!userData || !userData.spreadsheetId) {
        const speechText = t('ACCOUNT_LINKING_REQUIRED');
        return handlerInput.responseBuilder
          .speak(speechText)
          .withLinkAccountCard()
          .getResponse();
      }

      const accessToken = getAccessToken(handlerInput);
      if (!accessToken) {
        const speechText = t('ACCOUNT_LINKING_REQUIRED');
        return handlerInput.responseBuilder
          .speak(speechText)
          .withLinkAccountCard()
          .getResponse();
      }

      // Check if there's an active sleep session
      if (userData.activeSleepSessionStart) {
        const startTime = new Date(userData.activeSleepSessionStart);
        const now = new Date();
        const durationMinutes = Math.round((now - startTime) / 1000 / 60);
        const durationText = formatDuration(durationMinutes, sessionAttributes.locale || 'es-ES');
        const timeString = startTime.toLocaleTimeString(
          sessionAttributes.locale || 'es-ES',
          { hour: '2-digit', minute: '2-digit' }
        );

        const speechText = t('LAST_SLEEP_ONGOING', {
          startTime: timeString,
          duration: durationText
        });

        return handlerInput.responseBuilder
          .speak(speechText)
          .getResponse();
      }

      // Get last completed sleep session
      const lastSleep = await getLastSleep(
        userData.spreadsheetId,
        accessToken,
        sessionAttributes.locale || 'es-ES'
      );

      if (!lastSleep) {
        const speechText = t('NO_SLEEP_TODAY');
        return handlerInput.responseBuilder
          .speak(speechText)
          .getResponse();
      }

      // Format times for speech
      const startTime = new Date(lastSleep.startTime);
      const endTime = new Date(lastSleep.endTime);
      const startTimeString = startTime.toLocaleTimeString(
        sessionAttributes.locale || 'es-ES',
        { hour: '2-digit', minute: '2-digit' }
      );
      const endTimeString = endTime.toLocaleTimeString(
        sessionAttributes.locale || 'es-ES',
        { hour: '2-digit', minute: '2-digit' }
      );
      const durationText = formatDuration(
        lastSleep.durationMinutes,
        sessionAttributes.locale || 'es-ES'
      );

      const speechText = t('LAST_SLEEP', {
        duration: durationText,
        startTime: startTimeString,
        endTime: endTimeString
      });

      return handlerInput.responseBuilder
        .speak(speechText)
        .getResponse();

    } catch (error) {
      logger.error('Error in ConsultarUltimoSueñoIntent:', error);
      const speechText = t('ERROR');
      return handlerInput.responseBuilder
        .speak(speechText)
        .getResponse();
    }
  }
};

/**
 * ConsultarSueñoDelDiaIntent - Query today's sleep summary
 */
const ConsultarSueñoDelDiaIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'ConsultarSueñoDelDiaIntent';
  },
  async handle(handlerInput) {
    const { attributesManager } = handlerInput;
    const sessionAttributes = attributesManager.getSessionAttributes();
    const t = handlerInput.t;

    try {
      const userContext = handlerInput.requestEnvelope.context.System.user;
      const userId = userContext.userId;
      const userData = await getUserData(userId);

      if (!userData || !userData.spreadsheetId) {
        const speechText = t('ACCOUNT_LINKING_REQUIRED');
        return handlerInput.responseBuilder
          .speak(speechText)
          .withLinkAccountCard()
          .getResponse();
      }

      const accessToken = getAccessToken(handlerInput);
      if (!accessToken) {
        const speechText = t('ACCOUNT_LINKING_REQUIRED');
        return handlerInput.responseBuilder
          .speak(speechText)
          .withLinkAccountCard()
          .getResponse();
      }

      // Get timezone from device
      const deviceId = handlerInput.requestEnvelope.context.System.device.deviceId;
      const { getTimezone } = require('../utils/timezone');
      const timezone = await getTimezone(handlerInput, deviceId);

      // Get today's sleep summary
      const summary = await getTodaySleep(
        userData.spreadsheetId,
        accessToken,
        timezone,
        sessionAttributes.locale || 'es-ES'
      );

      if (summary.count === 0 && !userData.activeSleepSessionStart) {
        const speechText = t('NO_SLEEP_TODAY');
        return handlerInput.responseBuilder
          .speak(speechText)
          .getResponse();
      }

      // Format total duration
      const totalDurationText = formatDuration(
        summary.totalMinutes,
        sessionAttributes.locale || 'es-ES'
      );

      // Determine singular/plural
      const napWord = summary.count === 1 ? t('NAP_SINGULAR') : t('NAP_PLURAL');

      let speechText;

      // Check if there's an active sleep session
      if (userData.activeSleepSessionStart) {
        const currentStart = new Date(userData.activeSleepSessionStart);
        const currentStartString = currentStart.toLocaleTimeString(
          sessionAttributes.locale || 'es-ES',
          { hour: '2-digit', minute: '2-digit' }
        );

        speechText = t('DAILY_SLEEP_WITH_ONGOING', {
          count: summary.count,
          napWord: napWord,
          totalDuration: totalDurationText,
          currentStart: currentStartString
        });
      } else {
        speechText = t('DAILY_SLEEP_SUMMARY', {
          count: summary.count,
          napWord: napWord,
          totalDuration: totalDurationText
        });
      }

      return handlerInput.responseBuilder
        .speak(speechText)
        .getResponse();

    } catch (error) {
      logger.error('Error in ConsultarSueñoDelDiaIntent:', error);
      const speechText = t('ERROR');
      return handlerInput.responseBuilder
        .speak(speechText)
        .getResponse();
    }
  }
};

/**
 * Extended YesIntent handler for sleep confirmations
 * This should be merged with the existing YesIntentHandler
 */
const SleepYesIntentHandler = {
  canHandle(handlerInput) {
    const { attributesManager } = handlerInput;
    const sessionAttributes = attributesManager.getSessionAttributes();
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.YesIntent'
      && (sessionAttributes.pendingIntent === 'RegistrarInicioSueñoIntent'
          || sessionAttributes.pendingIntent === 'RegistrarFinSueñoIntent');
  },
  async handle(handlerInput) {
    const { attributesManager } = handlerInput;
    const sessionAttributes = attributesManager.getSessionAttributes();
    const t = handlerInput.t;
    const pendingIntent = sessionAttributes.pendingIntent;

    try {
      const userContext = handlerInput.requestEnvelope.context.System.user;
      const userId = userContext.userId;
      const userData = await getUserData(userId);

      if (!userData || !userData.spreadsheetId) {
        const speechText = t('ACCOUNT_LINKING_REQUIRED');
        return handlerInput.responseBuilder
          .speak(speechText)
          .withLinkAccountCard()
          .getResponse();
      }

      const accessToken = getAccessToken(handlerInput);
      if (!accessToken) {
        const speechText = t('ACCOUNT_LINKING_REQUIRED');
        return handlerInput.responseBuilder
          .speak(speechText)
          .withLinkAccountCard()
          .getResponse();
      }

      if (pendingIntent === 'RegistrarInicioSueñoIntent') {
        // Start sleep session
        const { startTime } = await startSleepSession(
          userData.spreadsheetId,
          accessToken,
          userId,
          sessionAttributes.locale || 'es-ES'
        );

        const timeString = new Date(startTime).toLocaleTimeString(
          sessionAttributes.locale || 'es-ES',
          { hour: '2-digit', minute: '2-digit' }
        );

        const speechText = t('SLEEP_START_REGISTERED', { time: timeString });

        // Clear pending intent
        sessionAttributes.pendingIntent = null;
        attributesManager.setSessionAttributes(sessionAttributes);

        return handlerInput.responseBuilder
          .speak(speechText)
          .getResponse();

      } else if (pendingIntent === 'RegistrarFinSueñoIntent') {
        // End sleep session
        if (!userData.activeSleepSessionStart) {
          const speechText = t('SLEEP_NO_ACTIVE_SESSION');
          sessionAttributes.pendingIntent = null;
          attributesManager.setSessionAttributes(sessionAttributes);
          return handlerInput.responseBuilder
            .speak(speechText)
            .getResponse();
        }

        const result = await endSleepSession(
          userData.spreadsheetId,
          accessToken,
          userId,
          userData.activeSleepSessionStart,
          sessionAttributes.locale || 'es-ES'
        );

        const startTimeString = new Date(result.startTime).toLocaleTimeString(
          sessionAttributes.locale || 'es-ES',
          { hour: '2-digit', minute: '2-digit' }
        );
        const endTimeString = new Date(result.endTime).toLocaleTimeString(
          sessionAttributes.locale || 'es-ES',
          { hour: '2-digit', minute: '2-digit' }
        );
        const durationText = formatDuration(
          result.durationMinutes,
          sessionAttributes.locale || 'es-ES'
        );

        const speechText = t('SLEEP_END_REGISTERED', {
          duration: durationText,
          startTime: startTimeString,
          endTime: endTimeString
        });

        // Clear pending intent
        sessionAttributes.pendingIntent = null;
        attributesManager.setSessionAttributes(sessionAttributes);

        return handlerInput.responseBuilder
          .speak(speechText)
          .getResponse();
      }

    } catch (error) {
      logger.error('Error in SleepYesIntentHandler:', error);
      const speechText = t('ERROR_SHEETS');
      return handlerInput.responseBuilder
        .speak(speechText)
        .getResponse();
    }
  }
};

/**
 * Extended NoIntent handler for sleep confirmations
 * This should be merged with the existing NoIntentHandler
 */
const SleepNoIntentHandler = {
  canHandle(handlerInput) {
    const { attributesManager } = handlerInput;
    const sessionAttributes = attributesManager.getSessionAttributes();
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.NoIntent'
      && (sessionAttributes.pendingIntent === 'RegistrarInicioSueñoIntent'
          || sessionAttributes.pendingIntent === 'RegistrarFinSueñoIntent');
  },
  handle(handlerInput) {
    const { attributesManager } = handlerInput;
    const sessionAttributes = attributesManager.getSessionAttributes();
    const t = handlerInput.t;
    const pendingIntent = sessionAttributes.pendingIntent;

    let speechText;

    if (pendingIntent === 'RegistrarInicioSueñoIntent') {
      speechText = t('SLEEP_START_CANCELLED');
    } else if (pendingIntent === 'RegistrarFinSueñoIntent') {
      speechText = t('SLEEP_END_CANCELLED');
    }

    // Clear pending intent
    sessionAttributes.pendingIntent = null;
    attributesManager.setSessionAttributes(sessionAttributes);

    return handlerInput.responseBuilder
      .speak(speechText)
      .getResponse();
  }
};

module.exports = {
  RegistrarInicioSueñoIntentHandler,
  RegistrarFinSueñoIntentHandler,
  ConsultarUltimoSueñoIntentHandler,
  ConsultarSueñoDelDiaIntentHandler,
  SleepYesIntentHandler,
  SleepNoIntentHandler
};
