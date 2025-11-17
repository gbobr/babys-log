# OAuth Account Linking Implementation Summary

## What Changed

This implementation transformed the skill from a single-user MVP to a multi-user public skill using Google OAuth and Alexa Account Linking.

---

## New Files Created

### `/lambda/src/utils/dynamodb.js`
Manages user data in DynamoDB:
- `getUserData(userId)` - Retrieves user's spreadsheet ID
- `saveUserData(userId, data)` - Saves user data
- `updateUserData(userId, updates)` - Updates specific fields
- `deleteUserData(userId)` - Removes user data

### `/lambda/src/utils/accountLinking.js`
Handles OAuth validation and user setup:
- `getUserContext(handlerInput)` - Validates OAuth token and returns user context
- `requireAccountLinking(handlerFunction)` - Wrapper for handlers requiring authentication

### `/ACCOUNT_LINKING_SETUP.md`
Complete setup guide with step-by-step instructions for:
- Google Cloud OAuth configuration
- AWS DynamoDB setup
- Alexa Account Linking configuration
- Deployment and testing

---

## Modified Files

### `/lambda/src/utils/sheets.js`
**Major changes:**
- All functions now accept `accessToken` and `spreadsheetId` parameters
- `getSheets(accessToken)` - Updated to support OAuth tokens
- `createUserSpreadsheet(accessToken, userName)` - NEW: Creates user's personal spreadsheet with formatted headers
- Maintains backward compatibility with service account for development

**Updated function signatures:**
```javascript
// Before
appendFeeding(type, amount, duration)

// After
appendFeeding(spreadsheetId, accessToken, type, amount, duration)
```

### `/lambda/src/handlers/feeding.js`
**Changes:**
- Added `getUserContext()` check to all handlers
- Updated all `appendFeeding()` calls to include spreadsheet ID and access token
- Updated `updateLastFeeding()` calls with new parameters
- Handlers now return account linking card if user hasn't linked account

### `/lambda/src/handlers/query.js`
**Changes:**
- Added `getUserContext()` check to both handlers
- Updated `getLastFeeding()` and `getTodayFeedings()` calls with user context

### `/lambda/src/utils/strings.js`
**New strings added:**
- `ACCOUNT_LINKING_REQUIRED` - Prompts user to link account
- `FIRST_TIME_SETUP_COMPLETE` - Welcome message after spreadsheet creation
- `ERROR_CREATING_SPREADSHEET` - Error handling for setup failures

### `/lambda/package.json`
**New dependency:**
- `aws-sdk: ^2.1691.0` - For DynamoDB access

---

## How It Works

### 1. User Opens Skill (Without Account Linking)

```
User: "Alexa, abre bitácora del bebé"
Skill: "Para usar esta skill, necesitas vincular tu cuenta de Google..."
       [Shows Link Account card in Alexa app]
```

### 2. User Links Account

1. User taps "Link Account" in Alexa app
2. Redirected to Google sign-in
3. Grants permissions to the skill
4. Alexa receives and stores OAuth token

### 3. First Use After Linking

```
User: "Alexa, abre bitácora del bebé"
Skill: [Checks for spreadsheet]
       [No spreadsheet found - creates one]
Skill: "¡Perfecto! He creado tu hoja de cálculo personal en Google Sheets..."
```

The spreadsheet is created in the user's Google Drive with:
- Title: "Bitácora del Bebé"
- Headers: Timestamp, Type, Amount (ml), Duration (min), Notes
- Formatted header row (blue background, white text)
- Frozen header row

### 4. Normal Usage

```
User: "Registra toma de pecho"
Skill: [Gets OAuth token from Alexa]
       [Looks up spreadsheet ID from DynamoDB]
       [Writes to user's spreadsheet]
Skill: "¿Confirmas que el bebé tomó pecho?"
User: "Sí"
Skill: "Perfecto. Toma de pecho registrada a las 14:30."
```

---

## Data Flow

```
┌─────────┐
│  User   │
└────┬────┘
     │ "Alexa, registra toma"
     ▼
┌─────────────────┐
│  Alexa Service  │ (Manages OAuth token)
└────┬────────────┘
     │ Request + OAuth token
     ▼
┌─────────────────┐
│ Lambda Function │
└────┬───────┬────┘
     │       │
     │       └──────────────┐
     ▼                      ▼
┌──────────┐          ┌────────────────┐
│ DynamoDB │          │ Google Sheets  │
│          │          │      API       │
│ userId → │          │  (with OAuth)  │
│ sheetId  │          │                │
└──────────┘          └────────────────┘
                             │
                             ▼
                      ┌──────────────┐
                      │ User's Google│
                      │    Drive     │
                      └──────────────┘
```

---

## Security & Privacy

### ✅ Benefits

