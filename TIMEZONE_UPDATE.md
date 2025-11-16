# Timezone Support Update

The skill now displays times in the user's local timezone instead of UTC!

## What Changed

### ✅ Times are now shown in user's local timezone
- **Before:** "Toma de pecho registrada a las 3:30 PM" (UTC)
- **After:** "Toma de pecho registrada a las 10:30 AM" (user's local time in Madrid/Mexico City/etc.)

### Files Modified

1. **`src/utils/timezone.js`** (NEW)
   - Retrieves device timezone from Alexa
   - Formats times in user's timezone
   - Falls back to UTC if timezone unavailable

2. **`src/handlers/feeding.js`**
   - Updated to use timezone-aware time formatting
   - Confirmation messages now show local time

3. **`src/handlers/query.js`**
   - "Last feeding" query shows local time
   - All time displays use user's timezone

4. **`src/index.js`**
   - Added `.withApiClient()` to enable device settings API access

## How It Works

1. When confirming a feeding, the skill:
   - Gets the device's timezone (e.g., "America/New_York", "Europe/Madrid")
   - Stores the feeding in UTC (unchanged)
   - Displays the confirmation in the user's local time

2. When querying feedings:
   - Retrieves data from Google Sheets (still in UTC)
   - Converts to user's timezone for speech output

## Data Storage (Unchanged)

- **Google Sheets still stores UTC timestamps** ✅
- This ensures data consistency across timezones
- Only the *display* is in local time

## Supported Timezones

All IANA timezones are supported, including:
- **Spain:** `Europe/Madrid`
- **Mexico:** `America/Mexico_City`
- **Argentina:** `America/Argentina/Buenos_Aires`
- **Colombia:** `America/Bogota`
- **Chile:** `America/Santiago`
- **US:** `America/New_York`, `America/Los_Angeles`, etc.
- And all others...

## Fallback Behavior

If timezone cannot be retrieved (rare):
- Falls back to UTC
- Skill continues to work normally
- Error is logged for debugging

## No Permissions Required

The skill uses Alexa's built-in Settings API:
- No explicit user permissions needed
- Works automatically on all devices
- Privacy-friendly (only reads timezone setting)

## Deployment

1. **Redeploy Lambda function:**
   ```bash
   cd lambda
   npm run deploy
   ```
   Upload `function.zip` to AWS Lambda

2. **No changes needed in Alexa Developer Console**
   - Interaction model unchanged
   - Permissions unchanged
   - Just redeploy Lambda code

## Testing

Test the timezone feature:

```
User: "Alexa, abre bitácora del bebé"
Alexa: "¡Bienvenido a la Bitácora del Bebé!..."

User: "registra toma de pecho"
Alexa: "¿Confirmas que el bebé tomó pecho?"

User: "sí"
Alexa: "Perfecto. Toma de pecho registrada a las 2:30 PM."
       ↑ This should now be in YOUR local time!

User: "cuál fue la última toma"
Alexa: "La última toma fue pecho a las 2:30 PM."
       ↑ Also in your local time
```

## Benefits

✅ **More intuitive** - Parents see times they recognize
✅ **Less confusing** - No mental timezone conversion needed
✅ **Data integrity** - Backend still uses UTC
✅ **Global ready** - Works in any timezone
✅ **No setup** - Automatic timezone detection

## Example Scenarios

### Scenario 1: User in Madrid (CET/CEST)
- Feeding at 10:30 AM Madrid time
- Stored as 08:30 UTC (or 09:30 UTC in summer)
- Displayed as "10:30 AM" to user

### Scenario 2: User in Mexico City (CST/CDT)
- Feeding at 3:45 PM Mexico time
- Stored as 21:45 UTC (or 20:45 UTC in summer)
- Displayed as "3:45 PM" to user

### Scenario 3: User traveling
- Uses device in different timezone
- Skill automatically adapts to new timezone
- Old feedings still displayed correctly
