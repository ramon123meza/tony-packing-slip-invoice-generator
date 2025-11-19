import React from 'react'
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'

// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 14,
    fontSize: 11,
    fontFamily: 'Helvetica',
    color: 'black',
  },
  header: {
    borderBottom: '2px solid black',
    paddingBottom: 5,
    marginBottom: 10,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  logoSection: {
    width: '25%',
  },
  logo: {
    width: 120,
    height: 'auto',
  },
  companyInfo: {
    width: '50%',
    textAlign: 'center',
  },
  companyName: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  companyWebsite: {
    fontSize: 12,
    marginTop: 2,
  },
  companyAddress: {
    fontSize: 10,
    marginTop: 2,
  },
  invoiceTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    fontStyle: 'italic',
    letterSpacing: 4,
    marginTop: 5,
  },
  invoiceInfo: {
    width: '25%',
    textAlign: 'right',
  },
  barcode: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 5,
  },
  invoiceNumber: {
    fontSize: 11,
    marginTop: 2,
  },
  metaInfo: {
    textAlign: 'center',
    fontSize: 10,
    marginTop: 5,
    marginBottom: 5,
  },
  customerInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 10,
  },
  customerBox: {
    width: '48%',
    border: '1px solid black',
    padding: 8,
    minHeight: 80,
    fontSize: 10,
  },
  boxTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  table: {
    display: 'table',
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: 10,
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1px solid black',
  },
  tableHeader: {
    backgroundColor: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 4,
    fontSize: 10,
    borderLeft: '1px solid black',
    borderTop: '1px solid black',
    borderRight: '1px solid black',
  },
  tableCell: {
    padding: 4,
    fontSize: 10,
    borderLeft: '1px solid black',
    borderRight: '1px solid black',
    textAlign: 'center',
  },
  tableCellRight: {
    padding: 4,
    fontSize: 10,
    borderLeft: '1px solid black',
    borderRight: '1px solid black',
    textAlign: 'right',
  },
  totalsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 10,
  },
  totalsLeft: {
    width: '55%',
    fontSize: 10,
  },
  totalsRight: {
    width: '40%',
  },
  totalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 2,
    fontSize: 10,
  },
  totalsRowBold: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 2,
    fontSize: 10,
    fontWeight: 'bold',
  },
  footer: {
    marginTop: 10,
    fontSize: 9,
    textAlign: 'justify',
    lineHeight: 1.3,
  },
})

