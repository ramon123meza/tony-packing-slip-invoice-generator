# M&J Toys Inc. - Invoice & Packing Slip Generator

A sophisticated full-stack application for generating professional invoices and packing slips from Excel files.

## 🚀 Features

- **Excel File Processing**: Upload Excel files and automatically generate invoices or packing slips
- **Dual Document Types**: Support for both invoices (with pricing) and packing slips (with physical data)
- **Live Preview**: Preview generated documents in the browser before downloading
- **Inline Editing**: Double-click any field to edit it (future enhancement)
- **PDF Generation**: Download documents as PDF files using WeasyPrint
- **Print Functionality**: Print documents directly from the browser
- **Document History**: View and regenerate previously created documents
- **Settings Management**: Configure company information, logo, and document footers
- **Simple Authentication**: Hardcoded authentication system for security
- **Beautiful UI**: Gradient animated background with modern design

## 📋 Prerequisites

- Python 3.9+ (for database setup script)
- Node.js 18+ (for React frontend)
- AWS Account with:
  - DynamoDB access
  - S3 bucket: `prompt-images-nerd`
  - Lambda function with URL enabled

## 🛠️ Setup Instructions

### Step 1: Setup DynamoDB Tables

1. Open `database_setup.py`
2. Replace the placeholders with your AWS credentials:
   ```python
   AWS_ACCESS_KEY_ID = 'YOUR_AWS_ACCESS_KEY_ID'
   AWS_SECRET_ACCESS_KEY = 'YOUR_AWS_SECRET_ACCESS_KEY'
   AWS_REGION = 'us-east-1'
   ```
3. Run the script:
   ```bash
   python database_setup.py
   ```
4. Type `yes` when prompted to create the tables

This will create three DynamoDB tables:
- `MJToys_Documents` - Stores generated documents
- `MJToys_Settings` - Stores company configuration
- `MJToys_FieldEdits` - Stores user field edits

### Step 2: Deploy Lambda Function

1. Copy the entire content of `lambda_function.py`
2. Also copy `invoice_template.py` and `packing_slip_template.py` to your Lambda deployment package
3. Make sure your Lambda function has the following layers installed (as mentioned in your requirements):
   - boto3
   - pandas
   - jinja2
   - weasyprint
   - openpyxl

4. Set up the Lambda function with:
   - Runtime: Python 3.9 or higher
   - Memory: At least 512 MB (recommended 1024 MB for PDF generation)
   - Timeout: 30 seconds or more
   - Function URL enabled (already provided): `https://iuymyhaagv6rta66lg24ghep2i0cchks.lambda-url.us-east-1.on.aws/`

5. Ensure Lambda has IAM permissions for:
   - DynamoDB read/write access
   - S3 read/write access to `prompt-images-nerd` bucket

### Step 3: Setup React Frontend

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open your browser to `http://localhost:5173`

That's it! No environment variables needed - everything is pre-configured.

## 🔐 Login Credentials

The system has hardcoded authentication with the following credentials:

- **Username**: `admin` / **Password**: `admin123`
- **Username**: `tony` / **Password**: `mjtoys2024`
- **Username**: `user` / **Password**: `user123`

## 📁 Excel File Format

Your Excel file should contain the following columns:

| Column Name | Description |
|------------|-------------|
| Order_number | Unique order identifier |
| Invoice_Date | Invoice date (MM/DD/YYYY) |
| Item_no | Product item number |
| Description | Product description |
| Recipient_Company | Customer company name |
| Recipient_Name | Customer contact name |
| Address1, Address2 | Shipping address |
| City, State, Postal_Code | Location info |
| Country_Code | Country code (e.g., US) |
| Phone, Fax | Contact numbers |
| Customer_ID | Customer identifier |
| SO_No, SO_Date | Sales order info |
| Order_Unit | Number of units ordered |
| unit | Unit type (e.g., CS for case) |
| Pack | Pack quantity |
| line_number | Line item number |
| Net_Price | Unit price |
| Total_WT | Total weight |
| Vol | Volume |
| Date_Paid, Ship_Date | Dates |
| PO_No | Purchase order number |
| Shipping_Handling | Shipping cost |
| Sales_rep | Sales representative |
| ship_via | Shipping method |
| Terms | Payment terms |
| Discount | Discount percentage |
| Loc | Location code (for packing slips) |

