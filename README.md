# Baby Milk Tracker - Alexa Skill

An Alexa skill to track your baby's milk intake, including breastfeeding, bottles with human milk, and bottles with formula. Data is stored in Google Sheets for easy access and analysis.

## Features

- **Register Feedings** in Spanish (primary) and English:
  - Breastfeeding (`registra toma de pecho`)
  - Bottle with breast milk (`anota biberón con leche materna`)
  - Bottle with formula (`registra biberón con fórmula`)
  - Optional amount specification for bottles

- **Query History**:
  - Check last feeding (`cuál fue la última toma`)
  - Get daily summary (`dame el resumen del día`)

- **Confirmation Flow**: All feedings require Yes/No confirmation before recording

- **Internationalization**: Built with i18n support for Spanish (es-ES) and English (en-US)

- **Google Sheets Integration**: All data stored in Google Sheets for easy access

## Project Structure

```
lola/
├── lambda/                          # Lambda function code
│   ├── src/
│   │   ├── handlers/
│   │   │   ├── basic.js            # Launch, Help, Stop, Error handlers
│   │   │   ├── feeding.js          # Feeding registration handlers
│   │   │   └── query.js            # Query handlers (last feeding, summary)
│   │   ├── interceptors/
│   │   │   └── localization.js     # i18n request interceptor
│   │   ├── utils/
│   │   │   ├── sheets.js           # Google Sheets API integration
│   │   │   └── strings.js          # Localized strings (es-ES, en-US)
│   │   └── index.js                # Main Lambda handler
│   └── package.json
│
└── skill-package/                   # Alexa skill configuration
    ├── interactionModels/
    │   └── custom/
    │       ├── es-ES.json          # Spanish interaction model
    │       └── en-US.json          # English interaction model
    └── skill.json                  # Skill manifest
```

## Setup Instructions

### 1. Google Sheets Setup

