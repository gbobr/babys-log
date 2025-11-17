# Account Linking Setup Guide

This guide explains how to configure Google OAuth and Alexa Account Linking for the Bitácora del Bebé skill.

## Overview

The skill uses OAuth 2.0 to allow users to authenticate with their Google accounts. Each user gets their own Google Sheets spreadsheet that is automatically created on first use.

## Architecture

```
User → Alexa (OAuth) → Lambda → Google Sheets API
                         ↓
                      DynamoDB (user data)
```

- **Alexa Account Linking**: Handles OAuth flow and token management
- **Lambda**: Validates tokens, manages user data
- **DynamoDB**: Stores user's spreadsheet ID
- **Google Sheets API**: Creates and manages user spreadsheets

---

## Part 1: Google Cloud Setup

### 1.1 Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Note your **Project ID**

### 1.2 Enable Google Sheets API

1. Go to **APIs & Services** > **Library**
2. Search for "Google Sheets API"
3. Click **Enable**

### 1.3 Configure OAuth Consent Screen

1. Go to **APIs & Services** > **OAuth consent screen**
2. Select **External** user type
3. Fill in the application information:
   - **App name**: `Bitácora del Bebé`
   - **User support email**: Your email
   - **Developer contact**: Your email
4. Click **Save and Continue**

5. Add scopes:
   - Click **Add or Remove Scopes**
   - Search and add:
     - `https://www.googleapis.com/auth/spreadsheets`
     - `https://www.googleapis.com/auth/userinfo.email`
   - Click **Update** and **Save and Continue**

6. Add test users (during development):
   - Add email addresses of users who will test the skill
   - Click **Save and Continue**

7. Review and click **Back to Dashboard**

