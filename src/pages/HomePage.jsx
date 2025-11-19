import React, { useState } from 'react'
import FileUpload from '../components/FileUpload'
import DocumentPreview from '../components/DocumentPreview'
import './HomePage.css'

const HomePage = () => {
  const [orders, setOrders] = useState([])
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [documentType, setDocumentType] = useState('invoice')
  const [step, setStep] = useState('upload') // upload, select, preview

  const handleFileProcessed = (parsedOrders) => {
    setOrders(parsedOrders)
    if (parsedOrders.length === 1) {
      setSelectedOrder(parsedOrders[0])
      setStep('preview')
    } else {
      setStep('select')
    }
  }

  const handleOrderSelect = (order) => {
    setSelectedOrder(order)
    setStep('preview')
  }

  const handleReset = () => {
    setOrders([])
    setSelectedOrder(null)
    setStep('upload')
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1>Invoice & Packing Slip Generator</h1>
        <p>Upload an Excel file to generate invoices or packing slips</p>
      </div>

      {step === 'upload' && (
        <div className="card">
          <h2>Step 1: Upload Excel File</h2>
          <div className="document-type-selector">
            <label>
              <strong>Select Document Type:</strong>
            </label>
            <div className="radio-group">
              <label className="radio-label">
                <input
                  type="radio"
                  value="invoice"
                  checked={documentType === 'invoice'}
                  onChange={(e) => setDocumentType(e.target.value)}
                />
                <span>Invoice</span>
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  value="packing_slip"
                  checked={documentType === 'packing_slip'}
                  onChange={(e) => setDocumentType(e.target.value)}
                />
                <span>Packing Slip</span>
              </label>
            </div>
          </div>
          <FileUpload onFileProcessed={handleFileProcessed} />
        </div>
      )}

      {step === 'select' && (
        <div className="card">
          <h2>Step 2: Select Order</h2>
          <p>Multiple orders found. Please select one:</p>
          <div className="order-grid">
            {orders.map((order, index) => (
              <div
                key={index}
                className="order-card"
                onClick={() => handleOrderSelect(order)}
              >
                <h3>Order #{order.Order_number}</h3>
                <p><strong>Customer:</strong> {order.Recipient_Company}</p>
                <p><strong>Date:</strong> {order.Invoice_Date}</p>
                <p><strong>Total:</strong> ${order.Total_Discounted_Amount?.toFixed(2)}</p>
                <button className="btn btn-primary">Select</button>
              </div>
            ))}
          </div>
          <button onClick={handleReset} className="btn btn-secondary" style={{ marginTop: '20px' }}>
            Upload Different File
          </button>
        </div>
      )}

      {step === 'preview' && selectedOrder && (
        <DocumentPreview
          order={selectedOrder}
          documentType={documentType}
          onBack={handleReset}
        />
      )}
    </div>
  )
}

export default HomePage
