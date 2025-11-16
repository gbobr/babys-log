/**
 * Google Sheets API integration for Baby Milk Tracker
 * Stores feeding records in a Google Sheet
 */

const { google } = require('googleapis');

/**
 * Initialize Google Sheets client
 * Requires GOOGLE_CREDENTIALS environment variable with service account JSON
 */
function getSheets() {
  try {
    const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS || '{}');

    const auth = new google.auth.GoogleAuth({
      credentials: credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });

    return google.sheets({ version: 'v4', auth });
  } catch (error) {
    console.error('Error initializing Google Sheets:', error);
    throw error;
  }
}

/**
 * Append a feeding record to the Google Sheet
 * @param {string} type - Type of feeding: PECHO, BIBERON_LECHE, BIBERON_FORMULA
 * @param {number|null} amount - Amount in ml (for bottles only)
 * @param {number|null} duration - Duration in minutes (for breastfeeding only)
 * @returns {Promise<boolean>} Success status
 */
async function appendFeeding(type, amount = null, duration = null) {
  try {
    const spreadsheetId = process.env.SPREADSHEET_ID;

    if (!spreadsheetId) {
      throw new Error('SPREADSHEET_ID environment variable not set');
    }

    const sheets = getSheets();

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

    console.log('Feeding recorded:', result.data);
    return true;
  } catch (error) {
    console.error('Error appending to Google Sheets:', error);
    throw error;
  }
}

/**
 * Get the last feeding record
 * @returns {Promise<Object|null>} Last feeding record or null
 */
async function getLastFeeding() {
  try {
    const spreadsheetId = process.env.SPREADSHEET_ID;

    if (!spreadsheetId) {
      throw new Error('SPREADSHEET_ID environment variable not set');
    }

    const sheets = getSheets();

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
    console.error('Error getting last feeding:', error);
    throw error;
  }
}

/**
 * Update the last feeding entry with amount or duration
 * @param {number|null} amount - New amount in ml (for bottles)
 * @param {number|null} duration - New duration in minutes (for breastfeeding)
 * @returns {Promise<Object>} Updated feeding record
 */
async function updateLastFeeding(amount = null, duration = null) {
  try {
    const spreadsheetId = process.env.SPREADSHEET_ID;

    if (!spreadsheetId) {
      throw new Error('SPREADSHEET_ID environment variable not set');
    }

    if (!amount && !duration) {
      throw new Error('Either amount or duration must be provided');
    }

    const sheets = getSheets();

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
      console.log(`Updated row ${lastRowNumber} with amount: ${amount}`);
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
      console.log(`Updated row ${lastRowNumber} with duration: ${duration}`);
      lastFeeding.duration = duration;
    }

    // Return the updated feeding
    return lastFeeding;
  } catch (error) {
    console.error('Error updating last feeding:', error);
    throw error;
  }
}

/**
 * Get all feedings for today
 * @returns {Promise<Array>} Array of feeding records for today
 */
async function getTodayFeedings() {
  try {
    const spreadsheetId = process.env.SPREADSHEET_ID;

    if (!spreadsheetId) {
      throw new Error('SPREADSHEET_ID environment variable not set');
    }

    const sheets = getSheets();

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
    console.error('Error getting today\'s feedings:', error);
    throw error;
  }
}

/**
 * Initialize the spreadsheet with headers if needed
 * Call this once during setup to create the sheet structure
 * @returns {Promise<boolean>} Success status
 */
async function initializeSpreadsheet() {
  try {
    const spreadsheetId = process.env.SPREADSHEET_ID;

    if (!spreadsheetId) {
      throw new Error('SPREADSHEET_ID environment variable not set');
    }

    const sheets = getSheets();

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

      console.log('Spreadsheet initialized with headers');
    }

    return true;
  } catch (error) {
    console.error('Error initializing spreadsheet:', error);
    throw error;
  }
}

module.exports = {
  appendFeeding,
  getLastFeeding,
  updateLastFeeding,
  getTodayFeedings,
  initializeSpreadsheet
};