1. **User Data Isolation**: Each user's data stays in their own Google account
2. **No Central Storage**: Lambda only stores spreadsheet IDs, not feeding data
3. **User Control**: Users can revoke access anytime via Google or Alexa app
4. **Secure Tokens**: Alexa manages token storage and refresh

### 🔒 What's Stored Where

**DynamoDB** (per user):
```json
{
  "userId": "amzn1.ask.account.XXX",
  "spreadsheetId": "1AbCdEfGhIjKlMnOpQrStUvWxYz",
  "spreadsheetUrl": "https://docs.google.com/spreadsheets/d/...",
  "createdAt": "2025-11-16T10:30:00Z",
  "updatedAt": "2025-11-16T15:45:00Z"
}
```

**Google Sheets** (user's Drive):
- All feeding records (timestamps, types, amounts, durations)
- Owned and controlled by the user
- Can be accessed/shared/deleted by user

---

## Migration Path

### For Existing Users (Your Current Setup)

You can continue using the service account method for personal use:

1. Keep `GOOGLE_CREDENTIALS` and `SPREADSHEET_ID` environment variables
2. The code will fall back to service account when no OAuth token is present
3. Works great for single-user/family use

### For Public Release

1. Complete OAuth setup per `ACCOUNT_LINKING_SETUP.md`
2. Create DynamoDB table
3. Update Lambda IAM role
4. Enable Account Linking in Alexa console
5. Test with multiple Google accounts
6. Submit for certification

---

## Backward Compatibility

The implementation maintains backward compatibility:

```javascript
// Development mode (no OAuth token)
const sheets = getSheets(); // Uses GOOGLE_CREDENTIALS
await appendFeeding(process.env.SPREADSHEET_ID, null, type, amount, duration);

// Production mode (with OAuth)
const sheets = getSheets(accessToken); // Uses user's token
await appendFeeding(spreadsheetId, accessToken, type, amount, duration);
```

---

## Testing Checklist

### Local Testing (Development)
- [ ] Works with service account credentials
- [ ] Can create/read/update feedings
- [ ] No OAuth required for local testing

### OAuth Testing
- [ ] Account linking flow works
- [ ] Spreadsheet is created on first use
- [ ] Multiple users can use skill simultaneously
- [ ] Each user has isolated data
- [ ] Token refresh works (test after 1 hour)

### Error Handling
- [ ] Prompts for account linking when token missing
- [ ] Handles spreadsheet creation failures
- [ ] Handles DynamoDB errors gracefully
- [ ] Logs useful debugging information

---

## Performance Considerations

### Cold Start Time
- Added DynamoDB call: ~50-100ms
- OAuth validation: Minimal (token provided by Alexa)
- Spreadsheet creation (first time only): ~2-3 seconds

### Typical Request Flow
1. Get OAuth token from request context: <1ms
2. Query DynamoDB for spreadsheet ID: ~50-100ms
3. Call Google Sheets API: ~200-500ms
4. **Total**: ~300-600ms (well within Alexa's limits)

### Optimization Tips
- DynamoDB queries are fast with proper indexing
- Consider caching spreadsheet ID in session attributes for subsequent requests
- Use batch operations for multiple sheet updates

---

## Cost Analysis

### Free Tier Coverage

**AWS Lambda**:
- 1M requests/month free
- Typical usage: 5-20 requests/user/day
- Can handle ~1,600 daily active users for free

**AWS DynamoDB**:
- 25GB storage free (millions of users)
- 200M requests/month free
- Far more than needed for this use case

**Google Sheets API**:
- 500 requests per 100 seconds per user
- Free forever
- More than sufficient for baby tracking

### Beyond Free Tier
- 10,000 active users: ~$5-10/month
- 100,000 active users: ~$50-100/month
- Scales linearly and predictably

---

## Next Steps

1. **Complete Setup**: Follow `ACCOUNT_LINKING_SETUP.md`
2. **Test Thoroughly**: Multiple accounts, error cases
3. **Privacy Policy**: Required for account linking skills
4. **Terms of Service**: Best practice for public skills
5. **Beta Testing**: Test with real users
6. **Certification**: Submit to Amazon
7. **Launch**: Make it public!

---

## Support During Setup

If you need help during setup:

1. **Google OAuth Issues**: Check CloudWatch logs for detailed errors
2. **DynamoDB Issues**: Verify IAM permissions and table configuration
3. **Alexa Account Linking**: Ensure redirect URLs match exactly
4. **Testing**: Use CloudWatch logs to debug token and API issues

---

## Summary

This implementation transforms your skill from an MVP to a production-ready, multi-user application while maintaining security, privacy, and ease of use. Each user gets their own isolated spreadsheet, and the skill handles all the complexity of OAuth and account management behind the scenes.

The setup requires about 30-60 minutes of configuration, but once complete, it provides a seamless experience for unlimited users.
