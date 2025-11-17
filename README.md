# Bitácora del Bebé / Baby's Log - Alexa Skill

An Alexa skill to track your baby's feeding information using Google Sheets. Each user gets their own private spreadsheet via Google OAuth account linking.

## Features

- **Multiple Feeding Types**: Breastfeeding, bottle with breast milk, bottle with formula
- **Regurgitation Tracking**: Log regurgitation events
- **Automatic Reminders**: Optional 3-hour feeding reminders via Alexa Reminders API
- **Update Entries**: Modify the most recent feeding with amount or duration
- **Query History**:
  - Check last feeding (`cuál fue la última toma`)
  - Get daily summary (`dame el resumen del día`)
- **Timezone Support**: Automatically uses device timezone for accurate timestamps
- **Multi-User Support**: Each user gets their own Google Sheets spreadsheet via OAuth
- **Internationalization**: Spanish (es-ES) and English (en-US) support
- **Confirmation Flow**: All feedings require Yes/No confirmation before recording

## Architecture

- **Platform**: Amazon Alexa
- **Runtime**: AWS Lambda (Node.js 18.x+)
- **Storage**:
  - User metadata: AWS DynamoDB (spreadsheet ID only)
  - Feeding data: Google Sheets (user-owned, one per user)
- **Authentication**: Google OAuth 2.0 via Alexa Account Linking

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
│   │   │   ├── accountLinking.js   # OAuth and user management
│   │   │   ├── dynamodb.js         # DynamoDB operations
│   │   │   ├── logger.js           # Production logging utility
│   │   │   ├── reminders.js        # Alexa Reminders API integration
│   │   │   ├── sheets.js           # Google Sheets API integration
│   │   │   ├── strings.js          # Localized strings (es-ES, en-US)
│   │   │   └── timezone.js         # Timezone utilities
│   │   └── index.js                # Main Lambda handler
│   ├── package.json
│   └── function.zip                # Production deployment package
│
├── skill-package/                   # Alexa skill configuration
│   ├── interactionModels/
│   │   └── custom/
│   │       ├── es-ES.json          # Spanish interaction model
│   │       └── en-US.json          # English interaction model
│   └── skill.json                  # Skill manifest
│
├── docs/                            # Documentation
│   ├── ACCOUNT_LINKING_SETUP.md    # OAuth setup guide
│   ├── PRODUCTION_DEPLOYMENT.md    # Production deployment guide
│   ├── TROUBLESHOOTING_OAUTH.md    # OAuth troubleshooting
│   ├── PRIVACY_POLICY_EN.md        # English privacy policy
│   ├── PRIVACY_POLICY_ES.md        # Spanish privacy policy
│   ├── TERMS_OF_USE_EN.md          # English terms of use
│   ├── TERMS_OF_USE_ES.md          # Spanish terms of use
│   ├── LEGAL_DOCUMENTS_README.md   # Legal docs setup guide
│   ├── OAUTH_IMPLEMENTATION_SUMMARY.md
│   ├── QUICKSTART.md
│   ├── DEPLOYMENT_CHECKLIST.md
│   ├── TIMEZONE_UPDATE.md
│   └── CHANGELOG.md
│
└── README.md                        # This file
```

## Quick Start

**For detailed setup instructions, see [ACCOUNT_LINKING_SETUP.md](docs/ACCOUNT_LINKING_SETUP.md)**.

### Overview

1. **Google OAuth Setup** - Create OAuth 2.0 credentials for user authentication
2. **AWS Infrastructure** - Set up Lambda function and DynamoDB table
3. **Alexa Account Linking** - Configure OAuth in Alexa Developer Console
4. **Testing** - Link your account and test the skill

### Prerequisites

- AWS account with Lambda and DynamoDB access
- Google Cloud project
- Alexa Developer account
- Node.js 18.x or higher

### Key Setup Steps

1. **Google Cloud Console**:
   ```bash
   # Enable APIs
   - Google Sheets API
   - Google Drive API

   # Create OAuth 2.0 Client
   - Application type: Web application
   - Add Alexa redirect URLs
   - Copy Client ID and Client Secret
   ```

2. **AWS Setup**:
   ```bash
   # Create DynamoDB table
   aws dynamodb create-table \
     --table-name BabyTrackerUsers \
     --attribute-definitions AttributeName=userId,AttributeType=S \
     --key-schema AttributeName=userId,KeyType=HASH \
     --billing-mode PAY_PER_REQUEST

   # Deploy Lambda
   cd lambda
   npm install --production
   npm run build
   aws lambda update-function-code \
     --function-name your-function-name \
     --zip-file fileb://function.zip

   # Set environment variables
   aws lambda update-function-configuration \
     --function-name your-function-name \
     --environment Variables="{LOG_LEVEL=ERROR,DYNAMODB_TABLE_NAME=BabyTrackerUsers}"
   ```

3. **Alexa Developer Console**:
   - Configure Account Linking with Google OAuth credentials
   - Add interaction models (Spanish + English)
   - Link Lambda function endpoint
   - Enable testing

4. **Update Legal Documents**:
   - Edit `docs/PRIVACY_POLICY_EN.md` and `docs/TERMS_OF_USE_EN.md`
   - Replace `[YOUR-EMAIL@example.com]` with your contact email
   - Replace `[YOUR-GITHUB-REPO-URL]` with your repository URL
   - Publish to GitHub to get public URLs for skill submission

## How It Works

### OAuth Account Linking Flow

1. User enables the skill in the Alexa app
2. Alexa prompts user to link their Google account
3. User authenticates with Google OAuth
4. Skill receives access token from Alexa
5. On first use, skill automatically creates a personal spreadsheet in user's Google Drive
6. Spreadsheet ID is stored in DynamoDB for future requests
7. All feeding data is written to the user's personal spreadsheet

### Data Privacy

- **Minimal Storage**: Only user ID and spreadsheet ID stored in DynamoDB
- **User-Owned Data**: All feeding records stay in the user's Google Sheets
- **No Sharing**: Each user's data is completely isolated
- **User Control**: Users can delete their spreadsheet anytime

## Logging

Production-ready logging system controlled by `LOG_LEVEL` environment variable:

| Level | Use Case | What Gets Logged |
|-------|----------|------------------|
| `ERROR` | Production (default) | Only errors |
| `INFO` | Staging/Monitoring | Errors + important events |
| `DEBUG` | Development | Everything including request details |

See [PRODUCTION_DEPLOYMENT.md](docs/PRODUCTION_DEPLOYMENT.md) for details.

## Testing

### First Time Setup

1. Enable the skill in the Alexa app
2. You'll be prompted to link your Google account
3. Authenticate with Google and grant permissions
4. Open the skill: "Alexa, abre Bitácora del Bebé"
5. Skill will automatically create your personal spreadsheet

### Example Utterances

**Spanish** (primary language):
- "Alexa, abre Bitácora del Bebé"
- "Registra toma de pecho" → "sí"
- "Registra biberón de leche materna de 120 mililitros" → "sí"
- "Registra biberón de fórmula de 90 mililitros" → "sí"
- "Registra regurgitación" → "sí"
- "¿Cuál fue la última toma?"
- "Dame el resumen del día"
- "Actualiza la última entrada con 100 mililitros" → "sí"

**English**:
- "Alexa, open Baby's Log"
- "Register breastfeeding" → "yes"
- "Register bottle of breast milk 120 milliliters" → "yes"
- "What was the last feeding?"
- "Give me today's summary"

### Testing Notes

- First invocation creates your spreadsheet (takes ~3 seconds)
- Subsequent requests are faster
- Check your Google Drive for the "Bitácora del Bebé" spreadsheet
- All timestamps use your Alexa device's timezone

## Data Schema

Data is stored in Google Sheets with the following structure:

| Timestamp | Type | Amount (ml) | Duration (min) | Notes |
|-----------|------|-------------|----------------|-------|
| 2024-11-17T10:30:00.000Z | PECHO | | | |
| 2024-11-17T13:45:00.000Z | BIBERON_LECHE | 120 | | |
| 2024-11-17T17:15:00.000Z | BIBERON_FORMULA | 150 | | |
| 2024-11-17T18:00:00.000Z | REGURGITACION | | | |

**Types:**
- `PECHO`: Breastfeeding
- `BIBERON_LECHE`: Bottle with breast milk
- `BIBERON_FORMULA`: Bottle with formula
- `REGURGITACION`: Regurgitation

## Customization

### Adding More Languages

1. Add locale strings to `lambda/src/utils/strings.js`
2. Create new interaction model in `skill-package/interactionModels/custom/{locale}.json`
3. Update skill manifest in `skill-package/skill.json`
4. Test with native speakers

### Extending Features

The codebase is modular and easy to extend:
- **Add tracking types**: Modify `sheets.js` and add handlers
- **Custom reports**: Add new query handlers in `query.js`
- **Notifications**: Use Alexa Proactive Events API
- **Data export**: Add CSV/PDF generation
- **Mobile app**: Create companion app using Google Sheets API

### Development Tips

- Use `LOG_LEVEL=DEBUG` for detailed logs during development
- Test OAuth flow in incognito mode
- Use DynamoDB local for offline testing
- Check CloudWatch Logs frequently

## Troubleshooting

**For detailed troubleshooting, see [TROUBLESHOOTING_OAUTH.md](docs/TROUBLESHOOTING_OAUTH.md)**.

### "Unable to link account"

1. Verify OAuth redirect URLs match exactly between Google Console and Alexa
2. Check Google OAuth consent screen is published (not in testing)
3. Ensure the required scope is added:
   - `https://www.googleapis.com/auth/drive.file`
