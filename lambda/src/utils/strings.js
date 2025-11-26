/**
 * Localized strings for the Baby Milk Tracker skill
 * Primary language: Spanish (es-ES)
 * Prepared for internationalization: English (en-US)
 */

module.exports = {
  'es-ES': {
    WELCOME: '¡Bienvenido a la Bitácora del Bebé! Puedes registrar tomas de pecho, biberones con leche materna o fórmula, y también regurgitaciones. ¿Qué quieres hacer?',
    WELCOME_REPROMPT: '¿Quieres registrar una toma?',

    // Account linking
    ACCOUNT_LINKING_REQUIRED: 'Para usar esta skill, necesitas vincular tu cuenta de Google. Por favor, revisa la aplicación Alexa para conectar tu cuenta.',
    FIRST_TIME_SETUP_COMPLETE: '¡Perfecto! He creado tu hoja de cálculo personal en Google Sheets. Ya puedes empezar a registrar las tomas del bebé. ¿Qué quieres hacer?',
    ERROR_CREATING_SPREADSHEET: 'Lo siento, hubo un problema al crear tu hoja de cálculo. Por favor, verifica que has vinculado tu cuenta correctamente e intenta de nuevo.',

    // Breastfeeding
    BREASTFEEDING_CONFIRM: '¿Confirmas que el bebé tomó pecho?',
    BREASTFEEDING_REGISTERED: 'Perfecto. Toma de pecho registrada a las {time}.',
    BREASTFEEDING_CANCELLED: 'De acuerdo, no registraré la toma de pecho.',

    // Bottle with human milk
    BOTTLE_MILK_CONFIRM: '¿Confirmas que el bebé tomó biberón con leche materna{amount}?',
    BOTTLE_MILK_REGISTERED: 'Perfecto. Biberón con leche materna registrado a las {time}{amount}.',
    BOTTLE_MILK_CANCELLED: 'De acuerdo, no registraré el biberón con leche materna.',

    // Bottle with formula
    BOTTLE_FORMULA_CONFIRM: '¿Confirmas que el bebé tomó biberón con fórmula{amount}?',
    BOTTLE_FORMULA_REGISTERED: 'Perfecto. Biberón con fórmula registrado a las {time}{amount}.',
    BOTTLE_FORMULA_CANCELLED: 'De acuerdo, no registraré el biberón con fórmula.',

    // Regurgitation
    REGURGITATION_CONFIRM: '¿Confirmas que el bebé regurgitó?',
    REGURGITATION_REGISTERED: 'Entendido. Regurgitación registrada a las {time}.',
    REGURGITATION_CANCELLED: 'De acuerdo, no registraré la regurgitación.',

    // Update last entry
    UPDATE_AMOUNT_CONFIRM: '¿Confirmas que quieres actualizar {type} a las {time} con {amount} mililitros?',
    UPDATE_DURATION_CONFIRM: '¿Confirmas que quieres actualizar {type} a las {time} con {duration} minutos?',
    UPDATE_AMOUNT_SUCCESS: 'Perfecto. Entrada actualizada con {amount} mililitros.',
    UPDATE_DURATION_SUCCESS: 'Perfecto. Entrada actualizada con {duration} minutos.',
    UPDATE_CANCELLED: 'De acuerdo, no actualizaré la entrada.',
    UPDATE_NO_ENTRY: 'No hay entradas para actualizar.',
    UPDATE_AMOUNT_NOT_BOTTLE: 'La última entrada es {type}, que no tiene cantidad. Solo puedes actualizar biberones con cantidad en mililitros.',
    UPDATE_DURATION_NOT_BREASTFEEDING: 'La última entrada es {type}, que no tiene duración. Solo puedes actualizar tomas de pecho con duración en minutos.',

    // Query responses
    LAST_FEEDING: 'La última toma fue {type} a las {time}{amount}.',
    NO_FEEDINGS_TODAY: 'No hay tomas registradas hoy.',
    DAILY_SUMMARY: 'Hoy el bebé ha tenido {count} tomas: {details}.',

    // Types for responses
    TYPE_BREASTFEEDING: 'pecho',
    TYPE_BOTTLE_MILK: 'biberón con leche materna',
    TYPE_BOTTLE_FORMULA: 'biberón con fórmula',
    TYPE_REGURGITATION: 'regurgitación',

    // Amounts and durations
    AMOUNT_ML: ' de {amount} mililitros',
    DURATION_MIN: ' de {duration} minutos',

    // Progressive response
    PROCESSING: 'Un momento, registrando...',

    // Help
    HELP: 'Puedes registrar tomas diciendo: registra toma de pecho, el bebé tomó biberón con leche materna, anota biberón con fórmula, o registra regurgitación. También puedes preguntar: cuál fue la última toma, o dame el resumen del día. ¿Qué quieres hacer?',
    HELP_REPROMPT: '¿Qué quieres hacer?',

    // Errors
    ERROR: 'Lo siento, hubo un problema al procesar tu solicitud. Por favor, intenta de nuevo.',
    ERROR_SHEETS: 'Lo siento, no pude guardar la información en este momento. Por favor, intenta de nuevo más tarde.',
    FALLBACK: 'Lo siento, no entendí eso. Puedes decir: registra toma de pecho, anota biberón con leche materna, o dame el resumen del día.',

    // Goodbye
    GOODBYE: '¡Hasta luego! Cuida bien al bebé.',

    // Reminders
    REMINDER_PERMISSION_REQUEST: 'Toma registrada! ¿Te gustaría que te recuerde cada 3 horas cuando es hora de alimentar al bebé?',
    REMINDER_PERMISSION_CARD: 'Para recibir recordatorios de alimentación, necesito tu permiso. Por favor habilita los permisos de recordatorios en la aplicación Alexa.',
    REMINDER_PERMISSION_GRANTED: 'Perfecto! Por favor revisa tu aplicación de Alexa para dar permisos de recordatorios. Una vez que otorgues el permiso, tu siguiente toma configurará los recordatorios.',
    REMINDER_PERMISSION_DECLINED: 'De acuerdo, no configuraré recordatorios. Siempre puedes habilitarlos más tarde.',
    REMINDER_PERMISSION_REPROMPT: '¿Te gustaría que te recuerde cuando alimentar al bebé?',

    // Sleep tracking - Start
    SLEEP_START_CONFIRM: '¿Confirmas que el bebé se durmió?',
    SLEEP_START_REGISTERED: 'Perfecto. Inicio de sueño registrado a las {time}.',
    SLEEP_START_CANCELLED: 'De acuerdo, no registraré el inicio de sueño.',
    SLEEP_ALREADY_ACTIVE: 'Ya hay una sesión de sueño activa desde las {time}. ¿Quieres terminar esa sesión y empezar una nueva?',

    // Sleep tracking - End
    SLEEP_END_CONFIRM: '¿Confirmas que el bebé se despertó?',
    SLEEP_END_REGISTERED: 'Perfecto. El bebé durmió {duration}, desde las {startTime} hasta las {endTime}.',
    SLEEP_END_CANCELLED: 'De acuerdo, no registraré el fin de sueño.',
    SLEEP_NO_ACTIVE_SESSION: 'No hay ninguna sesión de sueño activa. ¿Quieres que te ayude a registrar una siesta que ya terminó?',
    SLEEP_SHORT_WARNING: 'El bebé durmió solo {duration}. ¿Confirmas que se despertó?',

    // Sleep tracking - Queries
    LAST_SLEEP: 'La última siesta fue de {duration}, desde las {startTime} hasta las {endTime}.',
    LAST_SLEEP_ONGOING: 'El bebé está durmiendo ahora, desde las {startTime}. Lleva {duration} dormido.',
    NO_SLEEP_TODAY: 'No hay siestas registradas hoy.',
    DAILY_SLEEP_SUMMARY: 'Hoy el bebé ha dormido {count} {napWord} con un total de {totalDuration}.',
    DAILY_SLEEP_WITH_ONGOING: 'Hoy el bebé ha dormido {count} {napWord} con un total de {totalDuration}. Ahora está durmiendo desde las {currentStart}.',

    // Sleep types
    NAP_SINGULAR: 'siesta',
    NAP_PLURAL: 'siestas',
    TYPE_SLEEP: 'sueño',

    // Yes/No
    YES: 'sí',
    NO: 'no'
  },

  'en-US': {
    WELCOME: 'Welcome to Baby Milk Tracker! You can register breastfeeding, bottles with breast milk or formula, and also regurgitations. What would you like to do?',
    WELCOME_REPROMPT: 'Would you like to register a feeding?',

    // Account linking
    ACCOUNT_LINKING_REQUIRED: 'To use this skill, you need to link your Google account. Please check the Alexa app to connect your account.',
    FIRST_TIME_SETUP_COMPLETE: 'Perfect! I\'ve created your personal spreadsheet in Google Sheets. You can now start tracking baby\'s feedings. What would you like to do?',
    ERROR_CREATING_SPREADSHEET: 'Sorry, there was a problem creating your spreadsheet. Please verify that you have linked your account correctly and try again.',

    // Breastfeeding
    BREASTFEEDING_CONFIRM: 'Do you confirm that baby breastfed?',
    BREASTFEEDING_REGISTERED: 'Perfect. Breastfeeding registered at {time}.',
    BREASTFEEDING_CANCELLED: 'Okay, I won\'t register the breastfeeding.',

    // Bottle with human milk
    BOTTLE_MILK_CONFIRM: 'Do you confirm that baby had a bottle with breast milk{amount}?',
    BOTTLE_MILK_REGISTERED: 'Perfect. Bottle with breast milk registered at {time}{amount}.',
    BOTTLE_MILK_CANCELLED: 'Okay, I won\'t register the bottle with breast milk.',

    // Bottle with formula
    BOTTLE_FORMULA_CONFIRM: 'Do you confirm that baby had a bottle with formula{amount}?',
    BOTTLE_FORMULA_REGISTERED: 'Perfect. Bottle with formula registered at {time}{amount}.',
    BOTTLE_FORMULA_CANCELLED: 'Okay, I won\'t register the bottle with formula.',

    // Regurgitation
    REGURGITATION_CONFIRM: 'Do you confirm that baby spit up?',
    REGURGITATION_REGISTERED: 'Understood. Regurgitation registered at {time}.',
    REGURGITATION_CANCELLED: 'Okay, I won\'t register the regurgitation.',

    // Update last entry
    UPDATE_AMOUNT_CONFIRM: 'Do you confirm you want to update {type} at {time} with {amount} milliliters?',
    UPDATE_DURATION_CONFIRM: 'Do you confirm you want to update {type} at {time} with {duration} minutes?',
    UPDATE_AMOUNT_SUCCESS: 'Perfect. Entry updated with {amount} milliliters.',
    UPDATE_DURATION_SUCCESS: 'Perfect. Entry updated with {duration} minutes.',
    UPDATE_CANCELLED: 'Okay, I won\'t update the entry.',
    UPDATE_NO_ENTRY: 'There are no entries to update.',
    UPDATE_AMOUNT_NOT_BOTTLE: 'The last entry is {type}, which doesn\'t have an amount. You can only update bottles with amount in milliliters.',
    UPDATE_DURATION_NOT_BREASTFEEDING: 'The last entry is {type}, which doesn\'t have a duration. You can only update breastfeeding with duration in minutes.',

    // Query responses
    LAST_FEEDING: 'The last feeding was {type} at {time}{amount}.',
    NO_FEEDINGS_TODAY: 'No feedings registered today.',
    DAILY_SUMMARY: 'Today baby has had {count} feedings: {details}.',

    // Types for responses
    TYPE_BREASTFEEDING: 'breastfeeding',
    TYPE_BOTTLE_MILK: 'bottle with breast milk',
    TYPE_BOTTLE_FORMULA: 'bottle with formula',
    TYPE_REGURGITATION: 'regurgitation',

    // Amounts and durations
    AMOUNT_ML: ' of {amount} milliliters',
    DURATION_MIN: ' of {duration} minutes',

    // Progressive response
    PROCESSING: 'One moment, registering...',

    // Help
    HELP: 'You can register feedings by saying: register breastfeeding, baby had a bottle with breast milk, log formula bottle, or register regurgitation. You can also ask: what was the last feeding, or give me today\'s summary. What would you like to do?',
    HELP_REPROMPT: 'What would you like to do?',

    // Errors
    ERROR: 'Sorry, there was a problem processing your request. Please try again.',
    ERROR_SHEETS: 'Sorry, I couldn\'t save the information right now. Please try again later.',
    FALLBACK: 'Sorry, I didn\'t understand that. You can say: register breastfeeding, log bottle with breast milk, or give me today\'s summary.',

    // Goodbye
    GOODBYE: 'Goodbye! Take good care of baby.',

    // Reminders
    REMINDER_PERMISSION_REQUEST: 'Feeding registered! Would you like me to remind you every 3 hours when it\'s time to feed the baby?',
    REMINDER_PERMISSION_CARD: 'To receive feeding reminders, I need your permission. Please enable reminder permissions in the Alexa app.',
    REMINDER_PERMISSION_GRANTED: 'Great! Please check your Alexa app to grant reminder permissions. Once you grant permission, your next feeding will set up the reminders.',
    REMINDER_PERMISSION_DECLINED: 'Ok, I won\'t set up reminders. You can always enable them later.',
    REMINDER_PERMISSION_REPROMPT: 'Would you like me to remind you when to feed the baby?',

    // Sleep tracking - Start
    SLEEP_START_CONFIRM: 'Do you confirm that baby fell asleep?',
    SLEEP_START_REGISTERED: 'Perfect. Sleep start registered at {time}.',
    SLEEP_START_CANCELLED: 'Okay, I won\'t register the sleep start.',
    SLEEP_ALREADY_ACTIVE: 'There\'s already an active sleep session since {time}. Do you want to end that session and start a new one?',

    // Sleep tracking - End
    SLEEP_END_CONFIRM: 'Do you confirm that baby woke up?',
    SLEEP_END_REGISTERED: 'Perfect. Baby slept {duration}, from {startTime} until {endTime}.',
    SLEEP_END_CANCELLED: 'Okay, I won\'t register the sleep end.',
    SLEEP_NO_ACTIVE_SESSION: 'There\'s no active sleep session. Would you like me to help you register a nap that already ended?',
    SLEEP_SHORT_WARNING: 'Baby only slept {duration}. Do you confirm they woke up?',

    // Sleep tracking - Queries
    LAST_SLEEP: 'The last nap was {duration}, from {startTime} until {endTime}.',
    LAST_SLEEP_ONGOING: 'Baby is sleeping now, since {startTime}. They\'ve been asleep for {duration}.',
    NO_SLEEP_TODAY: 'No naps registered today.',
    DAILY_SLEEP_SUMMARY: 'Today baby has slept {count} {napWord} for a total of {totalDuration}.',
    DAILY_SLEEP_WITH_ONGOING: 'Today baby has slept {count} {napWord} for a total of {totalDuration}. They\'re currently sleeping since {currentStart}.',

    // Sleep types
    NAP_SINGULAR: 'nap',
    NAP_PLURAL: 'naps',
    TYPE_SLEEP: 'sleep',

    // Yes/No
    YES: 'yes',
    NO: 'no'
  }
};
