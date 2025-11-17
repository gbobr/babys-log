# Quick Start Guide - Baby Milk Tracker

This guide will help you get your Baby Milk Tracker Alexa skill up and running in about 30 minutes.

## Prerequisites

- Amazon Developer Account (free)
- AWS Account (free tier available)
- Google Account (free)
- Node.js 18.x or later installed

## Step 1: Google Sheets Setup (5 minutes)

### 1.1 Create the Spreadsheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Click the `+` button to create a new spreadsheet
3. Rename it to "Baby Milk Tracker"
4. Rename "Sheet1" to "Feedings"
5. Add these headers to row 1:
   - A1: `Timestamp`
   - B1: `Type`
   - C1: `Amount (ml)`
   - D1: `Duration (min)`
   - E1: `Notes`
6. **Copy the Spreadsheet ID** from the URL:
   ```
   https://docs.google.com/spreadsheets/d/[THIS_IS_YOUR_SPREADSHEET_ID]/edit
   ```

### 1.2 Create Service Account

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project:
   - Click "Select a project" → "New Project"
   - Name: "Baby Milk Tracker"
   - Click "Create"
3. Enable Google Sheets API:
   - Go to "APIs & Services" → "Enable APIs and Services"
   - Search for "Google Sheets API"
   - Click "Enable"
4. Create Service Account:
   - Go to "IAM & Admin" → "Service Accounts"
   - Click "Create Service Account"
   - Name: `baby-milk-tracker`
   - Click "Create and Continue"
   - Role: Select "Editor"
   - Click "Done"
5. Create Key:
   - Click on the service account you just created
   - Go to "Keys" tab
   - Click "Add Key" → "Create new key"
   - Choose "JSON"
   - Click "Create" - a JSON file will download
   - **Keep this file safe!**

### 1.3 Share Spreadsheet with Service Account

1. Open the downloaded JSON file
2. Copy the `client_email` value (looks like `baby-milk-tracker@project-id.iam.gserviceaccount.com`)
3. Go back to your Google Sheet
4. Click "Share" button
5. Paste the service account email
6. Change role to "Editor"
7. Uncheck "Notify people"
8. Click "Share"

## Step 2: AWS Lambda Setup (10 minutes)

### 2.1 Install Dependencies

```bash
cd lambda
npm install
```

### 2.2 Create Lambda Function

