/**
 * Basic request handlers for the Baby Milk Tracker skill
 * Includes Launch, Help, Stop, Cancel, and Error handlers
 */

const { getUserContext } = require('../utils/accountLinking');
const logger = require('../utils/logger');

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  async handle(handlerInput) {
    const { t } = handlerInput.attributesManager.getRequestAttributes();

    // Check account linking and setup
    const userContext = await getUserContext(handlerInput);
    if (!userContext.ready) {
      return userContext.response;
    }

    // Check if this is a new user (just created spreadsheet)
    let welcomeMessage;
    if (userContext.isNewUser) {
      welcomeMessage = t('FIRST_TIME_SETUP_COMPLETE');
    } else {
      welcomeMessage = t('WELCOME');
    }

    return handlerInput.responseBuilder
      .speak(welcomeMessage)
      .reprompt(t('WELCOME_REPROMPT'))
      .getResponse();
  }
};

const HelpIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const { t } = handlerInput.attributesManager.getRequestAttributes();

    return handlerInput.responseBuilder
      .speak(t('HELP'))
      .reprompt(t('HELP_REPROMPT'))
      .getResponse();
  }
};

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    const { t } = handlerInput.attributesManager.getRequestAttributes();

    return handlerInput.responseBuilder
      .speak(t('GOODBYE'))
      .getResponse();
  }
};

const FallbackIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.FallbackIntent';
  },
  handle(handlerInput) {
    const { t } = handlerInput.attributesManager.getRequestAttributes();

    return handlerInput.responseBuilder
      .speak(t('FALLBACK'))
      .reprompt(t('HELP_REPROMPT'))
      .getResponse();
  }
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    const reason = handlerInput.requestEnvelope.request.reason;
    logger.info('Session ended:', { reason });
    return handlerInput.responseBuilder.getResponse();
  }
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    logger.error('Error handled:', error);

    const { t } = handlerInput.attributesManager.getRequestAttributes();

    return handlerInput.responseBuilder
      .speak(t('ERROR'))
      .reprompt(t('HELP_REPROMPT'))
      .getResponse();
  }
};

module.exports = {
  LaunchRequestHandler,
  HelpIntentHandler,
  CancelAndStopIntentHandler,
  FallbackIntentHandler,
  SessionEndedRequestHandler,
  ErrorHandler
};
