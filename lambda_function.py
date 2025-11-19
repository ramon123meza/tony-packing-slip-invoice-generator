"""
M&J Toys Inc. - Invoice & Packing Slip Generator
Lambda Function with all endpoints
"""

import json
import base64
import io
import uuid
from datetime import datetime
from decimal import Decimal
import boto3
from boto3.dynamodb.conditions import Key
import pandas as pd
from jinja2 import Template
from weasyprint import HTML
import traceback

# Initialize AWS services
dynamodb = boto3.resource('dynamodb', region_name='us-east-1')
s3_client = boto3.client('s3', region_name='us-east-1')

# Table references
documents_table = dynamodb.Table('MJToys_Documents')
settings_table = dynamodb.Table('MJToys_Settings')
field_edits_table = dynamodb.Table('MJToys_FieldEdits')

# S3 bucket
S3_BUCKET = 'prompt-images-nerd'

class DecimalEncoder(json.JSONEncoder):
    """Helper class to convert Decimal to float for JSON serialization"""
    def default(self, obj):
        if isinstance(obj, Decimal):
            return float(obj)
        return super(DecimalEncoder, self).default(obj)

def cors_response(status_code, body):
    """Return response with CORS headers"""
    return {
        'statusCode': status_code,
        'headers': {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
            'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
            'Content-Type': 'application/json'
        },
        'body': json.dumps(body, cls=DecimalEncoder)
    }

def parse_excel_file(file_content):
    """Parse Excel file and extract order data"""
    try:
        # Decode base64 content
        excel_bytes = base64.b64decode(file_content)

        # Read Excel file
        df = pd.read_excel(io.BytesIO(excel_bytes), dtype=str)

        # Convert date columns
        date_columns = ['Invoice_Date', 'SO_Date', 'Date_Paid', 'Ship_Date']
        for col in date_columns:
            if col in df.columns:
                df[col] = pd.to_datetime(df[col], errors='coerce').dt.strftime('%m/%d/%Y')

        # Group by order number
        grouped = df.groupby('Order_number')

        orders = []
        for order_number, group in grouped:
            order_data = process_order_group(group, order_number)
            orders.append(order_data)

        return orders
    except Exception as e:
        print(f"Error parsing Excel: {str(e)}")
        traceback.print_exc()
        raise e

