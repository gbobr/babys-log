/**
 * Sleep tracking intent handlers
 * Handles sleep session start, end, and queries
 */

const { getUserData } = require('../utils/dynamodb');
const { getUserContext } = require('../utils/accountLinking');
const { getDeviceTimezone, formatTimeInTimezone } = require('../utils/timezone');
const {
  startSleepSession,
  endSleepSession,
  getLastSleep,
  getTodaySleep,
  formatDuration
} = require('../utils/sleep');
const logger = require('../utils/logger');

/**
 * RegistrarInicioSuenoIntent - Start sleep session
 */
const RegistrarInicioSuenoIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'RegistrarInicioSuenoIntent';
  },
  async handle(handlerInput) {
    const { attributesManager } = handlerInput;
    const sessionAttributes = attributesManager.getSessionAttributes();
    const { t } = attributesManager.getRequestAttributes();

    try {
      // Store intent in session for confirmation
      sessionAttributes.pendingIntent = 'RegistrarInicioSuenoIntent';
      attributesManager.setSessionAttributes(sessionAttributes);

      // Check if there's already an active sleep session
      const userContext = await getUserContext(handlerInput);
      const userData = await getUserData(userContext.userId);

      if (userData && userData.activeSleepSessionStart) {
        // Format time for speech
        const timezone = await getDeviceTimezone(handlerInput);
        const timeString = formatTimeInTimezone(userData.activeSleepSessionStart, timezone);

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
 * RegistrarFinSuenoIntent - End sleep session
 */
const RegistrarFinSuenoIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'RegistrarFinSuenoIntent';
  },
  async handle(handlerInput) {
    const { attributesManager } = handlerInput;
    const sessionAttributes = attributesManager.getSessionAttributes();
    const { t } = attributesManager.getRequestAttributes();

    try {
      const userContext = await getUserContext(handlerInput);
      const userData = await getUserData(userContext.userId);

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
      sessionAttributes.pendingIntent = 'RegistrarFinSuenoIntent';
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
 * ConsultarUltimoSuenoIntent - Query last sleep session
 */
const ConsultarUltimoSuenoIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'ConsultarUltimoSuenoIntent';
  },
  async handle(handlerInput) {
    const { attributesManager } = handlerInput;
    const sessionAttributes = attributesManager.getSessionAttributes();
    const { t } = attributesManager.getRequestAttributes();

    try {
      const userContext = await getUserContext(handlerInput);
      const userData = await getUserData(userContext.userId);

      if (!userData || !userData.spreadsheetId) {
        const speechText = t('ACCOUNT_LINKING_REQUIRED');
        return handlerInput.responseBuilder
          .speak(speechText)
          .withLinkAccountCard()
          .getResponse();
      }

      // Check if there's an active sleep session
      if (userData.activeSleepSessionStart) {
        const timezone = await getDeviceTimezone(handlerInput);
        const startTime = new Date(userData.activeSleepSessionStart);
        const now = new Date();
        const durationMinutes = Math.round((now - startTime) / 1000 / 60);
        const durationText = formatDuration(durationMinutes, sessionAttributes.locale || 'es-ES');
        const timeString = formatTimeInTimezone(startTime, timezone);

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
        userContext.accessToken,
        sessionAttributes.locale || 'es-ES'
      );

      if (!lastSleep) {
        const speechText = t('NO_SLEEP_TODAY');
        return handlerInput.responseBuilder
          .speak(speechText)
          .getResponse();
      }

      // Format times for speech
      const timezone = await getDeviceTimezone(handlerInput);
      const startTimeString = formatTimeInTimezone(lastSleep.startTime, timezone);
      const endTimeString = formatTimeInTimezone(lastSleep.endTime, timezone);
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
 * ConsultarSuenoDelDiaIntent - Query today's sleep summary
 */
const ConsultarSuenoDelDiaIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'ConsultarSuenoDelDiaIntent';
  },
  async handle(handlerInput) {
    const { attributesManager } = handlerInput;
    const sessionAttributes = attributesManager.getSessionAttributes();
    const { t } = attributesManager.getRequestAttributes();

    try {
      const userContext = await getUserContext(handlerInput);
      const userData = await getUserData(userContext.userId);

      if (!userData || !userData.spreadsheetId) {
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
        userContext.accessToken,
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
        const timezone = await getDeviceTimezone(handlerInput);
        const currentStartString = formatTimeInTimezone(userData.activeSleepSessionStart, timezone);

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
      && (sessionAttributes.pendingIntent === 'RegistrarInicioSuenoIntent'
          || sessionAttributes.pendingIntent === 'RegistrarFinSuenoIntent');
  },
  async handle(handlerInput) {
    const { attributesManager } = handlerInput;
    const sessionAttributes = attributesManager.getSessionAttributes();
    const { t } = attributesManager.getRequestAttributes();
    const pendingIntent = sessionAttributes.pendingIntent;

    try {
      const userContext = await getUserContext(handlerInput);
      const userData = await getUserData(userContext.userId);

      if (!userData || !userData.spreadsheetId) {
        const speechText = t('ACCOUNT_LINKING_REQUIRED');
        return handlerInput.responseBuilder
          .speak(speechText)
          .withLinkAccountCard()
          .getResponse();
      }

      if (pendingIntent === 'RegistrarInicioSuenoIntent') {
        // Start sleep session
        const { startTime } = await startSleepSession(
          userData.spreadsheetId,
          userContext.accessToken,
          userContext.userId,
          sessionAttributes.locale || 'es-ES'
        );

        const timezone = await getDeviceTimezone(handlerInput);
        const timeString = formatTimeInTimezone(startTime, timezone);

        const speechText = t('SLEEP_START_REGISTERED', { time: timeString });

        // Clear pending intent
        sessionAttributes.pendingIntent = null;
        attributesManager.setSessionAttributes(sessionAttributes);

        return handlerInput.responseBuilder
          .speak(speechText)
          .getResponse();

      } else if (pendingIntent === 'RegistrarFinSuenoIntent') {
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
          userContext.accessToken,
          userContext.userId,
          userData.activeSleepSessionStart,
          sessionAttributes.locale || 'es-ES'
        );

        const timezone = await getDeviceTimezone(handlerInput);
        const startTimeString = formatTimeInTimezone(result.startTime, timezone);
        const endTimeString = formatTimeInTimezone(result.endTime, timezone);
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
      && (sessionAttributes.pendingIntent === 'RegistrarInicioSuenoIntent'
          || sessionAttributes.pendingIntent === 'RegistrarFinSuenoIntent');
  },
  handle(handlerInput) {
    const { attributesManager } = handlerInput;
    const sessionAttributes = attributesManager.getSessionAttributes();
    const { t } = attributesManager.getRequestAttributes();
    const pendingIntent = sessionAttributes.pendingIntent;

    let speechText;

    if (pendingIntent === 'RegistrarInicioSuenoIntent') {
      speechText = t('SLEEP_START_CANCELLED');
    } else if (pendingIntent === 'RegistrarFinSuenoIntent') {
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
  RegistrarInicioSuenoIntentHandler,
  RegistrarFinSuenoIntentHandler,
  ConsultarUltimoSuenoIntentHandler,
  ConsultarSuenoDelDiaIntentHandler,
  SleepYesIntentHandler,
  SleepNoIntentHandler
};
