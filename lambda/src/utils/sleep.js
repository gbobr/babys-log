/**
 * Sleep tracking utilities for Google Sheets
 * Manages sleep sessions in a dedicated "Sueño" sheet
 */

const { google } = require('googleapis');
const logger = require('./logger');
const { updateUserData } = require('./dynamodb');

const SLEEP_SHEET_NAME = 'Sueño';
const SLEEP_SHEET_NAME_EN = 'Sleep';

/**
 * Ensure the sleep sheet exists in the spreadsheet
 * Creates it if it doesn't exist (backward compatibility)
 * @param {string} spreadsheetId - Google Sheets spreadsheet ID
 * @param {string} accessToken - OAuth access token
 * @param {string} locale - User's locale (for sheet name)
 * @returns {Promise<string>} Sheet name that was ensured
 */
async function ensureSleepSheetExists(spreadsheetId, accessToken, locale = 'es-ES') {
  try {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });
    const sheets = google.sheets({ version: 'v4', auth });

    // Determine sheet name based on locale
    const sheetName = locale.startsWith('es') ? SLEEP_SHEET_NAME : SLEEP_SHEET_NAME_EN;

    logger.debug('Checking if sleep sheet exists:', { sheetName });

    // Get all sheets in spreadsheet
    const response = await sheets.spreadsheets.get({
      spreadsheetId: spreadsheetId,
      fields: 'sheets.properties.title'
    });

    const existingSheets = response.data.sheets.map(sheet => sheet.properties.title);
    logger.debug('Existing sheets:', existingSheets);

    // Check if sleep sheet already exists
    if (existingSheets.includes(sheetName)) {
      logger.debug('Sleep sheet already exists');
      return sheetName;
    }

    // Create sleep sheet
    logger.info('Creating sleep sheet:', { sheetName });

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: spreadsheetId,
      resource: {
        requests: [{
          addSheet: {
            properties: {
              title: sheetName,
              gridProperties: {
                rowCount: 1000,
                columnCount: 5,
                frozenRowCount: 1
              }
            }
          }
        }]
      }
    });

    // Add headers
    const headers = locale.startsWith('es')
      ? ['Inicio', 'Fin', 'Duración (min)', 'Duración (horas)', 'Notas']
      : ['Start', 'End', 'Duration (min)', 'Duration (hours)', 'Notes'];

    await sheets.spreadsheets.values.update({
      spreadsheetId: spreadsheetId,
      range: `${sheetName}!A1:E1`,
      valueInputOption: 'RAW',
      resource: {
        values: [headers]
      }
    });

    // Format header row (bold, frozen)
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: spreadsheetId,
      resource: {
        requests: [{
          repeatCell: {
            range: {
              sheetId: (await getSheetId(sheets, spreadsheetId, sheetName)),
              startRowIndex: 0,
              endRowIndex: 1
            },
            cell: {
              userEnteredFormat: {
                backgroundColor: { red: 0.9, green: 0.9, blue: 0.9 },
                textFormat: { bold: true }
              }
            },
            fields: 'userEnteredFormat(backgroundColor,textFormat)'
          }
        }]
      }
    });

    logger.info('Sleep sheet created successfully:', { sheetName });
    return sheetName;

  } catch (error) {
    logger.error('Error ensuring sleep sheet exists:', error);
    throw error;
  }
}

/**
 * Get sheet ID by sheet name (helper function)
 */
async function getSheetId(sheets, spreadsheetId, sheetName) {
  const response = await sheets.spreadsheets.get({
    spreadsheetId: spreadsheetId,
    fields: 'sheets.properties'
  });

  const sheet = response.data.sheets.find(s => s.properties.title === sheetName);
  return sheet ? sheet.properties.sheetId : 0;
}

