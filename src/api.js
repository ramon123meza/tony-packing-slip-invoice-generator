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

export const checkHealth = async () => {
  const response = await api.get('/health')
  return response.data
}

export const getHistory = async () => {
  const response = await api.get('/get-history')
  return response.data
}

export const getDocument = async (documentId) => {
  const response = await api.get(`/get-document?document_id=${documentId}`)
  return response.data
}

export const saveDocument = async (documentData) => {
  const response = await api.post('/save-document', { document: documentData })
  return response.data
}

export const generatePDF = async (htmlContent) => {
  // This is a placeholder - PDF generation is now client-side using react-pdf
  // For backwards compatibility, return a mock response
  return {
    pdf_content: '',
    message: 'PDF generation is now handled client-side'
  }
}

export default api
