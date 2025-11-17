# Legal Documents for Bitácora del Bebé

This directory contains the Privacy Policy and Terms of Use documents required for publishing the Alexa skill and Google OAuth integration.

## Documents Created

1. **PRIVACY_POLICY_EN.md** - Privacy Policy in English
2. **PRIVACY_POLICY_ES.md** - Privacy Policy in Spanish
3. **TERMS_OF_USE_EN.md** - Terms of Use in English
4. **TERMS_OF_USE_ES.md** - Terms of Use in Spanish

## Before Publishing to GitHub

### Required Changes

You MUST replace the following placeholders in ALL four documents:

1. **[YOUR-EMAIL@example.com]** or **[TU-EMAIL@ejemplo.com]**
   - Replace with your actual contact email address
   - This should be a real email where users can contact you

2. **[YOUR-GITHUB-REPO-URL]** or **[TU-URL-GITHUB-REPO]**
   - Replace with your actual GitHub repository URL
   - Example: `https://github.com/yourusername/baby-tracker`

3. **[YOUR-JURISDICTION]** or **[TU-JURISDICCIÓN]**
   - Replace with your legal jurisdiction
   - Example: `Spain`, `California, USA`, `the European Union`, etc.

### Search and Replace

Use your text editor or command line to replace all instances:

```bash
# Replace email (English)
sed -i 's/\[YOUR-EMAIL@example.com\]/your.actual.email@domain.com/g' PRIVACY_POLICY_EN.md TERMS_OF_USE_EN.md

# Replace email (Spanish)
sed -i 's/\[TU-EMAIL@ejemplo.com\]/tu.email.real@dominio.com/g' PRIVACY_POLICY_ES.md TERMS_OF_USE_ES.md

# Replace GitHub URL (English)
sed -i 's|\[YOUR-GITHUB-REPO-URL\]|https://github.com/yourusername/baby-tracker|g' PRIVACY_POLICY_EN.md TERMS_OF_USE_EN.md

# Replace GitHub URL (Spanish)
sed -i 's|\[TU-URL-GITHUB-REPO\]|https://github.com/yourusername/baby-tracker|g' PRIVACY_POLICY_ES.md TERMS_OF_USE_ES.md

# Replace jurisdiction (English)
sed -i 's/\[YOUR-JURISDICTION\]/Spain/g' TERMS_OF_USE_EN.md

# Replace jurisdiction (Spanish)
sed -i 's/\[TU-JURISDICCIÓN\]/España/g' TERMS_OF_USE_ES.md
```

## Using These Documents

### For Alexa Skill Submission

1. **Privacy Policy URL**: Use the raw GitHub URL for the English version
   ```
   https://raw.githubusercontent.com/yourusername/baby-tracker/main/docs/PRIVACY_POLICY_EN.md
   ```

2. **Terms of Use URL**: Use the raw GitHub URL for the English version
   ```
   https://raw.githubusercontent.com/yourusername/baby-tracker/main/docs/TERMS_OF_USE_EN.md
   ```

### For Google OAuth Consent Screen

1. **Privacy Policy URL**: Use the English version URL (same as above)
2. **Terms of Service URL**: Use the English version URL (same as above)

Note: Both Amazon and Google accept Markdown files, but you can also convert them to HTML if preferred.

### Alternative: GitHub Pages

If you want prettier URLs, you can enable GitHub Pages and use:
```
https://yourusername.github.io/baby-tracker/docs/PRIVACY_POLICY_EN
https://yourusername.github.io/baby-tracker/docs/TERMS_OF_USE_EN
```

## Document Details

### Privacy Policy Covers

- What data is collected (Alexa User ID, spreadsheet ID only)
- How Google OAuth works
- Where data is stored (DynamoDB, Google Sheets)
- User rights (GDPR compliance)
- Data deletion process
- Google API Services User Data Policy compliance
- Children's privacy (COPPA considerations)

### Terms of Use Covers

- Service description
- Account requirements
- Acceptable use policy
- Medical disclaimer (important for baby tracking)
- Liability limitations
- Termination conditions
- Intellectual property rights
- Dispute resolution

## Compliance Checklist

Before publishing:

- [ ] Replace all placeholder text with actual information
- [ ] Review jurisdiction-specific requirements
- [ ] Verify email address is monitored
- [ ] Ensure GitHub repository is public
- [ ] Test that raw URLs are accessible
- [ ] Verify documents render correctly on GitHub
- [ ] Update "Last Updated" dates if you make changes

## Legal Disclaimer

These documents are provided as templates. While they cover common requirements for Alexa skills and Google OAuth integrations, you should:

1. **Consult a lawyer** if you have specific legal concerns
2. **Review compliance requirements** for your specific jurisdiction
3. **Update regularly** as laws and service requirements change
4. **Customize** based on your specific implementation

## Support and Updates

If you modify the skill functionality, remember to:
- Update the Privacy Policy if data collection changes
- Update the Terms of Use if service features change
- Update the "Last Updated" date at the top of each document
- Notify users of material changes (if required by law)

## Questions?

If you're unsure about any legal requirements:
- Consult with a lawyer familiar with privacy law
- Review Amazon Alexa's skill policy: https://developer.amazon.com/docs/alexa/custom-skills/policy-testing-for-an-alexa-skill.html
- Review Google's OAuth policy: https://developers.google.com/terms/api-services-user-data-policy

## Version History

- **2024-11-17**: Initial creation of legal documents
