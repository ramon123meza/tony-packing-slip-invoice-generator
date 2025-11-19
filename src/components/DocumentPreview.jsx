import React, { useState, useEffect } from 'react'
import { PDFViewer, PDFDownloadLink, pdf } from '@react-pdf/renderer'
import InvoiceTemplate from './InvoiceTemplate'
import PackingSlipTemplate from './PackingSlipTemplate'
import { getSettings, saveDocument } from '../api'
import './DocumentPreview.css'

const DocumentPreview = ({ order, documentType, onBack }) => {
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    setLoading(true)
    setError('')
    try {
      const result = await getSettings()
      setSettings(result.settings || {})

      // Save document to history after settings are loaded
      await saveDocumentToHistory()
    } catch (err) {
      console.error('Error loading settings:', err)
      // Use default settings if API fails
      setSettings({})

      // Still try to save document even if settings fail
      try {
        await saveDocumentToHistory()
      } catch (saveErr) {
        console.error('Error saving document to history:', saveErr)
      }
    } finally {
      setLoading(false)
    }
  }

  const saveDocumentToHistory = async () => {
    try {
      const documentData = {
        order_number: order.Order_number,
        document_type: documentType,
        order_data: order,
        html_content: '', // Not storing HTML since we're using React PDF
        created_at: new Date().toISOString()
      }

      await saveDocument(documentData)
      console.log('Document saved to history successfully')
    } catch (err) {
      console.error('Failed to save document to history:', err)
      // Don't show error to user - this is a background operation
    }
  }

  const handlePrint = async () => {
    try {
      // Generate the PDF blob
      const DocumentComponent = documentType === 'invoice' ? InvoiceTemplate : PackingSlipTemplate
      const blob = await pdf(<DocumentComponent order={order} settings={settings} />).toBlob()

      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob)

      // Open in new window for printing
      const printWindow = window.open(url, '_blank')
      if (printWindow) {
        printWindow.addEventListener('load', () => {
          printWindow.print()
        })
      }
    } catch (err) {
      console.error('Error printing:', err)
      setError('Failed to print document')
    }
  }

  const DocumentComponent = documentType === 'invoice' ? InvoiceTemplate : PackingSlipTemplate
  const filename = `${documentType}_${order.Order_number}.pdf`

  return (
    <div className="document-preview-container">
      <div className="preview-header card">
        <div className="preview-title">
          <h2>
            {documentType === 'invoice' ? 'Invoice' : 'Packing Slip'} Preview
          </h2>
          <p>Order #{order.Order_number}</p>
        </div>
        <div className="preview-actions">
          <button onClick={handlePrint} className="btn btn-secondary">
            Print
          </button>
          {!loading && settings && (
            <PDFDownloadLink
              document={<DocumentComponent order={order} settings={settings} />}
              fileName={filename}
              className="btn btn-success"
            >
              {({ loading: pdfLoading }) =>
                pdfLoading ? 'Preparing PDF...' : 'Download PDF'
              }
            </PDFDownloadLink>
          )}
          <button onClick={onBack} className="btn btn-secondary">
            Back
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      <div className="card preview-content">
        {loading ? (
          <div className="preview-loading">
            <div className="spinner"></div>
            <p>Loading settings...</p>
          </div>
        ) : (
          <div className="preview-info">
            <div className="info-box">
              <p><strong>Preview:</strong> This is a live preview of your document</p>
            </div>
            <div className="pdf-viewer-container">
              <PDFViewer
                width="100%"
                height="800px"
                showToolbar={true}
              >
                <DocumentComponent order={order} settings={settings} />
              </PDFViewer>
            </div>
          </div>
        )}
      </div>

      <div className="card order-details-summary">
        <h3>Order Summary</h3>
        <div className="summary-grid">
          <div className="summary-item">
            <strong>Order Number:</strong>
            <span>{order.Order_number}</span>
          </div>
          <div className="summary-item">
            <strong>Customer:</strong>
            <span>{order.Recipient_Company}</span>
          </div>
          <div className="summary-item">
            <strong>Total Items:</strong>
            <span>{order.line_items?.length || 0}</span>
          </div>
          {documentType === 'invoice' && (
            <div className="summary-item">
              <strong>Total Amount:</strong>
              <span>${order.Total_Discounted_Amount?.toFixed(2)}</span>
            </div>
          )}
          <div className="summary-item">
            <strong>Total Cases:</strong>
            <span>{order.Total_Case}</span>
          </div>
          <div className="summary-item">
            <strong>Total Weight:</strong>
            <span>{order.Total_WT?.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DocumentPreview
