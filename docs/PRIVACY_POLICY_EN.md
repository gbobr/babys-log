# Privacy Policy for Bitácora del Bebé / Baby's Log

**Last Updated:** November 17, 2024

## Introduction

This Privacy Policy describes how Bitácora del Bebé ("we", "our", or "the skill") collects, uses, and protects your information when you use our Alexa skill.

## Information We Collect

### 1. Amazon Alexa Information
When you use our skill, we receive:
- Your Alexa User ID (a unique identifier assigned by Amazon)
- Voice commands and requests you make to the skill
- Device information necessary to respond to your requests

### 2. Google Account Information
When you link your Google account, we receive:
- OAuth 2.0 access token to access your Google Sheets
- Permission to create and modify spreadsheets in your Google Drive
- Permission to read file metadata (to verify spreadsheet existence and status)

### 3. Data Stored by Us
We store the following in our secure database (Amazon DynamoDB):
- Your Alexa User ID
- Your Google Sheets spreadsheet ID
- Spreadsheet URL
- Timestamps of account creation and updates

**Important:** We do NOT store any feeding records, baby information, or personal health data on our servers. All feeding data is stored exclusively in YOUR Google Sheets spreadsheet that you own and control.

## How We Use Your Information

We use the collected information to:
1. **Provide the Service**: Create and manage your personal baby tracking spreadsheet
2. **Record Feedings**: Add feeding entries to YOUR Google Sheets spreadsheet
3. **Retrieve Information**: Read feeding data from YOUR spreadsheet to answer your queries
4. **Maintain Service**: Associate your Alexa account with your Google Sheets spreadsheet

## Data Storage and Security

### Our Servers (DynamoDB)
- We store only your Alexa User ID and spreadsheet reference
- Data is stored in AWS DynamoDB with encryption at rest
- Access is restricted and protected by AWS security measures

### Your Data (Google Sheets)
- ALL feeding records are stored in YOUR Google Sheets spreadsheet
- You maintain full ownership and control of this data
- You can access, modify, or delete this spreadsheet at any time
- We only access your spreadsheet when you use the skill

## Data Sharing and Third Parties

We do NOT:
- Sell your data to third parties
- Share your data with advertisers
- Use your data for marketing purposes
- Access your Google Drive files other than the spreadsheet created by this skill

We DO share data with:
- **Amazon Web Services (AWS)**: To host our service (Lambda, DynamoDB)
- **Google**: To access your Google Sheets via OAuth 2.0
- **Amazon Alexa**: To process your voice commands

These services are used solely to provide the skill's functionality.

## Data Retention and Deletion

### How Long We Keep Data
- We retain your Alexa User ID and spreadsheet reference as long as you use the skill
- If you disable the skill, your DynamoDB data remains for 90 days and is then automatically deleted

### How to Delete Your Data

**To delete all data:**
1. **Disable the skill** in the Alexa app (Settings → Your Skills → Bitácora del Bebé → Disable)
2. **Revoke Google access** at https://myaccount.google.com/permissions
3. **Delete your spreadsheet** in Google Drive (if you wish to delete feeding records)

After disabling, your data will be removed from our database within 90 days. To request immediate deletion, contact us at [YOUR-EMAIL@example.com].

## Children's Privacy

This skill is designed to track baby feeding information. However:
- The skill does NOT collect information directly from children
- The skill is operated by parents/caregivers who are adults
- No child personal information is stored on our servers
- All baby-related data is stored in the parent's Google Sheets account

## Google API Services User Data Policy

This skill's use of information received from Google APIs adheres to the [Google API Services User Data Policy](https://developers.google.com/terms/api-services-user-data-policy), including the Limited Use requirements.

Specifically:
- We only access Google Sheets and Drive metadata APIs
- We use your data solely to provide baby feeding tracking functionality
- We do not transfer your Google user data to third parties (except as necessary to provide the service)
- We do not use your Google user data for serving advertisements

## OAuth and Account Linking

When you link your Google account:
1. You are redirected to Google's OAuth consent screen
2. You grant permission for us to access your Google Sheets
3. Google provides us with an access token (not your password)
4. We use this token to create and manage your spreadsheet
5. You can revoke access at any time through your Google account settings

**Permissions Requested:**
- `https://www.googleapis.com/auth/spreadsheets` - To create and manage your feeding spreadsheet
- `https://www.googleapis.com/auth/drive.metadata.readonly` - To verify your spreadsheet exists and is not deleted

## International Data Transfers

Your data may be processed in:
- AWS data centers (region: configurable by administrator)
- Google Cloud data centers (according to your Google account settings)

We implement appropriate safeguards to protect your data during international transfers.

## Changes to This Privacy Policy

We may update this Privacy Policy from time to time. We will notify you of any changes by:
- Updating the "Last Updated" date at the top of this policy
- Announcing changes through the skill (for major changes)

Continued use of the skill after changes constitutes acceptance of the updated policy.

## Your Rights

Depending on your location, you may have rights including:
- **Access**: Request a copy of your data
- **Correction**: Request correction of inaccurate data
- **Deletion**: Request deletion of your data
- **Portability**: Request your data in a portable format
- **Objection**: Object to certain data processing activities

To exercise these rights, contact us at [YOUR-EMAIL@example.com].

## Contact Us

If you have questions about this Privacy Policy or our data practices, contact us at:

**Email:** [YOUR-EMAIL@example.com]
**Project Repository:** [YOUR-GITHUB-REPO-URL]

## Compliance

This skill complies with:
- Amazon Alexa Skills Privacy Requirements
- Google API Services User Data Policy
- General Data Protection Regulation (GDPR) - where applicable
- California Consumer Privacy Act (CCPA) - where applicable

---

**For Spanish version, see:** [PRIVACY_POLICY_ES.md](PRIVACY_POLICY_ES.md)