4. Clear browser cache and try again in incognito mode

### "Error creating spreadsheet"

1. Check CloudWatch logs with `LOG_LEVEL=DEBUG`
2. Verify OAuth token has correct permissions
3. Ensure Google Sheets API and Drive API are enabled
4. Check Lambda has permissions for DynamoDB

### "Writing to deleted spreadsheet"

1. Unlink and relink your account in Alexa app
2. Or manually delete DynamoDB entry:
   ```bash
   aws dynamodb delete-item \
     --table-name BabyTrackerUsers \
     --key '{"userId": {"S": "your-alexa-user-id"}}'
   ```

### Skill not responding

- Verify Lambda has Alexa Skills Kit trigger with correct Skill ID
- Check Lambda timeout (recommended: 10 seconds)
- Review CloudWatch logs for errors
- Ensure Lambda execution role has DynamoDB permissions

## Cost Considerations

**For 1000 users making 10 requests/day each:**

- **AWS Lambda**: ~$0.20/month (10K requests, 256MB, 2s avg)
- **DynamoDB**: ~$1.25/month (on-demand, 1000 items, 300KB storage)
- **CloudWatch Logs**: ~$0.50/month (50MB at ERROR level)
- **Google Sheets/Drive API**: Free (within quota limits)
- **Alexa Skills**: Free
- **Total**: ~$2/month

