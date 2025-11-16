/**
 * Timezone utilities for Alexa Baby Milk Tracker
 * Gets device timezone and formats times appropriately
 */

/**
 * Get the user's timezone from their Alexa device
 * @param {object} handlerInput - Alexa handler input
 * @returns {Promise<string>} Timezone string (e.g., 'America/New_York') or 'UTC' as fallback
 */
async function getDeviceTimezone(handlerInput) {
  try {
    const { serviceClientFactory, requestEnvelope } = handlerInput;

    if (!serviceClientFactory) {
      console.warn('Service client factory not available');
      return 'UTC';
    }

    const deviceId = requestEnvelope.context.System.device.deviceId;
    const upsServiceClient = serviceClientFactory.getUpsServiceClient();

    const timezone = await upsServiceClient.getSystemTimeZone(deviceId);
    console.log('Device timezone:', timezone);

    return timezone || 'UTC';
  } catch (error) {
    console.error('Error getting device timezone:', error);
    return 'UTC'; // Fallback to UTC
  }
}

/**
 * Format a date/time for speech in the user's timezone
 * @param {Date|string} date - Date object or ISO string
 * @param {string} timezone - IANA timezone string (e.g., 'America/New_York')
 * @returns {string} Formatted time string (e.g., "10:30 AM")
 */
function formatTimeInTimezone(date, timezone = 'UTC') {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    // Format time in the user's timezone
    const formatter = new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: timezone
    });

    return formatter.format(dateObj);
  } catch (error) {
    console.error('Error formatting time:', error);
    // Fallback to simple UTC formatting
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const hours = dateObj.getUTCHours();
    const minutes = dateObj.getUTCMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes} ${ampm}`;
  }
}

/**
 * Format a full date and time for speech in the user's timezone
 * @param {Date|string} date - Date object or ISO string
 * @param {string} timezone - IANA timezone string
 * @param {string} locale - Locale for formatting (e.g., 'es-ES', 'en-US')
 * @returns {string} Formatted date and time string
 */
function formatDateTimeInTimezone(date, timezone = 'UTC', locale = 'es-ES') {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    const formatter = new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: timezone
    });

    return formatter.format(dateObj);
  } catch (error) {
    console.error('Error formatting date/time:', error);
    return date.toString();
  }
}

module.exports = {
  getDeviceTimezone,
  formatTimeInTimezone,
  formatDateTimeInTimezone
};
