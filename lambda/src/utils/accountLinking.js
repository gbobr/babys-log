/**
 * Account linking utilities for Alexa skill
 * Handles OAuth token validation and user spreadsheet management
 */

const { getUserData, saveUserData } = require('./dynamodb');
const { createUserSpreadsheet, spreadsheetExists } = require('./sheets');
const logger = require('./logger');

/**
 * Check if user has linked their account and has a spreadsheet
 * If not, guide them through the process
 * @param {Object} handlerInput - Alexa handler input
 * @returns {Promise<Object|null>} User context with accessToken and spreadsheetId, or null if not ready
 */
async function getUserContext(handlerInput) {
  const { t } = handlerInput.attributesManager.getRequestAttributes();

  // Check for access token (account linking)
  const accessToken = handlerInput.requestEnvelope.context.System.user.accessToken;

  if (!accessToken) {
    logger.info('No access token found, prompting for account linking');
    return {
      response: handlerInput.responseBuilder
        .speak(t('ACCOUNT_LINKING_REQUIRED'))
        .withLinkAccountCard()
        .getResponse(),
      ready: false
    };
  }

  // Get user ID
  const userId = handlerInput.requestEnvelope.context.System.user.userId;
  logger.debug(`User ID: ${userId.substring(0, 20)}...`);

  // Check if user has a spreadsheet
  logger.debug('Checking DynamoDB for existing user data');
  let userData = await getUserData(userId);
  logger.debug('User data retrieved:', userData ? 'FOUND' : 'NOT FOUND');

  // If user has a spreadsheet ID, verify it still exists
  if (userData && userData.spreadsheetId) {
    logger.debug(`Verifying spreadsheet ${userData.spreadsheetId}`);
    const exists = await spreadsheetExists(userData.spreadsheetId, accessToken);

    if (!exists) {
      logger.info('Spreadsheet no longer exists (deleted/trashed), creating new one');
      userData = null; // Force creation of new spreadsheet
    } else {
      logger.debug('Spreadsheet verified and accessible');
    }
  }

  if (!userData || !userData.spreadsheetId) {
    // First time user - create spreadsheet
    try {
      logger.info(`Creating spreadsheet for new user`);

      const { spreadsheetId, spreadsheetUrl } = await createUserSpreadsheet(accessToken);

      // Save to DynamoDB (async, best effort)
      const newUserData = {
        spreadsheetId,
        spreadsheetUrl,
        createdAt: new Date().toISOString()
      };

      // Save asynchronously - don't wait
      saveUserData(userId, newUserData).catch(err => {
        logger.error('Error saving to DynamoDB (non-blocking):', err);
      });

      logger.info(`Spreadsheet created successfully: ${spreadsheetId}`);

      // Store in session attributes for immediate use
      const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
      sessionAttributes.spreadsheetId = spreadsheetId;
      sessionAttributes.spreadsheetUrl = spreadsheetUrl;
      sessionAttributes.isNewUser = true;
      handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

      return {
        accessToken,
        spreadsheetId,
        userId,
        ready: true,
        isNewUser: true
      };
    } catch (error) {
      logger.error('Error creating user spreadsheet:', error);

      return {
        response: handlerInput.responseBuilder
          .speak(t('ERROR_CREATING_SPREADSHEET'))
          .withShouldEndSession(true)
          .getResponse(),
        ready: false
      };
    }
  }

  // User is all set - return context
  logger.debug('Returning existing user context');
  return {
    accessToken,
    spreadsheetId: userData.spreadsheetId,
    userId,
    ready: true,
    isNewUser: false
  };
}

/**
 * Wrapper for handlers that require account linking
 * Checks account linking and user data before calling the handler
 * @param {Function} handlerFunction - The actual handler function
 * @returns {Function} Wrapped handler function
 */
function requireAccountLinking(handlerFunction) {
  return async function(handlerInput) {
    const userContext = await getUserContext(handlerInput);

    if (!userContext.ready) {
      return userContext.response;
    }

    // Call the original handler with user context
    return handlerFunction(handlerInput, userContext);
  };
}

module.exports = {
  getUserContext,
  requireAccountLinking
};
