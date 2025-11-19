import React, { useState, useEffect } from 'react'
import { getSettings, updateSettings, uploadLogo } from '../api'
import './SettingsPage.css'

const SettingsPage = () => {
  const [settings, setSettings] = useState({
    company_name: '',
    company_website: '',
    company_address: '',
    company_phone: '',
    company_fax: '',
    logo_url: '',
    default_fob: '',
    invoice_footer: '',
    packing_slip_footer: ''
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    setLoading(true)
    try {
      const result = await getSettings()
      if (result.settings) {
        setSettings(result.settings)
      }
    } catch (err) {
      console.error('Error loading settings:', err)
      setError('Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field, value) => {
    setSettings({ ...settings, [field]: value })
    setSuccess('')
    setError('')
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      await updateSettings(settings)
      setSuccess('Settings saved successfully!')
    } catch (err) {
      console.error('Error saving settings:', err)
      setError('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    setUploadingLogo(true)
    setError('')
    setSuccess('')

    try {
      const reader = new FileReader()
      reader.onload = async (event) => {
        try {
          const base64 = event.target.result.split(',')[1]
          const result = await uploadLogo(base64, file.name)
          if (result.logo_url) {
            setSettings({ ...settings, logo_url: result.logo_url })
            setSuccess('Logo uploaded successfully!')
            // Reload settings to get updated logo URL
            await loadSettings()
          }
        } catch (err) {
          console.error('Error uploading logo:', err)
          setError('Failed to upload logo')
        } finally {
          setUploadingLogo(false)
        }
      }
      reader.readAsDataURL(file)
    } catch (err) {
      console.error('Error reading file:', err)
      setError('Failed to read file')
      setUploadingLogo(false)
    }
  }

  if (loading) {
    return (
      <div className="container">
        <div className="card">
          <div className="spinner"></div>
          <p style={{ textAlign: 'center', marginTop: '20px' }}>Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1>Settings</h1>
        <p>Configure company information and templates</p>
      </div>

      {success && (
        <div className="alert alert-success">
          {success}
        </div>
      )}

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      <div className="card">
        <h2>Company Logo</h2>
        <div className="logo-section">
          {settings.logo_url && (
            <div className="current-logo">
              <img src={settings.logo_url} alt="Company Logo" />
            </div>
          )}
          <div className="logo-upload">
            <input
              type="file"
              id="logo-upload"
              accept="image/*"
              onChange={handleLogoUpload}
              style={{ display: 'none' }}
            />
            <label htmlFor="logo-upload" className="btn btn-secondary">
              {uploadingLogo ? 'Uploading...' : '📷 Upload New Logo'}
            </label>
            <p className="help-text">Recommended: PNG or JPG, max 500KB</p>
          </div>
        </div>
      </div>

      <div className="card">
        <h2>Company Information</h2>
        <div className="settings-grid">
          <div className="form-group">
            <label>Company Name</label>
            <input
              type="text"
              value={settings.company_name}
              onChange={(e) => handleChange('company_name', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Website</label>
            <input
              type="text"
              value={settings.company_website}
              onChange={(e) => handleChange('company_website', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Address</label>
            <input
              type="text"
              value={settings.company_address}
              onChange={(e) => handleChange('company_address', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Phone</label>
            <input
              type="text"
              value={settings.company_phone}
              onChange={(e) => handleChange('company_phone', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Fax</label>
            <input
              type="text"
              value={settings.company_fax}
              onChange={(e) => handleChange('company_fax', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Default F.O.B.</label>
            <input
              type="text"
              value={settings.default_fob}
              onChange={(e) => handleChange('default_fob', e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="card">
        <h2>Document Footers</h2>

        <div className="form-group">
          <label>Invoice Footer</label>
          <textarea
            rows="4"
            value={settings.invoice_footer}
            onChange={(e) => handleChange('invoice_footer', e.target.value)}
            placeholder="Footer text for invoices..."
          />
        </div>

        <div className="form-group">
          <label>Packing Slip Footer</label>
          <textarea
            rows="4"
            value={settings.packing_slip_footer}
            onChange={(e) => handleChange('packing_slip_footer', e.target.value)}
            placeholder="Footer text for packing slips..."
          />
        </div>
      </div>

      <div className="save-section">
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn btn-success btn-save"
        >
          {saving ? 'Saving...' : '💾 Save All Settings'}
        </button>
      </div>
    </div>
  )
}

export default SettingsPage
