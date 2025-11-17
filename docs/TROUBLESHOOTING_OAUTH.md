# Troubleshooting OAuth Account Linking

## Problem: "Unable to link the skill at this time"

This error occurs when Alexa cannot complete the OAuth token exchange with Google after you grant permissions.

---

## Checklist (Go through in order)

### ✅ 1. Verify Redirect URLs Match EXACTLY

This is the #1 cause of this error.

**Step 1: Get URLs from Alexa**
1. Go to [Alexa Developer Console](https://developer.amazon.com/alexa/console/ask)
2. Select your skill > **Build** > **Account Linking**
3. Scroll to the bottom - you'll see **Redirect URLs** with 3 URLs like:
   ```
   https://pitangui.amazon.com/api/skill/link/M1XXXXXXXXXXXXX
   https://layla.amazon.com/api/skill/link/M1XXXXXXXXXXXXX
   https://alexa.amazon.co.jp/api/skill/link/M1XXXXXXXXXXXXX
   ```
4. Copy these EXACTLY (use the copy button)

**Step 2: Add to Google Console**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. **APIs & Services** > **Credentials**
3. Click on your OAuth 2.0 Client ID
4. Under **Authorized redirect URIs**, paste ALL 3 URLs
5. **Important**: No trailing slashes, no extra spaces, EXACT match
6. Click **Save**
7. Wait 1-2 minutes for Google to propagate changes

**Step 3: Try Again**
- Unlink the account in Alexa app (if partially linked)
- Try linking again

---

### ✅ 2. Check OAuth Configuration in Alexa

Go to your skill > **Account Linking** and verify:

**Authorization URI:**
```
https://accounts.google.com/o/oauth2/v2/auth
```
(No typos, no spaces, exact URL)

**Access Token URI:**
```
https://oauth2.googleapis.com/token
```
(Not `/oauth2` or `/tokens` - exactly as shown)

**Client ID:**
- Should look like: `123456789-xxxxxxxxxx.apps.googleusercontent.com`
- Copy from Google Console, not manually typed
- No extra spaces

**Client Secret:**
- Copy from Google Console
- No extra spaces or line breaks

**Authentication Scheme:**
- Must be: **HTTP Basic (Recommended)**

**Scope:**
```
https://www.googleapis.com/auth/drive.file
```

**After making changes:**
- Click **Save**
- Wait 30 seconds
- Try linking again

---

### ✅ 3. Verify OAuth Client Type

In Google Cloud Console:

1. **APIs & Services** > **Credentials**
2. Find your OAuth 2.0 Client ID
3. Under "Type" it must say **Web application**
4. If it says anything else (Android, iOS, Desktop), you need to create a new one:
   - Click **+ CREATE CREDENTIALS** > **OAuth 2.0 Client ID**
   - Select **Web application**
   - Add the 3 redirect URLs from Alexa
   - Use the new Client ID and Secret in Alexa

---

### ✅ 4. Check OAuth Consent Screen

1. Go to **APIs & Services** > **OAuth consent screen**
2. Verify:
   - **App name**: Filled in
   - **User support email**: Valid email
   - **Developer contact**: Valid email

3. Click **Edit App**
4. Go to **Scopes** step
5. Verify the scope is added:
   - `https://www.googleapis.com/auth/drive.file`
6. If missing, add it:
   - Click **ADD OR REMOVE SCOPES**
   - Search for "drive.file" and check it
   - Click **UPDATE**
   - Click **SAVE AND CONTINUE**

---

### ✅ 5. Check Testing Status

If your OAuth consent screen is in "Testing" mode:

1. Go to **OAuth consent screen**
2. Under "Publishing status" you'll see either:
   - **Testing** - Only test users can link
   - **In production** - Anyone can link

**If "Testing":**
1. Scroll down to **Test users**
2. Make sure YOUR email (the one you're using to link) is in the list
3. If not, click **+ ADD USERS** and add it
4. **Or** click **PUBLISH APP** to make it available to everyone

---

### ✅ 6. Test OAuth Flow Directly

Let's verify Google is working correctly:

1. Go to [Google OAuth 2.0 Playground](https://developers.google.com/oauthplayground/)
2. Click the **gear icon** (⚙️) top right
3. Check **"Use your own OAuth credentials"**
4. Paste your **OAuth Client ID**
5. Paste your **OAuth Client secret**
6. Click **Close**
7. In Step 1, scroll and select:
   - `https://www.googleapis.com/auth/drive.file`
8. Click **Authorize APIs**
9. Sign in with Google
10. Grant permissions

**Expected result:** You should see an authorization code
**If this fails:** The problem is in your Google OAuth setup
**If this works:** The problem is in how Alexa is configured

---

### ✅ 7. Clear and Retry

Sometimes cached data causes issues:

1. **In Alexa app:**
   - Go to skill settings
   - If there's an option to "Unlink Account", tap it
   - Force close Alexa app
   - Reopen app

2. **Clear browser cache** (if using Alexa web):
   - Clear cookies for amazon.com and google.com
   - Try again

3. **Try different account:**
   - Use a different Google account to test
   - This helps identify if it's account-specific

---

### ✅ 8. Create Fresh OAuth Credentials

If nothing else works, start clean:

1. In Google Cloud Console:
   - **APIs & Services** > **Credentials**
   - Click **+ CREATE CREDENTIALS**
   - Select **OAuth 2.0 Client ID**
   - Application type: **Web application**
   - Name: `Alexa Baby Tracker NEW`
   - Add all 3 redirect URLs from Alexa
   - Click **CREATE**
   - Copy the new Client ID and Secret

2. In Alexa Developer Console:
   - Update **Your Client ID** with new value
   - Update **Your Secret** with new value
   - Click **Save**
   - Wait 60 seconds
   - Try linking

---

### ✅ 9. Check Browser/App Issues

**If using Alexa app:**
- Make sure app is updated to latest version
- Try on a different device (phone vs tablet)
- Try using alexa.amazon.com in browser instead

**If using browser:**
- Try a different browser (Chrome, Firefox, Safari)
- Disable browser extensions temporarily
- Try incognito/private mode

---

### ✅ 10. Verify Google APIs are Enabled

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. **APIs & Services** > **Library**
3. Search for "Google Sheets API"
4. It should show **MANAGE** (meaning it's enabled)
5. If it shows **ENABLE**, click it

Also enable:
- Google Sheets API
- Google OAuth 2.0 API (usually enabled by default)

---

## Still Not Working?

### Check Google Developer Console Logs

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. **APIs & Services** > **Credentials**
3. Click on your OAuth 2.0 Client ID
4. Look for any warnings or errors on the page

### Check Alexa Skill Status

1. In Alexa Developer Console
2. Go to your skill > **Build** > **Account Linking**
3. Look for any yellow warning banners
4. Make sure all fields show green checkmarks

### Common Error Messages

**"redirect_uri_mismatch"**
- Redirect URLs don't match
- Check step 1 again - they must be EXACT

**"invalid_client"**
- Client ID or Secret is wrong
- Copy fresh credentials from Google

**"access_denied"**
- User denied permissions
- Try again and click "Allow" when Google asks

**"unauthorized_client"**
- OAuth client not configured correctly
- Verify it's a "Web application" type
- Check consent screen is complete

---

## Get More Info

After deploying the updated Lambda code with debugging, try to link again, then:

1. Go to [AWS CloudWatch](https://console.aws.amazon.com/cloudwatch/)
2. **Logs** > **Log groups**
3. Find `/aws/lambda/your-function-name`
4. Look for recent logs

The logs will show if Alexa is even trying to invoke your skill. If you don't see any new logs, the problem is in the OAuth configuration, not your code.

---

## Quick Reference: What Should Match

| Google Cloud Console | Alexa Account Linking |
|---------------------|----------------------|
| Redirect URIs (3 URLs) | Redirect URLs (provided by Alexa) |
| Client ID | Your Client ID |
| Client Secret | Your Secret |
| Scope: drive.file | Scope (1 line) |

---

## Need More Help?

1. Screenshot your Account Linking page in Alexa (blur Client Secret)
2. Screenshot your OAuth Client settings in Google Console
3. Check if error happens before or after you click "Allow" on Google's permission page

**If error happens AFTER clicking Allow:** Configuration mismatch (usually redirect URLs)
**If error happens BEFORE Google login:** Alexa configuration issue (wrong URLs)