/**
 * Start a sleep session
 * @param {string} spreadsheetId - Google Sheets spreadsheet ID
 * @param {string} accessToken - OAuth access token
 * @param {string} userId - Alexa user ID
 * @param {string} locale - User's locale
 * @returns {Promise<Object>} Session info { startTime }
 */
async function startSleepSession(spreadsheetId, accessToken, userId, locale = 'es-ES') {
  try {
    // Ensure sleep sheet exists
    await ensureSleepSheetExists(spreadsheetId, accessToken, locale);

    const startTime = new Date().toISOString();

    // Store active session in DynamoDB
    await updateUserData(userId, {
      activeSleepSessionStart: startTime,
      sleepSheetExists: true
    });

    logger.info('Sleep session started:', { userId, startTime });

    return { startTime };

  } catch (error) {
    logger.error('Error starting sleep session:', error);
    throw error;
  }
}

/**
 * End a sleep session and log to sheet
 * @param {string} spreadsheetId - Google Sheets spreadsheet ID
 * @param {string} accessToken - OAuth access token
 * @param {string} userId - Alexa user ID
 * @param {string} startTime - ISO timestamp of sleep start
 * @param {string} locale - User's locale
 * @returns {Promise<Object>} Session info { startTime, endTime, durationMinutes }
 */
async function endSleepSession(spreadsheetId, accessToken, userId, startTime, locale = 'es-ES') {
  try {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });
    const sheets = google.sheets({ version: 'v4', auth });

    const sheetName = locale.startsWith('es') ? SLEEP_SHEET_NAME : SLEEP_SHEET_NAME_EN;
    const endTime = new Date().toISOString();

    // Calculate duration
    const start = new Date(startTime);
    const end = new Date(endTime);
    const durationMinutes = Math.round((end - start) / 1000 / 60);
    const durationHours = (durationMinutes / 60).toFixed(2);

    // Append to sleep sheet
    const row = [
      startTime,
      endTime,
      durationMinutes,
      `=C${await getNextRow(sheets, spreadsheetId, sheetName)}/60`, // Formula for hours
      '' // Notes (empty for now)
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: spreadsheetId,
      range: `${sheetName}!A:E`,
      valueInputOption: 'USER_ENTERED', // USER_ENTERED to process formulas
      resource: {
        values: [row]
      }
    });

    // Clear active session in DynamoDB
    await updateUserData(userId, {
      activeSleepSessionStart: null
    });

    logger.info('Sleep session ended:', { userId, startTime, endTime, durationMinutes });

    return {
      startTime,
      endTime,
      durationMinutes,
      durationHours: parseFloat(durationHours)
    };

  } catch (error) {
    logger.error('Error ending sleep session:', error);
    throw error;
  }
}

/**
 * Get the next available row number in a sheet
 */
async function getNextRow(sheets, spreadsheetId, sheetName) {
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: spreadsheetId,
    range: `${sheetName}!A:A`
  });

  const rows = response.data.values || [];
  return rows.length + 1;
}

/**
 * Get the last sleep session
 * @param {string} spreadsheetId - Google Sheets spreadsheet ID
 * @param {string} accessToken - OAuth access token
 * @param {string} locale - User's locale
 * @returns {Promise<Object|null>} Sleep session or null if none found
 */
async function getLastSleep(spreadsheetId, accessToken, locale = 'es-ES') {
  try {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });
    const sheets = google.sheets({ version: 'v4', auth });

    const sheetName = locale.startsWith('es') ? SLEEP_SHEET_NAME : SLEEP_SHEET_NAME_EN;

    // Check if sheet exists first
    try {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: spreadsheetId,
        range: `${sheetName}!A:E`
      });

      const rows = response.data.values || [];

      // Skip header row and get last row
      if (rows.length <= 1) {
        logger.debug('No sleep sessions found');
        return null;
      }

      const lastRow = rows[rows.length - 1];
      const [startTime, endTime, durationMinutes, durationHours, notes] = lastRow;

      return {
        startTime,
        endTime,
        durationMinutes: parseInt(durationMinutes) || 0,
        durationHours: parseFloat(durationHours) || 0,
        notes
      };

    } catch (error) {
      if (error.code === 400) {
        // Sheet doesn't exist yet
        logger.debug('Sleep sheet does not exist yet');
        return null;
      }
      throw error;
    }

  } catch (error) {
    logger.error('Error getting last sleep:', error);
    throw error;
  }
}

