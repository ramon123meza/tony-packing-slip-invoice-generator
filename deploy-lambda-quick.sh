#!/bin/bash

# M&J Toys - Quick Lambda Deployment Script
# This script packages and deploys the Lambda function directly

set -e  # Exit on any error

echo "🚀 M&J Toys Lambda Quick Deployment"
echo "===================================="

# Configuration
AWS_REGION="us-east-1"
FUNCTION_NAME="MJToys-InvoiceGenerator"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI is not installed. Please install it first.${NC}"
    exit 1
fi

echo ""
echo "📦 Step 1: Cleaning up old deployment package..."
rm -rf package lambda-deployment.zip
mkdir -p package

echo ""
echo "📥 Step 2: Installing Python dependencies..."
pip install -r requirements.txt -t package/ --quiet

echo ""
echo "📋 Step 3: Copying Lambda function..."
cp lambda_function.py package/
cp invoice_template.py package/
cp packing_slip_template.py package/

echo ""
echo "📦 Step 4: Creating deployment package..."
cd package
zip -r ../lambda-deployment.zip . -q
cd ..

echo ""
echo "⬆️  Step 5: Uploading to Lambda..."
aws lambda update-function-code \
    --function-name ${FUNCTION_NAME} \
    --zip-file fileb://lambda-deployment.zip \
    --region ${AWS_REGION}

echo ""
echo "⏳ Waiting for Lambda update to complete..."
aws lambda wait function-updated \
    --function-name ${FUNCTION_NAME} \
    --region ${AWS_REGION}

echo ""
echo -e "${GREEN}✅ Lambda function updated successfully!${NC}"

# Cleanup
echo ""
echo "🧹 Cleaning up..."
rm -rf package lambda-deployment.zip

echo ""
echo -e "${GREEN}✨ Deployment complete!${NC}"
echo ""
echo "📝 Next steps:"
echo "  1. Test your Lambda function at: https://iuymyhaagv6rta66lg24ghep2i0cchks.lambda-url.us-east-1.on.aws/health"
echo "  2. Check CloudWatch logs for any errors"
echo "  3. Test the frontend application"
echo ""