1. Go to [AWS Lambda Console](https://console.aws.amazon.com/lambda)
2. Click "Create function"
3. Choose "Author from scratch"
4. Settings:
   - Function name: `baby-milk-tracker`
   - Runtime: `Node.js 18.x`
   - Architecture: `x86_64`
5. Click "Create function"

### 2.3 Configure Environment Variables

1. In your Lambda function, go to "Configuration" → "Environment variables"
2. Click "Edit" → "Add environment variable"
3. Add two variables:

   **Variable 1:**
   - Key: `GOOGLE_CREDENTIALS`
   - Value: Open the JSON file you downloaded, copy ALL contents (including the curly braces), and paste it here

   **Variable 2:**
   - Key: `SPREADSHEET_ID`
   - Value: Paste your Spreadsheet ID from Step 1.1

4. Click "Save"

### 2.4 Deploy Code

```bash
cd lambda
npm run deploy
```

This creates `function.zip`. Now upload it:

1. In Lambda console, go to "Code" tab
2. Click "Upload from" → ".zip file"
3. Choose `function.zip`
4. Click "Save"

### 2.5 Adjust Settings

1. Go to "Configuration" → "General configuration"
2. Click "Edit"
3. Set Timeout to `30 seconds`
4. Click "Save"

### 2.6 Copy Lambda ARN

At the top of your Lambda function page, copy the ARN:
```
arn:aws:lambda:us-east-1:123456789012:function:baby-milk-tracker
```
You'll need this in the next step.

## Step 3: Alexa Developer Console Setup (10 minutes)

### 3.1 Create Skill

1. Go to [Alexa Developer Console](https://developer.amazon.com/alexa/console/ask)
2. Click "Create Skill"
3. Settings:
   - Skill name: `Baby Milk Tracker`
   - Primary locale: `Spanish (ES)`
   - Model: Choose "Custom"
   - Hosting: "Provision your own"
4. Click "Create skill"
5. Choose "Start from Scratch"
6. Click "Continue with template"

### 3.2 Configure Interaction Model (Spanish)

1. Go to "Build" → "Interaction Model" → "JSON Editor"
2. Open `skill-package/interactionModels/custom/es-ES.json` from this project
3. Copy ALL contents
4. Paste into the JSON Editor (replacing everything)
5. Click "Save Model"
6. Click "Build Model" (takes ~30 seconds)

### 3.3 Add English Locale (Optional)

1. Click "Language" at the top (dropdown with flag icon)
2. Click "Add"
3. Select "English (US)"
4. Go to "Interaction Model" → "JSON Editor"
5. Open `skill-package/interactionModels/custom/en-US.json`
6. Copy and paste contents
7. Click "Save Model"
8. Click "Build Model"

### 3.4 Configure Endpoint

1. Go to "Build" → "Endpoint"
2. Choose "AWS Lambda ARN"
3. Default Region: Paste your Lambda ARN from Step 2.6
4. Click "Save Endpoints"

### 3.5 Copy Skill ID

1. At the top of the page, click "View Skill ID"
2. Copy the Skill ID (looks like `amzn1.ask.skill.xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)

### 3.6 Add Alexa Trigger to Lambda

1. Go back to AWS Lambda Console
2. Open your `baby-milk-tracker` function
3. Click "Add trigger"
4. Choose "Alexa Skills Kit"
5. Paste your Skill ID
6. Click "Add"

## Step 4: Test Your Skill (5 minutes)

### 4.1 Test in Console

1. In Alexa Developer Console, go to "Test" tab
2. Enable "Development" mode from dropdown
3. Try these phrases:

**Spanish:**
```
abre rastreador de leche
```
Response: "¡Bienvenido al rastreador de leche del bebé!..."

```
registra toma de pecho
```
Response: "¿Confirmas que el bebé tomó pecho?"

```
sí
```
Response: "Perfecto. Toma de pecho registrada a las..."

```
dame el resumen del día
```
Response: "Hoy el bebé ha tenido 1 tomas:..."

**English (if configured):**
```
open milk tracker
register breastfeeding
yes
give me today's summary
```

### 4.2 Check Google Sheets

1. Open your Google Sheet
2. You should see the feeding recorded in the "Feedings" sheet!

### 4.3 Test on Device (Optional)

If you have an Alexa device:
1. Make sure it's linked to the same Amazon account
2. Say: "Alexa, abre rastreador de leche"
3. Follow the prompts!

## Common Test Phrases

### Spanish (es-ES)

**Register feedings:**
- "registra toma de pecho"
- "anota biberón con leche materna de 120 mililitros"
- "el bebé tomó biberón con fórmula de 150 mililitros"

**Query history:**
- "cuál fue la última toma"
- "dame el resumen del día"

**Help:**
- "ayuda"

### English (en-US)

**Register feedings:**
- "register breastfeeding"
- "log bottle with breast milk of 120 milliliters"
- "baby had a bottle with formula of 150 milliliters"

**Query history:**
- "what was the last feeding"
- "give me today's summary"

**Help:**
- "help"

## Troubleshooting

### Skill says "Sorry, I couldn't save the information"

1. Check Lambda CloudWatch logs:
   - Go to Lambda → Monitor → Logs
   - Look for errors related to Google Sheets
2. Verify environment variables are set correctly
3. Make sure service account has Editor access to the sheet

### Skill doesn't respond

1. Check Lambda trigger is configured with correct Skill ID
2. Verify Endpoint ARN in Alexa console matches Lambda ARN
3. Check Lambda timeout is at least 30 seconds

### "Sorry, I didn't understand that"

1. Make sure interaction model is built (green checkmark)
2. Check that you're using the correct locale
3. Try rephrasing the utterance

## Next Steps

- Read the full [README.md](README.md) for advanced configuration
- Customize utterances in the interaction model
- Add more features (see README for ideas)
- Submit for certification to make it public

## Need Help?

Check the main [README.md](README.md) for detailed troubleshooting and customization options.

Enjoy tracking your baby's feedings! 🍼
