# OAuth Scope Update - Security Improvement

**Date:** November 17, 2025

## Summary

Updated OAuth scope configuration to follow the principle of least privilege, improving security and user trust.

## Changes

### Old Configuration (Broad Permissions)

**Scopes requested:**
- `https://www.googleapis.com/auth/spreadsheets` - Full access to ALL user spreadsheets
- `https://www.googleapis.com/auth/drive.metadata.readonly` - Read metadata for all Drive files
- `https://www.googleapis.com/auth/userinfo.email` - Access to user's email address

**Total:** 3 scopes

**Issues:**
- Too broad - accesses all user spreadsheets, not just app-created ones
- Violates principle of least privilege
- Harder to get Google verification approval
- Users may be hesitant to grant such broad permissions

### New Configuration (Minimal Permissions)

**Scope requested:**
- `https://www.googleapis.com/auth/drive.file` - Access ONLY to files created by this app

**Total:** 1 scope

**Benefits:**
- ✅ More secure - only accesses app-created spreadsheets
- ✅ Better privacy - cannot read other user files
- ✅ Easier Google OAuth verification
- ✅ Increased user trust
- ✅ Follows principle of least privilege
- ✅ Simpler to explain in privacy policy
- ✅ No code changes required

## What `drive.file` Provides

The `https://www.googleapis.com/auth/drive.file` scope allows the app to:

1. **Create** new files (spreadsheets) in user's Google Drive
2. **Read** files that it created
3. **Write/Update** files that it created
4. **Delete** files that it created (if implemented)
5. **Check metadata** (name, trashed status, etc.) for files it created

It does **NOT** allow:
- Accessing other apps' files
- Accessing user-created spreadsheets
- Listing all Drive files
- Accessing files outside the app's scope

## Migration Steps

### 1. Update Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** > **OAuth consent screen**
3. Click **Edit App**
4. Go to **Scopes** section
5. **Remove** these scopes:
   - `https://www.googleapis.com/auth/spreadsheets`
   - `https://www.googleapis.com/auth/drive.metadata.readonly`
   - `https://www.googleapis.com/auth/userinfo.email`
6. **Add** this scope:
   - Click **ADD OR REMOVE SCOPES**
   - Search for "Google Drive API" scopes
   - Check `https://www.googleapis.com/auth/drive.file`
   - Description: "See, edit, create, and delete only the specific Google Drive files you use with this app"
7. Click **UPDATE**
8. Click **SAVE AND CONTINUE**

### 2. Update Alexa Developer Console

1. Go to [Alexa Developer Console](https://developer.amazon.com/alexa/console/ask)
2. Select your skill
3. Navigate to **Build** > **Account Linking**
4. Under **Scope** section:
   - Remove both existing scope entries
   - Add single scope: `https://www.googleapis.com/auth/drive.file`
5. Click **Save**

### 3. Test the Update

1. **Unlink account** in Alexa app (important!)
2. **Re-link account** with new scope
3. Test skill functionality:
   - First launch should create new spreadsheet
   - Record a feeding
   - Query last feeding
   - Check Google Drive for spreadsheet
4. Verify everything works as before

### 4. User Migration

**For existing users:**
- Users will need to **unlink and re-link** their accounts to grant the new permission
- Old spreadsheets created with previous scope will still be accessible (they were created by the app)
- Announce the change to users via skill update message or email

**Communication template:**
```
We've updated our app to use more secure permissions!

Action required: Please unlink and re-link your Google account in the Alexa app.

What changed:
- We now only request permission to access files created by our app
- Your existing spreadsheet remains accessible
- Your data is more secure

How to update:
1. Open Alexa app
2. Go to Skills → Your Skills → Baby's Log
3. Settings → Unlink Account
4. Link Account again
```

## Files Updated

All documentation has been updated to reflect the new scope:

- ✅ `docs/PRIVACY_POLICY_EN.md` - Updated permissions section
- ✅ `docs/PRIVACY_POLICY_ES.md` - Updated permissions section
- ✅ `docs/ACCOUNT_LINKING_SETUP.md` - Updated setup instructions
- ✅ `docs/PRODUCTION_DEPLOYMENT.md` - Updated security checklist
- ✅ `docs/TROUBLESHOOTING_OAUTH.md` - Updated all scope references
- ✅ `README.md` - Updated troubleshooting section

## Code Changes

**None required!** The application code works identically with the new scope because:
- The app only creates and accesses its own spreadsheets
- The `drive.file` scope provides all necessary permissions
- Google APIs handle scope validation transparently

**Note:** The service account fallback in `lambda/src/utils/sheets.js` still uses `spreadsheets` scope. This is correct because:
- Service accounts are used for development/testing only
- They may need access to existing test spreadsheets
- This code path is not used in production (OAuth flow is used instead)

## Google Verification

When submitting for Google OAuth verification, highlight:

1. **Minimal scope usage** - Only `drive.file`
2. **Purpose** - Baby feeding tracking in user's own spreadsheet
3. **No data sharing** - All data stays in user's Google Drive
4. **User ownership** - Users control and own their data
5. **Privacy-first** - Cannot access other user files

This scope configuration demonstrates security best practices and should expedite approval.

## Rollback Plan

If issues arise, rollback is simple:

1. Revert scope in Google Console and Alexa to:
   - `https://www.googleapis.com/auth/spreadsheets`
   - `https://www.googleapis.com/auth/drive.metadata.readonly`
2. Have users unlink/re-link accounts
3. No code deployment needed

However, rollback is not recommended as the new scope is strictly better from security, privacy, and verification perspectives.

## Questions?

See the following docs for details:
- [Google API Scopes](https://developers.google.com/identity/protocols/oauth2/scopes#drive)
- [ACCOUNT_LINKING_SETUP.md](ACCOUNT_LINKING_SETUP.md)
- [TROUBLESHOOTING_OAUTH.md](TROUBLESHOOTING_OAUTH.md)
