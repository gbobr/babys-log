/**
 * Simple logging utility with environment-based control
 * Set LOG_LEVEL environment variable to control verbosity:
 * - 'ERROR' (default): Only errors
 * - 'INFO': Errors and important info
 * - 'DEBUG': Everything
 */

const LOG_LEVEL = process.env.LOG_LEVEL || 'ERROR';

const LEVELS = {
  ERROR: 0,
  INFO: 1,
  DEBUG: 2
};

const currentLevel = LEVELS[LOG_LEVEL] || LEVELS.ERROR;

function debug(...args) {
  if (currentLevel >= LEVELS.DEBUG) {
    console.log('[DEBUG]', ...args);
  }
}

function info(...args) {
  if (currentLevel >= LEVELS.INFO) {
    console.log('[INFO]', ...args);
  }
}

function error(...args) {
  // Always log errors
  console.error('[ERROR]', ...args);
}

module.exports = {
  debug,
  info,
  error
};
