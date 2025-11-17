/**
 * Alexa Reminders API utilities
 * Manages automatic feeding reminders for users
 */

const logger = require('./logger');
const { getUserData, updateUserData } = require('./dynamodb');

// Default reminder interval in hours
const DEFAULT_REMINDER_INTERVAL_HOURS = 3;

/**
 * Check if user has granted reminder permissions
 * @param {Object} handlerInput - Alexa handler input
 * @returns {boolean} True if permission granted
 */
function hasReminderPermission(handlerInput) {
  const { requestEnvelope } = handlerInput;
  const permissions = requestEnvelope.context.System.user.permissions;

  if (!permissions || !permissions.consentToken) {
    logger.debug('No reminder permission granted');
    return false;
  }

  logger.debug('Reminder permission granted');
  return true;
}

/**
 * Check if user should be asked for reminder permission
 * This is asked after the first feeding for new users,
 * or for existing users who haven't been asked yet
 * @param {Object} userData - User data from DynamoDB
 * @returns {boolean} True if should ask for permission
 */
function shouldAskForPermission(userData) {
  // If reminderPermissionAsked is undefined or false, ask
  // This handles both new users and existing users after feature deployment
  if (userData.reminderPermissionAsked !== true) {
    logger.debug('Should ask for reminder permission - not asked before');
    return true;
  }

  logger.debug('Already asked for reminder permission');
  return false;
}

/**
 * Mark that we've asked the user for reminder permission
 * @param {string} userId - Alexa user ID
 * @returns {Promise<void>}
 */
async function markPermissionAsked(userId) {
  try {
    await updateUserData(userId, {
      reminderPermissionAsked: true
    });
    logger.info('Marked reminder permission as asked for user');
  } catch (error) {
    logger.error('Error marking permission asked:', error);
    // Don't throw - this is not critical
  }
}

/**
 * Schedule next feeding reminder
 * @param {Object} handlerInput - Alexa handler input
 * @param {string} userId - Alexa user ID
 * @param {string} feedingTime - ISO timestamp of feeding
 * @returns {Promise<string|null>} Reminder ID or null if not created
 */
async function scheduleNextFeedingReminder(handlerInput, userId, feedingTime) {
  try {
    // 1. Check permissions
    if (!hasReminderPermission(handlerInput)) {
      logger.info('No reminder permission, skipping reminder creation');
      return null;
    }

    // 2. Get user preferences from DynamoDB
    const userData = await getUserData(userId);

    // Check if reminders are enabled (default to true)
    if (userData && userData.reminderEnabled === false) {
      logger.info('Reminders disabled for user');
      return null;
    }

    const intervalHours = (userData && userData.reminderIntervalHours) || DEFAULT_REMINDER_INTERVAL_HOURS;
    const offsetSeconds = intervalHours * 60 * 60;

    // 3. Cancel existing reminder if it exists
    if (userData && userData.activeReminderId) {
      await cancelReminder(handlerInput, userData.activeReminderId);
    }

    // 4. Create new reminder
    const { serviceClientFactory, requestEnvelope } = handlerInput;
    const reminderClient = serviceClientFactory.getReminderManagementServiceClient();

    const locale = requestEnvelope.request.locale;
    const reminderText = locale.startsWith('es')
      ? 'Es hora de alimentar al bebé'
      : 'Time to feed the baby';

    const reminderRequest = {
      requestTime: new Date().toISOString(),
      trigger: {
        type: 'SCHEDULED_RELATIVE',
        offsetInSeconds: offsetSeconds
      },
      alertInfo: {
        spokenInfo: {
          content: [{
            locale: locale,
            text: reminderText
          }]
        }
      },
      pushNotification: {
        status: 'ENABLED'
      }
    };

    logger.debug('Creating reminder with offset:', { offsetSeconds, intervalHours });
    const reminderResponse = await reminderClient.createReminder(reminderRequest);

    // 5. Store reminder ID and last feeding time in DynamoDB
    await updateUserData(userId, {
      activeReminderId: reminderResponse.alertToken,
      lastFeedingTime: feedingTime
    });

    logger.info(`Created reminder ${reminderResponse.alertToken} for ${intervalHours} hours from now`);
    return reminderResponse.alertToken;

  } catch (error) {
    // Check for specific error types
    if (error.statusCode === 401 || error.statusCode === 403) {
      logger.info('Reminder permission not granted or revoked');
      return null;
    }

    logger.error('Error creating reminder:', error);
    // Don't throw - we don't want reminder failures to block feeding recording
    return null;
  }
}

/**
 * Cancel an existing reminder
 * @param {Object} handlerInput - Alexa handler input
 * @param {string} reminderId - Reminder alert token
 * @returns {Promise<void>}
 */
async function cancelReminder(handlerInput, reminderId) {
  try {
    const { serviceClientFactory } = handlerInput;
    const reminderClient = serviceClientFactory.getReminderManagementServiceClient();

    await reminderClient.deleteReminder(reminderId);
    logger.info(`Cancelled reminder ${reminderId}`);
  } catch (error) {
    if (error.statusCode === 404) {
      logger.info('Reminder already deleted or expired');
    } else {
      logger.error('Error cancelling reminder:', error);
    }
    // Don't throw - this is not critical
  }
}

/**
 * Disable reminders for a user
 * @param {string} userId - Alexa user ID
 * @param {Object} handlerInput - Alexa handler input (optional, for cancelling active reminder)
 * @returns {Promise<void>}
 */
async function disableReminders(userId, handlerInput = null) {
  try {
    const userData = await getUserData(userId);

    // Cancel active reminder if exists
    if (handlerInput && userData && userData.activeReminderId) {
      await cancelReminder(handlerInput, userData.activeReminderId);
    }

    // Update user preferences
    await updateUserData(userId, {
      reminderEnabled: false,
      activeReminderId: null
    });

    logger.info('Reminders disabled for user');
  } catch (error) {
    logger.error('Error disabling reminders:', error);
    throw error;
  }
}

/**
 * Enable reminders for a user
 * @param {string} userId - Alexa user ID
 * @returns {Promise<void>}
 */
async function enableReminders(userId) {
  try {
    await updateUserData(userId, {
      reminderEnabled: true
    });

    logger.info('Reminders enabled for user');
  } catch (error) {
    logger.error('Error enabling reminders:', error);
    throw error;
  }
}

module.exports = {
  hasReminderPermission,
  shouldAskForPermission,
  markPermissionAsked,
  scheduleNextFeedingReminder,
  cancelReminder,
  disableReminders,
  enableReminders,
  DEFAULT_REMINDER_INTERVAL_HOURS
};
