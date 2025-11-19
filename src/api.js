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

export default api
