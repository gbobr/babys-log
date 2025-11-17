# Feeding Reminders Feature

## Overview

The Baby's Log skill includes an **automatic feeding reminder** feature that uses the Alexa Reminders API to notify parents when it's time to feed their baby.

## How It Works

### Automatic Scheduling

After recording any feeding (breastfeeding, bottle with breast milk, or bottle with formula), the skill automatically:

1. **Cancels** any previously scheduled reminder
2. **Schedules** a new reminder for 3 hours from now
3. **Stores** the reminder ID in DynamoDB for future cancellation

This ensures that:
- Only one reminder is active at a time
- The reminder is always based on the most recent feeding
- Early feedings automatically push back the reminder

### Example Flow

```
3:00 PM - Register feeding
         → Reminder scheduled for 6:00 PM

5:30 PM - Register another feeding
         → 6:00 PM reminder cancelled
         → New reminder scheduled for 8:30 PM

8:30 PM - Alexa reminds: "Es hora de alimentar al bebé"
```

## User Experience

### First-Time Permission Request

After recording their **first feeding**, users are asked:

**Spanish:**
> "Toma registrada! ¿Te gustaría que te recuerde cada 3 horas cuando es hora de alimentar al bebé?"

**English:**
> "Feeding registered! Would you like me to remind you every 3 hours when it's time to feed the baby?"

A permissions card is also sent to the Alexa app for enabling reminder permissions.

### For Existing Users

Users who already have the skill installed before this feature was deployed will be asked for permission after their **next feeding** (not on skill launch, to avoid interrupting their workflow).

### Granting Permission

Users can grant permission in two ways:

1. **Via Voice**: Say "Yes" when asked
2. **Via Alexa App**:
   - Open Alexa app
   - Go to Skills & Games → Your Skills → Dev (or enabled skills)
   - Select "Baby's Log" / "Bitácora del Bebé"
   - Tap "Settings"
   - Enable "Reminders" permission

### When Permission is Denied

If the user says "No" or doesn't grant permission:
- The skill works normally (feeding tracking continues)
- No reminders are created
- The user is **not asked again** (we respect their choice)
- They can manually enable permissions in the Alexa app later

### Reminder Notification

When a reminder triggers, Alexa:
1. Plays a brief tone
2. Says: "Es hora de alimentar al bebé" (Spanish) or "Time to feed the baby" (English)
3. Repeats the message twice (unless user says "Stop")
4. Shows the reminder in the Alexa app

## Technical Implementation

### Data Model

DynamoDB stores the following reminder-related fields:

```javascript
{
  userId: "alexa-user-id",
  spreadsheetId: "google-sheet-id",
  spreadsheetUrl: "https://...",
  createdAt: "2025-01-17...",
  updatedAt: "2025-01-17...",

  // Reminder fields
  reminderEnabled: true,                    // Feature toggle (default: true)
  reminderIntervalHours: 3,                 // Interval in hours (default: 3)
  activeReminderId: "amzn1.alexa.reminder.xxx", // Current reminder ID
  lastFeedingTime: "2025-01-17T15:30:00Z",  // Last feeding timestamp
  reminderPermissionAsked: true             // Tracks if we asked for permission
}
```

### Permissions Required

The skill requires the following permission in `skill.json`:

```json
{
  "permissions": [
    {
      "name": "alexa::alerts:reminders:skill:readwrite"
    }
  ]
}
```

### API Integration

The feature uses the **Alexa Reminders API** with:

- **Trigger Type**: `SCHEDULED_RELATIVE` (e.g., "in 3 hours")
- **Offset**: `10800` seconds (3 hours)
- **Push Notifications**: Enabled (sends to mobile app too)
- **Locale-Aware**: Reminder text matches user's language

### Code Structure

**Key Files:**
- `lambda/src/utils/reminders.js` - Reminder management logic
- `lambda/src/handlers/feeding.js` - Integration with feeding flow
- `lambda/src/utils/strings.js` - Localized reminder messages

