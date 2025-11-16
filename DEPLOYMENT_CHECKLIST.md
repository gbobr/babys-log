# Deployment Checklist

Use this checklist to ensure your Baby Milk Tracker skill is properly configured and ready for use.

## Pre-Deployment

### Google Sheets Setup
- [ ] Google Spreadsheet created
- [ ] Sheet renamed to "Feedings"
- [ ] Headers added (Timestamp, Type, Amount (ml), Duration (min), Notes)
- [ ] Spreadsheet ID copied
- [ ] Google Cloud project created
- [ ] Google Sheets API enabled
- [ ] Service Account created
- [ ] Service Account JSON key downloaded
- [ ] Spreadsheet shared with service account email (Editor role)

### Local Development
- [ ] Project cloned/downloaded
- [ ] Dependencies installed (`cd lambda && npm install`)
- [ ] `.env` file created from `.env.example` (for local testing)
- [ ] Environment variables configured in `.env`:
  - [ ] `GOOGLE_CREDENTIALS`
  - [ ] `SPREADSHEET_ID`
- [ ] Local test run successfully (`npm test`)

### AWS Lambda Setup
- [ ] Lambda function created (`baby-milk-tracker`)
- [ ] Runtime set to Node.js 18.x or later
- [ ] Environment variables configured in Lambda:
  - [ ] `GOOGLE_CREDENTIALS` (full JSON)
  - [ ] `SPREADSHEET_ID`
- [ ] Code packaged (`npm run deploy`)
- [ ] `function.zip` uploaded to Lambda
- [ ] Function timeout set to 30 seconds (or higher)
- [ ] Lambda ARN copied

### Alexa Developer Console Setup
- [ ] Skill created in Alexa Developer Console
- [ ] Skill name set
- [ ] Primary locale configured (es-ES or en-US)
- [ ] Custom model selected
- [ ] Spanish interaction model uploaded and built
- [ ] English interaction model uploaded and built (optional)
- [ ] Endpoint configured with Lambda ARN
- [ ] Skill ID copied

### Lambda-Alexa Connection
- [ ] Alexa Skills Kit trigger added to Lambda
- [ ] Skill ID added to Lambda trigger
- [ ] Endpoint verified in Alexa console shows green checkmark

## Testing

### Console Testing
- [ ] Development mode enabled in Alexa Developer Console
- [ ] Launch request tested: "abre rastreador de leche"
- [ ] Breastfeeding flow tested: "registra toma de pecho" → "sí"
- [ ] Bottle with milk tested: "anota biberón con leche materna de 120 mililitros" → "sí"
- [ ] Bottle with formula tested: "registra biberón con fórmula" → "sí"
- [ ] Last feeding query tested: "cuál fue la última toma"
- [ ] Daily summary tested: "dame el resumen del día"
- [ ] Help intent tested: "ayuda"
- [ ] Cancel/Stop tested: "cancela"
- [ ] No response tested: "registra toma de pecho" → "no"

### Data Verification
- [ ] Feedings appear in Google Sheet
- [ ] Timestamps are correct
- [ ] Types are recorded properly (PECHO, BIBERON_LECHE, BIBERON_FORMULA)
- [ ] Amounts are recorded when provided
- [ ] No duplicate entries

### Device Testing (Optional)
- [ ] Skill invoked on physical Alexa device
- [ ] Voice recognition working correctly for Spanish utterances
- [ ] Responses are clear and natural
- [ ] Confirmation flow works smoothly

### Error Handling
- [ ] Network error handling tested (disconnect internet during test)
- [ ] Invalid amount handling tested
- [ ] CloudWatch logs reviewed for errors
- [ ] All errors have user-friendly messages

## Post-Deployment

### Monitoring
- [ ] CloudWatch Logs enabled
- [ ] Lambda execution monitored
- [ ] Google Sheets API quota monitored
- [ ] Error alerts configured (optional)

### Documentation
- [ ] README.md reviewed and customized
- [ ] Privacy policy URL updated in skill.json (if publishing)
- [ ] Terms of use URL updated in skill.json (if publishing)
- [ ] Testing instructions documented

### Security
- [ ] `.env` file added to `.gitignore`
- [ ] Service account JSON NOT committed to git
- [ ] Lambda environment variables verified secure
- [ ] Google Sheet access limited to service account

## Optional: Publishing to Alexa Store

If you plan to publish your skill publicly:

### Skill Information
- [ ] Skill icon created (108x108 and 512x512 pixels)
- [ ] Description written for all supported locales
- [ ] Keywords optimized
- [ ] Category selected appropriately
- [ ] Example phrases tested and working

### Privacy & Compliance
- [ ] Privacy policy created and hosted
- [ ] Terms of use created and hosted
- [ ] Data collection practices documented
- [ ] COPPA compliance verified (if applicable)
- [ ] Export compliance confirmed

### Testing for Certification
- [ ] All test cases passed
- [ ] Skill works in all supported locales
- [ ] No profanity or inappropriate content
- [ ] Skill description matches functionality
- [ ] No crashes or errors during extensive testing

### Submission
- [ ] Skill submitted for certification
- [ ] Certification feedback addressed
- [ ] Skill approved and published

## Maintenance

### Regular Checks
- [ ] Google Sheets API usage monitored
- [ ] Lambda invocation count monitored
- [ ] User feedback reviewed (if published)
- [ ] CloudWatch logs checked for errors
- [ ] Dependencies kept up to date

### Updates
- [ ] Version number updated in package.json
- [ ] CHANGELOG.md updated
- [ ] New features tested thoroughly
- [ ] Interaction model rebuilt after changes
- [ ] Lambda function redeployed

---

## Quick Command Reference

```bash
# Install dependencies
cd lambda
npm install

# Run local tests
npm test

# Create deployment package
npm run deploy

# Check Lambda logs (AWS CLI)
aws logs tail /aws/lambda/baby-milk-tracker --follow

# Update Lambda function (AWS CLI)
aws lambda update-function-code \
  --function-name baby-milk-tracker \
  --zip-file fileb://function.zip
```

---

**Date Completed:** _______________

**Deployed By:** _______________

**Notes:**
_______________________________________
_______________________________________
_______________________________________
