#!/usr/bin/env python3
"""
Test script to verify Lambda function is working correctly
Run this to diagnose 502 errors
"""

import requests
import base64
import json

LAMBDA_URL = 'https://iuymyhaagv6rta66lg24ghep2i0cchks.lambda-url.us-east-1.on.aws'

def test_health():
    """Test the health endpoint"""
    print("Testing /health endpoint...")
    try:
        response = requests.get(f"{LAMBDA_URL}/health", timeout=10)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code == 200
    except requests.exceptions.RequestException as e:
        print(f"Error: {e}")
        return False

def test_parse_excel_with_sample():
    """Test parse-excel with a minimal sample"""
    print("\nTesting /parse-excel endpoint with sample data...")

    # Create a minimal Excel file in memory for testing
    # This is just a test - you'll need a real Excel file
    sample_base64 = "UEsDBBQACAgIAAAAIQAAAAAAAAAAAAAAAA"  # Placeholder

    payload = {
        "file_content": sample_base64
    }

    try:
        response = requests.post(
            f"{LAMBDA_URL}/parse-excel",
            json=payload,
            timeout=30
        )
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            print("Success! Excel parsing is working")
            return True
        else:
            print(f"Error Response: {response.text}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"Error: {e}")
        return False

def diagnose():
    """Run diagnostic tests"""
    print("=" * 60)
    print("Lambda Function Diagnostic Test")
    print("=" * 60)

    # Test 1: Health Check
    health_ok = test_health()

    if not health_ok:
        print("\n❌ FAILED: Lambda function is not responding")
        print("Possible causes:")
        print("  1. Lambda function URL is incorrect")
        print("  2. Lambda function is not deployed")
        print("  3. Lambda function has a configuration error")
        print("  4. Network/firewall issue")
        return

    print("\n✅ PASSED: Lambda function is responding")

    # Test 2: Parse Excel (requires real file)
    print("\nTo test Excel parsing:")
    print("  1. Make sure you have deployed the Lambda with all dependencies")
    print("  2. Upload a real Excel file through the web interface")
    print("  3. Check CloudWatch logs if you get 502 errors")

    print("\n" + "=" * 60)
    print("Next Steps:")
    print("=" * 60)
    print("1. If health check passed but Excel parsing fails:")
    print("   → Check Lambda CloudWatch logs for specific errors")
    print("   → Verify openpyxl is installed in Lambda")
    print("   → Check Lambda timeout is at least 30 seconds")
    print("   → Verify Lambda memory is at least 512 MB")
    print("")
    print("2. To view Lambda logs:")
    print("   → AWS Console → CloudWatch → Log groups")
    print("   → Find your Lambda function log group")
    print("   → Look for recent errors")
    print("")
    print("3. See LAMBDA_DEPLOYMENT_GUIDE.md for full deployment instructions")

if __name__ == "__main__":
    diagnose()
