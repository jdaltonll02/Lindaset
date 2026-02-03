import axios from 'axios'

const API_BASE_URL = 'http://127.0.0.1:8000/api/v1'

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth token to requests if available (except for login)
api.interceptors.request.use((config) => {
  // Don't add token to login requests
  if (config.url?.includes('/login/')) {
    return config
  }
  
  const token = localStorage.getItem('auth-token')
  if (token) {
    config.headers.Authorization = `Token ${token}`
  }
  return config
})

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

// Languages API
export const languagesApi = {
  getLanguages: () => api.get('/languages/'),
  createLanguage: (languageData: any) => api.post('/languages/create/', languageData)
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
  getLanguages: () => languagesApi.getLanguages(),
  createLanguage: (languageData: any) => languagesApi.createLanguage(languageData),
  updateLanguage: (languageId: number, languageData: any) => api.put(`/languages/${languageId}/`, languageData),
  deleteLanguage: (languageId: number) => api.delete(`/languages/${languageId}/`)
}

// System API
export const systemApi = {
  getBackups: () => api.get('/system/backups/'),
  createBackup: (data: any) => api.post('/system/backups/', data),
  downloadBackup: (id: string) => api.get(`/system/backups/${id}/`),
  deleteBackup: (id: string) => api.delete(`/system/backups/${id}/`),
  
  getSnapshots: () => api.get('/system/snapshots/'),
  createSnapshot: (data: any) => api.post('/system/snapshots/', data),
  downloadSnapshot: (id: string) => api.get(`/system/snapshots/${id}/`),
  deleteSnapshot: (id: string) => api.delete(`/system/snapshots/${id}/`),
  restoreSnapshot: (id: string) => api.post(`/system/snapshots/${id}/`)
}

// Roles API
export const rolesApi = {
  getPermissions: () => api.get('/roles/permissions/'),
  getRoles: () => api.get('/roles/roles/'),
  createRole: (data: any) => api.post('/roles/roles/', data),
  updateRole: (id: string, data: any) => api.put(`/roles/roles/${id}/`, data),
  deleteRole: (id: string) => api.delete(`/roles/roles/${id}/`),
  
  getUserRoles: () => api.get('/roles/user-roles/'),
  getUsersWithRoles: () => api.get('/roles/user-roles/users_with_roles/'),
  assignRole: (userId: number, roleId: string) => api.post('/roles/user-roles/assign_role/', { user_id: userId, role_id: roleId }),
  removeRole: (userId: number, roleId: string) => api.delete('/roles/user-roles/remove_role/', { data: { user_id: userId, role_id: roleId } })
}

export default api