/**
 * Get today's sleep summary
 * @param {string} spreadsheetId - Google Sheets spreadsheet ID
 * @param {string} accessToken - OAuth access token
 * @param {string} timezone - User's timezone
 * @param {string} locale - User's locale
 * @returns {Promise<Object>} Sleep summary { count, totalMinutes, sessions }
 */
async function getTodaySleep(spreadsheetId, accessToken, timezone = 'UTC', locale = 'es-ES') {
  try {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });
    const sheets = google.sheets({ version: 'v4', auth });

    const sheetName = locale.startsWith('es') ? SLEEP_SHEET_NAME : SLEEP_SHEET_NAME_EN;

    // Check if sheet exists
    try {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: spreadsheetId,
        range: `${sheetName}!A:E`
      });

      const rows = response.data.values || [];

      // Skip header row
      if (rows.length <= 1) {
        return { count: 0, totalMinutes: 0, sessions: [] };
      }

      // Get today's date in user's timezone
      const now = new Date();
      const todayStart = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
      todayStart.setHours(0, 0, 0, 0);

      // Filter sessions from today
      const todaySessions = rows.slice(1).filter(row => {
        const startTime = new Date(row[0]);
        const sessionDate = new Date(startTime.toLocaleString('en-US', { timeZone: timezone }));
        sessionDate.setHours(0, 0, 0, 0);
        return sessionDate.getTime() === todayStart.getTime();
      });

      // Calculate total
      let totalMinutes = 0;
      const sessions = todaySessions.map(row => {
        const durationMinutes = parseInt(row[2]) || 0;
        totalMinutes += durationMinutes;
        return {
          startTime: row[0],
          endTime: row[1],
          durationMinutes,
          durationHours: parseFloat(row[3]) || 0
        };
      });

      logger.debug('Today\'s sleep summary:', { count: sessions.length, totalMinutes });

      return {
        count: sessions.length,
        totalMinutes,
        totalHours: (totalMinutes / 60).toFixed(1),
        sessions
      };

    } catch (error) {
      if (error.code === 400) {
        // Sheet doesn't exist yet
        return { count: 0, totalMinutes: 0, sessions: [] };
      }
      throw error;
    }

  } catch (error) {
    logger.error('Error getting today\'s sleep:', error);
    throw error;
  }
}

/**
 * Format duration for speech output
 * @param {number} minutes - Duration in minutes
 * @param {string} locale - User's locale
 * @returns {string} Formatted duration (e.g., "2 horas y 30 minutos")
 */
function formatDuration(minutes, locale = 'es-ES') {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (locale.startsWith('es')) {
    if (hours === 0) {
      return `${mins} ${mins === 1 ? 'minuto' : 'minutos'}`;
    } else if (mins === 0) {
      return `${hours} ${hours === 1 ? 'hora' : 'horas'}`;
    } else {
      return `${hours} ${hours === 1 ? 'hora' : 'horas'} y ${mins} ${mins === 1 ? 'minuto' : 'minutos'}`;
    }
  } else {
    // English
    if (hours === 0) {
      return `${mins} ${mins === 1 ? 'minute' : 'minutes'}`;
    } else if (mins === 0) {
      return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
    } else {
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} and ${mins} ${mins === 1 ? 'minute' : 'minutes'}`;
    }
  }
}

module.exports = {
  ensureSleepSheetExists,
  startSleepSession,
  endSleepSession,
  getLastSleep,
  getTodaySleep,
  formatDuration
};
