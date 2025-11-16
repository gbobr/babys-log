/**
 * Query handlers for the Baby Milk Tracker skill
 * Handles requests for last feeding and daily summary
 */

const { getLastFeeding, getTodayFeedings } = require('../utils/sheets');
const { getDeviceTimezone, formatTimeInTimezone } = require('../utils/timezone');

/**
 * Get localized type string
 */
function getTypeString(type, t) {
  switch (type) {
    case 'PECHO':
      return t('TYPE_BREASTFEEDING');
    case 'BIBERON_LECHE':
      return t('TYPE_BOTTLE_MILK');
    case 'BIBERON_FORMULA':
      return t('TYPE_BOTTLE_FORMULA');
    case 'REGURGITACION':
      return t('TYPE_REGURGITATION');
    default:
      return type;
  }
}

// ===== LAST FEEDING =====

const LastFeedingIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'ConsultarUltimaTomIntent';
  },
  async handle(handlerInput) {
    const { t } = handlerInput.attributesManager.getRequestAttributes();

    try {
      const lastFeeding = await getLastFeeding();

      if (!lastFeeding) {
        return handlerInput.responseBuilder
          .speak(t('NO_FEEDINGS_TODAY'))
          .withShouldEndSession(true)
          .getResponse();
      }

      const timezone = await getDeviceTimezone(handlerInput);
      const time = formatTimeInTimezone(new Date(lastFeeding.timestamp), timezone);
      const type = getTypeString(lastFeeding.type, t);

      // Build detail text (amount for bottles, duration for breastfeeding)
      let detailText = '';
      if (lastFeeding.amount) {
        detailText = t('AMOUNT_ML', { amount: lastFeeding.amount });
      } else if (lastFeeding.duration) {
        detailText = t('DURATION_MIN', { duration: lastFeeding.duration });
      }

      const speechText = t('LAST_FEEDING', { type, time, amount: detailText });

      return handlerInput.responseBuilder
        .speak(speechText)
        .withShouldEndSession(true)
        .getResponse();

    } catch (error) {
      console.error('Error getting last feeding:', error);

      return handlerInput.responseBuilder
        .speak(t('ERROR_SHEETS'))
        .withShouldEndSession(true)
        .getResponse();
    }
  }
};

// ===== DAILY SUMMARY =====

const DailySummaryIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'ConsultarResumenDiaIntent';
  },
  async handle(handlerInput) {
    const { t } = handlerInput.attributesManager.getRequestAttributes();

    try {
      const feedings = await getTodayFeedings();

      if (feedings.length === 0) {
        return handlerInput.responseBuilder
          .speak(t('NO_FEEDINGS_TODAY'))
          .withShouldEndSession(true)
          .getResponse();
      }

      // Count feedings by type
      const counts = {
        PECHO: 0,
        BIBERON_LECHE: 0,
        BIBERON_FORMULA: 0,
        REGURGITACION: 0
      };

      let totalMl = 0;
      let totalMinutes = 0;

      feedings.forEach(feeding => {
        counts[feeding.type] = (counts[feeding.type] || 0) + 1;
        if (feeding.amount) {
          totalMl += feeding.amount;
        }
        if (feeding.duration) {
          totalMinutes += feeding.duration;
        }
      });

      // Build details string
      const details = [];

      if (counts.PECHO > 0) {
        details.push(`${counts.PECHO} ${t('TYPE_BREASTFEEDING')}`);
      }

      if (counts.BIBERON_LECHE > 0) {
        details.push(`${counts.BIBERON_LECHE} ${t('TYPE_BOTTLE_MILK')}`);
      }

      if (counts.BIBERON_FORMULA > 0) {
        details.push(`${counts.BIBERON_FORMULA} ${t('TYPE_BOTTLE_FORMULA')}`);
      }

      if (counts.REGURGITACION > 0) {
        details.push(`${counts.REGURGITACION} ${t('TYPE_REGURGITATION')}`);
      }

      const detailsText = details.join(', ');

      let speechText = t('DAILY_SUMMARY', {
        count: feedings.length,
        details: detailsText
      });

      // Add totals if any
      const totals = [];
      if (totalMl > 0) {
        totals.push(`${totalMl} mililitros`);
      }
      if (totalMinutes > 0) {
        totals.push(`${totalMinutes} minutos`);
      }
      if (totals.length > 0) {
        speechText += ` Total: ${totals.join(' y ')}.`;
      }

      return handlerInput.responseBuilder
        .speak(speechText)
        .withShouldEndSession(true)
        .getResponse();

    } catch (error) {
      console.error('Error getting daily summary:', error);

      return handlerInput.responseBuilder
        .speak(t('ERROR_SHEETS'))
        .withShouldEndSession(true)
        .getResponse();
    }
  }
};

module.exports = {
  LastFeedingIntentHandler,
  DailySummaryIntentHandler
};