Free tiers cover most development and personal use scenarios.

## Privacy & Security

- **User Data**: All feeding records stored in user's own Google Sheets (not on our servers)
- **Minimal Storage**: Only user ID + spreadsheet ID in DynamoDB
- **OAuth**: Standard Google OAuth 2.0 flow
- **No Tracking**: No analytics or third-party data sharing
- **User Control**: Users own and control their data completely
- **Encryption**: Lambda environment variables encrypted at rest
- **Compliance**: GDPR and CCPA friendly architecture

See [PRIVACY_POLICY_EN.md](docs/PRIVACY_POLICY_EN.md) for details.

## License

MIT License - Feel free to modify and use for personal or commercial purposes.

## Documentation

All documentation is located in the [`docs/`](docs/) folder:

- **[ACCOUNT_LINKING_SETUP.md](docs/ACCOUNT_LINKING_SETUP.md)** - Complete OAuth setup guide
- **[PRODUCTION_DEPLOYMENT.md](docs/PRODUCTION_DEPLOYMENT.md)** - Production deployment guide
- **[TROUBLESHOOTING_OAUTH.md](docs/TROUBLESHOOTING_OAUTH.md)** - OAuth troubleshooting
- **[PRIVACY_POLICY_EN.md](docs/PRIVACY_POLICY_EN.md)** / **[ES](docs/PRIVACY_POLICY_ES.md)** - Privacy policies
- **[TERMS_OF_USE_EN.md](docs/TERMS_OF_USE_EN.md)** / **[ES](docs/TERMS_OF_USE_ES.md)** - Terms of use
- **[QUICKSTART.md](docs/QUICKSTART.md)** - Quick start guide
- **[CHANGELOG.md](docs/CHANGELOG.md)** - Version history
- **[DEPLOYMENT_CHECKLIST.md](docs/DEPLOYMENT_CHECKLIST.md)** - Pre-deployment checklist

## Support

For issues or questions:
1. Check the troubleshooting guides above
2. Review CloudWatch logs (set `LOG_LEVEL=DEBUG`)
3. Verify account linking in Alexa app
4. Open an issue on GitHub

## Contributing

Contributions welcome! Areas for improvement:
- Additional languages (French, German, Portuguese, etc.)
- Enhanced voice interactions
- Data visualization/charts
- Mobile companion app
- Integration with other baby tracking apps
- Weekly/monthly summary reports

## Roadmap

- [x] **Alexa feeding reminders** - Automatic 3-hour notifications ✅
- [ ] **Sleep tracking** - Log sleep sessions with duration
- [ ] **Diaper tracking** - Track wet and dirty diapers
- [ ] **Multi-baby support** - Track multiple children in one account
- [ ] **Growth tracking** - Record weight, height, head circumference
- [ ] **Weekly/monthly summaries** - Voice reports with statistics
- [ ] **Medication tracking** - Log medicine doses and schedules
- [ ] **Temperature tracking** - Record fever and health metrics
- [ ] **Notes/observations** - Add freeform text notes to entries
- [ ] **Photo logging** - Link photos to feeding/sleep entries (via app card)
