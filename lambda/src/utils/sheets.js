/**
 * Google Sheets API integration for Baby Milk Tracker
 * Stores feeding records in a Google Sheet
 * Supports both OAuth (for public users) and service account (for development)
 */

const { google } = require('googleapis');
const logger = require('./logger');

/**
 * Initialize Google Sheets client with OAuth token
 * @param {string} accessToken - OAuth 2.0 access token from Alexa account linking
 * @returns {Object} Google Sheets API client
 */
function getSheets(accessToken) {
  try {
    // If access token is provided, use OAuth (production)
    if (accessToken) {
      const auth = new google.auth.OAuth2();
      auth.setCredentials({ access_token: accessToken });
      return google.sheets({ version: 'v4', auth });
    }

    // Fallback to service account for development/testing
    const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS || '{}');
    const auth = new google.auth.GoogleAuth({
      credentials: credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });

    return google.sheets({ version: 'v4', auth });
  } catch (error) {
    logger.error('Error initializing Google Sheets:', error);
    throw error;
  }
}

/**
 * Append a feeding record to the Google Sheet
 * @param {string} spreadsheetId - The user's spreadsheet ID
 * @param {string} accessToken - OAuth access token (optional for dev)
 * @param {string} type - Type of feeding: PECHO, BIBERON_LECHE, BIBERON_FORMULA
 * @param {number|null} amount - Amount in ml (for bottles only)
 * @param {number|null} duration - Duration in minutes (for breastfeeding only)
 * @returns {Promise<boolean>} Success status
 */
async function appendFeeding(spreadsheetId, accessToken, type, amount = null, duration = null) {
  try {
    if (!spreadsheetId) {
      throw new Error('Spreadsheet ID is required');
    }

    const sheets = getSheets(accessToken);

    // Current timestamp in ISO format (adjust timezone as needed)
    const timestamp = new Date().toISOString();

    // Prepare row data
    const values = [[
      timestamp,
      type,
      amount || '',
      duration || '',
      '' // Notes column for future use
    ]];

    const resource = {
      values
    };

    const result = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Feedings!A:E', // Assumes sheet named "Feedings"
      valueInputOption: 'RAW',
      resource
    });

    logger.debug('Feeding recorded successfully');
    return true;
  } catch (error) {
    logger.error('Error appending to Google Sheets:', error);
    throw error;
  }
}

/**
 * Get the last feeding record
 * @param {string} spreadsheetId - The user's spreadsheet ID
 * @param {string} accessToken - OAuth access token (optional for dev)
 * @returns {Promise<Object|null>} Last feeding record or null
 */
async function getLastFeeding(spreadsheetId, accessToken) {
  try {
    if (!spreadsheetId) {
      throw new Error('Spreadsheet ID is required');
    }

    const sheets = getSheets(accessToken);

    const result = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Feedings!A:E'
    });

    const rows = result.data.values;

    if (!rows || rows.length <= 1) { // Skip header row
      return null;
    }

    // Get last row (skip header at index 0)
    const lastRow = rows[rows.length - 1];

    return {
      timestamp: lastRow[0],
      type: lastRow[1],
      amount: lastRow[2] ? parseInt(lastRow[2]) : null,
      duration: lastRow[3] ? parseInt(lastRow[3]) : null,
      notes: lastRow[4] || ''
    };
  } catch (error) {
    logger.error('Error getting last feeding:', error);
    throw error;
  }
}

/**
 * Update the last feeding entry with amount or duration
 * @param {string} spreadsheetId - The user's spreadsheet ID
 * @param {string} accessToken - OAuth access token (optional for dev)
 * @param {number|null} amount - New amount in ml (for bottles)
 * @param {number|null} duration - New duration in minutes (for breastfeeding)
 * @returns {Promise<Object>} Updated feeding record
 */
