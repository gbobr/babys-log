/**
 * Basic request handlers for the Baby Milk Tracker skill
 * Includes Launch, Help, Stop, Cancel, and Error handlers
 */

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  handle(handlerInput) {
    const { t } = handlerInput.attributesManager.getRequestAttributes();

    return handlerInput.responseBuilder
      .speak(t('WELCOME'))
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
    console.log(`Session ended: ${JSON.stringify(handlerInput.requestEnvelope.request)}`);
    return handlerInput.responseBuilder.getResponse();
  }
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.error(`Error handled: ${error.stack || error.message}`);

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
