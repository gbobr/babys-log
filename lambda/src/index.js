/**
 * Baby Milk Tracker Alexa Skill
 * Main entry point for Lambda function
 */

const Alexa = require('ask-sdk-core');

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
 * Lambda handler function
 */
exports.handler = Alexa.SkillBuilders.custom()
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
  .addRequestInterceptors(
    LocalizationInterceptor
  )
  .addErrorHandlers(
    ErrorHandler
  )
  .withApiClient(new Alexa.DefaultApiClient())
  .withCustomUserAgent('baby-milk-tracker/1.0')
  .lambda();
