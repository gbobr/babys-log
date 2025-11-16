#!/bin/bash

# Baby Milk Tracker - Deployment Script
# Creates a properly structured Lambda deployment package

echo "📦 Creating Lambda deployment package..."

# Clean up old package
rm -f function.zip

# Create zip with proper structure
cd "$(dirname "$0")"
zip -r function.zip . \
  -x "*.git*" \
  -x "node_modules/@types/*" \
  -x "test-local.js" \
  -x ".env*" \
  -x "deploy.sh" \
  -x "*.zip"

echo "✅ Package created: function.zip"
echo ""
echo "📋 Next steps:"
echo "1. Upload function.zip to AWS Lambda"
echo "2. Set Handler to: src/index.handler"
echo "3. Configure environment variables:"
echo "   - GOOGLE_CREDENTIALS"
echo "   - SPREADSHEET_ID"
echo ""
