#!/bin/bash

# Setup S3 CORS for the prompt-images-nerd bucket

BUCKET_NAME="prompt-images-nerd"

echo "Setting up CORS for S3 bucket: $BUCKET_NAME"

# Create CORS configuration
cat > /tmp/cors-config.json <<'EOF'
{
  "CORSRules": [
    {
      "AllowedOrigins": ["*"],
      "AllowedMethods": ["GET", "HEAD"],
      "AllowedHeaders": ["*"],
      "MaxAgeSeconds": 3600,
      "ExposeHeaders": ["ETag"]
    }
  ]
}
EOF

# Apply CORS configuration
aws s3api put-bucket-cors \
  --bucket "$BUCKET_NAME" \
  --cors-configuration file:///tmp/cors-config.json

if [ $? -eq 0 ]; then
  echo "✓ CORS configuration applied successfully"

  # Verify the configuration
  echo ""
  echo "Current CORS configuration:"
  aws s3api get-bucket-cors --bucket "$BUCKET_NAME"
else
  echo "✗ Failed to apply CORS configuration"
  echo "Make sure you have the necessary AWS permissions"
  exit 1
fi

# Clean up
rm /tmp/cors-config.json

echo ""
echo "Done! The S3 bucket now allows cross-origin requests from any origin."