### 1.4 Create OAuth 2.0 Credentials

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth 2.0 Client ID**
3. Select **Web application**
4. Name: `Alexa Account Linking`
5. Add **Authorized redirect URIs**:
   ```
   https://pitangui.amazon.com/api/skill/link/YOUR_VENDOR_ID
   https://layla.amazon.com/api/skill/link/YOUR_VENDOR_ID
   https://alexa.amazon.co.jp/api/skill/link/YOUR_VENDOR_ID
   ```

   **Note**: Replace `YOUR_VENDOR_ID` with your actual Alexa Vendor ID
   - Find your Vendor ID in [Alexa Developer Console](https://developer.amazon.com/alexa/console/ask)
   - It's in the format `M1XXXXXXXXXXXXX`

6. Click **Create**
7. **Save** your Client ID and Client Secret - you'll need these for Alexa configuration

---

## Part 2: AWS DynamoDB Setup

### 2.1 Create DynamoDB Table

1. Go to [AWS DynamoDB Console](https://console.aws.amazon.com/dynamodb/)
2. Click **Create table**
3. Configure:
   - **Table name**: `BabyTrackerUsers`
   - **Partition key**: `userId` (String)
   - **Table settings**: Default settings or On-demand
4. Click **Create table**

### 2.2 Update Lambda IAM Role

Add DynamoDB permissions to your Lambda function's execution role:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:UpdateItem",
        "dynamodb:DeleteItem"
      ],
      "Resource": "arn:aws:dynamodb:YOUR_REGION:YOUR_ACCOUNT_ID:table/BabyTrackerUsers"
    }
  ]
}
```

Replace `YOUR_REGION` and `YOUR_ACCOUNT_ID` with your actual values.

### 2.3 Set Lambda Environment Variable

1. Go to your Lambda function
2. Configuration > Environment variables
3. Add:
   - **Key**: `DYNAMODB_TABLE_NAME`
   - **Value**: `BabyTrackerUsers`

**Note**: You can now remove `GOOGLE_CREDENTIALS` and `SPREADSHEET_ID` environment variables as they're no longer needed for production.

---

## Part 3: Alexa Skill Configuration

### 3.1 Enable Account Linking

1. Go to [Alexa Developer Console](https://developer.amazon.com/alexa/console/ask)
2. Select your skill > **Build** > **Account Linking**
3. Toggle **Do you allow users to create an account or link to an existing account with you?** to **Yes**

### 3.2 Configure OAuth Settings

Fill in the following settings:

**Authorization URI**:
```
https://accounts.google.com/o/oauth2/v2/auth
```

**Access Token URI**:
```
https://oauth2.googleapis.com/token
```

**Your Client ID**:
- Paste the Client ID from Google OAuth credentials (Part 1.4)

**Your Secret**:
- Paste the Client Secret from Google OAuth credentials (Part 1.4)

**Your Authentication Scheme**:
- Select **HTTP Basic (Recommended)**

**Scope**:
Add two scopes (click **+ Add scope** for each):
```
https://www.googleapis.com/auth/spreadsheets
https://www.googleapis.com/auth/userinfo.email
```

**Domain List** (optional):
```
google.com
googleapis.com
```

**Default Access Token Expiration Time**:
```
3600
```

### 3.3 Copy Redirect URLs

After saving, Alexa will display 3 redirect URLs. Copy these and add them to your Google OAuth credentials:

1. Go back to [Google Cloud Console](https://console.cloud.google.com/)
2. **APIs & Services** > **Credentials**
3. Click on your OAuth 2.0 Client ID
4. Under **Authorized redirect URIs**, paste all 3 URLs from Alexa
5. Click **Save**

### 3.4 Save and Test

1. Click **Save** in Alexa Developer Console
2. The Account Linking section should show as **Configured**

---

## Part 4: Deploy Updated Lambda

### 4.1 Install Dependencies

```bash
cd lambda
npm install
```

This will install the new `aws-sdk` dependency.

### 4.2 Deploy to Lambda

```bash
npm run deploy
```

Then upload `function.zip` to your Lambda function.

---

## Part 5: Testing

### 5.1 Test Account Linking Flow

1. Open the Alexa app on your phone
2. Go to **More** > **Skills & Games** > **Your Skills** > **Dev**
3. Find "Bitácora del Bebé"
4. Tap **Settings** > **Link Account**
5. You should be redirected to Google sign-in
6. Sign in with your Google account
7. Grant permissions to the skill
8. You should see "Account successfully linked"

### 5.2 Test the Skill

1. Say: "Alexa, abre bitácora del bebé"
2. On first use, the skill will create a spreadsheet and say: "¡Perfecto! He creado tu hoja de cálculo personal..."
3. Check your Google Drive - you should see a new spreadsheet named "Bitácora del Bebé"
4. Try registering a feeding: "Registra toma de pecho"
5. Confirm: "Sí"
6. Check the spreadsheet - the feeding should appear

---

## Troubleshooting

### "Account linking required" message keeps appearing

- Check that redirect URLs in Google Console match exactly those from Alexa
- Verify OAuth scopes are correctly configured
- Try unlinking and relinking the account in Alexa app

### "Error creating spreadsheet" message

- Check Lambda CloudWatch logs for detailed error
- Verify Google Sheets API is enabled
- Ensure OAuth token has `spreadsheets` scope
- Check that user granted permissions during linking

### DynamoDB errors

- Verify table name matches environment variable
- Check Lambda IAM role has DynamoDB permissions
- Ensure table exists in the same region as Lambda

### Spreadsheet not created

- Check CloudWatch logs for errors
- Verify user's Google account has permission to create files
- Test OAuth token validity

---

## Security Notes

1. **OAuth Tokens**: Alexa securely stores and refreshes OAuth tokens. Never log tokens in production.

2. **User Data**: Each user's data is isolated in their own Google account. Your Lambda only has access when the user grants permission.

3. **DynamoDB**: Contains only spreadsheet IDs, no sensitive feeding data.

4. **Service Account**: No longer needed for production. Keep for development/testing only.

---

## For Development/Testing

During development, you can still use the service account method by keeping these environment variables:

- `GOOGLE_CREDENTIALS` - Service account JSON
- `SPREADSHEET_ID` - Your test spreadsheet ID

The code will fall back to service account if no OAuth token is provided.

---

## Publishing Checklist

Before submitting for certification:

- [ ] OAuth consent screen is complete
- [ ] Privacy policy URL is added (required for account linking)
- [ ] Terms of use URL is added
- [ ] Account linking is tested with multiple users
- [ ] DynamoDB table is created in production region
- [ ] Lambda has correct IAM permissions
- [ ] Environment variables are set correctly
- [ ] Remove development/test credentials from Lambda

---

## Cost Estimation

**AWS Costs** (Free tier eligible):
- Lambda: Free for first 1M requests/month
- DynamoDB: Free for first 25GB + 200M requests/month

**Google Costs**:
- Google Sheets API: Free (500 requests/100 seconds per user)
- Adequate for typical baby tracking use (a few requests per day)

**Expected cost for 100 active users**: $0/month (within free tiers)
**Expected cost for 10,000 active users**: ~$5-10/month

---

## Support

If you encounter issues during setup:

1. Check CloudWatch Logs for Lambda errors
2. Verify all URLs and credentials match exactly
3. Test OAuth flow in Google OAuth Playground
4. Ensure all APIs are enabled in Google Cloud

---

## Next Steps

After completing this setup:

1. Test the skill with multiple Google accounts
2. Create privacy policy and terms of use
3. Prepare skill listing (description, icons, etc.)
4. Submit for Amazon certification
5. Handle beta testing feedback
6. Launch to public!
