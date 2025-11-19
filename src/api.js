import axios from 'axios'

// Lambda Function URL - No need for environment variables
const API_BASE_URL = 'https://iuymyhaagv6rta66lg24ghep2i0cchks.lambda-url.us-east-1.on.aws'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

export const parseExcel = async (fileContent) => {
  const response = await api.post('/parse-excel', { file_content: fileContent })
  return response.data
}

export const generateDocument = async (type, orderData, fieldEdits = {}) => {
  const response = await api.post('/generate-document', {
    type,
    order_data: orderData,
    field_edits: fieldEdits
  })
  return response.data
}

export const saveFieldEdit = async (documentId, fieldEdits) => {
  const response = await api.post('/save-field-edit', {
    document_id: documentId,
    field_edits: fieldEdits
  })
  return response.data
}

export const getFieldEdits = async (documentId) => {
  const response = await api.post('/get-field-edits', { document_id: documentId })
  return response.data
}

export const getHistory = async () => {
  const response = await api.get('/get-history')
  return response.data
}

export const getDocument = async (documentId) => {
  const response = await api.post('/get-document', { document_id: documentId })
  return response.data
}

export const getSettings = async () => {
  const response = await api.get('/get-settings')
  return response.data
}

export const updateSettings = async (settings) => {
  const response = await api.post('/update-settings', { settings })
  return response.data
}

export const uploadLogo = async (logoContent, filename) => {
  const response = await api.post('/upload-logo', {
    logo_content: logoContent,
    filename
  })
  return response.data
}

export const generatePDF = async (htmlContent) => {
  const response = await api.post('/generate-pdf', { html_content: htmlContent })
  return response.data
}

export const checkHealth = async () => {
  const response = await api.get('/health')
  return response.data
}

export default api
