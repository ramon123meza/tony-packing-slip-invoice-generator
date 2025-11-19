# Lambda Function Deployment Guide

## Problem: 502 Bad Gateway Error

The 502 error occurs because the Lambda function is missing required dependencies, specifically **openpyxl** which is needed by pandas to read Excel (.xlsx) files.

## Solution: Deploy Lambda Function with All Dependencies

### Option 1: Using AWS Lambda Layers (Recommended)

#### Step 1: Create a Lambda Layer with Dependencies

1. **On your local machine or EC2 instance**, create a directory:
   ```bash
   mkdir -p lambda-layer/python
   cd lambda-layer
   ```

2. **Install dependencies**:
   ```bash
   pip install -r ../requirements.txt -t python/
   ```

3. **Create a ZIP file**:
   ```bash
   zip -r lambda-layer.zip python/
   ```

4. **Upload to AWS Lambda Layer**:
   - Go to AWS Lambda Console → Layers → Create Layer
   - Name: `mjtoys-dependencies`
   - Upload: `lambda-layer.zip`
   - Compatible runtimes: Python 3.9, Python 3.10, Python 3.11

5. **Attach layer to your Lambda function**:
   - Go to your Lambda function
   - Scroll to "Layers" section
   - Click "Add a layer"
   - Choose "Custom layers"
   - Select `mjtoys-dependencies`

#### Step 2: Update Lambda Configuration

1. **Update timeout**: Set to **60 seconds** (30 minimum)
2. **Update memory**: Set to **1024 MB** (512 MB minimum)
3. **Verify IAM permissions**:
   - DynamoDB: `dynamodb:PutItem`, `dynamodb:GetItem`, `dynamodb:Scan`, `dynamodb:Query`
   - S3: `s3:PutObject`, `s3:GetObject`, `s3:PutObjectAcl`

#### Step 3: Deploy Lambda Code

1. **Create deployment package**:
   ```bash
   zip -r lambda-deployment.zip lambda_function.py invoice_template.py packing_slip_template.py
   ```

2. **Upload to Lambda**:
   - Go to your Lambda function
   - Click "Upload from" → ".zip file"
   - Select `lambda-deployment.zip`

### Option 2: Deploy Everything as One Package

If you prefer to deploy everything together without layers:

1. **Create deployment directory**:
   ```bash
   mkdir lambda-deploy
   cd lambda-deploy
   ```

2. **Copy Lambda files**:
   ```bash
   cp ../lambda_function.py .
   cp ../invoice_template.py .
   cp ../packing_slip_template.py .
   ```

3. **Install dependencies in the same directory**:
   ```bash
   pip install -r ../requirements.txt -t .
   ```

4. **Create ZIP**:
   ```bash
   zip -r lambda-deploy.zip .
   ```

5. **Upload to Lambda**:
   - AWS Lambda Console → Your function
   - Upload from → .zip file
   - Select `lambda-deploy.zip`

6. **Update Configuration**:
   - Timeout: **60 seconds**
   - Memory: **1024 MB**

### Option 3: Using AWS SAM or Serverless Framework

Create `template.yaml`:

```yaml
AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31

Resources:
  MJToysFunction:
    Type: AWS::Serverless::Function
    Properties:
      FunctionName: mjtoys-invoice-generator
      Runtime: python3.11
      Handler: lambda_function.lambda_handler
      Timeout: 60
      MemorySize: 1024
      FunctionUrlConfig:
        AuthType: NONE
        Cors:
          AllowOrigins:
            - "*"
          AllowMethods:
            - GET
            - POST
            - OPTIONS
          AllowHeaders:
            - "*"
      Policies:
        - DynamoDBCrudPolicy:
            TableName: MJToys_*
        - S3CrudPolicy:
            BucketName: prompt-images-nerd
```

Then deploy:
```bash
sam build
sam deploy --guided
```

## Verification Steps

After deploying, test the Lambda function:

### 1. Test Parse Excel Endpoint

Create a test event in Lambda console:

```json
{
  "requestContext": {
    "http": {
      "method": "POST"
    }
  },
  "rawPath": "/parse-excel",
  "body": "{\"file_content\": \"UEsDBBQABgAI...\"}"
}
```

### 2. Test Health Endpoint

```json
{
  "requestContext": {
    "http": {
      "method": "GET"
    }
  },
  "rawPath": "/health"
}
```

Expected response:
```json
{
  "statusCode": 200,
  "body": "{\"status\": \"healthy\", \"message\": \"M&J Toys API is running\"}"
}
```

### 3. Check CloudWatch Logs

1. Go to AWS CloudWatch → Log groups
2. Find `/aws/lambda/your-function-name`
3. Look for error messages related to:
   - `ModuleNotFoundError: No module named 'openpyxl'`
   - `Task timed out`
   - Memory errors

## Common Issues and Solutions

### Issue 1: "ModuleNotFoundError: No module named 'openpyxl'"
**Solution**: Ensure openpyxl is included in your Lambda layer or deployment package

### Issue 2: "Task timed out after 3.00 seconds"
**Solution**: Increase Lambda timeout to at least 30 seconds (recommended 60)

### Issue 3: "Cannot parse Excel file"
**Solution**:
- Verify Excel file has required columns (Order_number, etc.)
- Check that pandas and openpyxl are properly installed
- Ensure base64 encoding is correct

### Issue 4: Lambda returns 502 Bad Gateway
**Solution**:
- Check CloudWatch logs for actual error
- Verify all dependencies are installed
- Ensure Lambda has enough memory (1024 MB recommended)
- Check Lambda timeout is sufficient

## Quick Troubleshooting

Run this test to verify your Lambda function:

```bash
# Test health endpoint
curl https://iuymyhaagv6rta66lg24ghep2i0cchks.lambda-url.us-east-1.on.aws/health

# Should return:
# {"status":"healthy","message":"M&J Toys API is running"}
```

If health check fails, your Lambda function has a configuration issue.

## Required Lambda Configuration Summary

| Setting | Value |
|---------|-------|
| Runtime | Python 3.9 or higher |
| Memory | 1024 MB (minimum 512 MB) |
| Timeout | 60 seconds (minimum 30) |
| Handler | `lambda_function.lambda_handler` |

## Required Permissions

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:PutItem",
        "dynamodb:GetItem",
        "dynamodb:Scan",
        "dynamodb:Query",
        "dynamodb:UpdateItem"
      ],
      "Resource": "arn:aws:dynamodb:us-east-1:*:table/MJToys_*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:PutObjectAcl"
      ],
      "Resource": "arn:aws:s3:::prompt-images-nerd/*"
    }
  ]
}
```

## Still Having Issues?

1. Check CloudWatch Logs for specific error messages
2. Verify all three files are deployed: `lambda_function.py`, `invoice_template.py`, `packing_slip_template.py`
3. Test with a small Excel file first
4. Ensure Excel file format matches the required columns
