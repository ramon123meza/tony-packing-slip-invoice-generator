import React, { useState, useEffect } from 'react'
import { generateDocument, generatePDF, saveFieldEdit } from '../api'
import './DocumentPreview.css'

const DocumentPreview = ({ order, documentType, onBack }) => {
  const [htmlContent, setHtmlContent] = useState('')
  const [documentId, setDocumentId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [fieldEdits, setFieldEdits] = useState({})
  const [editingField, setEditingField] = useState(null)
  const [generatingPDF, setGeneratingPDF] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    generateDocumentPreview()
  }, [order, documentType])

  const generateDocumentPreview = async () => {
    setLoading(true)
    setError('')
    try {
      const result = await generateDocument(documentType, order, fieldEdits)
      setHtmlContent(result.html_content)
      setDocumentId(result.document_id)
    } catch (err) {
      console.error('Error generating document:', err)
      setError(err.response?.data?.error || 'Failed to generate document preview')
    } finally {
      setLoading(false)
    }
  }

  const handleFieldEdit = (fieldPath, currentValue) => {
    setEditingField({ path: fieldPath, value: currentValue })
  }

  const handleFieldSave = async () => {
    if (!editingField) return

    const { path, value } = editingField
    const newEdits = { ...fieldEdits, [path]: value }
    setFieldEdits(newEdits)

    // Save to database
    try {
      await saveFieldEdit(documentId, newEdits)
    } catch (err) {
      console.error('Error saving field edit:', err)
    }

    setEditingField(null)

    // Regenerate preview with new edits
    setLoading(true)
    try {
      const result = await generateDocument(documentType, order, newEdits)
      setHtmlContent(result.html_content)
    } catch (err) {
      console.error('Error regenerating document:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadPDF = async () => {
    setGeneratingPDF(true)
    setError('')
    try {
      const result = await generatePDF(htmlContent)
      const pdfBlob = base64ToBlob(result.pdf_content, 'application/pdf')
      const url = window.URL.createObjectURL(pdfBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${documentType}_${order.Order_number}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Error generating PDF:', err)
      setError(err.response?.data?.error || 'Failed to generate PDF')
    } finally {
      setGeneratingPDF(false)
    }
  }

  const handlePrint = () => {
    const printWindow = window.open('', '_blank')
    printWindow.document.write(htmlContent)
    printWindow.document.close()
    setTimeout(() => {
      printWindow.print()
    }, 250)
  }

  const base64ToBlob = (base64, mimeType) => {
    const byteCharacters = atob(base64)
    const byteArrays = []
    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512)
      const byteNumbers = new Array(slice.length)
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i)
      }
      const byteArray = new Uint8Array(byteNumbers)
      byteArrays.push(byteArray)
    }
    return new Blob(byteArrays, { type: mimeType })
  }

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
            🖨️ Print
          </button>
          <button
            onClick={handleDownloadPDF}
            disabled={generatingPDF}
            className="btn btn-success"
          >
            {generatingPDF ? 'Generating...' : '📥 Download PDF'}
          </button>
          <button onClick={onBack} className="btn btn-secondary">
            ← Back
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {editingField && (
        <div className="edit-modal-overlay" onClick={() => setEditingField(null)}>
          <div className="edit-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Edit Field</h3>
            <div className="form-group">
              <label>Value:</label>
              <input
                type="text"
                value={editingField.value}
                onChange={(e) => setEditingField({ ...editingField, value: e.target.value })}
                autoFocus
                onKeyPress={(e) => e.key === 'Enter' && handleFieldSave()}
              />
            </div>
            <div className="modal-actions">
              <button onClick={handleFieldSave} className="btn btn-primary">
                Save
              </button>
              <button onClick={() => setEditingField(null)} className="btn btn-secondary">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="card preview-content">
        {loading ? (
          <div className="preview-loading">
            <div className="spinner"></div>
            <p>Generating preview...</p>
          </div>
        ) : (
          <div className="preview-info">
            <div className="info-box">
              <p><strong>💡 Tip:</strong> Double-click on any field in the preview below to edit it</p>
            </div>
            <div
              className="document-frame"
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            />
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