def process_order_group(group, order_number):
    """Process a group of rows for a single order"""
    # Calculate totals
    group['Order_Unit'] = pd.to_numeric(group['Order_Unit'], errors='coerce').fillna(0).astype(int)
    group['Pack'] = pd.to_numeric(group['Pack'], errors='coerce').fillna(0).astype(int)
    group['Net_Price'] = pd.to_numeric(group['Net_Price'], errors='coerce').fillna(0).astype(float)
    group['Total_WT'] = pd.to_numeric(group['Total_WT'], errors='coerce').fillna(0).astype(float)
    group['Vol'] = pd.to_numeric(group['Vol'], errors='coerce').fillna(0).astype(float)

    total_case = int(group['Order_Unit'].sum())
    total_wt = float(group['Total_WT'].sum())
    vol = float(group['Vol'].sum())

    # Get order details from first row
    first_row = group.iloc[0]
    order_details = {
        'Order_number': str(order_number),
        'Invoice_Date': first_row.get('Invoice_Date', ''),
        'SO_Date': first_row.get('SO_Date', ''),
        'Ship_Date': first_row.get('Ship_Date', ''),
        'Date_Paid': first_row.get('Date_Paid', ''),
        'Customer_ID': first_row.get('Customer_ID', ''),
        'SO_No': first_row.get('SO_No', ''),
        'PO_No': first_row.get('PO_No', ''),
        'Sales_rep': first_row.get('Sales_rep', ''),
        'ship_via': first_row.get('ship_via', ''),
        'Terms': first_row.get('Terms', ''),
        'Recipient_Name': first_row.get('Recipient_Name', ''),
        'Recipient_Company': first_row.get('Recipient_Company', ''),
        'Address1': first_row.get('Address1', ''),
        'Address2': first_row.get('Address2', ''),
        'City': first_row.get('City', ''),
        'State': first_row.get('State', ''),
        'Postal_Code': first_row.get('Postal_Code', ''),
        'Country_Code': first_row.get('Country_Code', ''),
        'Phone': first_row.get('Phone', ''),
        'Fax': first_row.get('Fax', ''),
        'Discount': float(first_row.get('Discount', 0)),
        'Shipping_Handling': float(first_row.get('Shipping_Handling', 0)) if pd.notna(first_row.get('Shipping_Handling')) else 0.0,
    }

    # Process line items
    line_items = []
    total_amount = 0.0
    total_qty = 0

    for idx, row in group.iterrows():
        order_unit = int(row['Order_Unit'])
        pack = int(row['Pack'])
        ship_qty = order_unit * pack
        total_qty += ship_qty

        net_price = float(row['Net_Price'])
        extended_price = ship_qty * net_price
        total_amount += extended_price

        # For packing slip - include weight and volume per line
        line_weight = float(row.get('Total_WT', 0))
        line_volume = float(row.get('Vol', 0))

        line_item = {
            'line_number': str(row.get('line_number', len(line_items) + 1)),
            'Order_Unit': order_unit,
            'unit': str(row.get('unit', 'CS')),
            'Pack': pack,
            'Item_no': str(row.get('Item_no', '')),
            'Description': str(row.get('Description', '')),
            'Ship_Qty': ship_qty,
            'Net_Price': net_price,
            'Extended_Price': extended_price,
            'Weight': line_weight,
            'Volume': line_volume,
            'Loc': str(row.get('Loc', ''))
        }
        line_items.append(line_item)

    # Calculate discount and total
    discount_percentage = order_details['Discount'] / 100
    total_discount = total_amount * discount_percentage
    shipping_handling = order_details['Shipping_Handling']
    total_discounted_amount = total_amount - total_discount + shipping_handling

    order_details.update({
        'line_items': line_items,
        'Total_Case': total_case,
        'Total_WT': total_wt,
        'Vol': vol,
        'Total_qty': total_qty,
        'Total_Amount': total_amount,
        'Total_Discount': total_discount,
        'Total_Discounted_Amount': total_discounted_amount,
        'Sales_Amount': total_amount
    })

    return order_details

def get_settings():
    """Get company settings from DynamoDB"""
    try:
        response = settings_table.get_item(Key={'setting_key': 'company_settings'})
        if 'Item' in response:
            return response['Item']
        else:
            # Return defaults if not found
            return {
                'company_name': 'M&J Toys Inc.',
                'company_website': 'MJTOYSINC.COM',
                'company_address': '16700 GALE AVE, CITY OF INDUSTRY, CA 91745',
                'company_phone': '(626) 330-3882',
                'company_fax': '(626) 330-3108',
                'logo_url': 'https://prompt-images-nerd.s3.us-east-1.amazonaws.com/logo_toys.png',
                'default_fob': 'CITY OF INDUSTR'
            }
    except Exception as e:
        print(f"Error getting settings: {e}")
        return {}

def save_document(document_id, doc_type, order_data, html_content):
    """Save document to DynamoDB"""
    try:
        item = {
            'document_id': document_id,
            'document_type': doc_type,
            'order_number': order_data['Order_number'],
            'order_data': order_data,
            'html_content': html_content,
            'created_at': datetime.now().isoformat(),
            'updated_at': datetime.now().isoformat()
        }
        documents_table.put_item(Item=item)
        return True
    except Exception as e:
        print(f"Error saving document: {e}")
        return False

