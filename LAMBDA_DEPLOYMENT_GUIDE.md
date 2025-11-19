# Lambda Function Deployment Guide

## ⚠️ CRITICAL: WeasyPrint System Dependencies Issue

The Lambda function uses **WeasyPrint** for PDF generation, which requires system-level libraries (libgobject, Pango, Cairo, etc.) that are **NOT available** in the standard AWS Lambda Python runtime.

**Error you'll see:**
```
OSError: cannot load library 'libgobject-2.0-0': libgobject-2.0-0: cannot open shared object file: No such file or directory
```

## ✅ Recommended Solution: Docker Container Deployment

AWS Lambda supports Docker containers, which allows us to include all required system libraries. This is the **most reliable** approach for WeasyPrint.

---

## 🐳 Option 1: Docker Container Deployment (RECOMMENDED)

### Prerequisites

1. **Docker** installed on your machine ([Install Docker](https://docs.docker.com/get-docker/))
2. **AWS CLI** installed and configured ([Install AWS CLI](https://aws.amazon.com/cli/))
3. **AWS Account** with permissions to:
   - Create/manage ECR repositories
   - Update Lambda functions
   - DynamoDB and S3 access

### Step 1: Verify Required Files

Ensure you have these files in your project:
- ✅ `Dockerfile`
- ✅ `deploy-lambda-docker.sh`
- ✅ `.dockerignore`
- ✅ `lambda_function.py`
- ✅ `invoice_template.py`
- ✅ `packing_slip_template.py`
- ✅ `requirements.txt`

### Step 2: Configure AWS Credentials

```bash
# Configure AWS CLI if not already done
aws configure

# Verify your credentials
aws sts get-caller-identity
```

### Step 3: Deploy Using the Automated Script

```bash
# Make the script executable (if not already)
chmod +x deploy-lambda-docker.sh

# Run the deployment script
./deploy-lambda-docker.sh
```

The script will:
1. ✅ Create an ECR repository (if needed)
2. ✅ Build the Docker image with all WeasyPrint dependencies
3. ✅ Push the image to Amazon ECR
4. ✅ Update your Lambda function with the new image

### Step 4: Verify Lambda Configuration

After deployment, verify in AWS Console:

1. **Go to Lambda Console** → Your function
2. **Check Configuration**:
   - **Memory**: 1024 MB (minimum 512 MB)
   - **Timeout**: 60 seconds (minimum 30 seconds)
   - **Package type**: Image
   - **Architecture**: x86_64

3. **Verify IAM Permissions**:
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

### Step 5: Test the Deployment

Test using the Lambda console:

1. **Create a test event**:
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

2. **Expected response**:
   ```json
   {
     "statusCode": 200,
     "body": "{\"status\": \"healthy\", \"message\": \"M&J Toys API is running\"}"
   }
   ```

### Manual Deployment Steps (if script fails)

If the automated script doesn't work, follow these manual steps:

#### 1. Create ECR Repository
```bash
aws ecr create-repository \
  --repository-name mjtoys-lambda \
  --region us-east-1 \
  --image-scanning-configuration scanOnPush=true
```

#### 2. Login to ECR
```bash
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <YOUR_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com
```

#### 3. Build Docker Image
```bash
docker build --platform linux/amd64 -t mjtoys-lambda:latest .
```

#### 4. Tag Image
```bash
docker tag mjtoys-lambda:latest <YOUR_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/mjtoys-lambda:latest
```

#### 5. Push to ECR
```bash
docker push <YOUR_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/mjtoys-lambda:latest
```

#### 6. Update Lambda Function
```bash
aws lambda update-function-code \
  --function-name mjtoys-invoice-generator \
  --image-uri <YOUR_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/mjtoys-lambda:latest \
  --region us-east-1
```

---

## 📦 Option 2: Lambda Layer with Pre-built WeasyPrint (Alternative)

If you prefer not to use Docker, you can use a pre-built Lambda layer with WeasyPrint dependencies.

### Using a Community Layer

There are community-maintained layers with WeasyPrint and dependencies:

1. Search for "weasyprint lambda layer" in the [AWS Serverless Application Repository](https://serverlessrepo.aws.amazon.com/)
2. Or use this ARN (verify it's up to date):
   ```
   arn:aws:lambda:us-east-1:764866452798:layer:chrome-aws-lambda:31
   ```

**Note**: This option is less reliable and may have compatibility issues. Docker deployment is strongly recommended.

---

## 🔧 Troubleshooting

### Error: "cannot load library 'libgobject-2.0-0'"

**Cause**: System libraries not available in Lambda environment

**Solution**: Use Docker container deployment (Option 1)

### Error: "Task timed out after 3.00 seconds"

**Cause**: Lambda timeout too short

**Solution**: Increase timeout to 60 seconds:
```bash
aws lambda update-function-configuration \
  --function-name mjtoys-invoice-generator \
  --timeout 60 \
  --region us-east-1
```

### Error: "Memory allocation failed"

**Cause**: Insufficient memory

**Solution**: Increase memory to 1024 MB:
```bash
aws lambda update-function-configuration \
  --function-name mjtoys-invoice-generator \
  --memory-size 1024 \
  --region us-east-1
```

### Error: "502 Bad Gateway"

**Causes**:
1. Lambda function is crashing during initialization
2. Missing dependencies
3. Timeout or memory issues

**Solutions**:
1. Check CloudWatch Logs for specific errors
2. Ensure Docker deployment includes all dependencies
3. Verify timeout and memory settings
4. Test with a simple health check first

### Docker Build Fails

**Common issues**:

1. **Platform mismatch**: Use `--platform linux/amd64` flag
   ```bash
   docker build --platform linux/amd64 -t mjtoys-lambda:latest .
   ```

2. **Permission errors**: Ensure Docker daemon is running
   ```bash
   sudo systemctl start docker  # Linux
   # Or restart Docker Desktop on Mac/Windows
   ```

3. **Network issues**: Check internet connection and Docker Hub access

### ECR Push Fails

**Solutions**:

1. **Verify AWS credentials**:
   ```bash
   aws sts get-caller-identity
   ```

2. **Re-login to ECR**:
   ```bash
   aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com
   ```

3. **Check ECR permissions**: Ensure your IAM user/role has ECR permissions

---

## 📊 Performance Optimization

### Memory vs Cost
| Memory | Cold Start | Warm Start | Cost/Request |
|--------|-----------|-----------|--------------|
| 512 MB | ~3-4s | ~500ms | Lower |
| 1024 MB | ~2-3s | ~300ms | Medium |
| 2048 MB | ~1-2s | ~200ms | Higher |

**Recommendation**: Start with 1024 MB and adjust based on usage patterns.

### Reducing Cold Starts

1. **Enable Provisioned Concurrency** (for production):
   ```bash
   aws lambda put-provisioned-concurrency-config \
     --function-name mjtoys-invoice-generator \
     --provisioned-concurrent-executions 1
   ```

2. **Use Smaller Images**: Minimize Docker image size by:
   - Only including necessary dependencies
   - Using `.dockerignore` properly
   - Multi-stage builds (advanced)

---

## 🔄 Updating the Lambda Function

When you make code changes:

### Quick Update (code changes only)
```bash
# Run the deployment script again
./deploy-lambda-docker.sh
```

### Manual Update
```bash
# Rebuild and push
docker build --platform linux/amd64 -t mjtoys-lambda:latest .
docker tag mjtoys-lambda:latest <ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/mjtoys-lambda:latest
docker push <ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/mjtoys-lambda:latest

# Update Lambda
aws lambda update-function-code \
  --function-name mjtoys-invoice-generator \
  --image-uri <ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/mjtoys-lambda:latest
```

---

## 📝 Quick Reference

### Required Lambda Configuration
| Setting | Value |
|---------|-------|
| Runtime | Container Image (Python 3.11) |
| Memory | 1024 MB (minimum 512 MB) |
| Timeout | 60 seconds (minimum 30) |
| Package Type | Image |
| Architecture | x86_64 |

### Required AWS Permissions
- **ECR**: Full access to push/pull images
- **Lambda**: Update function code and configuration
- **DynamoDB**: Read/write to `MJToys_*` tables
- **S3**: Read/write to `prompt-images-nerd` bucket
- **CloudWatch Logs**: Write logs (automatic)

### Useful Commands

```bash
# Check Lambda function status
aws lambda get-function --function-name mjtoys-invoice-generator

# View recent logs
aws logs tail /aws/lambda/mjtoys-invoice-generator --follow

# Test health endpoint
curl https://iuymyhaagv6rta66lg24ghep2i0cchks.lambda-url.us-east-1.on.aws/health

# List ECR images
aws ecr describe-images --repository-name mjtoys-lambda

# Remove old ECR images
aws ecr batch-delete-image \
  --repository-name mjtoys-lambda \
  --image-ids imageTag=old-tag
```

---

## ✅ Deployment Checklist

Before going to production:

- [ ] Docker image builds successfully
- [ ] Image pushed to ECR
- [ ] Lambda function updated with new image
- [ ] Memory set to 1024 MB
- [ ] Timeout set to 60 seconds
- [ ] IAM permissions configured
- [ ] Function URL enabled (if using)
- [ ] Health endpoint returns 200 OK
- [ ] DynamoDB tables created
- [ ] S3 bucket accessible
- [ ] Test with sample Excel file
- [ ] PDF generation works
- [ ] CloudWatch logs readable
- [ ] CORS configured (if needed)

---

## 🆘 Still Having Issues?

1. **Check CloudWatch Logs**:
   - Go to CloudWatch → Log groups
   - Find `/aws/lambda/mjtoys-invoice-generator`
   - Look for error messages

2. **Verify Docker Image**:
   ```bash
   # Run locally to test
   docker run -p 9000:8080 mjtoys-lambda:latest

   # Test locally
   curl -XPOST "http://localhost:9000/2015-03-31/functions/function/invocations" -d '{"rawPath": "/health"}'
   ```

3. **Check AWS Resources**:
   - Verify DynamoDB tables exist
   - Confirm S3 bucket is accessible
   - Check IAM role permissions

4. **Enable Debug Logging**:
   Add to `lambda_function.py`:
   ```python
   import logging
   logging.basicConfig(level=logging.DEBUG)
   ```

---

## 📚 Additional Resources

- [AWS Lambda Container Images](https://docs.aws.amazon.com/lambda/latest/dg/images-create.html)
- [WeasyPrint Documentation](https://doc.courtbouillon.org/weasyprint/)
- [AWS ECR Documentation](https://docs.aws.amazon.com/ecr/)
- [Lambda Performance Best Practices](https://docs.aws.amazon.com/lambda/latest/dg/best-practices.html)
