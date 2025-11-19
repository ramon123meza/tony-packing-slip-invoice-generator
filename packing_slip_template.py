"""
Packing Slip Template for M&J Toys Inc.
"""

PACKING_SLIP_TEMPLATE = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Packing List {{ order.Order_number }}</title>
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

        .packing-list-title {
            font-size: 32px;
            font-weight: bold;
            font-style: italic;
            letter-spacing: 2px;
            margin: 5px 0;
        }

        .packing-info {
            width: 25%;
            text-align: right;
        }

        .barcode {
            font-size: 24px;
            font-weight: bold;
            margin: 5px 0;
        }

        .invoice-number {
            font-size: 11px;
            margin: 2px 0;
        }

        .page-info {
            font-size: 11px;
            margin: 2px 0;
        }

        .meta-info {
            display: flex;
            justify-content: space-between;
            font-size: 10px;
            margin: 10px 0;
        }

        .meta-left, .meta-right {
            width: 48%;
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
            min-height: 70px;
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

        .totals {
            margin: 10px 0;
            font-size: 10px;
            font-weight: bold;
        }

        .footer {
            margin-top: 10px;
            font-size: 9px;
            text-align: justify;
            line-height: 1.3;
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
                <div class="packing-list-title">Packing List</div>
            </div>
            <div class="packing-info">
                <div class="barcode">*{{ order.Order_number }}*</div>
                <div class="page-info">Page 1 of 1</div>
            </div>
        </div>
    </div>

    <div class="meta-info">
        <div class="meta-left">
            <strong>Invoice No.:</strong> {{ order.Order_number }}&nbsp;&nbsp;&nbsp;&nbsp;
            <strong>Terms:</strong> {{ order.Terms }}
        </div>
        <div class="meta-right" style="text-align: right;">
            <strong>Cases:</strong> {{ order.Total_Case }}&nbsp;&nbsp;&nbsp;&nbsp;
            <strong>Date:</strong> {{ order.Ship_Date }}
        </div>
    </div>

    <div class="customer-info-row">
        <div class="customer-box">
            <div class="box-title">Sold To:</div>
            <div>Attn: {{ order.Recipient_Name }}</div>
            <div><strong>{{ order.Recipient_Company }}</strong></div>
            <div>{{ order.Address1 }}{% if order.Address2 %} {{ order.Address2 }}{% endif %}</div>
            <div>{{ order.City }}, {{ order.State }} {{ order.Postal_Code }}</div>
            <div><br></div>
            <div>Tel: {{ order.Phone }}</div>
        </div>
        <div class="customer-box">
            <div class="box-title">Ship To Address:</div>
            <div>Attn: {{ order.Recipient_Name }}</div>
            <div><strong>{{ order.Recipient_Company }}</strong></div>
            <div>{{ order.Address1 }}{% if order.Address2 %} {{ order.Address2 }}{% endif %}</div>
            <div>{{ order.City }}, {{ order.State }} {{ order.Postal_Code }}, {{ order.Country_Code }}</div>
            <div><br></div>
            <div>Tel:{{ order.Phone }}</div>
        </div>
    </div>

    <table class="order-details">
        <thead>
            <tr>
                <th>Customer ID</th>
                <th>Customer P/O No.</th>
                <th>Order Date</th>
                <th>S/O No.</th>
                <th>Sales Rep.</th>
                <th>Ship Date</th>
                <th>Ship Via</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>{{ order.Customer_ID }}</td>
                <td>{{ order.PO_No }}</td>
                <td>{{ order.SO_Date }}</td>
                <td>{{ order.SO_No }}</td>
                <td>{{ order.Sales_rep }}</td>
                <td>{{ order.Ship_Date }}</td>
                <td>{{ order.ship_via }}</td>
            </tr>
        </tbody>
    </table>

    <table class="items-table">
        <thead>
            <tr>
                <th style="width: 5%;">Line</th>
                <th style="width: 12%;">Item No.</th>
                <th style="width: 8%;">Ship Units</th>
                <th style="width: 5%;">Pack</th>
                <th style="width: 8%;">Loc</th>
                <th style="width: 42%;">Description</th>
                <th style="width: 8%;">ShipQty</th>
                <th style="width: 8%;">Weight</th>
                <th style="width: 8%;">Volume</th>
            </tr>
        </thead>
        <tbody>
            {% for item in order.line_items %}
            <tr>
                <td class="center">{{ item.line_number }}</td>
                <td>{{ item.Item_no }}</td>
                <td class="center">{{ item.Order_Unit }} {{ item.unit }}</td>
                <td class="center">{{ item.Pack }}</td>
                <td class="center">{{ item.Loc }}</td>
                <td>{{ item.Description }}</td>
                <td class="right">{{ item.Ship_Qty }}</td>
                <td class="right">{{ "%.2f"|format(item.Weight) }}</td>
                <td class="right">{{ "%.2f"|format(item.Volume) }}</td>
            </tr>
            {% endfor %}
        </tbody>
    </table>

    <div class="totals">
        <strong>Total:</strong> {{ order.line_items|length }} Items&nbsp;&nbsp;&nbsp;&nbsp;
        Total BX:&nbsp;&nbsp;&nbsp;&nbsp;
        Unit PC:&nbsp;&nbsp;&nbsp;&nbsp;
        <strong>Total CASE:</strong> {{ order.Total_Case }}&nbsp;&nbsp;&nbsp;&nbsp;
        <strong>Actual Cases:</strong> {{ order.Total_Case }}&nbsp;&nbsp;&nbsp;&nbsp;
        {{ order.Total_qty }}&nbsp;&nbsp;&nbsp;&nbsp;
        <strong>{{ "%.2f"|format(order.Total_WT) }}</strong>&nbsp;&nbsp;&nbsp;&nbsp;
        <strong>{{ "%.2f"|format(order.Vol) }}</strong>
    </div>

    <div class="footer">
        {{ settings.packing_slip_footer or "Please carefully inspect the shipment quantities with this packing list , and before you sign complete on the BOL to the Carriers. Missing or damage found, your responsible to write on the BOL, and contact to us within 7 days." }}
    </div>
</body>
</html>
"""