def lambda_handler(event, context):
    """Main Lambda handler"""

    # Handle OPTIONS request for CORS
    if event.get('requestContext', {}).get('http', {}).get('method') == 'OPTIONS':
        return cors_response(200, {'message': 'OK'})

    try:
        # Parse the request
        http_method = event.get('requestContext', {}).get('http', {}).get('method', 'POST')
        path = event.get('rawPath', '/')

        # Handle different routes
        if path == '/parse-excel' and http_method == 'POST':
            return handle_parse_excel(event)
        elif path == '/generate-document' and http_method == 'POST':
            return handle_generate_document(event)
        elif path == '/save-field-edit' and http_method == 'POST':
            return handle_save_field_edit(event)
        elif path == '/get-field-edits' and http_method == 'POST':
            return handle_get_field_edits(event)
        elif path == '/get-history' and http_method == 'GET':
            return handle_get_history(event)
        elif path == '/get-document' and http_method == 'POST':
            return handle_get_document(event)
        elif path == '/get-settings' and http_method == 'GET':
            return handle_get_settings(event)
        elif path == '/update-settings' and http_method == 'POST':
            return handle_update_settings(event)
        elif path == '/upload-logo' and http_method == 'POST':
            return handle_upload_logo(event)
        elif path == '/generate-pdf' and http_method == 'POST':
            return handle_generate_pdf(event)
        elif path == '/health' and http_method == 'GET':
            return cors_response(200, {'status': 'healthy', 'message': 'M&J Toys API is running'})
        else:
            return cors_response(404, {'error': 'Endpoint not found'})

    except Exception as e:
        print(f"Error in lambda_handler: {str(e)}")
        traceback.print_exc()
        return cors_response(500, {'error': str(e), 'traceback': traceback.format_exc()})

def handle_parse_excel(event):
    """Handle Excel file parsing"""
    try:
        body = json.loads(event.get('body', '{}'))
        file_content = body.get('file_content')

        if not file_content:
            return cors_response(400, {'error': 'No file content provided'})

        orders = parse_excel_file(file_content)
        return cors_response(200, {'orders': orders})
    except Exception as e:
        return cors_response(500, {'error': str(e)})

def handle_generate_document(event):
    """Handle document generation (invoice or packing slip)"""
    try:
        body = json.loads(event.get('body', '{}'))
        doc_type = body.get('type', 'invoice')  # 'invoice' or 'packing_slip'
        order_data = body.get('order_data')
        field_edits = body.get('field_edits', {})

        if not order_data:
            return cors_response(400, {'error': 'No order data provided'})

        # Apply field edits
        if field_edits:
            apply_field_edits(order_data, field_edits)

        # Get settings
        settings = get_settings()

        # Generate HTML based on type
        if doc_type == 'invoice':
            html_content = generate_invoice_html(order_data, settings)
        else:
            html_content = generate_packing_slip_html(order_data, settings)

        # Generate document ID
        document_id = str(uuid.uuid4())

        # Save to DynamoDB
        save_document(document_id, doc_type, order_data, html_content)

        return cors_response(200, {
            'document_id': document_id,
            'html_content': html_content,
            'order_data': order_data
        })
    except Exception as e:
        traceback.print_exc()
        return cors_response(500, {'error': str(e)})

def apply_field_edits(order_data, field_edits):
    """Apply user field edits to order data"""
    for key, value in field_edits.items():
        if '.' in key:  # Handle nested keys like 'line_items.0.Description'
            parts = key.split('.')
            if parts[0] == 'line_items' and len(parts) == 3:
                idx = int(parts[1])
                field = parts[2]
                if idx < len(order_data['line_items']):
                    order_data['line_items'][idx][field] = value
        else:
            order_data[key] = value

def handle_save_field_edit(event):
    """Save field edit to DynamoDB"""
    try:
        body = json.loads(event.get('body', '{}'))
        document_id = body.get('document_id')
        field_edits = body.get('field_edits', {})

        if not document_id:
            document_id = str(uuid.uuid4())

        field_edits_table.put_item(Item={
            'document_id': document_id,
            'field_edits': field_edits,
            'updated_at': datetime.now().isoformat()
        })

        return cors_response(200, {'document_id': document_id, 'message': 'Field edits saved'})
    except Exception as e:
        return cors_response(500, {'error': str(e)})

