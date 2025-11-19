# M&J Toys Inc. - Invoice & Packing Slip Generator

A full-stack application for generating professional invoices and packing slips from Excel files with **client-side PDF generation**.

## 🚀 Features

- **Excel File Processing**: Upload Excel files and automatically generate invoices or packing slips
- **Dual Document Types**: Support for both invoices (with pricing) and packing slips (with physical data)
- **Live PDF Preview**: Real-time preview using react-pdf/renderer
- **Client-Side PDF Generation**: Generate and download PDFs entirely in the browser - no server required!
- **Print Functionality**: Print documents directly from the preview
- **Settings Management**: Configure company information, logo, and document footers
- **Simple Authentication**: Hardcoded authentication system for security
- **Beautiful UI**: Gradient animated background with modern design
- **Simplified Deployment**: No Docker or complex Lambda layers needed!

## 📋 Prerequisites

- Python 3.9+ (for database setup script and Lambda)
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

This will create:
- `MJToys_Settings` - Stores company configuration
- `MJToys_Documents` - Stores document history
- `MJToys_FieldEdits` - Stores user field edits

### Step 2: Deploy Lambda Function

**Simple Deployment** (No Docker required!):

1. Install dependencies locally:
   ```bash
   pip install -r requirements.txt -t .
   ```

2. Create a deployment package:
   ```bash
   zip -r lambda_function.zip lambda_function.py boto3 pandas openpyxl
   ```

3. Upload to Lambda:
   ```bash
   aws lambda update-function-code \
     --function-name your-function-name \
     --zip-file fileb://lambda_function.zip
   ```

**Lambda Configuration:**
- Runtime: **Python 3.9+**
- Memory: **256 MB** (minimal requirements)
- Timeout: **30 seconds**
- Function URL: Enable with CORS

**Required IAM Permissions:**
- DynamoDB read/write access to `MJToys_Settings` and `MJToys_Documents` tables
- S3 read/write access to `prompt-images-nerd` bucket

### Step 3: Setup React Frontend

1. Install dependencies:
   ```bash
   npm install
   ```

2. Update the Lambda URL in `src/api.js`:
   ```javascript
   const API_BASE_URL = 'your-lambda-url-here'
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser to `http://localhost:5173`

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
┌─────────────────────────┐
│    React Frontend       │
│  (Vite + React)         │
│  - @react-pdf/renderer  │
│  - Client-side PDFs     │
│  - Live preview         │
└────────┬────────────────┘
         │
         │ HTTPS (Simplified API)
         │
┌────────▼────────────────┐
│   Lambda Function       │
│   (Python - Minimal)    │
│   - Parse Excel only    │
│   - Settings storage    │
│   - Logo upload         │
└────────┬────────────────┘
         │
    ┌────┴────┐
    │         │
┌───▼──┐  ┌──▼──┐
│DynamoDB│  │ S3  │
│Settings│  │Logos│
└────────┘  └─────┘
```

## 📦 Project Structure

```
.
├── database_setup.py          # DynamoDB table creation script
├── lambda_function.py         # Simplified Lambda (Excel parsing only)
├── requirements.txt           # Python dependencies (minimal)
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
    │   ├── DocumentPreview.jsx # PDF preview component
    │   ├── InvoiceTemplate.jsx # Invoice PDF template (react-pdf)
    │   └── PackingSlipTemplate.jsx # Packing slip PDF template (react-pdf)
    └── pages/
        ├── LoginPage.jsx     # Login page
        ├── HomePage.jsx      # Main generator page
        ├── SettingsPage.jsx  # Settings configuration
        └── HistoryPage.jsx   # Document history
```

## 🔧 API Endpoints

The Lambda function provides the following simplified endpoints:

- `POST /parse-excel` - Parse Excel file and extract orders
- `GET /get-settings` - Get company settings
- `POST /update-settings` - Update company settings
- `POST /upload-logo` - Upload company logo to S3
- `GET /health` - Health check endpoint

## 🎯 Usage Workflow

1. **Login** with provided credentials
2. **Select Document Type** (Invoice or Packing Slip)
3. **Upload Excel File** containing order data
4. **Preview Document** - Real-time PDF preview in browser
5. **Download PDF** or **Print** the document (generated client-side)

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

### PDF preview not showing
- Ensure you ran `npm install` to get @react-pdf/renderer
- Check browser console for errors
- Try refreshing the page

### Cannot upload logo
- Check S3 bucket `prompt-images-nerd` exists
- Verify Lambda has S3 write permissions
- Ensure image file is under 5 MB

### Settings not saving
- Verify DynamoDB table was created successfully
- Check Lambda has DynamoDB write permissions
- Review Lambda CloudWatch logs for errors

### Debugging Tips

1. **Check Lambda CloudWatch Logs**:
   - AWS Console → CloudWatch → Log groups
   - Find `/aws/lambda/your-function-name`
   - Look for error messages

2. **Verify Lambda Configuration**:
   - Runtime: Python 3.9+
   - Memory: 256 MB minimum
   - Timeout: 30 seconds
   - Required dependencies installed (see requirements.txt)

3. **Test Health Endpoint**:
   ```bash
   curl https://your-lambda-url/health
   ```
   Expected: `{"status":"healthy","message":"M&J Toys API is running (client-side PDF generation)","version":"2.0"}`

## ⚡ Key Improvements in v2.0

- **No Docker Required**: Simple Lambda deployment without container images
- **Faster PDFs**: Generated instantly in the browser
- **Smaller Lambda**: Reduced from ~500MB to ~50MB
- **Lower Costs**: No PDF generation Lambda invocations
- **Better Preview**: Real-time PDF viewer with native controls
- **Offline Capable**: PDF generation works even if Lambda is down
- **Simpler Deployment**: No WeasyPrint, no complex dependencies

## 📄 License

Copyright © 2024 M&J Toys Inc. All rights reserved.

## 🤝 Support

For issues or questions, please contact your system administrator.

---

Built with ❤️ using React, AWS Lambda, DynamoDB, and @react-pdf/renderer