1. **Create a Google Spreadsheet**:
   - Go to [Google Sheets](https://sheets.google.com)
   - Create a new spreadsheet
   - Rename it to "Baby Milk Tracker" (or your preferred name)
   - Create a sheet named "Feedings"
   - Note the Spreadsheet ID from the URL: `https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit`

2. **Create a Google Service Account**:
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project or select an existing one
   - Enable the Google Sheets API
   - Go to "IAM & Admin" > "Service Accounts"
   - Click "Create Service Account"
   - Give it a name like "baby-milk-tracker"
   - Click "Create and Continue"
   - Grant the "Editor" role
   - Click "Done"
   - Click on the created service account
   - Go to "Keys" tab
   - Click "Add Key" > "Create new key"
   - Choose JSON format
   - Download the JSON file

3. **Share the Spreadsheet**:
   - Open your Google Sheet
   - Click "Share" button
   - Add the service account email (found in the JSON file as `client_email`)
   - Give it "Editor" permissions

### 2. AWS Lambda Setup

1. **Install Dependencies**:
   ```bash
   cd lambda
   npm install
   ```

2. **Create Lambda Function**:
   - Go to [AWS Lambda Console](https://console.aws.amazon.com/lambda)
   - Click "Create function"
   - Choose "Author from scratch"
   - Function name: `baby-milk-tracker`
   - Runtime: Node.js 18.x (or later)
   - Click "Create function"

3. **Configure Environment Variables**:
   - In the Lambda function configuration, go to "Configuration" > "Environment variables"
   - Add the following variables:
     - `GOOGLE_CREDENTIALS`: Paste the entire contents of the service account JSON file
     - `SPREADSHEET_ID`: Your Google Sheets spreadsheet ID

4. **Upload Code**:
   ```bash
   cd lambda
   npm run deploy  # Creates function.zip
   ```
   - Upload `function.zip` to Lambda via the console or AWS CLI

5. **Configure Trigger**:
   - Add an Alexa Skills Kit trigger
   - You'll get the skill ID from the Alexa Developer Console in the next step

### 3. Alexa Developer Console Setup

1. **Create a New Skill**:
   - Go to [Alexa Developer Console](https://developer.amazon.com/alexa/console/ask)
   - Click "Create Skill"
   - Skill name: "Baby Milk Tracker" (or "Rastreador de Leche del Bebé")
   - Choose "Custom" model
   - Choose "Alexa-hosted (Node.js)" or "Provision your own"
   - Click "Create skill"

2. **Configure the Skill**:
   - Go to "Build" > "Interaction Model" > "JSON Editor"
   - For Spanish: Copy contents of `skill-package/interactionModels/custom/es-ES.json`
   - For English: Add locale and copy contents of `skill-package/interactionModels/custom/en-US.json`
   - Click "Save Model" and "Build Model"

3. **Configure Endpoint**:
   - Go to "Build" > "Endpoint"
   - Choose "AWS Lambda ARN"
   - Default Region: Enter your Lambda function ARN
   - Example: `arn:aws:lambda:us-east-1:123456789012:function:baby-milk-tracker`
   - Click "Save Endpoints"

4. **Copy Skill ID**:
   - From the Alexa Developer Console, copy your Skill ID
   - Go back to your Lambda function
   - Add this Skill ID to the Alexa Skills Kit trigger

### 4. Initialize Google Sheet

Run this once to set up the spreadsheet headers:

```javascript
// You can add this as a one-time Lambda test event
const { initializeSpreadsheet } = require('./src/utils/sheets');
await initializeSpreadsheet();
```

Or manually add these headers to row 1 of the "Feedings" sheet:
- A1: `Timestamp`
- B1: `Type`
- C1: `Amount (ml)`
- D1: `Duration (min)`
- E1: `Notes`

## Testing

### Test in Alexa Developer Console

1. Go to "Test" tab
2. Enable testing for "Development"
3. Try these utterances:

**Spanish:**
- "abre rastreador de leche"
- "registra toma de pecho" → "sí"
- "anota biberón con leche materna de 120 mililitros" → "sí"
- "registra biberón con fórmula" → "sí"
- "cuál fue la última toma"
- "dame el resumen del día"

**English:**
- "open milk tracker"
- "register breastfeeding" → "yes"
- "log bottle with breast milk of 120 milliliters" → "yes"
- "register bottle with formula" → "yes"
- "what was the last feeding"
- "give me today's summary"

### Test on Device

Once configured, you can test on any Alexa-enabled device linked to your Amazon account.

## Data Schema

Data is stored in Google Sheets with the following structure:

| Timestamp | Type | Amount (ml) | Duration (min) | Notes |
|-----------|------|-------------|----------------|-------|
| 2025-11-15T10:30:00.000Z | PECHO | | | |
| 2025-11-15T13:45:00.000Z | BIBERON_LECHE | 120 | | |
| 2025-11-15T17:15:00.000Z | BIBERON_FORMULA | 150 | | |

**Types:**
- `PECHO`: Breastfeeding
- `BIBERON_LECHE`: Bottle with breast milk
- `BIBERON_FORMULA`: Bottle with formula

## Customization

### Adding More Languages

1. Add locale strings to `lambda/src/utils/strings.js`
2. Create new interaction model in `skill-package/interactionModels/custom/{locale}.json`
3. Update skill manifest in `skill-package/skill.json`

### Modifying Data Storage

The Google Sheets integration is in `lambda/src/utils/sheets.js`. You can:
- Switch to DynamoDB by using ASK SDK's built-in persistence adapter
- Add more fields (duration for breastfeeding, notes, etc.)
- Implement data export features

### Adding Features

Consider adding:
- Duration tracking for breastfeeding
- Left/right breast tracking
- Diaper change tracking
- Sleep tracking
- Export to CSV
- Weekly/monthly summaries
- Reminders for next feeding

## Troubleshooting

### "Sorry, I couldn't save the information"

- Check Lambda CloudWatch logs for errors
- Verify `GOOGLE_CREDENTIALS` environment variable is valid JSON
- Verify `SPREADSHEET_ID` is correct
- Ensure service account has Editor access to the spreadsheet
- Check that the "Feedings" sheet exists

### "Sorry, I didn't understand that"

- Check that your utterance matches the interaction model
- Verify the correct locale is being used
- Check Lambda logs for intent matching issues

### Skill not responding

- Verify Lambda function ARN in Alexa Developer Console
- Check Lambda function has Alexa Skills Kit trigger configured
- Verify Skill ID is added to Lambda trigger
- Check Lambda function timeout (increase if needed)

## Cost Considerations

- **AWS Lambda**: Free tier includes 1M requests/month
- **Google Sheets API**: Free (daily quota: 500 requests/100 seconds per project)
- **Alexa Skills**: Free for development and personal use

## Privacy & Security

- Data is stored in your personal Google Sheets account
- No data is sent to third parties
- Service account credentials should be kept secure
- Consider encrypting environment variables in Lambda

## License

MIT License - Feel free to modify and use for personal or commercial purposes.

## Support

For issues or questions:
1. Check CloudWatch logs in AWS Lambda
2. Review Alexa Developer Console test simulator
3. Verify Google Sheets API permissions

## Contributing

Contributions welcome! Please consider:
- Adding more languages
- Improving voice interactions
- Adding data visualization
- Creating mobile companion app
