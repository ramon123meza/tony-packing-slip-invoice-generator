# Quick Fix for 502 Bad Gateway Error

## Problem
When uploading Excel file, you get:
```
POST .../parse-excel 502 (Bad Gateway)
Error parsing Excel: AxiosError {...}
Failed to parse Excel file. Please check the file format.
```

## Root Cause
Lambda function is **missing the openpyxl dependency**, which pandas needs to read Excel (.xlsx) files. When pandas tries to read_excel() without openpyxl, it crashes, causing the 502 error.

## Solution

### Option 1: Quick Deploy with Layer (Recommended)

1. **Create Lambda Layer locally**:
   ```bash
   mkdir -p lambda-layer/python
   cd lambda-layer
   pip install boto3 pandas openpyxl jinja2 weasyprint Pillow -t python/
   zip -r lambda-layer.zip python/
   ```

2. **Upload to AWS Lambda Layers**:
   - AWS Console → Lambda → Layers → Create Layer
   - Name: `mjtoys-dependencies`
   - Upload: `lambda-layer.zip`
   - Compatible runtimes: Python 3.9, 3.10, 3.11

3. **Attach to your Lambda function**:
   - Go to your Lambda function
   - Layers section → Add a layer
   - Choose Custom layers → `mjtoys-dependencies`

4. **Update Lambda configuration**:
   - Memory: **1024 MB**
   - Timeout: **60 seconds**

5. **Test**:
   ```bash
   curl https://iuymyhaagv6rta66lg24ghep2i0cchks.lambda-url.us-east-1.on.aws/health
   ```

### Option 2: Deploy Everything Together

1. **Create deployment package**:
   ```bash
   mkdir lambda-deploy
   cd lambda-deploy
   cp ../lambda_function.py .
   cp ../invoice_template.py .
   cp ../packing_slip_template.py .
   pip install boto3 pandas openpyxl jinja2 weasyprint Pillow -t .
   zip -r lambda-deploy.zip .
   ```

2. **Upload to Lambda**:
   - AWS Console → Your Lambda function
   - Upload from → .zip file
   - Select `lambda-deploy.zip`

3. **Update configuration**:
   - Memory: **1024 MB**
   - Timeout: **60 seconds**

## Verify Fix

After deploying:

1. **Test health endpoint**:
   ```bash
   curl https://iuymyhaagv6rta66lg24ghep2i0cchks.lambda-url.us-east-1.on.aws/health
   ```

   Should return:
   ```json
   {"status":"healthy","message":"M&J Toys API is running"}
   ```

2. **Upload Excel file** through the web interface

3. **If still failing**, check CloudWatch logs:
   - AWS Console → CloudWatch → Log groups
   - Find `/aws/lambda/your-function-name`
   - Look for specific error messages

## Required Lambda Configuration

| Setting | Value |
|---------|-------|
| Runtime | Python 3.9+ |
| Memory | 1024 MB |
| Timeout | 60 seconds |
| Dependencies | boto3, pandas, **openpyxl**, jinja2, weasyprint, Pillow |

## Common Errors in CloudWatch

| Error Message | Solution |
|---------------|----------|
| `ModuleNotFoundError: No module named 'openpyxl'` | Install openpyxl in Lambda layer/package |
| `Task timed out after 3.00 seconds` | Increase timeout to 60 seconds |
| `Runtime exited with error: signal: killed` | Increase memory to 1024 MB |

## Need More Help?

See [LAMBDA_DEPLOYMENT_GUIDE.md](LAMBDA_DEPLOYMENT_GUIDE.md) for comprehensive deployment instructions.
