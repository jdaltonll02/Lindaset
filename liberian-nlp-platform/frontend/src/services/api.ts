import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth-storage')
  if (token) {
    try {
      const authData = JSON.parse(token)
      if (authData.state?.token) {
        config.headers.Authorization = `Token ${authData.state.token}`
      }
    } catch (error) {
      console.error('Error parsing auth token:', error)
    }
  }
  return config
})

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth data on 401
      localStorage.removeItem('auth-storage')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authApi = {
  login: (credentials: { username: string; password: string }) =>
    api.post('/accounts/login/', credentials),
  
  register: (userData: any) =>
    api.post('/accounts/register/', userData),
  
  logout: () =>
    api.post('/accounts/logout/'),
  
  getProfile: () =>
    api.get('/accounts/profile/'),
  
  updateProfile: (data: any) =>
    api.patch('/accounts/profile/', data),
  
  getUserStats: () =>
    api.get('/accounts/stats/'),
}

// Languages API
export const languagesApi = {
  getLanguages: (params?: any) =>
    api.get('/languages/', { params }),
  
  getLanguage: (id: number) =>
    api.get(`/languages/${id}/`),
  
  getLanguagePairs: (params?: any) =>
    api.get('/languages/pairs/', { params }),
  
  getLanguageStats: () =>
    api.get('/languages/stats/'),
  
  getLiberianLanguages: () =>
    api.get('/languages/liberian/'),
}

// Text Data API
export const textDataApi = {
  getCorpora: (params?: any) =>
    api.get('/text-data/corpora/', { params }),
  
  createCorpus: (data: any) =>
    api.post('/text-data/corpora/', data),
  
  getSentences: (params?: any) =>
    api.get('/text-data/sentences/', { params }),
  
  createSentence: (data: any) =>
    api.post('/text-data/sentences/', data),
  
  getTranslations: (params?: any) =>
    api.get('/text-data/translations/', { params }),
  
  createTranslationPair: (data: any) =>
    api.post('/text-data/translation-pairs/', data),
  
  getRandomSentence: (params?: any) =>
    api.get('/text-data/random-sentence/', { params }),
  
  getTextStats: () =>
    api.get('/text-data/stats/'),
}

// Audio Data API
export const audioDataApi = {
  getRecordings: (params?: any) =>
    api.get('/audio-data/recordings/', { params }),
  
  uploadAudio: (formData: FormData) =>
    api.post('/audio-data/upload/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  
  getRecording: (id: string) =>
    api.get(`/audio-data/recordings/${id}/`),
  
  getSpeakerProfile: () =>
    api.get('/audio-data/speaker-profile/'),
  
  updateSpeakerProfile: (data: any) =>
    api.patch('/audio-data/speaker-profile/', data),
  
  getAudioStats: () =>
    api.get('/audio-data/stats/'),
  
  getRecordingsForSentence: (sentenceId: string) =>
    api.get(`/audio-data/sentence/${sentenceId}/recordings/`),
}

// Datasets API
export const datasetsApi = {
  getDatasets: (params?: any) =>
    api.get('/datasets/', { params }),
  
  createDataset: (data: any) =>
    api.post('/datasets/', data),
  
  getDataset: (id: number) =>
    api.get(`/datasets/${id}/`),
  
  exportDataset: (id: number, format: string) =>
    api.get(`/datasets/${id}/export/`, { params: { format } }),
}

export default api