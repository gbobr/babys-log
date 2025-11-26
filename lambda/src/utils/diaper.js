/**
 * Diaper tracking utilities
 * Handles diaper change logging and queries
 */

const { google } = require('googleapis');
const { getUserData, updateUserData } = require('./dynamodb');
const logger = require('./logger');

/**
 * Ensure the Diaper sheet exists in the spreadsheet
 * Creates it if it doesn't exist
 */
async function ensureDiaperSheetExists(spreadsheetId, accessToken, locale = 'es-ES') {
  try {
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });

    const sheets = google.sheets({ version: 'v4', auth: oauth2Client });

    // Determine sheet name based on locale
    const sheetName = locale === 'es-ES' ? 'Pañales' : 'Diapers';

    // Get existing sheets
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId,
      fields: 'sheets.properties'
    });

    // Check if Diaper sheet exists
    const diaperSheet = spreadsheet.data.sheets.find(
      sheet => sheet.properties.title === sheetName
    );

    if (diaperSheet) {
      logger.debug(`Diaper sheet "${sheetName}" already exists`);
      return sheetName;
    }

    // Create the Diaper sheet
    logger.info(`Creating Diaper sheet: "${sheetName}"`);

    const headerRow = locale === 'es-ES'
      ? ['Fecha y Hora', 'Tipo', 'Notas', '', '']
      : ['Timestamp', 'Type', 'Notes', '', ''];

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
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
          }
        ]
      }
    });

    // Add header row
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${sheetName}!A1:E1`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [headerRow]
      }
    });

    // Format header row (bold)
    const sheetId = (await sheets.spreadsheets.get({
      spreadsheetId,
      fields: 'sheets.properties'
    })).data.sheets.find(s => s.properties.title === sheetName).properties.sheetId;

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            repeatCell: {
              range: {
                sheetId: sheetId,
                startRowIndex: 0,
                endRowIndex: 1
              },
              cell: {
                userEnteredFormat: {
                  textFormat: {
                    bold: true
                  }
                }
              },
              fields: 'userEnteredFormat.textFormat.bold'
            }
          }
        ]
      }
    });

    logger.info(`Diaper sheet "${sheetName}" created successfully`);
    return sheetName;

  } catch (error) {
    logger.error('Error ensuring Diaper sheet exists:', error);
    throw error;
  }
}

/**
 * Append a diaper change to the spreadsheet
 */
async function appendDiaperChange(spreadsheetId, accessToken, type, notes, locale = 'es-ES') {
  try {
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });

    const sheets = google.sheets({ version: 'v4', auth: oauth2Client });

    // Ensure sheet exists
    const sheetName = await ensureDiaperSheetExists(spreadsheetId, accessToken, locale);

    const timestamp = new Date().toISOString();

    // Type mapping: MOJADO/WET, SUCIO/DIRTY, AMBOS/BOTH
    const row = [
      timestamp,
      type,
      notes || '',
      '',  // Reserved for future use (diaper size)
      ''   // Reserved for future use
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${sheetName}!A:E`,
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: [row]
      }
    });

    logger.info(`Diaper change appended: ${type} at ${timestamp}`);
    return { timestamp, type, notes };

  } catch (error) {
    logger.error('Error appending diaper change:', error);
    throw error;
  }
}

/**
 * Get the last diaper change
 */
async function getLastDiaper(spreadsheetId, accessToken, locale = 'es-ES') {
  try {
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });

    const sheets = google.sheets({ version: 'v4', auth: oauth2Client });

    const sheetName = locale === 'es-ES' ? 'Pañales' : 'Diapers';

    // Get all data (skip header)
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A2:E`
    });

    const rows = response.data.values;

    if (!rows || rows.length === 0) {
      return null;
    }

    // Get the last row
    const lastRow = rows[rows.length - 1];

    return {
      timestamp: lastRow[0],
      type: lastRow[1],
      notes: lastRow[2] || ''
    };

  } catch (error) {
    if (error.code === 400 && error.message.includes('Unable to parse range')) {
      // Sheet doesn't exist yet
      return null;
    }
    logger.error('Error getting last diaper:', error);
    throw error;
  }
}

/**
 * Get today's diaper changes
 */
async function getTodayDiapers(spreadsheetId, accessToken, timezone, locale = 'es-ES') {
  try {
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });

    const sheets = google.sheets({ version: 'v4', auth: oauth2Client });

    const sheetName = locale === 'es-ES' ? 'Pañales' : 'Diapers';

    // Get all data (skip header)
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A2:E`
    });

    const rows = response.data.values;

    if (!rows || rows.length === 0) {
      return {
        count: 0,
        wet: 0,
        dirty: 0,
        mixed: 0,
        diapers: []
      };
    }

    // Filter for today's entries using the timezone
    const now = new Date();
    const startOfDay = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
    startOfDay.setHours(0, 0, 0, 0);

    const todaysDiapers = rows
      .map(row => ({
        timestamp: row[0],
        type: row[1],
        notes: row[2] || ''
      }))
      .filter(diaper => {
        const diaperDate = new Date(diaper.timestamp);
        const diaperLocalDate = new Date(diaperDate.toLocaleString('en-US', { timeZone: timezone }));
        return diaperLocalDate >= startOfDay;
      });

    // Count by type
    let wet = 0;
    let dirty = 0;
    let mixed = 0;

    todaysDiapers.forEach(diaper => {
      if (diaper.type === 'MOJADO' || diaper.type === 'WET') {
        wet++;
      } else if (diaper.type === 'SUCIO' || diaper.type === 'DIRTY') {
        dirty++;
      } else if (diaper.type === 'AMBOS' || diaper.type === 'BOTH' || diaper.type === 'MIXED') {
        mixed++;
      }
    });

    return {
      count: todaysDiapers.length,
      wet,
      dirty,
      mixed,
      diapers: todaysDiapers
    };

  } catch (error) {
    if (error.code === 400 && error.message.includes('Unable to parse range')) {
      // Sheet doesn't exist yet
      return {
        count: 0,
        wet: 0,
        dirty: 0,
        mixed: 0,
        diapers: []
      };
    }
    logger.error('Error getting today\'s diapers:', error);
    throw error;
  }
}

module.exports = {
  ensureDiaperSheetExists,
  appendDiaperChange,
  getLastDiaper,
  getTodayDiapers
};
