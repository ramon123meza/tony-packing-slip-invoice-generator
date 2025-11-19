# 🚀 Quick Start Guide

## Step-by-Step Setup (5 minutes)

### 1️⃣ Setup Database (2 minutes)

```bash
# Edit database_setup.py and replace credentials
# Then run:
python database_setup.py
```

When prompted, type `yes` to create the tables.

### 2️⃣ Deploy Lambda Function (2 minutes)

**Copy these 3 files to your Lambda function:**
1. `lambda_function.py` (main handler)
2. `invoice_template.py` (invoice template)
3. `packing_slip_template.py` (packing slip template)

**Lambda Configuration:**
- Runtime: Python 3.9+
- Memory: 1024 MB
- Timeout: 30 seconds
- Layers: Make sure these are available:
  - boto3, pandas, jinja2, weasyprint, openpyxl

**IAM Permissions needed:**
- DynamoDB: Read/Write to all MJToys_* tables
- S3: Read/Write to `prompt-images-nerd` bucket

### 3️⃣ Start React App (1 minute)

```bash
npm install
npm run dev
```

Open http://localhost:5173

### 4️⃣ Login & Test

**Credentials:**
- Username: `admin`
- Password: `admin123`

**Test the system:**
1. Select "Invoice" or "Packing Slip"
2. Upload the sample Excel file: `Invoice_generator_old_sample/template.xlsx`
3. Preview the generated document
4. Download as PDF or Print

## 🎯 That's It!

You're ready to generate invoices and packing slips!

## 📝 Next Steps

- **Upload your logo**: Go to Settings → Upload Logo
- **Customize company info**: Go to Settings → Update all fields
- **Generate your first invoice**: Upload your Excel file on Home page
- **View history**: Check the History page to see all generated documents

## 🆘 Need Help?

Check the full `README.md` for:
- Excel file format details
- Troubleshooting guide
- API endpoint documentation
- Customization options

## 🔑 Default Login Credentials

| Username | Password |
|----------|----------|
| admin | admin123 |
| tony | mjtoys2024 |
| user | user123 |

## 📊 Excel File Requirements

Your Excel must have these columns:
- Order_number (required)
- Invoice_Date, Customer_ID
- Recipient_Name, Recipient_Company
- Address1, City, State, Postal_Code
- Item_no, Description
- Order_Unit, Pack, Net_Price
- And more... (see template.xlsx for reference)

## 🎨 Features Ready to Use

✅ Invoice generation with pricing
✅ Packing slip generation with weight/volume
✅ PDF download
✅ Print function
✅ Document history
✅ Settings management
✅ Logo upload
✅ Beautiful gradient UI

---

**Enjoy your new invoice system!** 🎉