const InvoiceTemplate = ({ order, settings }) => {
  const defaultSettings = {
    company_name: 'M&J Toys Inc.',
    company_website: 'MJTOYSINC.COM',
    company_address: '16700 GALE AVE, CITY OF INDUSTRY, CA 91745',
    company_phone: '(626) 330-3882',
    company_fax: '(626) 330-3108',
    logo_url: '/api/logo',
    default_fob: 'CITY OF INDUSTR',
    invoice_footer: 'ALL SALES ARE FINAL! Net prices included defective allowance discount. Please contact us with in 7 days to claim for missing or damage caused by the Carriers. Refused shipment will get bill for a 20% restocking fees, plus both ways freights. Payment received after 10 days from due date will be subject for a $50 fee, or 2%which ever is greater and additional periodic interest charges of up to 1.5% per month.',
  }

  const mergedSettings = { ...defaultSettings, ...settings }

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.logoSection}>
              <Image style={styles.logo} src={mergedSettings.logo_url} />
            </View>
            <View style={styles.companyInfo}>
              <Text style={styles.companyName}>{mergedSettings.company_name}</Text>
              <Text style={styles.companyWebsite}>{mergedSettings.company_website}</Text>
              <Text style={styles.companyAddress}>{mergedSettings.company_address}</Text>
              <Text style={styles.companyAddress}>
                Tel: {mergedSettings.company_phone}    Fax: {mergedSettings.company_fax}
              </Text>
              <Text style={styles.invoiceTitle}>I N V O I C E</Text>
            </View>
            <View style={styles.invoiceInfo}>
              <Text style={styles.barcode}>*{order.Order_number}*</Text>
              <Text style={styles.invoiceNumber}>Invoice No.: {order.Order_number}</Text>
              <Text style={styles.invoiceNumber}>Date: {order.Invoice_Date}</Text>
            </View>
          </View>
        </View>

        {/* Meta Info */}
        <View style={styles.metaInfo}>
          <Text>
            Customer ID: {order.Customer_ID}      Ship Date: {order.Ship_Date}      Page: 1
          </Text>
        </View>

        {/* Customer Info */}
        <View style={styles.customerInfoRow}>
          <View style={styles.customerBox}>
            <Text style={styles.boxTitle}>Sold To:</Text>
            <Text>Attn: {order.Recipient_Name}</Text>
            <Text style={{ fontWeight: 'bold' }}>{order.Recipient_Company}</Text>
            <Text>{order.Address1}{order.Address2 ? ' ' + order.Address2 : ''}</Text>
            <Text>{order.City}, {order.State} {order.Postal_Code}</Text>
            <Text>{'\n'}</Text>
            <Text>Tel: {order.Phone}    Fax: {order.Fax}</Text>
          </View>
          <View style={styles.customerBox}>
            <Text style={styles.boxTitle}>Ship To:</Text>
            <Text>Attn: {order.Recipient_Name}</Text>
            <Text style={{ fontWeight: 'bold' }}>{order.Recipient_Company}</Text>
            <Text>{order.Address1}{order.Address2 ? ' ' + order.Address2 : ''}</Text>
            <Text>{order.City}, {order.State} {order.Postal_Code}, {order.Country_Code}</Text>
            <Text>{'\n'}</Text>
            <Text>Tel: {order.Phone}</Text>
          </View>
        </View>

        {/* Order Details Table */}
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text style={[styles.tableHeader, { width: '12.5%' }]}>S/O No.</Text>
            <Text style={[styles.tableHeader, { width: '12.5%' }]}>S/O Date</Text>
            <Text style={[styles.tableHeader, { width: '12.5%' }]}>P/O No.</Text>
            <Text style={[styles.tableHeader, { width: '12.5%' }]}>Sales Rep.</Text>
            <Text style={[styles.tableHeader, { width: '12.5%' }]}>Ship Via</Text>
            <Text style={[styles.tableHeader, { width: '12.5%' }]}>F.O.B.</Text>
            <Text style={[styles.tableHeader, { width: '12.5%' }]}>Terms</Text>
            <Text style={[styles.tableHeader, { width: '12.5%' }]}>Due Date</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={[styles.tableCell, { width: '12.5%' }]}>{order.SO_No}</Text>
            <Text style={[styles.tableCell, { width: '12.5%' }]}>{order.SO_Date}</Text>
            <Text style={[styles.tableCell, { width: '12.5%' }]}>{order.PO_No}</Text>
            <Text style={[styles.tableCell, { width: '12.5%' }]}>{order.Sales_rep}</Text>
            <Text style={[styles.tableCell, { width: '12.5%' }]}>{order.ship_via}</Text>
            <Text style={[styles.tableCell, { width: '12.5%' }]}>{mergedSettings.default_fob}</Text>
            <Text style={[styles.tableCell, { width: '12.5%', fontWeight: 'bold' }]}>{order.Terms}</Text>
            <Text style={[styles.tableCell, { width: '12.5%' }]}>{order.Date_Paid}</Text>
          </View>
        </View>

        {/* Items Table */}
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text style={[styles.tableHeader, { width: '5%' }]}>Line#</Text>
            <Text style={[styles.tableHeader, { width: '8%' }]}>Order{'\n'}Unit</Text>
            <Text style={[styles.tableHeader, { width: '5%' }]}>Unit</Text>
            <Text style={[styles.tableHeader, { width: '5%' }]}>Pack</Text>
            <Text style={[styles.tableHeader, { width: '12%' }]}>Item No.</Text>
            <Text style={[styles.tableHeader, { width: '35%' }]}>Description</Text>
            <Text style={[styles.tableHeader, { width: '8%' }]}>Ship{'\n'}Qty (PC)</Text>
            <Text style={[styles.tableHeader, { width: '8%' }]}>Pricelist</Text>
            <Text style={[styles.tableHeader, { width: '10%' }]}>Ext. Amount</Text>
            <Text style={[styles.tableHeader, { width: '8%' }]}>Net Price</Text>
          </View>
          {order.line_items?.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={[styles.tableCell, { width: '5%' }]}>{item.line_number}</Text>
              <Text style={[styles.tableCellRight, { width: '8%' }]}>{item.Order_Unit}</Text>
              <Text style={[styles.tableCell, { width: '5%' }]}>{item.unit}</Text>
              <Text style={[styles.tableCellRight, { width: '5%' }]}>{item.Pack}</Text>
              <Text style={[styles.tableCell, { width: '12%' }]}>{item.Item_no}</Text>
              <Text style={[styles.tableCell, { width: '35%' }]}>{item.Description}</Text>
              <Text style={[styles.tableCellRight, { width: '8%' }]}>{item.Ship_Qty}</Text>
              <Text style={[styles.tableCellRight, { width: '8%' }]}>{(item.Net_Price * 0.86).toFixed(3)}</Text>
              <Text style={[styles.tableCellRight, { width: '10%' }]}>{item.Extended_Price.toFixed(3)}</Text>
              <Text style={[styles.tableCellRight, { width: '8%' }]}>{item.Net_Price.toFixed(3)}</Text>
            </View>
          ))}
        </View>

        {/* Totals Section */}
        <View style={styles.totalsSection}>
          <View style={styles.totalsLeft}>
            <Text>
              Total BX:    Total Wt: {order.Total_WT?.toFixed(2)}   Unit PC:
              Vol.: {order.Vol?.toFixed(2)}   Total CASE: {order.Total_Case}
              Total PC: {order.Total_qty}
            </Text>
          </View>
          <View style={styles.totalsRight}>
            <View style={styles.totalsRowBold}>
              <Text>Sales Amount:</Text>
              <Text>{order.Sales_Amount?.toFixed(2)}</Text>
            </View>
            <View style={styles.totalsRow}>
              <Text>Discount {Math.floor(order.Discount || 0)}%:</Text>
              <Text>{(-order.Total_Discount)?.toFixed(2)}</Text>
            </View>
            <View style={styles.totalsRow}>
              <Text>Tax %:</Text>
              <Text>0.00</Text>
            </View>
            <View style={styles.totalsRow}>
              <Text>Shipping & Handling:</Text>
              <Text>{order.Shipping_Handling?.toFixed(2)}</Text>
            </View>
            <View style={styles.totalsRowBold}>
              <Text>Total Amount:</Text>
              <Text>{order.Total_Discounted_Amount?.toFixed(2)}</Text>
            </View>
            <View style={styles.totalsRow}>
              <Text>Payment:</Text>
              <Text>0.00</Text>
            </View>
            <View style={styles.totalsRowBold}>
              <Text>Balance Due:</Text>
              <Text>{order.Total_Discounted_Amount?.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>{mergedSettings.invoice_footer}</Text>
        </View>
      </Page>
    </Document>
  )
}

export default InvoiceTemplate
