# Production Deployment Guide

This guide covers deployment of the Bitácora del Bebé Alexa skill to production.

## Prerequisites

- AWS CLI configured with appropriate credentials
- Lambda function created in AWS
- DynamoDB table created (see [ACCOUNT_LINKING_SETUP.md](ACCOUNT_LINKING_SETUP.md))
- Google OAuth configured (see [ACCOUNT_LINKING_SETUP.md](ACCOUNT_LINKING_SETUP.md))
- Alexa Account Linking configured

## Logging Configuration

The skill uses a configurable logging system controlled by the `LOG_LEVEL` environment variable.

### Log Levels

| Level | Description | What Gets Logged |
|-------|-------------|------------------|
| `ERROR` (default) | Production | Only errors |
| `INFO` | Staging/Monitoring | Errors + important events (user creation, spreadsheet operations) |
| `DEBUG` | Development | Everything (all requests, API calls, data flow) |

### Setting Log Level in Lambda

**For Production (recommended):**
```bash
aws lambda update-function-configuration \
  --function-name your-function-name \
  --environment Variables={LOG_LEVEL=ERROR}
```

**For Staging/Monitoring:**
```bash
aws lambda update-function-configuration \
  --function-name your-function-name \
  --environment Variables={LOG_LEVEL=INFO}
```

**For Development/Debugging:**
```bash
aws lambda update-function-configuration \
  --function-name your-function-name \
  --environment Variables={LOG_LEVEL=DEBUG}
```

### What Gets Logged at Each Level

**ERROR level (production):**
- Fatal initialization errors
- API call failures
- Database errors
- Unexpected exceptions

**INFO level (adds to ERROR):**
- User account linking events
- Spreadsheet creation
- DynamoDB operations
- Session lifecycle events

**DEBUG level (adds to INFO):**
- All incoming Alexa requests
- Spreadsheet validation checks
- Google Drive API operations
- Detailed flow information

## Deployment Steps

### 1. Build Deployment Package

```bash
cd /home/gbobr/git/lola/lambda

# Install dependencies (production only, no dev dependencies)
npm install --production

# Create deployment package
cd src
zip -r ../function.zip . -x "*.git*" "*.DS_Store"
cd ..
zip -r function.zip node_modules/
```

### 2. Upload to Lambda

```bash
aws lambda update-function-code \
  --function-name your-function-name \
  --zip-file fileb://function.zip
```

### 3. Configure Environment Variables

```bash
aws lambda update-function-configuration \
  --function-name your-function-name \
  --environment Variables="{LOG_LEVEL=ERROR,DYNAMODB_TABLE_NAME=BabyTrackerUsers}"
```

### 4. Verify Deployment

1. Check Lambda configuration:
   ```bash
   aws lambda get-function-configuration --function-name your-function-name
   ```

2. Test via Alexa Developer Console:
   - Go to Test tab
   - Enable testing for "Development"
   - Try: "Alexa, open Baby Tracker"

3. Check CloudWatch Logs:
   ```bash
   aws logs tail /aws/lambda/your-function-name --follow
   ```

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `LOG_LEVEL` | No | `ERROR` | Logging verbosity (ERROR, INFO, DEBUG) |
| `DYNAMODB_TABLE_NAME` | No | `BabyTrackerUsers` | Name of DynamoDB table for user data |

## Security Checklist

Before deploying to production:

- [ ] Remove any hardcoded credentials or API keys
- [ ] Set `LOG_LEVEL=ERROR` to minimize log data
- [ ] Verify Lambda IAM role has minimum required permissions:
  - DynamoDB: GetItem, PutItem, UpdateItem
  - CloudWatch Logs: CreateLogGroup, CreateLogStream, PutLogEvents
- [ ] Enable Lambda function encryption
- [ ] Review CloudWatch log retention settings
- [ ] Verify Google OAuth scopes are minimal:
  - `https://www.googleapis.com/auth/spreadsheets`
  - `https://www.googleapis.com/auth/drive.metadata.readonly`