**Key Functions:**
- `scheduleNextFeedingReminder()` - Creates new reminder
- `cancelReminder()` - Cancels existing reminder
- `hasReminderPermission()` - Checks if permission granted
- `shouldAskForPermission()` - Determines if we should ask
- `markPermissionAsked()` - Records that we asked

## Limitations

### Current Version (v1)

- **Fixed Interval**: 3 hours (hardcoded)
- **No Quiet Hours**: Reminders can fire at any time
- **No Customization**: Reminder text is fixed per locale
- **Single Reminder**: Only one active reminder at a time

### Alexa Platform Limits

- **Reminder Lifetime**: Reminders auto-delete 3 days after triggering
- **Scope**: Can only manage reminders created by this skill
- **Permissions**: Requires user consent (can't force enable)

## Future Enhancements

Potential improvements for future versions:

### Configurable Interval

```javascript
// New intent: "change reminder interval to 2 hours"
UpdateReminderIntervalIntent {
  slots: {
    hours: AMAZON.NUMBER
  }
}
```

### Enable/Disable Toggle

```javascript
// "disable reminders" / "enable reminders"
DisableRemindersIntent
EnableRemindersIntent
```

### Quiet Hours

```javascript
// Don't send reminders between 10 PM - 6 AM
quietHoursStart: "22:00",
quietHoursEnd: "06:00"
```

### Smart Intervals Based on Age

```javascript
// Adjust interval based on baby's age
// Newborn: 2-3 hours
// 3 months: 3-4 hours
// 6 months: 4-5 hours
babyBirthdate: "2024-11-01",
ageBasedIntervals: true
```

### Custom Reminder Text

```javascript
// "remind me to feed Sofia"
babyName: "Sofia",
reminderText: "Hora de darle de comer a Sofia"
```

## Troubleshooting

### "I'm not getting reminders"

**Check:**
1. Permission granted in Alexa app?
2. Recording feedings successfully?
3. More than 3 hours since last feeding?

**Debug Steps:**
1. Check DynamoDB for `activeReminderId`
2. Check CloudWatch logs for reminder creation
3. Verify permission token exists in request

### "Permission request not appearing"

**Possible Causes:**
- Already asked before (`reminderPermissionAsked: true`)
- User already has permission granted
- Not recording actual feedings (only querying)

**Fix:**
Manually reset in DynamoDB:
```bash
aws dynamodb update-item \
  --table-name BabyTrackerUsers \
  --key '{"userId": {"S": "amzn1.ask.account.XXX"}}' \
  --update-expression "SET reminderPermissionAsked = :false" \
  --expression-attribute-values '{":false": {"BOOL": false}}'
```

### "Reminder not cancelled when feeding early"

**Check:**
- CloudWatch logs for cancellation attempts
- Reminder ID stored in DynamoDB
- API errors (404 = already expired/deleted)

## Privacy & Data

### What We Store

- Reminder ID (for cancellation)
- Last feeding timestamp (for scheduling)
- Permission asked flag (to avoid re-asking)

### What We Don't Store

- Reminder content
- Notification history
- User responses to reminders

### User Control

Users have full control:
- Can disable permissions anytime in Alexa app
- Disabling skill auto-deletes all reminders
- Can manually delete reminders in Alexa app

## Compliance

The reminder feature complies with:
- **Alexa Skills Privacy Requirements**
- **Voice Design Best Practices** (non-intrusive permission ask)
- **User Consent Requirements** (two-tier permission model)

## References

- [Alexa Reminders API Overview](https://developer.amazon.com/en-GB/docs/alexa/smapi/alexa-reminders-overview.html)
- [Reminders REST API Reference](https://developer.amazon.com/en-US/docs/alexa/smapi/alexa-reminders-api-reference.html)
- [Call Alexa Service APIs (Node.js SDK)](https://developer.amazon.com/en-US/docs/alexa/alexa-skills-kit-sdk-for-nodejs/call-alexa-service-apis.html)

---

**Last Updated:** November 17, 2025
