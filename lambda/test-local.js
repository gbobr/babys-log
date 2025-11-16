/**
 * Local testing script for Baby Milk Tracker
 * Run with: node test-local.js
 *
 * Note: Requires .env file with GOOGLE_CREDENTIALS and SPREADSHEET_ID
 */

require('dotenv').config();
const { handler } = require('./src/index');

// Sample Alexa request events for testing

const launchRequest = {
  version: '1.0',
  session: {
    new: true,
    sessionId: 'test-session-1',
    application: {
      applicationId: 'amzn1.ask.skill.test'
    },
    user: {
      userId: 'test-user-1'
    }
  },
  context: {
    System: {
      application: {
        applicationId: 'amzn1.ask.skill.test'
      },
      user: {
        userId: 'test-user-1'
      },
      device: {
        deviceId: 'test-device-1'
      }
    }
  },
  request: {
    type: 'LaunchRequest',
    requestId: 'test-request-1',
    timestamp: new Date().toISOString(),
    locale: 'es-ES'
  }
};

const breastfeedingIntent = {
  version: '1.0',
  session: {
    new: false,
    sessionId: 'test-session-2',
    application: {
      applicationId: 'amzn1.ask.skill.test'
    },
    user: {
      userId: 'test-user-1'
    }
  },
  context: {
    System: {
      application: {
        applicationId: 'amzn1.ask.skill.test'
      },
      user: {
        userId: 'test-user-1'
      },
      device: {
        deviceId: 'test-device-1'
      }
    }
  },
  request: {
    type: 'IntentRequest',
    requestId: 'test-request-2',
    timestamp: new Date().toISOString(),
    locale: 'es-ES',
    intent: {
      name: 'RegistrarTomaDePechoIntent',
      confirmationStatus: 'NONE'
    }
  }
};

const yesIntent = {
  version: '1.0',
  session: {
    new: false,
    sessionId: 'test-session-3',
    application: {
      applicationId: 'amzn1.ask.skill.test'
    },
    user: {
      userId: 'test-user-1'
    },
    attributes: {
      pendingIntent: 'BREASTFEEDING'
    }
  },
  context: {
    System: {
      application: {
        applicationId: 'amzn1.ask.skill.test'
      },
      user: {
        userId: 'test-user-1'
      },
      device: {
        deviceId: 'test-device-1'
      }
    }
  },
  request: {
    type: 'IntentRequest',
    requestId: 'test-request-3',
    timestamp: new Date().toISOString(),
    locale: 'es-ES',
    intent: {
      name: 'AMAZON.YesIntent',
      confirmationStatus: 'NONE'
    }
  }
};

async function test() {
  console.log('🧪 Testing Baby Milk Tracker Alexa Skill\n');

  try {
    // Test 1: Launch Request
    console.log('Test 1: LaunchRequest');
    const response1 = await handler(launchRequest);
    console.log('Response:', response1.response.outputSpeech.ssml);
    console.log('✅ LaunchRequest passed\n');

    // Test 2: Register Breastfeeding Intent
    console.log('Test 2: RegistrarTomaDePechoIntent');
    const response2 = await handler(breastfeedingIntent);
    console.log('Response:', response2.response.outputSpeech.ssml);
    console.log('✅ Breastfeeding intent passed\n');

    // Test 3: Confirm with Yes
    console.log('Test 3: AMAZON.YesIntent (confirm breastfeeding)');
    const response3 = await handler(yesIntent);
    console.log('Response:', response3.response.outputSpeech.ssml);
    console.log('✅ Yes intent passed\n');

    console.log('🎉 All tests passed!');
    console.log('Check your Google Sheet to verify the feeding was recorded.');

  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

// Run tests
test();
