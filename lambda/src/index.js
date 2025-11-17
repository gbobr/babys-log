/**
 * Baby Milk Tracker Alexa Skill
 * Main entry point for Lambda function
 */

const Alexa = require('ask-sdk-core');
const logger = require('./utils/logger');

// Import handlers
const {
  LaunchRequestHandler,
  HelpIntentHandler,
  CancelAndStopIntentHandler,
  FallbackIntentHandler,
  SessionEndedRequestHandler,
  ErrorHandler
} = require('./handlers/basic');

const {
  RegisterBreastfeedingIntentHandler,
  RegisterBottleMilkIntentHandler,
  RegisterBottleFormulaIntentHandler,
  RegisterRegurgitacionIntentHandler,
  UpdateLastEntryIntentHandler,
  YesIntentHandler,
  NoIntentHandler
} = require('./handlers/feeding');

const {
  LastFeedingIntentHandler,
  DailySummaryIntentHandler
} = require('./handlers/query');

// Import interceptors
const LocalizationInterceptor = require('./interceptors/localization');

/**
 * Request logging interceptor (only active in DEBUG mode)
 */
const RequestLoggingInterceptor = {
  process(handlerInput) {
    logger.debug('Request received:', {
      type: handlerInput.requestEnvelope.request.type,
      intent: handlerInput.requestEnvelope.request.intent?.name,
      hasAccessToken: !!handlerInput.requestEnvelope.context.System.user.accessToken
    });
  }
};

/**
 * Lambda handler function
 */
let skillHandler;

try {
  logger.info('Initializing Alexa skill handler');

  const requestInterceptors = [LocalizationInterceptor];

  // Add request logging only in DEBUG mode
  if (process.env.LOG_LEVEL === 'DEBUG') {
    requestInterceptors.unshift(RequestLoggingInterceptor);
  }

  skillHandler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
      // Basic handlers
      LaunchRequestHandler,
      HelpIntentHandler,
      CancelAndStopIntentHandler,
      FallbackIntentHandler,
      SessionEndedRequestHandler,

      // Feeding registration handlers
      RegisterBreastfeedingIntentHandler,
      RegisterBottleMilkIntentHandler,
      RegisterBottleFormulaIntentHandler,
      RegisterRegurgitacionIntentHandler,
      UpdateLastEntryIntentHandler,
      YesIntentHandler,
      NoIntentHandler,

      // Query handlers
      LastFeedingIntentHandler,
      DailySummaryIntentHandler
    )
    .addRequestInterceptors(...requestInterceptors)
    .addErrorHandlers(ErrorHandler)
    .withApiClient(new Alexa.DefaultApiClient())
    .withCustomUserAgent('baby-milk-tracker/1.0')
    .lambda();

  logger.info('Skill handler initialized successfully');
} catch (error) {
  logger.error('FATAL ERROR during skill initialization:', error);
  throw error;
}

exports.handler = skillHandler;
