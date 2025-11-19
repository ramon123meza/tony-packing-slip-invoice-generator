"""
DynamoDB Setup Script for M&J Toys Invoice & Packing Slip Generator
Run this script to create the required DynamoDB tables
"""

import boto3
from botocore.exceptions import ClientError

# Replace with your AWS credentials
AWS_ACCESS_KEY_ID = 'YOUR_AWS_ACCESS_KEY_ID'
AWS_SECRET_ACCESS_KEY = 'YOUR_AWS_SECRET_ACCESS_KEY'
AWS_REGION = 'us-east-1'

def create_dynamodb_tables():
    """Create DynamoDB tables for the invoice/packing slip system"""

    # Initialize DynamoDB client
    dynamodb = boto3.client(
        'dynamodb',
        aws_access_key_id=AWS_ACCESS_KEY_ID,
        aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
        region_name=AWS_REGION
    )

    tables_to_create = [
        {
            'TableName': 'MJToys_Documents',
            'KeySchema': [
                {'AttributeName': 'document_id', 'KeyType': 'HASH'},  # Partition key
            ],
            'AttributeDefinitions': [
                {'AttributeName': 'document_id', 'AttributeType': 'S'},
                {'AttributeName': 'created_at', 'AttributeType': 'S'},
            ],
            'GlobalSecondaryIndexes': [
                {
                    'IndexName': 'created_at-index',
                    'KeySchema': [
                        {'AttributeName': 'created_at', 'KeyType': 'HASH'},
                    ],
                    'Projection': {'ProjectionType': 'ALL'},
                    'ProvisionedThroughput': {
                        'ReadCapacityUnits': 5,
                        'WriteCapacityUnits': 5
                    }
                }
            ],
            'ProvisionedThroughput': {
                'ReadCapacityUnits': 5,
                'WriteCapacityUnits': 5
            }
        },
        {
            'TableName': 'MJToys_Settings',
            'KeySchema': [
                {'AttributeName': 'setting_key', 'KeyType': 'HASH'},  # Partition key
            ],
            'AttributeDefinitions': [
                {'AttributeName': 'setting_key', 'AttributeType': 'S'},
            ],
            'ProvisionedThroughput': {
                'ReadCapacityUnits': 5,
                'WriteCapacityUnits': 5
            }
        },
        {
            'TableName': 'MJToys_FieldEdits',
            'KeySchema': [
                {'AttributeName': 'document_id', 'KeyType': 'HASH'},  # Partition key
            ],
            'AttributeDefinitions': [
                {'AttributeName': 'document_id', 'AttributeType': 'S'},
            ],
            'ProvisionedThroughput': {
                'ReadCapacityUnits': 5,
                'WriteCapacityUnits': 5
            }
        }
    ]

    for table_config in tables_to_create:
        try:
            print(f"Creating table: {table_config['TableName']}...")
            response = dynamodb.create_table(**table_config)
            print(f"✓ Table {table_config['TableName']} created successfully!")
            print(f"  Status: {response['TableDescription']['TableStatus']}")
        except ClientError as e:
            if e.response['Error']['Code'] == 'ResourceInUseException':
                print(f"! Table {table_config['TableName']} already exists.")
            else:
                print(f"✗ Error creating table {table_config['TableName']}: {e}")

    # Initialize default settings
    print("\nInitializing default settings...")
    dynamodb_resource = boto3.resource(
        'dynamodb',
        aws_access_key_id=AWS_ACCESS_KEY_ID,
        aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
        region_name=AWS_REGION
    )

    settings_table = dynamodb_resource.Table('MJToys_Settings')

    default_settings = {
        'company_name': 'M&J Toys Inc.',
        'company_website': 'MJTOYSINC.COM',
        'company_address': '16700 GALE AVE, CITY OF INDUSTRY, CA 91745',
        'company_phone': '(626) 330-3882',
        'company_fax': '(626) 330-3108',
        'logo_url': 'https://prompt-images-nerd.s3.us-east-1.amazonaws.com/logo_toys.png',
        'default_fob': 'CITY OF INDUSTR',
        'invoice_footer': "ALL SALES ARE FINAL! Net prices included defective allowance discount. Please contact us with in 7 days to claim for missing or damage caused by the Carriers. Refused shipment will get bill for a 20% restocking fees, plus both ways freights. Payment received after 10 days from due date will be subject for a $50 fee, or 2%which ever is greater and additional periodic interest charges of up to 1.5% per month.",
        'packing_slip_footer': "Please carefully inspect the shipment quantities with this packing list , and before you sign complete on the BOL to the Carriers. Missing or damage found, your responsible to write on the BOL, and contact to us within 7 days."
    }

    try:
        settings_table.put_item(Item={
            'setting_key': 'company_settings',
            **default_settings
        })
        print("✓ Default settings initialized successfully!")
    except ClientError as e:
        print(f"✗ Error initializing settings: {e}")

    print("\n" + "="*50)
    print("Database setup completed!")
    print("="*50)
    print("\nCreated tables:")
    print("  1. MJToys_Documents - Stores generated invoices and packing slips")
    print("  2. MJToys_Settings - Stores company configuration")
    print("  3. MJToys_FieldEdits - Stores user field edits")
    print("\nYou can now run your Lambda function and React application!")

if __name__ == '__main__':
    print("="*50)
    print("M&J Toys Inc. - Database Setup Script")
    print("="*50)
    print("\nThis script will create DynamoDB tables for the system.")
    print(f"Region: {AWS_REGION}\n")

    confirm = input("Do you want to proceed? (yes/no): ")
    if confirm.lower() in ['yes', 'y']:
        create_dynamodb_tables()
    else:
        print("Setup cancelled.")