See `Invoice_generator_old_sample/template.xlsx` for a reference.

## 🎨 System Architecture

```
┌─────────────────┐
│  React Frontend │
│   (Vite + React)│
└────────┬────────┘
         │
         │ HTTPS
         │
┌────────▼────────────┐
│  Lambda Function   │
│  (Python)          │
│  - Parse Excel     │
│  - Generate HTML   │
│  - Create PDF      │
└────────┬───────────┘
         │
    ┌────┴────┐
    │         │
┌───▼──┐  ┌──▼──┐
│DynamoDB│  │ S3  │
│Tables  │  │Logos│
└────────┘  └─────┘
```

## 📦 Project Structure

```
.
├── database_setup.py          # DynamoDB table creation script
├── lambda_function.py         # Main Lambda function with all endpoints
├── invoice_template.py        # Invoice HTML template
├── packing_slip_template.py   # Packing slip HTML template
├── package.json               # Node dependencies
├── vite.config.js            # Vite configuration
├── index.html                # HTML entry point
└── src/
    ├── main.jsx              # React entry point
    ├── App.jsx               # Main app component with routing
    ├── index.css             # Global styles with gradient
    ├── api.js                # API client for Lambda
    ├── contexts/
    │   └── AuthContext.jsx   # Authentication context
    ├── components/
    │   ├── Layout.jsx        # Main layout with navigation
    │   ├── FileUpload.jsx    # Excel file upload component
    │   └── DocumentPreview.jsx # Document preview with editing
    └── pages/
        ├── LoginPage.jsx     # Login page
        ├── HomePage.jsx      # Main generator page
        ├── SettingsPage.jsx  # Settings configuration
        └── HistoryPage.jsx   # Document history
```

## 🔧 API Endpoints

The Lambda function provides the following endpoints:

- `POST /parse-excel` - Parse Excel file and extract orders
- `POST /generate-document` - Generate invoice or packing slip HTML
- `POST /save-field-edit` - Save user field edits
- `POST /get-field-edits` - Retrieve field edits for a document
- `GET /get-history` - Get all generated documents
- `POST /get-document` - Get specific document by ID
- `GET /get-settings` - Get company settings
- `POST /update-settings` - Update company settings
- `POST /upload-logo` - Upload company logo to S3
- `POST /generate-pdf` - Generate PDF from HTML using WeasyPrint
- `GET /health` - Health check endpoint

## 🎯 Usage Workflow

1. **Login** with provided credentials
2. **Select Document Type** (Invoice or Packing Slip)
3. **Upload Excel File** containing order data
4. **Preview Document** - Review the generated document
5. **Edit Fields** (if needed) - Double-click to edit
6. **Download PDF** or **Print** the document
7. **View History** - Access previously generated documents

## 🎨 Customization

### Change Company Logo

1. Go to **Settings** page
2. Click "Upload New Logo"
3. Select your image file (PNG or JPG recommended)
4. Logo will be uploaded to S3 and used in all future documents

### Update Company Information

1. Go to **Settings** page
2. Update fields like:
   - Company Name
   - Address
   - Phone/Fax
   - Website
   - F.O.B. default value
3. Click "Save All Settings"

### Customize Document Footers

1. Go to **Settings** page
2. Scroll to "Document Footers" section
3. Edit the footer text for invoices and packing slips
4. Click "Save All Settings"

## 🐛 Troubleshooting

### Excel parsing fails
- Ensure Excel file has all required columns
- Check that dates are in MM/DD/YYYY format
- Verify Order_number column exists and has values

### PDF generation fails
- Ensure Lambda has WeasyPrint layer installed
- Check Lambda memory is at least 512 MB
- Verify Lambda timeout is 30+ seconds

### Cannot upload logo
- Check S3 bucket `prompt-images-nerd` exists
- Verify Lambda has S3 write permissions
- Ensure image file is under 5 MB

### Settings not saving
- Verify DynamoDB tables were created successfully
- Check Lambda has DynamoDB write permissions
- Review Lambda CloudWatch logs for errors

## 📄 License

Copyright © 2024 M&J Toys Inc. All rights reserved.

## 🤝 Support

For issues or questions, please contact your system administrator.

---

Built with ❤️ using React, AWS Lambda, DynamoDB, and WeasyPrint
