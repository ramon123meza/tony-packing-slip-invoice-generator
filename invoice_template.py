"""
Invoice Template for M&J Toys Inc.
"""

INVOICE_TEMPLATE = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice {{ order.Order_number }}</title>
    <style>
        @page {
            size: Letter;
            margin: 0.5cm;
        }

        body {
            margin: 0;
            padding: 0;
            font-family: Arial, sans-serif;
            font-size: 11px;
            color: black;
        }

        .header {
            width: 100%;
            border-bottom: 2px solid black;
            padding-bottom: 5px;
            margin-bottom: 10px;
        }

        .header-top {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
        }

        .logo-section {
            width: 25%;
        }

        .logo-section img {
            width: 120px;
            height: auto;
        }

        .company-info {
            width: 50%;
            text-align: center;
        }

        .company-name {
            font-size: 24px;
            font-weight: bold;
            margin: 0;
        }

        .company-website {
            font-size: 12px;
            margin: 2px 0;
        }

        .company-address {
            font-size: 10px;
            margin: 2px 0;
        }

        .invoice-title {
            font-size: 32px;
            font-weight: bold;
            font-style: italic;
            letter-spacing: 4px;
            margin: 5px 0;
        }

        .invoice-info {
            width: 25%;
            text-align: right;
        }

        .barcode {
            font-size: 24px;
            font-weight: bold;
            margin: 5px 0;
        }

        .invoice-number, .invoice-date {
            font-size: 11px;
            margin: 2px 0;
        }

        .customer-info-row {
            display: flex;
            justify-content: space-between;
            margin: 10px 0;
            font-size: 10px;
        }

        .customer-box {
            width: 48%;
            border: 1px solid black;
            padding: 8px;
            min-height: 80px;
        }

        .box-title {
            font-weight: bold;
            margin-bottom: 5px;
        }

        .order-details {
            width: 100%;
            border-collapse: collapse;
            margin: 10px 0;
            font-size: 10px;
        }

        .order-details th {
            background-color: white;
            border: 1px solid black;
            padding: 4px;
            text-align: center;
            font-weight: bold;
        }

        .order-details td {
            border: 1px solid black;
            padding: 4px;
            text-align: center;
        }

        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin: 10px 0;
            font-size: 10px;
        }

        .items-table th {
            background-color: white;
            border: 1px solid black;
            padding: 4px;
            text-align: center;
            font-weight: bold;
        }

        .items-table td {
            border: 1px solid black;
            padding: 4px;
        }

        .items-table td.right {
            text-align: right;
        }

        .items-table td.center {
            text-align: center;
        }

        .totals-section {
            display: flex;
            justify-content: space-between;
            margin: 10px 0;
            font-size: 10px;
        }

        .totals-left {
            width: 55%;
        }

        .totals-right {
            width: 40%;
        }

        .totals-table {
            width: 100%;
        }

        .totals-table tr td:first-child {
            text-align: left;
            padding: 2px 5px;
        }

        .totals-table tr td:last-child {
            text-align: right;
            padding: 2px 5px;
        }

        .totals-table tr.bold {
            font-weight: bold;
        }

        .footer {
            margin-top: 10px;
            font-size: 9px;
            text-align: justify;
            line-height: 1.3;
        }

        .meta-info {
            text-align: center;
            font-size: 10px;
            margin: 5px 0;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="header-top">
            <div class="logo-section">
                <img src="{{ settings.logo_url }}" alt="M&J Toys Logo">
            </div>
            <div class="company-info">
                <div class="company-name">{{ settings.company_name }}</div>
                <div class="company-website">{{ settings.company_website }}</div>
                <div class="company-address">{{ settings.company_address }}</div>
                <div class="company-address">Tel: {{ settings.company_phone }}&nbsp;&nbsp;&nbsp;&nbsp;Fax:{{ settings.company_fax }}</div>
                <div class="invoice-title">I N V O I C E</div>
            </div>
            <div class="invoice-info">
                <div class="barcode">*{{ order.Order_number }}*</div>
                <div class="invoice-number">Invoice No.: {{ order.Order_number }}</div>
                <div class="invoice-date">Date: {{ order.Invoice_Date }}</div>
            </div>
        </div>
    </div>

    <div class="meta-info">
        <strong>Customer ID:</strong> {{ order.Customer_ID }}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        <strong>Ship Date:</strong> {{ order.Ship_Date }}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        <strong>Page:</strong> 1
    </div>

    <div class="customer-info-row">
        <div class="customer-box">
            <div class="box-title">Sold To:</div>
            <div>Attn: {{ order.Recipient_Name }}</div>
            <div><strong>{{ order.Recipient_Company }}</strong></div>
            <div>{{ order.Address1 }}{% if order.Address2 %} {{ order.Address2 }}{% endif %}</div>
            <div>{{ order.City }}, {{ order.State }} {{ order.Postal_Code }}</div>
            <div><br></div>
            <div>Tel: {{ order.Phone }}&nbsp;&nbsp;&nbsp;&nbsp;Fax:{{ order.Fax }}</div>
        </div>
        <div class="customer-box">
            <div class="box-title">Ship To:</div>
            <div>Attn: {{ order.Recipient_Name }}</div>
            <div><strong>{{ order.Recipient_Company }}</strong></div>
            <div>{{ order.Address1 }}{% if order.Address2 %} {{ order.Address2 }}{% endif %}</div>
            <div>{{ order.City }}, {{ order.State }} {{ order.Postal_Code }}, {{ order.Country_Code }}</div>
            <div><br></div>
            <div>Tel: {{ order.Phone }}</div>
        </div>
    </div>

    <table class="order-details">
        <thead>
            <tr>
                <th>S/O No.</th>
                <th>S/O Date</th>
                <th>P/O No.</th>
                <th>Sales Rep.</th>
                <th>Ship Via</th>
                <th>F.O.B.</th>
                <th>Terms</th>
                <th>Due Date</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>{{ order.SO_No }}</td>
                <td>{{ order.SO_Date }}</td>
                <td>{{ order.PO_No }}</td>
                <td>{{ order.Sales_rep }}</td>
                <td>{{ order.ship_via }}</td>
                <td>{{ settings.default_fob }}</td>
                <td><strong>{{ order.Terms }}</strong></td>
                <td>{{ order.Date_Paid }}</td>
            </tr>
        </tbody>
    </table>

    <table class="items-table">
        <thead>
            <tr>
                <th style="width: 5%;">Line#</th>
                <th style="width: 8%;">Order<br>Unit</th>
                <th style="width: 5%;">Unit</th>
                <th style="width: 5%;">Pack</th>
                <th style="width: 12%;">Item No.</th>
                <th style="width: 35%;">Description</th>
                <th style="width: 8%;">Ship<br>Qty (PC)</th>
                <th style="width: 8%;">Pricelist</th>
                <th style="width: 10%;">Ext. Amount</th>
                <th style="width: 8%;">Net Price</th>
            </tr>
        </thead>
        <tbody>
            {% for item in order.line_items %}
            <tr>
                <td class="center">{{ item.line_number }}</td>
                <td class="right">{{ item.Order_Unit }}</td>
                <td class="center">{{ item.unit }}</td>
                <td class="right">{{ item.Pack }}</td>
                <td>{{ item.Item_no }}</td>
                <td>{{ item.Description }}</td>
                <td class="right">{{ item.Ship_Qty }}</td>
                <td class="right">{{ "%.3f"|format(item.Net_Price * 0.86) }}</td>
                <td class="right">{{ "%.3f"|format(item.Extended_Price) }}</td>
                <td class="right">{{ "%.3f"|format(item.Net_Price) }}</td>
            </tr>
            {% endfor %}
        </tbody>
    </table>

    <div class="totals-section">
        <div class="totals-left">
            <strong>Total BX:</strong>&nbsp;&nbsp;&nbsp;
            <strong>Total Wt:</strong> {{ "%.2f"|format(order.Total_WT) }}&nbsp;&nbsp;&nbsp;
            <strong>Unit PC:</strong>&nbsp;&nbsp;&nbsp;
            <strong>Vol.:</strong> {{ "%.2f"|format(order.Vol) }}&nbsp;&nbsp;&nbsp;
            <strong>Total CASE:</strong> {{ order.Total_Case }}&nbsp;&nbsp;&nbsp;
            <strong>Total PC:</strong> {{ order.Total_qty }}
        </div>
        <div class="totals-right">
            <table class="totals-table">
                <tr class="bold">
                    <td>Sales Amount:</td>
                    <td>{{ "%.2f"|format(order.Sales_Amount) }}</td>
                </tr>
                <tr>
                    <td>Discount {{ order.Discount|int }}%:</td>
                    <td>{{ "%.2f"|format(-order.Total_Discount) }}</td>
                </tr>
                <tr>
                    <td>Tax %:</td>
                    <td>0.00</td>
                </tr>
                <tr>
                    <td>Shipping & Handling:</td>
                    <td>{{ "%.2f"|format(order.Shipping_Handling) }}</td>
                </tr>
                <tr class="bold">
                    <td>Total Amount:</td>
                    <td>{{ "%.2f"|format(order.Total_Discounted_Amount) }}</td>
                </tr>
                <tr>
                    <td>Payment:</td>
                    <td>0.00</td>
                </tr>
                <tr class="bold">
                    <td>Balance Due:</td>
                    <td>{{ "%.2f"|format(order.Total_Discounted_Amount) }}</td>
                </tr>
            </table>
        </div>
    </div>

    <div class="footer">
        {{ settings.invoice_footer or "ALL SALES ARE FINAL! Net prices included defective allowance discount. Please contact us with in 7 days to claim for missing or damage caused by the Carriers. Refused shipment will get bill for a 20% restocking fees, plus both ways freights. Payment received after 10 days from due date will be subject for a $50 fee, or 2%which ever is greater and additional periodic interest charges of up to 1.5% per month." }}
    </div>
</body>
</html>
"""
