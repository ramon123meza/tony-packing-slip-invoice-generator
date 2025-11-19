import React, { useState } from 'react'
import { parseExcel } from '../api'
import './FileUpload.css'

const FileUpload = ({ onFileProcessed }) => {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      if (selectedFile.name.endsWith('.xlsx') || selectedFile.name.endsWith('.xls')) {
        setFile(selectedFile)
        setError('')
      } else {
        setError('Please select an Excel file (.xlsx or .xls)')
        setFile(null)
      }
    }
  }

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Read file as base64
      const reader = new FileReader()
      reader.onload = async (e) => {
        try {
          const base64 = e.target.result.split(',')[1]

          // Parse Excel file
          const result = await parseExcel(base64)

          if (result.orders && result.orders.length > 0) {
            onFileProcessed(result.orders)
          } else {
            setError('No orders found in the Excel file')
          }
        } catch (err) {
          console.error('Error parsing Excel:', err)
          setError(err.response?.data?.error || 'Failed to parse Excel file. Please check the file format.')
        } finally {
          setLoading(false)
        }
      }
      reader.onerror = () => {
        setError('Failed to read file')
        setLoading(false)
      }
      reader.readAsDataURL(file)
    } catch (err) {
      console.error('Error uploading file:', err)
      setError('An error occurred while uploading the file')
      setLoading(false)
    }
  }

  return (
    <div className="file-upload">
      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      <div className="upload-area">
        <input
          type="file"
          id="file-input"
          accept=".xlsx,.xls"
          onChange={handleFileChange}
          className="file-input"
        />
        <label htmlFor="file-input" className="file-label">
          <div className="upload-icon">📁</div>
          <div className="upload-text">
            {file ? (
              <>
                <strong>{file.name}</strong>
                <span>Click to change file</span>
              </>
            ) : (
              <>
                <strong>Click to upload Excel file</strong>
                <span>or drag and drop</span>
              </>
            )}
          </div>
        </label>
      </div>

      <button
        onClick={handleUpload}
        disabled={!file || loading}
        className="btn btn-primary btn-upload"
      >
        {loading ? (
          <>
            <div className="spinner" style={{ width: '20px', height: '20px', borderWidth: '3px' }}></div>
            Processing...
          </>
        ) : (
          'Process File'
        )}
      </button>

      <div className="upload-info">
        <p><strong>Excel File Format:</strong></p>
        <ul>
          <li>Supported formats: .xlsx, .xls</li>
          <li>Must contain Order_number column</li>
          <li>See sample template for reference</li>
        </ul>
      </div>
    </div>
  )
}

export default FileUpload