async function updateLastFeeding(spreadsheetId, accessToken, amount = null, duration = null) {
  try {
    if (!spreadsheetId) {
      throw new Error('Spreadsheet ID is required');
    }

    if (!amount && !duration) {
      throw new Error('Either amount or duration must be provided');
    }

    const sheets = getSheets(accessToken);

    // First, get all rows to find the last one
    const result = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Feedings!A:E'
    });

    const rows = result.data.values;

    if (!rows || rows.length <= 1) { // No data rows (only header or empty)
      throw new Error('No feeding entries to update');
    }

    // Calculate the row number of the last entry (1-indexed, +1 for header)
    const lastRowNumber = rows.length;

    // Get the last feeding data
    const lastRow = rows[rows.length - 1];
    const lastFeeding = {
      timestamp: lastRow[0],
      type: lastRow[1],
      amount: lastRow[2] ? parseInt(lastRow[2]) : null,
      duration: lastRow[3] ? parseInt(lastRow[3]) : null,
      notes: lastRow[4] || '',
      rowNumber: lastRowNumber
    };

    // Update the appropriate column
    if (amount !== null) {
      // Update amount (column C)
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `Feedings!C${lastRowNumber}`,
        valueInputOption: 'RAW',
        resource: {
          values: [[amount]]
        }
      });
      logger.debug(`Updated row with amount: ${amount}`);
      lastFeeding.amount = amount;
    }

    if (duration !== null) {
      // Update duration (column D)
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `Feedings!D${lastRowNumber}`,
        valueInputOption: 'RAW',
        resource: {
          values: [[duration]]
        }
      });
      logger.debug(`Updated row with duration: ${duration}`);
      lastFeeding.duration = duration;
    }

    // Return the updated feeding
    return lastFeeding;
  } catch (error) {
    logger.error('Error updating last feeding:', error);
    throw error;
  }
}

/**
 * Get all feedings for today
 * @param {string} spreadsheetId - The user's spreadsheet ID
 * @param {string} accessToken - OAuth access token (optional for dev)
 * @returns {Promise<Array>} Array of feeding records for today
 */
async function getTodayFeedings(spreadsheetId, accessToken) {
  try {
    if (!spreadsheetId) {
      throw new Error('Spreadsheet ID is required');
    }

    const sheets = getSheets(accessToken);

    const result = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Feedings!A:E'
    });

    const rows = result.data.values;

    if (!rows || rows.length <= 1) { // Skip header row
      return [];
    }

    // Get today's date at midnight (local time)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Filter for today's feedings (skip header at index 0)
    const todayFeedings = rows.slice(1).filter(row => {
      const feedingDate = new Date(row[0]);
      return feedingDate >= today;
    }).map(row => ({
      timestamp: row[0],
      type: row[1],
      amount: row[2] ? parseInt(row[2]) : null,
      duration: row[3] ? parseInt(row[3]) : null,
      notes: row[4] || ''
    }));

    return todayFeedings;
  } catch (error) {
    logger.error('Error getting today\'s feedings:', error);
    throw error;
  }
}

/**
 * Initialize the spreadsheet with headers if needed
 * Call this once during setup to create the sheet structure
 * @param {string} spreadsheetId - The user's spreadsheet ID
 * @param {string} accessToken - OAuth access token (optional for dev)
 * @returns {Promise<boolean>} Success status
 */
async function initializeSpreadsheet(spreadsheetId, accessToken) {
  try {
    if (!spreadsheetId) {
      throw new Error('Spreadsheet ID is required');
    }

    const sheets = getSheets(accessToken);

    // Check if sheet exists and has headers
    const result = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Feedings!A1:E1'
    });

    if (!result.data.values || result.data.values.length === 0) {
      // Add headers
      const values = [[
        'Timestamp',
        'Type',
        'Amount (ml)',
        'Duration (min)',
        'Notes'
      ]];

      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: 'Feedings!A1:E1',
        valueInputOption: 'RAW',
        resource: { values }
      });

      logger.debug('Spreadsheet initialized with headers');
    }

    return true;
  } catch (error) {
    logger.error('Error initializing spreadsheet:', error);
    throw error;
  }
}

/**
 * Create a new spreadsheet for a user
 * Called automatically on first use after account linking
 * @param {string} accessToken - OAuth access token
 * @param {string} userName - Optional user name for spreadsheet title
 * @returns {Promise<Object>} Object with spreadsheetId and spreadsheetUrl
 */