- [ ] Test account linking flow end-to-end
- [ ] Verify legal documents are publicly accessible
- [ ] Review Alexa skill privacy settings

## Monitoring

### CloudWatch Metrics to Monitor

1. **Invocations**: Track skill usage
2. **Errors**: Monitor ERROR level logs
3. **Duration**: Ensure responses are fast (<3s)
4. **Throttles**: Check if hitting Lambda limits

### Setting Up Alarms

```bash
# Example: Alert on high error rate
aws cloudwatch put-metric-alarm \
  --alarm-name baby-tracker-high-errors \
  --alarm-description "Alert when error rate is high" \
  --metric-name Errors \
  --namespace AWS/Lambda \
  --statistic Sum \
  --period 300 \
  --threshold 5 \
  --comparison-operator GreaterThanThreshold \
  --dimensions Name=FunctionName,Value=your-function-name \
  --evaluation-periods 1
```

## Troubleshooting

### Common Issues

**1. "Unable to link account"**
- Verify OAuth redirect URLs match exactly
- Check Google OAuth consent screen is published
- Verify scopes include both spreadsheets and drive.metadata.readonly

**2. "Error creating spreadsheet"**
- Check CloudWatch logs for specific error
- Verify OAuth token has correct permissions
- Ensure LOG_LEVEL=DEBUG temporarily for detailed logs

**3. "Writing to trashed spreadsheet"**
- User should unlink and relink account
- Manually delete old DynamoDB entry:
  ```bash
  aws dynamodb delete-item \
    --table-name BabyTrackerUsers \
    --key '{"userId": {"S": "alexa-user-id"}}'
  ```

**4. High latency (>3s responses)**
- Check CloudWatch Duration metrics
- Consider increasing Lambda memory allocation
- Verify network connectivity to Google APIs

## Rollback Procedure

If you need to rollback to a previous version:

```bash
# List previous versions
aws lambda list-versions-by-function --function-name your-function-name

# Rollback to specific version
aws lambda update-alias \
  --function-name your-function-name \
  --name PROD \
  --function-version <previous-version-number>
```

## Performance Optimization

1. **Lambda Configuration:**
   - Memory: 256 MB (sufficient for most operations)
   - Timeout: 10 seconds (Google API calls can take time)

2. **Cold Start Reduction:**
   - Keep lambda "warm" with CloudWatch Events (optional)
   - Minimize package size (only production dependencies)

3. **DynamoDB:**
   - Use On-Demand billing for unpredictable traffic
   - Or provision 5 RCU/WCU for consistent low traffic

## Cost Estimation

For a skill with 1000 users making 10 requests/day each:

- **Lambda**: ~$0.20/month (10,000 requests, 256MB, 2s avg duration)
- **DynamoDB**: ~$1.25/month (on-demand pricing, 1000 items, 300KB storage)
- **CloudWatch Logs**: ~$0.50/month (50MB logs at ERROR level)
- **Total**: ~$2/month

## Certification Checklist

Before submitting skill for Alexa certification:

- [ ] Privacy Policy URL is valid and accessible
- [ ] Terms of Use URL is valid and accessible
- [ ] Skill description mentions account linking requirement
- [ ] Testing instructions include OAuth setup steps
- [ ] All utterances tested and working
- [ ] Error messages are user-friendly
- [ ] Skill complies with Alexa Voice Design guidelines
- [ ] No debug logging in production
- [ ] Legal compliance (COPPA if applicable)

## Support

- Check CloudWatch Logs for errors
- Review [TROUBLESHOOTING_OAUTH.md](TROUBLESHOOTING_OAUTH.md) for OAuth issues
- See [ACCOUNT_LINKING_SETUP.md](ACCOUNT_LINKING_SETUP.md) for setup details

## Version Control

Always tag releases:

```bash
git tag -a v1.0.0 -m "Production release 1.0.0"
git push origin v1.0.0
```

Document changes in a CHANGELOG.md file.
