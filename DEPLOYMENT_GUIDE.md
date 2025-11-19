# Lambda Deployment Guide

## Critical Issues Fixed

### 1. CORS Configuration ✅
- **Problem**: Lambda was not returning proper CORS headers, causing frontend requests to fail
- **Solution**: Added complete CORS headers to all responses:
  - `Access-Control-Allow-Origin: *`
  - `Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS`
  - `Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With`
  - `Access-Control-Max-Age: 86400`

### 2. OPTIONS Handler ✅
- **Problem**: Browser preflight requests (OPTIONS) were not handled
- **Solution**: Added OPTIONS method handler in `lambda_handler()` to respond to preflight requests

### 3. S3 Logo Upload ✅
- **Problem**: S3 upload failing with 500 error due to ACL restrictions
- **Solution**:
  - Removed hard-coded `ACL='public-read'` requirement
  - Added fallback mechanism to try with and without ACL
  - Added unique timestamp-based filenames to avoid caching issues
  - Improved error logging

### 4. Document Preview Flow ✅
- **Problem**: Preview not showing on first document generation
- **Solution**: Settings API calls now work properly with CORS fixes

## Quick Deployment (Recommended)

### Option 1: Using the Quick Deploy Script

```bash
# Make the script executable (if not already)
chmod +x deploy-lambda-quick.sh

# Run deployment
./deploy-lambda-quick.sh
```

This script will:
1. Install Python dependencies
2. Package Lambda function
3. Upload to AWS Lambda
4. Wait for deployment to complete

### Option 2: Manual Deployment

If you prefer manual deployment or the script fails:

```bash
# 1. Clean up old packages
rm -rf package lambda-deployment.zip
mkdir -p package

# 2. Install dependencies
pip install -r requirements.txt -t package/

# 3. Copy Lambda files
cp lambda_function.py package/
cp invoice_template.py package/
cp packing_slip_template.py package/

# 4. Create deployment package
cd package
zip -r ../lambda-deployment.zip . -q
cd ..

# 5. Upload to Lambda
aws lambda update-function-code \
    --function-name MJToys-InvoiceGenerator \
    --zip-file fileb://lambda-deployment.zip \
    --region us-east-1

# 6. Cleanup
rm -rf package lambda-deployment.zip
```

## Testing After Deployment

### 1. Test Health Endpoint

```bash
curl https://iuymyhaagv6rta66lg24ghep2i0cchks.lambda-url.us-east-1.on.aws/health
```

Expected response:
```json
{
  "status": "healthy",
  "message": "M&J Toys API is running (client-side PDF generation)",
  "version": "2.0"
}
```

### 2. Test Settings Endpoint

```bash
curl https://iuymyhaagv6rta66lg24ghep2i0cchks.lambda-url.us-east-1.on.aws/get-settings
```

### 3. Test from Browser Console

Open your frontend application and run:

```javascript
// Test settings API
fetch('https://iuymyhaagv6rta66lg24ghep2i0cchks.lambda-url.us-east-1.on.aws/get-settings')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error)
```

## Verifying CORS Configuration

### Check Lambda Function URL CORS (AWS Console)

1. Go to AWS Lambda Console
2. Select function: `MJToys-InvoiceGenerator`
3. Go to "Configuration" → "Function URL"
4. Check CORS settings:
   - **Allow origin**: `*` (or your specific domain)
   - **Allow methods**: `GET, POST, PUT, DELETE, OPTIONS`
   - **Allow headers**: `Content-Type, Authorization, X-Requested-With`
   - **Max age**: `86400`

If CORS is not configured at the Function URL level, you can add it via AWS CLI:

```bash
aws lambda update-function-url-config \
  --function-name MJToys-InvoiceGenerator \
  --cors '{
    "AllowOrigins": ["*"],
    "AllowMethods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    "AllowHeaders": ["Content-Type", "Authorization", "X-Requested-With"],
    "MaxAge": 86400
  }' \
  --region us-east-1
```

## Checking S3 Bucket Configuration

### Verify Bucket Policy

The S3 bucket `prompt-images-nerd` needs to allow public read access for logo images:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::prompt-images-nerd/logos/*"
    }
  ]
}
```

### Verify CORS Configuration

The S3 bucket needs CORS configured for browser access:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

To set S3 CORS via AWS CLI:

```bash
# Save the above CORS config to cors-config.json
aws s3api put-bucket-cors \
  --bucket prompt-images-nerd \
  --cors-configuration file://cors-config.json
```

## Troubleshooting

### Issue: Still getting CORS errors

**Solution**:
1. Check CloudWatch logs for the Lambda function
2. Verify Function URL CORS configuration (see above)
3. Clear browser cache and retry
4. Check browser console for specific CORS error message

### Issue: Logo upload still failing

**Solution**:
1. Check S3 bucket permissions
2. Verify Lambda has `s3:PutObject` permission
3. Check CloudWatch logs for detailed S3 error
4. Verify bucket policy allows public read (see above)

### Issue: Documents not saving to history

**Solution**:
1. Check DynamoDB table permissions
2. Verify Lambda has permissions: `dynamodb:PutItem`, `dynamodb:GetItem`, `dynamodb:Scan`
3. Check CloudWatch logs for DynamoDB errors

## CloudWatch Logs

To check Lambda logs:

```bash
aws logs tail /aws/lambda/MJToys-InvoiceGenerator --follow
```

Or go to AWS Console → CloudWatch → Log Groups → `/aws/lambda/MJToys-InvoiceGenerator`

## Architecture Overview

```
Frontend (React)
    ↓
    ├─ API calls via axios
    ↓
Lambda Function URL
    ↓
    ├─ CORS headers added
    ├─ Route handling
    ↓
AWS Services:
    ├─ S3 (logo storage)
    ├─ DynamoDB (settings & history)
    └─ CloudWatch (logs)
```

## Next Steps After Deployment

1. ✅ Test health endpoint
2. ✅ Test settings retrieval
3. ✅ Upload a logo to test S3 integration
4. ✅ Generate a document to test the complete flow
5. ✅ Check document history
6. ✅ Verify all CORS issues are resolved

## Contact

If you encounter any issues after deployment:
1. Check CloudWatch logs first
2. Verify all AWS permissions
3. Test each endpoint individually
4. Check browser console for detailed error messages