/**
 * Helper to wait for a specified time
 * @param {number} ms - Milliseconds to wait
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function createUserSpreadsheet(accessToken, userName = null) {
  try {
    if (!accessToken) {
      throw new Error('Access token is required to create a spreadsheet');
    }

    const sheets = getSheets(accessToken);

    // Create the spreadsheet
    const title = userName ? `Bitácora del Bebé - ${userName}` : 'Bitácora del Bebé';

    logger.info('Creating new spreadsheet');
    const createResponse = await sheets.spreadsheets.create({
      resource: {
        properties: {
          title: title,
          locale: 'es_ES',
          timeZone: 'Europe/Madrid'
        },
        sheets: [{
          properties: {
            title: 'Feedings',
            gridProperties: {
              frozenRowCount: 1
            }
          }
        }]
      }
    });

    const spreadsheetId = createResponse.data.spreadsheetId;
    const spreadsheetUrl = createResponse.data.spreadsheetUrl;
    const sheetId = createResponse.data.sheets[0].properties.sheetId;

    logger.info(`Spreadsheet created: ${spreadsheetId}`);

    // Wait for Google's eventual consistency (2 seconds)
    logger.debug('Waiting for Google Drive propagation');
    await delay(2000);

    // Initialize with headers
    logger.debug('Adding headers');
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'Feedings!A1:E1',
      valueInputOption: 'RAW',
      resource: {
        values: [[
          'Timestamp',
          'Type',
          'Amount (ml)',
          'Duration (min)',
          'Notes'
        ]]
      }
    });

    // Format the header row (optional - don't fail if this errors)
    try {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        resource: {
          requests: [{
            repeatCell: {
              range: {
                sheetId: sheetId,
                startRowIndex: 0,
                endRowIndex: 1
              },
              cell: {
                userEnteredFormat: {
                  backgroundColor: {
                    red: 0.2,
                    green: 0.6,
                    blue: 0.86
                  },
                  textFormat: {
                    foregroundColor: {
                      red: 1.0,
                      green: 1.0,
                      blue: 1.0
                    },
                    fontSize: 11,
                    bold: true
                  }
                }
              },
              fields: 'userEnteredFormat(backgroundColor,textFormat)'
            }
          }]
        }
      });
      logger.debug('Header formatting applied');
    } catch (formatError) {
      logger.debug('Could not format headers (non-critical):', formatError.message);
    }

    return {
      spreadsheetId,
      spreadsheetUrl
    };
  } catch (error) {
    logger.error('Error creating user spreadsheet:', error);
    throw error;
  }
}

/**
 * Check if a spreadsheet exists and is accessible
 * @param {string} spreadsheetId - The spreadsheet ID to check
 * @param {string} accessToken - OAuth access token
 * @returns {Promise<boolean>} True if spreadsheet exists and is accessible
 */
async function spreadsheetExists(spreadsheetId, accessToken) {
  try {
    // Use Drive API to check if file is trashed
    // We need to check Drive API because Sheets API can still access trashed files
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });
    const drive = google.drive({ version: 'v3', auth });

    logger.debug('Checking if spreadsheet exists and is not trashed');

    const response = await drive.files.get({
      fileId: spreadsheetId,
      fields: 'id,name,trashed'
    });

    const isTrashed = response.data.trashed || false;

    if (isTrashed) {
      logger.info('Spreadsheet is trashed, treating as non-existent');
      return false;
    }

    logger.debug('Spreadsheet exists and is not trashed');
    return true;
  } catch (error) {
    if (error.code === 404 || error.status === 404) {
      logger.info('Spreadsheet not found (deleted)');
      return false;
    }

    // Other errors (permissions, network, etc.) - assume it exists but we can't access it
    logger.debug('Error checking spreadsheet, assuming it exists:', error.message);
    return true; // Assume exists to avoid creating duplicates
  }
}

module.exports = {
  appendFeeding,
  getLastFeeding,
  updateLastFeeding,
  getTodayFeedings,
  initializeSpreadsheet,
  createUserSpreadsheet,
  spreadsheetExists
};
