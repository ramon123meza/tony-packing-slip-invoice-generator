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

### Step 2: Deploy Lambda Function with Docker

⚠️ **CRITICAL**: WeasyPrint requires system libraries that are NOT available in standard Lambda Python runtime. You **MUST** use Docker deployment.

**Error you'll see without Docker:**
```
OSError: cannot load library 'libgobject-2.0-0'
```

**Quick Docker Deployment** (Recommended):

1. Ensure Docker and AWS CLI are installed
2. Configure AWS credentials:
   ```bash
   aws configure
   ```
3. Run the deployment script:
   ```bash
   chmod +x deploy-lambda-docker.sh
   ./deploy-lambda-docker.sh
   ```

The script will:
- ✅ Build Docker image with all WeasyPrint dependencies
- ✅ Push to Amazon ECR
- ✅ Update your Lambda function

**For detailed instructions and troubleshooting**, see **[LAMBDA_DEPLOYMENT_GUIDE.md](LAMBDA_DEPLOYMENT_GUIDE.md)**

**Lambda Configuration:**
- Package Type: **Container Image** (required for WeasyPrint)
- Memory: **1024 MB** (minimum 512 MB)
- Timeout: **60 seconds** (minimum 30 seconds)
- Function URL: `https://iuymyhaagv6rta66lg24ghep2i0cchks.lambda-url.us-east-1.on.aws/`

**Required IAM Permissions:**
- DynamoDB read/write access to `MJToys_*` tables
- S3 read/write access to `prompt-images-nerd` bucket
- ECR access for Docker image deployment

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

### OSError: cannot load library 'libgobject-2.0-0' (CRITICAL)

If you see this error when testing Lambda, it means you're using the wrong deployment method.

**Cause**: WeasyPrint requires system libraries (Cairo, Pango, etc.) not available in standard Lambda Python runtime.

**Solution**: You MUST use Docker container deployment. See **[LAMBDA_DEPLOYMENT_GUIDE.md](LAMBDA_DEPLOYMENT_GUIDE.md)** for complete instructions.

**Quick Fix**:
```bash
# Deploy using Docker (the correct way)
./deploy-lambda-docker.sh
```

### 502 Bad Gateway Error

If you see a **502 Bad Gateway** error when uploading Excel files, this means the Lambda function is crashing. Causes:

1. **Missing system libraries** - Use Docker deployment (see above)
2. **Lambda timeout too short** - Needs to be at least 30 seconds
3. **Insufficient memory** - Needs at least 512 MB (1024 MB recommended)

**Solution**: Use Docker deployment and verify configuration in **[LAMBDA_DEPLOYMENT_GUIDE.md](LAMBDA_DEPLOYMENT_GUIDE.md)**

**Quick Health Check**:
```bash
curl https://iuymyhaagv6rta66lg24ghep2i0cchks.lambda-url.us-east-1.on.aws/health
```

Expected response: `{"status":"healthy","message":"M&J Toys API is running"}`

### Excel parsing fails
- Ensure Excel file has all required columns
- Check that dates are in MM/DD/YYYY format
- Verify Order_number column exists and has values
- **If getting 502 error**: See above section

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

### Debugging Tips

1. **Check Lambda CloudWatch Logs**:
   - AWS Console → CloudWatch → Log groups
   - Find `/aws/lambda/your-function-name`
   - Look for error messages

2. **Verify Lambda Configuration**:
   - Runtime: Python 3.9+
   - Memory: 1024 MB
   - Timeout: 60 seconds
   - Required dependencies installed (see requirements.txt)

3. **Test Endpoints**:
   - Use `test_lambda.py` to verify Lambda is responding
   - Check each endpoint individually

## 📄 License

Copyright © 2024 M&J Toys Inc. All rights reserved.

## 🤝 Support

For issues or questions, please contact your system administrator.

---

Built with ❤️ using React, AWS Lambda, DynamoDB, and WeasyPrint