def handle_get_field_edits(event):
    """Get field edits for a document"""
    try:
        body = json.loads(event.get('body', '{}'))
        document_id = body.get('document_id')

        if not document_id:
            return cors_response(400, {'error': 'No document_id provided'})

        response = field_edits_table.get_item(Key={'document_id': document_id})

        if 'Item' in response:
            return cors_response(200, {'field_edits': response['Item'].get('field_edits', {})})
        else:
            return cors_response(200, {'field_edits': {}})
    except Exception as e:
        return cors_response(500, {'error': str(e)})

def handle_get_history(event):
    """Get history of generated documents"""
    try:
        response = documents_table.scan()
        documents = response.get('Items', [])

        # Sort by created_at descending
        documents.sort(key=lambda x: x.get('created_at', ''), reverse=True)

        return cors_response(200, {'documents': documents})
    except Exception as e:
        return cors_response(500, {'error': str(e)})

def handle_get_document(event):
    """Get a specific document by ID"""
    try:
        body = json.loads(event.get('body', '{}'))
        document_id = body.get('document_id')

        if not document_id:
            return cors_response(400, {'error': 'No document_id provided'})

        response = documents_table.get_item(Key={'document_id': document_id})

        if 'Item' in response:
            return cors_response(200, {'document': response['Item']})
        else:
            return cors_response(404, {'error': 'Document not found'})
    except Exception as e:
        return cors_response(500, {'error': str(e)})

def handle_get_settings(event):
    """Get company settings"""
    try:
        settings = get_settings()
        return cors_response(200, {'settings': settings})
    except Exception as e:
        return cors_response(500, {'error': str(e)})

def handle_update_settings(event):
    """Update company settings"""
    try:
        body = json.loads(event.get('body', '{}'))
        settings = body.get('settings', {})

        settings['setting_key'] = 'company_settings'
        settings_table.put_item(Item=settings)

        return cors_response(200, {'message': 'Settings updated successfully'})
    except Exception as e:
        return cors_response(500, {'error': str(e)})

def handle_upload_logo(event):
    """Handle logo upload to S3"""
    try:
        body = json.loads(event.get('body', '{}'))
        logo_content = body.get('logo_content')  # base64 encoded
        filename = body.get('filename', 'logo.png')

        if not logo_content:
            return cors_response(400, {'error': 'No logo content provided'})

        # Decode base64
        logo_bytes = base64.b64decode(logo_content)

        # Upload to S3
        key = f'logos/{filename}'
        s3_client.put_object(
            Bucket=S3_BUCKET,
            Key=key,
            Body=logo_bytes,
            ContentType='image/png',
            ACL='public-read'
        )

        # Get URL
        logo_url = f'https://{S3_BUCKET}.s3.us-east-1.amazonaws.com/{key}'

        # Update settings
        settings = get_settings()
        settings['logo_url'] = logo_url
        settings['setting_key'] = 'company_settings'
        settings_table.put_item(Item=settings)

        return cors_response(200, {'logo_url': logo_url})
    except Exception as e:
        traceback.print_exc()
        return cors_response(500, {'error': str(e)})

def handle_generate_pdf(event):
    """Generate PDF from HTML"""
    try:
        body = json.loads(event.get('body', '{}'))
        html_content = body.get('html_content')

        if not html_content:
            return cors_response(400, {'error': 'No HTML content provided'})

        # Generate PDF using WeasyPrint
        pdf_file = HTML(string=html_content).write_pdf()

        # Encode as base64
        pdf_base64 = base64.b64encode(pdf_file).decode('utf-8')

        return cors_response(200, {'pdf_content': pdf_base64})
    except Exception as e:
        traceback.print_exc()
        return cors_response(500, {'error': str(e)})

# Template generation functions will be defined after we create the HTML templates
def generate_invoice_html(order_data, settings):
    """Generate invoice HTML - template will be added"""
    from invoice_template import INVOICE_TEMPLATE
    template = Template(INVOICE_TEMPLATE)
    return template.render(order=order_data, settings=settings)

def generate_packing_slip_html(order_data, settings):
    """Generate packing slip HTML - template will be added"""
    from packing_slip_template import PACKING_SLIP_TEMPLATE
    template = Template(PACKING_SLIP_TEMPLATE)
    return template.render(order=order_data, settings=settings)
