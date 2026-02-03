import axios from 'axios'

const API_BASE_URL = 'http://127.0.0.1:8000/api/v1'

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth-token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Auth API
export const authApi = {
  login: async (credentials: { username: string; password: string }) => {
    try {
      console.log('Attempting login with:', { username: credentials.username })
      const response = await api.post('/accounts/login/', credentials)
      console.log('Login response:', response)
      return response
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  },
  
  register: async (userData: any) => {
    try {
      console.log('Attempting registration with:', { username: userData.username, email: userData.email })
      const response = await api.post('/accounts/api/register/', userData)
      console.log('Registration response:', response)
      return response
    } catch (error) {
      console.error('Registration error:', error)
      throw error
    }
  },
  
  forgotPassword: (email: string) =>
    api.post('/accounts/forgot-password/', { email }),
  
  resetPassword: (uid: string, token: string, password: string) =>
    api.post('/accounts/reset-password/', { uid, token, password }),
  
  send2FACode: (email: string) =>
    api.post('/accounts/2fa/send-code/', { email }),
  
  verify2FACode: (code: string) =>
    api.post('/accounts/2fa/verify/', { code }),
  
  checkUsername: (username: string) =>
    api.get(`/accounts/api/check-username/?username=${username}`),
  
  checkEmail: (email: string) =>
    api.get(`/accounts/api/check-email/?email=${email}`),
  
  logout: () => api.post('/accounts/logout/')
}

// Admin API
export const adminApi = {
  getUsers: () => api.get('/accounts/api/admin/users/'),
  createUser: (userData: any) => api.post('/accounts/api/admin/users/', userData),
  updateUser: (userId: number, userData: any) => api.put(`/accounts/api/admin/users/${userId}/`, userData),
  deleteUser: (userId: number) => api.delete(`/accounts/api/admin/users/${userId}/`),
  updateUserRole: (userId: number, role: string) => api.patch(`/accounts/api/admin/users/${userId}/`, { role }),
  updateUserStatus: (userId: number, status: string) => api.patch(`/accounts/api/admin/users/${userId}/`, { is_active: status === 'active' }),
  
  // Language management
  getLanguages: () => api.get('/accounts/api/admin/languages/'),
  createLanguage: (languageData: any) => api.post('/accounts/api/admin/languages/', languageData),
  updateLanguage: (languageId: number, languageData: any) => api.put(`/accounts/api/admin/languages/${languageId}/`, languageData),
  deleteLanguage: (languageId: number) => api.delete(`/accounts/api/admin/languages/${languageId}/`)
}

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.config.url, response.status, response.data)
    return response
  },
  (error) => {
    console.error('API Error:', error.config?.url, error.response?.status, error.response?.data)
    return Promise.reject(error)
  }
)

// Languages API
export const languagesApi = {
  getLanguages: () => api.get('/languages/'),
  createLanguage: (languageData: any) => api.post('/languages/create/', languageData)
}

// Update admin API to use correct endpoints
export const adminApi = {
  getUsers: () => api.get('/accounts/api/admin/users/'),
  createUser: (userData: any) => api.post('/accounts/api/admin/users/', userData),
  updateUser: (userId: number, userData: any) => api.put(`/accounts/api/admin/users/${userId}/`, userData),
  deleteUser: (userId: number) => api.delete(`/accounts/api/admin/users/${userId}/`),
  updateUserRole: (userId: number, role: string) => api.patch(`/accounts/api/admin/users/${userId}/`, { role }),
  updateUserStatus: (userId: number, status: string) => api.patch(`/accounts/api/admin/users/${userId}/`, { is_active: status === 'active' }),
  
  // Language management - use languagesApi endpoints
  getLanguages: () => languagesApi.getLanguages(),
  createLanguage: (languageData: any) => languagesApi.createLanguage(languageData),
  updateLanguage: (languageId: number, languageData: any) => api.put(`/languages/${languageId}/`, languageData),
  deleteLanguage: (languageId: number) => api.delete(`/languages/${languageId}/`)
}