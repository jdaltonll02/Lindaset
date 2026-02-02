import axios from 'axios'

const API_BASE_URL = 'http://localhost:8000/api/v1'

// Mock data for demo
const mockLanguages = [
  { id: 1, name: 'Bassa', family: 'niger_congo', regions: 'Liberia', endangerment_level: 'safe' },
  { id: 2, name: 'Kpelle', family: 'niger_congo', regions: 'Liberia', endangerment_level: 'safe' },
  { id: 3, name: 'Gio', family: 'niger_congo', regions: 'Liberia', endangerment_level: 'safe' },
  { id: 4, name: 'Mano', family: 'niger_congo', regions: 'Liberia', endangerment_level: 'safe' },
  { id: 5, name: 'Krahn', family: 'niger_congo', regions: 'Liberia', endangerment_level: 'vulnerable' },
  { id: 6, name: 'Grebo', family: 'niger_congo', regions: 'Liberia', endangerment_level: 'safe' }
]

const mockStats = {
  total_sentences: 1250,
  total_translations: 890,
  validated_sentences: 750,
  by_language: {
    'Bassa': 320,
    'Kpelle': 280,
    'Gio': 180,
    'Mano': 150,
    'Krahn': 120,
    'Grebo': 200
  },
  by_status: {
    'submitted': 400,
    'validated': 750,
    'rejected': 100
  }
}

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Override API calls with mock data for demo
api.get = async (url: string) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300))
  
  if (url.includes('/languages/')) {
    return { data: mockLanguages }
  }
  if (url.includes('/stats/')) {
    return { data: mockStats }
  }
  return { data: {} }
}

api.post = async (url: string, data: any) => {
  await new Promise(resolve => setTimeout(resolve, 500))
  console.log('Mock POST to:', url, data)
  return { data: { success: true } }
}

// Auth API
export const authApi = {
  login: (credentials: { username: string; password: string }) =>
    Promise.resolve({ data: { user: { username: credentials.username }, token: 'demo-token' } }),
  
  register: async (userData: any) => {
    // For demo, simulate real registration
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Simulate validation errors occasionally
    if (userData.username === 'admin') {
      throw new Error('Username already exists')
    }
    
    return { 
      data: { 
        user: { 
          id: Date.now(),
          username: userData.username,
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          role: userData.role
        }, 
        token: 'demo-token' 
      } 
    }
  },
  
  checkUsername: async (username: string) => {
    await new Promise(resolve => setTimeout(resolve, 500))
    const unavailable = ['admin', 'user', 'test', 'demo']
    return {
      data: {
        available: !unavailable.includes(username.toLowerCase()),
        message: unavailable.includes(username.toLowerCase()) 
          ? 'Username already taken' 
          : 'Username is available'
      }
    }
  },
  
  checkEmail: async (email: string) => {
    await new Promise(resolve => setTimeout(resolve, 500))
    const unavailable = ['admin@example.com', 'test@example.com']
    return {
      data: {
        available: !unavailable.includes(email.toLowerCase()),
        message: unavailable.includes(email.toLowerCase()) 
          ? 'Email already registered' 
          : 'Email is available'
      }
    }
  },
  
  logout: () => Promise.resolve()
}

export default api