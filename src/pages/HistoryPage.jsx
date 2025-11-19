import React, { useState, useEffect } from 'react'
import { PDFViewer, pdf } from '@react-pdf/renderer'
import { getHistory, getDocument, getSettings } from '../api'
import InvoiceTemplate from '../components/InvoiceTemplate'
import PackingSlipTemplate from '../components/PackingSlipTemplate'
import './HistoryPage.css'

const HistoryPage = () => {
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedDoc, setSelectedDoc] = useState(null)
  const [generatingPDF, setGeneratingPDF] = useState(null)
  const [settings, setSettings] = useState({})

  useEffect(() => {
    loadHistory()
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const result = await getSettings()
      setSettings(result.settings || {})
    } catch (err) {
      console.error('Error loading settings:', err)
      setSettings({})
    }
  }

  const loadHistory = async () => {
    setLoading(true)
    setError('')
    try {
      const result = await getHistory()
      if (result.documents) {
        setDocuments(result.documents)
      }
    } catch (err) {
      console.error('Error loading history:', err)
      setError('Failed to load document history')
    } finally {
      setLoading(false)
    }
  }

  const handleViewDocument = async (documentId) => {
    try {
      const result = await getDocument(documentId)
      if (result.document) {
        setSelectedDoc(result.document)
      }
    } catch (err) {
      console.error('Error loading document:', err)
      setError('Failed to load document')
    }
  }

  const handleDownloadPDF = async (doc) => {
    setGeneratingPDF(doc.document_id)
    try {
      // Regenerate PDF from order data
      const DocumentComponent = doc.document_type === 'invoice' ? InvoiceTemplate : PackingSlipTemplate
      const blob = await pdf(<DocumentComponent order={doc.order_data} settings={settings} />).toBlob()

      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${doc.document_type}_${doc.order_number}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Error generating PDF:', err)
      setError('Failed to generate PDF')
    } finally {
      setGeneratingPDF(null)
    }
  }

  const handlePrintDocument = async (doc) => {
    try {
      // Regenerate PDF for printing
      const DocumentComponent = doc.document_type === 'invoice' ? InvoiceTemplate : PackingSlipTemplate
      const blob = await pdf(<DocumentComponent order={doc.order_data} settings={settings} />).toBlob()

      const url = window.URL.createObjectURL(blob)
      const printWindow = window.open(url, '_blank')
      if (printWindow) {
        printWindow.addEventListener('load', () => {
          printWindow.print()
        })
      }
    } catch (err) {
      console.error('Error printing document:', err)
      setError('Failed to print document')
    }
  }

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return dateString
    }
  }

  if (loading) {
    return (
      <div className="container">
        <div className="card">
          <div className="spinner"></div>
          <p style={{ textAlign: 'center', marginTop: '20px' }}>Loading history...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1>Document History</h1>
        <p>View and download previously generated documents</p>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {selectedDoc && (
        <div className="modal-overlay" onClick={() => setSelectedDoc(null)}>
          <div className="preview-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {selectedDoc.document_type === 'invoice' ? 'Invoice' : 'Packing Slip'} #{selectedDoc.order_number}
              </h2>
              <button onClick={() => setSelectedDoc(null)} className="close-btn">
                ✕
              </button>
            </div>
            <div className="modal-body">
              <PDFViewer width="100%" height="600px">
                {selectedDoc.document_type === 'invoice' ? (
                  <InvoiceTemplate order={selectedDoc.order_data} settings={settings} />
                ) : (
                  <PackingSlipTemplate order={selectedDoc.order_data} settings={settings} />
                )}
              </PDFViewer>
            </div>
            <div className="modal-footer">
              <button
                onClick={() => handlePrintDocument(selectedDoc)}
                className="btn btn-secondary"
              >
                🖨️ Print
              </button>
              <button
                onClick={() => handleDownloadPDF(selectedDoc)}
                disabled={generatingPDF === selectedDoc.document_id}
                className="btn btn-success"
              >
                {generatingPDF === selectedDoc.document_id ? 'Generating...' : '📥 Download PDF'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        {documents.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📄</div>
            <h3>No Documents Yet</h3>
            <p>Generated documents will appear here</p>
          </div>
        ) : (
          <div className="documents-table">
            <table>
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Type</th>
                  <th>Customer</th>
                  <th>Date Generated</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => (
                  <tr key={doc.document_id}>
                    <td className="order-number">#{doc.order_number}</td>
                    <td>
                      <span className={`badge badge-${doc.document_type}`}>
                        {doc.document_type === 'invoice' ? '🧾 Invoice' : '📦 Packing Slip'}
                      </span>
                    </td>
                    <td>{doc.order_data?.Recipient_Company || 'N/A'}</td>
                    <td>{formatDate(doc.created_at)}</td>
                    <td className="actions">
                      <button
                        onClick={() => handleViewDocument(doc.document_id)}
                        className="btn-action btn-view"
                        title="View"
                      >
                        👁️
                      </button>
                      <button
                        onClick={() => handlePrintDocument(doc)}
                        className="btn-action btn-print"
                        title="Print"
                      >
                        🖨️
                      </button>
                      <button
                        onClick={() => handleDownloadPDF(doc)}
                        disabled={generatingPDF === doc.document_id}
                        className="btn-action btn-download"
                        title="Download PDF"
                      >
                        {generatingPDF === doc.document_id ? '⏳' : '📥'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {documents.length > 0 && (
        <div className="history-stats card">
          <h3>Statistics</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-value">{documents.length}</div>
              <div className="stat-label">Total Documents</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">
                {documents.filter(d => d.document_type === 'invoice').length}
              </div>
              <div className="stat-label">Invoices</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">
                {documents.filter(d => d.document_type === 'packing_slip').length}
              </div>
              <div className="stat-label">Packing Slips</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default HistoryPage
