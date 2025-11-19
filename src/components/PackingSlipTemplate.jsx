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
  packingListTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    fontStyle: 'italic',
    letterSpacing: 2,
    marginTop: 5,
  },
  packingInfo: {
    width: '25%',
    textAlign: 'right',
  },
  barcode: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 5,
  },
  pageInfo: {
    fontSize: 11,
    marginTop: 2,
  },
  metaInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 10,
    marginTop: 10,
    marginBottom: 10,
  },
  metaLeft: {
    width: '48%',
  },
  metaRight: {
    width: '48%',
    textAlign: 'right',
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
    minHeight: 70,
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
  totals: {
    marginTop: 10,
    marginBottom: 10,
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

const PackingSlipTemplate = ({ order, settings }) => {
  const defaultSettings = {
    company_name: 'M&J Toys Inc.',
    company_website: 'MJTOYSINC.COM',
    company_address: '16700 GALE AVE, CITY OF INDUSTRY, CA 91745',
    company_phone: '(626) 330-3882',
    company_fax: '(626) 330-3108',
    logo_url: 'https://prompt-images-nerd.s3.us-east-1.amazonaws.com/logo_toys.png',
    packing_slip_footer: 'Please carefully inspect the shipment quantities with this packing list , and before you sign complete on the BOL to the Carriers. Missing or damage found, your responsible to write on the BOL, and contact to us within 7 days.',
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
              <Text style={styles.packingListTitle}>Packing List</Text>
            </View>
            <View style={styles.packingInfo}>
              <Text style={styles.barcode}>*{order.Order_number}*</Text>
              <Text style={styles.pageInfo}>Page 1 of 1</Text>
            </View>
          </View>
        </View>

        {/* Meta Info */}
        <View style={styles.metaInfo}>
          <View style={styles.metaLeft}>
            <Text>Invoice No.: {order.Order_number}    Terms: {order.Terms}</Text>
          </View>
          <View style={styles.metaRight}>
            <Text>Cases: {order.Total_Case}    Date: {order.Ship_Date}</Text>
          </View>
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
            <Text>Tel: {order.Phone}</Text>
          </View>
          <View style={styles.customerBox}>
            <Text style={styles.boxTitle}>Ship To Address:</Text>
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
            <Text style={[styles.tableHeader, { width: '14.28%' }]}>Customer ID</Text>
            <Text style={[styles.tableHeader, { width: '14.28%' }]}>Customer P/O No.</Text>
            <Text style={[styles.tableHeader, { width: '14.28%' }]}>Order Date</Text>
            <Text style={[styles.tableHeader, { width: '14.28%' }]}>S/O No.</Text>
            <Text style={[styles.tableHeader, { width: '14.28%' }]}>Sales Rep.</Text>
            <Text style={[styles.tableHeader, { width: '14.28%' }]}>Ship Date</Text>
            <Text style={[styles.tableHeader, { width: '14.28%' }]}>Ship Via</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={[styles.tableCell, { width: '14.28%' }]}>{order.Customer_ID}</Text>
            <Text style={[styles.tableCell, { width: '14.28%' }]}>{order.PO_No}</Text>
            <Text style={[styles.tableCell, { width: '14.28%' }]}>{order.SO_Date}</Text>
            <Text style={[styles.tableCell, { width: '14.28%' }]}>{order.SO_No}</Text>
            <Text style={[styles.tableCell, { width: '14.28%' }]}>{order.Sales_rep}</Text>
            <Text style={[styles.tableCell, { width: '14.28%' }]}>{order.Ship_Date}</Text>
            <Text style={[styles.tableCell, { width: '14.28%' }]}>{order.ship_via}</Text>
          </View>
        </View>

        {/* Items Table */}
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text style={[styles.tableHeader, { width: '5%' }]}>Line</Text>
            <Text style={[styles.tableHeader, { width: '12%' }]}>Item No.</Text>
            <Text style={[styles.tableHeader, { width: '8%' }]}>Ship Units</Text>
            <Text style={[styles.tableHeader, { width: '5%' }]}>Pack</Text>
            <Text style={[styles.tableHeader, { width: '8%' }]}>Loc</Text>
            <Text style={[styles.tableHeader, { width: '42%' }]}>Description</Text>
            <Text style={[styles.tableHeader, { width: '8%' }]}>ShipQty</Text>
            <Text style={[styles.tableHeader, { width: '8%' }]}>Weight</Text>
            <Text style={[styles.tableHeader, { width: '8%' }]}>Volume</Text>
          </View>
          {order.line_items?.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={[styles.tableCell, { width: '5%' }]}>{item.line_number}</Text>
              <Text style={[styles.tableCell, { width: '12%' }]}>{item.Item_no}</Text>
              <Text style={[styles.tableCell, { width: '8%' }]}>{item.Order_Unit} {item.unit}</Text>
              <Text style={[styles.tableCell, { width: '5%' }]}>{item.Pack}</Text>
              <Text style={[styles.tableCell, { width: '8%' }]}>{item.Loc}</Text>
              <Text style={[styles.tableCell, { width: '42%' }]}>{item.Description}</Text>
              <Text style={[styles.tableCellRight, { width: '8%' }]}>{item.Ship_Qty}</Text>
              <Text style={[styles.tableCellRight, { width: '8%' }]}>{item.Weight?.toFixed(2)}</Text>
              <Text style={[styles.tableCellRight, { width: '8%' }]}>{item.Volume?.toFixed(2)}</Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totals}>
          <Text>
            Total: {order.line_items?.length || 0} Items    Total BX:    Unit PC:
            Total CASE: {order.Total_Case}    Actual Cases: {order.Total_Case}
            {order.Total_qty}    {order.Total_WT?.toFixed(2)}    {order.Vol?.toFixed(2)}
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>{mergedSettings.packing_slip_footer}</Text>
        </View>
      </Page>
    </Document>
  )
}

export default PackingSlipTemplate
