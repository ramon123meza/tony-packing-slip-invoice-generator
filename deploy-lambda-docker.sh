#!/bin/bash

# M&J Toys - Lambda Docker Deployment Script
# This script builds and deploys the Lambda function as a Docker container

set -e  # Exit on any error

echo "🚀 M&J Toys Lambda Docker Deployment"
echo "===================================="

# Configuration - UPDATE THESE VALUES
AWS_REGION="us-east-1"
AWS_ACCOUNT_ID=""  # Will be auto-detected if not set
FUNCTION_NAME="mjtoys-invoice-generator"
ECR_REPO_NAME="mjtoys-lambda"

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

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed. Please install it first.${NC}"
    exit 1
fi

# Get AWS Account ID if not set
if [ -z "$AWS_ACCOUNT_ID" ]; then
    echo "📡 Detecting AWS Account ID..."
    AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
    if [ -z "$AWS_ACCOUNT_ID" ]; then
        echo -e "${RED}❌ Failed to detect AWS Account ID. Please set it manually in the script.${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ AWS Account ID: $AWS_ACCOUNT_ID${NC}"
fi

ECR_URI="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPO_NAME}"

# Step 1: Create ECR repository if it doesn't exist
echo ""
echo "📦 Step 1: Creating ECR repository (if needed)..."
if aws ecr describe-repositories --repository-names ${ECR_REPO_NAME} --region ${AWS_REGION} > /dev/null 2>&1; then
    echo -e "${GREEN}✅ ECR repository already exists${NC}"
else
    echo "Creating ECR repository..."
    aws ecr create-repository \
        --repository-name ${ECR_REPO_NAME} \
        --region ${AWS_REGION} \
        --image-scanning-configuration scanOnPush=true
    echo -e "${GREEN}✅ ECR repository created${NC}"
fi

# Step 2: Login to ECR
echo ""
echo "🔐 Step 2: Logging in to ECR..."
aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com
echo -e "${GREEN}✅ Logged in to ECR${NC}"

# Step 3: Build Docker image
echo ""
echo "🔨 Step 3: Building Docker image..."
docker build --platform linux/amd64 -t ${ECR_REPO_NAME}:latest .
echo -e "${GREEN}✅ Docker image built${NC}"

# Step 4: Tag image
echo ""
echo "🏷️  Step 4: Tagging image..."
docker tag ${ECR_REPO_NAME}:latest ${ECR_URI}:latest
echo -e "${GREEN}✅ Image tagged${NC}"

# Step 5: Push to ECR
echo ""
echo "⬆️  Step 5: Pushing image to ECR..."
docker push ${ECR_URI}:latest
echo -e "${GREEN}✅ Image pushed to ECR${NC}"

# Step 6: Update Lambda function
echo ""
echo "🔄 Step 6: Updating Lambda function..."

# Check if Lambda function exists
if aws lambda get-function --function-name ${FUNCTION_NAME} --region ${AWS_REGION} > /dev/null 2>&1; then
    echo "Updating existing Lambda function..."
    aws lambda update-function-code \
        --function-name ${FUNCTION_NAME} \
        --image-uri ${ECR_URI}:latest \
        --region ${AWS_REGION}

    echo "Waiting for update to complete..."
    aws lambda wait function-updated \
        --function-name ${FUNCTION_NAME} \
        --region ${AWS_REGION}

    # Update configuration
    echo "Updating function configuration..."
    aws lambda update-function-configuration \
        --function-name ${FUNCTION_NAME} \
        --timeout 60 \
        --memory-size 1024 \
        --region ${AWS_REGION}

    echo -e "${GREEN}✅ Lambda function updated${NC}"
else
    echo -e "${YELLOW}⚠️  Lambda function does not exist. Creating new function...${NC}"
    echo ""
    echo "Please create the Lambda function manually with these settings:"
    echo "  - Function name: ${FUNCTION_NAME}"
    echo "  - Container image URI: ${ECR_URI}:latest"
    echo "  - Memory: 1024 MB"
    echo "  - Timeout: 60 seconds"
    echo "  - Architecture: x86_64"
    echo ""
    echo "Or run this command:"
    echo ""
    echo "aws lambda create-function \\"
    echo "  --function-name ${FUNCTION_NAME} \\"
    echo "  --package-type Image \\"
    echo "  --code ImageUri=${ECR_URI}:latest \\"
    echo "  --role arn:aws:iam::${AWS_ACCOUNT_ID}:role/lambda-execution-role \\"
    echo "  --timeout 60 \\"
    echo "  --memory-size 1024 \\"
    echo "  --region ${AWS_REGION}"
    echo ""
    echo "Note: Replace 'lambda-execution-role' with your actual Lambda execution role name"
fi

echo ""
echo -e "${GREEN}✨ Deployment complete!${NC}"
echo ""
echo "📝 Next steps:"
echo "  1. Test your Lambda function in AWS Console"
echo "  2. Check CloudWatch logs for any errors"
echo "  3. Ensure Function URL is enabled if needed"
echo ""
echo "🔗 Lambda function URL: https://iuymyhaagv6rta66lg24ghep2i0cchks.lambda-url.us-east-1.on.aws/"
