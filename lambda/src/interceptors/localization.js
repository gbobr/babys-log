/**
 * Localization Request Interceptor
 * Loads appropriate language strings based on request locale
 */

const strings = require('../utils/strings');

/**
 * Request interceptor to set up localization
 */
const LocalizationInterceptor = {
  process(handlerInput) {
    const locale = handlerInput.requestEnvelope.request.locale;

    // Get strings for locale, fallback to es-ES
    const localeStrings = strings[locale] || strings['es-ES'];

    // Add translation function to request attributes
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();

    requestAttributes.t = function(key, params = {}) {
      let text = localeStrings[key] || key;

      // Replace parameters in template strings
      Object.keys(params).forEach(param => {
        text = text.replace(`{${param}}`, params[param]);
      });

      return text;
    };

    // Also add direct access to strings
    requestAttributes.strings = localeStrings;
  }
};

module.exports = LocalizationInterceptor;
