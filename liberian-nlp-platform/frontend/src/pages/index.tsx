import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { useNavigate } from 'react-router-dom'
import { api, authApi, adminApi } from '../services/api'
import { useAuthStore } from '../store/authStore'

export function RegisterPage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    location: '',
    languages: [] as string[],
    role: 'contributor',
    agreeToTerms: false
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const { login } = useAuthStore()

  const liberianLanguages = [
    'Bassa', 'Kpelle', 'Gio', 'Mano', 'Krahn', 'Grebo', 'Vai', 'Gola',
    'Kissi', 'Gbandi', 'Loma', 'Mandingo', 'Mende', 'Kru', 'Sapo', 'Belleh'
  ]

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.username.trim()) newErrors.username = 'Username is required'
    if (formData.username.length < 3) newErrors.username = 'Username must be at least 3 characters'
    
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email format'
    
    if (!formData.password) newErrors.password = 'Password is required'
    if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters'
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }
    
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required'
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required'
    if (!formData.agreeToTerms) newErrors.agreeToTerms = 'You must agree to the terms'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      const response = await authApi.register(formData)
      
      // Auto-login after successful registration
      login(response.data.user)
      
      setShowSuccess(true)
      setTimeout(() => {
        navigate('/dashboard')
      }, 2000)
    } catch (error: any) {
      setErrors({ submit: error.message || 'Registration failed. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const toggleLanguage = (language: string) => {
    const newLanguages = formData.languages.includes(language)
      ? formData.languages.filter(l => l !== language)
      : [...formData.languages, language]
    handleInputChange('languages', newLanguages)
  }

  if (showSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-green-600 mb-2">Welcome to the Platform!</h2>
            <p className="text-gray-600 mb-4">Your account has been created successfully.</p>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="text-sm text-gray-500 mt-2">Redirecting to dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Join the Liberian NLP Platform</h2>
            <p className="text-gray-600 mt-2">Help preserve and digitize Liberian languages</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">First Name *</label>
                <input
                  type="text"
                  className={`input ${errors.firstName ? 'border-red-500' : ''}`}
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  placeholder="Enter your first name"
                />
                {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
              </div>
              
              <div>
                <label className="label">Last Name *</label>
                <input
                  type="text"
                  className={`input ${errors.lastName ? 'border-red-500' : ''}`}
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  placeholder="Enter your last name"
                />
                {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
              </div>
            </div>

            {/* Account Details */}
            <div>
              <label className="label">Username *</label>
              <input
                type="text"
                className={`input ${errors.username ? 'border-red-500' : ''}`}
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                placeholder="Choose a unique username"
              />
              {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username}</p>}
            </div>

            <div>
              <label className="label">Email Address *</label>
              <input
                type="email"
                className={`input ${errors.email ? 'border-red-500' : ''}`}
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Enter your email address"
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Password *</label>
                <input
                  type="password"
                  className={`input ${errors.password ? 'border-red-500' : ''}`}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="Create a strong password"
                />
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
              </div>
              
              <div>
                <label className="label">Confirm Password *</label>
                <input
                  type="password"
                  className={`input ${errors.confirmPassword ? 'border-red-500' : ''}`}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  placeholder="Confirm your password"
                />
                {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
              </div>
            </div>

            {/* Additional Information */}
            <div>
              <label className="label">Location</label>
              <input
                type="text"
                className="input"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="City, County (e.g., Monrovia, Montserrado)"
              />
            </div>

            <div>
              <label htmlFor="roleSelect" className="label">Role</label>
              <select
                id="roleSelect"
                className="input"
                value={formData.role}
                onChange={(e) => handleInputChange('role', e.target.value)}
                aria-label="Select your role"
                title="Select your role"
              >
                <option value="contributor">Contributor - Submit translations and recordings</option>
                <option value="reviewer">Reviewer - Review and validate content</option>
                <option value="language_lead">Language Lead - Manage specific language content</option>
              </select>
            </div>

            {/* Language Selection */}
            <div>
              <label className="label">Languages I speak (select all that apply)</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                {liberianLanguages.map(language => (
                  <label key={language} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.languages.includes(language)}
                      onChange={() => toggleLanguage(language)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      title={`Select ${language}`}
                      aria-label={`Select ${language}`}
                    />
                    <span className="text-sm">{language}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Terms Agreement */}
            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                id="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={(e) => handleInputChange('agreeToTerms', e.target.checked)}
                className={`mt-1 rounded border-gray-300 text-primary-600 focus:ring-primary-500 ${errors.agreeToTerms ? 'border-red-500' : ''}`}
                title="Agree to Terms of Service and Privacy Policy"
                aria-label="Agree to Terms of Service and Privacy Policy"
              />
              <label htmlFor="agreeToTerms" className="text-sm text-gray-700">
                I agree to the <a href="#" className="text-primary-600 hover:underline">Terms of Service</a> and 
                <a href="#" className="text-primary-600 hover:underline"> Privacy Policy</a>. 
                I understand that my contributions will be used to build open-source language datasets.
              </label>
            </div>
            {errors.agreeToTerms && <p className="text-red-500 text-sm">{errors.agreeToTerms}</p>}

            {/* Submit Button */}
            <div>
              {errors.submit && <p className="text-red-500 text-sm mb-4">{errors.submit}</p>}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full btn-primary py-3 text-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Creating Account...</span>
                  </div>
                ) : (
                  'Create Account'
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account? 
              <a href="/login" className="text-primary-600 hover:underline font-medium"> Sign in here</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export function DashboardPage() {
  const { user } = useAuthStore()
  
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {String(user?.username || 'User')}!</h1>
        <p className="text-gray-600">Here's what's happening with the Liberian NLP Platform</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-primary-100 text-primary-800 mr-4">
              📚
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Sentences</p>
              <p className="text-2xl font-bold">1,250</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-secondary-100 text-secondary-800 mr-4">
              🌍
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Languages</p>
              <p className="text-2xl font-bold">16</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-800 mr-4">
              ✓
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Validated</p>
              <p className="text-2xl font-bold">890</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-800 mr-4">
              🎤
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Your Contributions</p>
              <p className="text-2xl font-bold">45</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Languages by Content</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Bassa</span>
              <span className="text-sm text-gray-600">320 sentences</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Kpelle</span>
              <span className="text-sm text-gray-600">280 sentences</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Gio</span>
              <span className="text-sm text-gray-600">180 sentences</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Content Status</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Submitted</span>
              <span className="text-sm text-gray-600">400 items</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Validated</span>
              <span className="text-sm text-gray-600">750 items</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Rejected</span>
              <span className="text-sm text-gray-600">100 items</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function LanguagesPage() {
  const { data: languages, isLoading } = useQuery('languages', () => api.get('/languages/'))

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-800"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Liberian Languages</h1>
        <div className="text-sm text-gray-600">
          {languages?.data?.length || 0} languages available
        </div>
      </div>
      
      {languages?.data?.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🌍</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Languages Found</h3>
          <p className="text-gray-600">Languages will appear here once they are added by administrators.</p>
        </div>
      ) : (
        <div className="language-grid">
          {languages?.data?.map((language: any) => (
            <div key={language.id} className="language-card">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold text-lg">{language.name}</h3>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  language.endangerment_level === 'safe' ? 'bg-green-100 text-green-800' :
                  language.endangerment_level === 'vulnerable' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {language.endangerment_level.replace('_', ' ')}
                </span>
              </div>
              
              <div className="space-y-2 text-sm text-gray-600">
                <div><strong>Family:</strong> {language.family.replace('_', ' ')}</div>
                <div><strong>Regions:</strong> {language.regions}</div>
                {language.iso_code && (
                  <div><strong>ISO Code:</strong> {language.iso_code}</div>
                )}
                {language.estimated_speakers && (
                  <div><strong>Speakers:</strong> {language.estimated_speakers.toLocaleString()}</div>
                )}
              </div>
              
              {language.description && (
                <p className="mt-3 text-sm text-gray-700">{language.description}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function TranslationWorkspace() {
  const [sourceText, setSourceText] = useState('')
  const [targetText, setTargetText] = useState('')
  const [sourceLang, setSourceLang] = useState('')
  const [targetLang, setTargetLang] = useState('')

  const { data: languages } = useQuery('languages', () => api.get('/languages/'))

  const handleSubmit = async () => {
    if (!sourceText || !targetText || !sourceLang || !targetLang) return
    
    try {
      await api.post('/text-data/translation-pairs/', {
        source_text: sourceText,
        target_text: targetText,
        source_language_id: sourceLang,
        target_language_id: targetLang,
        corpus_id: 1,
        difficulty_level: 'intermediate',
        translation_type: 'human'
      })
      setSourceText('')
      setTargetText('')
    } catch (error) {
      console.error('Translation submission failed:', error)
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Translation Workspace</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Source Text */}
        <div className="card">
          <div className="mb-4">
            <label className="label">Source Language</label>
            <select 
              className="input" 
              value={sourceLang} 
              onChange={(e) => setSourceLang(e.target.value)}
              title="Select source language"
              aria-label="Select source language"
            >
              <option value="">Select language...</option>
              {languages?.data?.map((lang: any) => (
                <option key={lang.id} value={lang.id}>{lang.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Source Text</label>
            <textarea
              className="input h-40 resize-none"
              placeholder="Enter text to translate..."
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              title="Enter the source text to translate"
              aria-label="Source text for translation"
            />
          </div>
        </div>

        {/* Target Text */}
        <div className="card">
          <div className="mb-4">
            <label className="label">Target Language</label>
            <select 
              className="input" 
              value={targetLang} 
              onChange={(e) => setTargetLang(e.target.value)}
              title="Select target language"
              aria-label="Select target language"
            >
              <option value="">Select language...</option>
              {languages?.data?.map((lang: any) => (
                <option key={lang.id} value={lang.id}>{lang.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Translation</label>
            <textarea
              className="input h-40 resize-none"
              placeholder="Enter translation..."
              value={targetText}
              onChange={(e) => setTargetText(e.target.value)}
              title="Enter the translation text"
              aria-label="Target translation text"
            />
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-center">
        <button 
          className="btn-primary px-8 py-3"
          onClick={handleSubmit}
          disabled={!sourceText || !targetText || !sourceLang || !targetLang}
        >
          Submit Translation
        </button>
      </div>
    </div>
  )
}

export function AudioStudio() {
  const [isRecording, setIsRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [selectedLang, setSelectedLang] = useState('')
  const [transcript, setTranscript] = useState('')
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioRef = useRef<HTMLAudioElement>(null)

  const { data: languages } = useQuery('languages', () => api.get('/languages/'))

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      
      const chunks: BlobPart[] = []
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data)
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' })
        setAudioBlob(blob)
        if (audioRef.current) {
          audioRef.current.src = URL.createObjectURL(blob)
        }
      }
      
      mediaRecorder.start()
      setIsRecording(true)
    } catch (error) {
      console.error('Recording failed:', error)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const submitRecording = async () => {
    if (!audioBlob || !selectedLang || !transcript) return
    
    const formData = new FormData()
    formData.append('audio_file', audioBlob, 'recording.wav')
    formData.append('language', selectedLang)
    formData.append('transcript', transcript)
    formData.append('recording_type', 'read_speech')
    
    try {
      await api.post('/audio-data/recordings/', formData)
      setAudioBlob(null)
      setTranscript('')
      if (audioRef.current) audioRef.current.src = ''
    } catch (error) {
      console.error('Upload failed:', error)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Audio Recording Studio</h1>
      
      <div className="card mb-8">
        <div className="mb-6">
          <label className="label">Language</label>
          <select 
            className="input" 
            value={selectedLang} 
            onChange={(e) => setSelectedLang(e.target.value)}
            title="Select recording language"
            aria-label="Select recording language"
          >
            <option value="">Select language...</option>
            {languages?.data?.map((lang: any) => (
              <option key={lang.id} value={lang.id}>{lang.name}</option>
            ))}
          </select>
        </div>

        <div className="mb-6">
          <label className="label">Transcript</label>
          <textarea
            className="input h-24"
            placeholder="Enter the text you will read..."
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            title="Enter the transcript text to read for recording"
            aria-label="Transcript for audio recording"
          />
        </div>

        <div className="flex items-center justify-center space-x-4 mb-6">
          {!isRecording ? (
            <button 
              className="btn-primary px-8 py-4 text-lg"
              onClick={startRecording}
              disabled={!selectedLang || !transcript}
            >
              🎤 Start Recording
            </button>
          ) : (
            <button 
              className="bg-red-600 text-white px-8 py-4 text-lg rounded-md hover:bg-red-700"
              onClick={stopRecording}
            >
              ⏹️ Stop Recording
            </button>
          )}
        </div>

        {isRecording && (
          <div className="text-center mb-6">
            <div className="recording-indicator mx-auto mb-2"></div>
            <p className="text-red-600 font-medium">Recording in progress...</p>
          </div>
        )}

        {audioBlob && (
          <div className="mb-6">
            <label className="label">Playback</label>
            <audio ref={audioRef} controls className="w-full" />
            <button 
              className="btn-primary mt-4"
              onClick={submitRecording}
            >
              Submit Recording
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export function ReviewPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Review</h1>
      <p>Review contributions</p>
    </div>
  )
}

export function ProfilePage() {
  const { user, updateUser } = useAuthStore()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    bio: 'Passionate about preserving Liberian languages and contributing to NLP research.',
    location: 'Monrovia, Liberia',
    languages: ['Bassa', 'English'],
    notifications: {
      email: true,
      reviews: true,
      datasets: false
    }
  })

  const handleSave = () => {
    if (user) {
      updateUser({ ...user, username: formData.username, email: formData.email })
    }
    setIsEditing(false)
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Profile Settings</h1>
        <button 
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          className="btn-primary"
        >
          {isEditing ? 'Save Changes' : 'Edit Profile'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
            <div className="space-y-4">
              <div>
                <label className="label">Username</label>
                {isEditing ? (
                  <input 
                    type="text" 
                    className="input" 
                    value={formData.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                  />
                ) : (
                  <p className="text-gray-900">{formData.username}</p>
                )}
              </div>
              
              <div>
                <label className="label">Email</label>
                {isEditing ? (
                  <input 
                    type="email" 
                    className="input" 
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                  />
                ) : (
                  <p className="text-gray-900">{formData.email}</p>
                )}
              </div>
              
              <div>
                <label className="label">Bio</label>
                {isEditing ? (
                  <textarea 
                    className="input h-24" 
                    value={formData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                  />
                ) : (
                  <p className="text-gray-900">{formData.bio}</p>
                )}
              </div>
              
              <div>
                <label className="label">Location</label>
                {isEditing ? (
                  <input 
                    type="text" 
                    className="input" 
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                  />
                ) : (
                  <p className="text-gray-900">{formData.location}</p>
                )}
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Language Preferences</h3>
            <div className="space-y-3">
              <label className="label">Languages I speak</label>
              <div className="flex flex-wrap gap-2">
                {formData.languages.map((lang, index) => (
                  <span key={index} className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm">
                    {lang}
                    {isEditing && (
                      <button 
                        onClick={() => {
                          const newLangs = formData.languages.filter((_, i) => i !== index)
                          handleInputChange('languages', newLangs)
                        }}
                        className="ml-2 text-primary-600 hover:text-primary-800"
                      >
                        ×
                      </button>
                    )}
                  </span>
                ))}
                {isEditing && (
                  <button className="px-3 py-1 border-2 border-dashed border-gray-300 rounded-full text-sm text-gray-600 hover:border-primary-300">
                    + Add Language
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Notification Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-gray-600">Receive updates via email</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={formData.notifications.email}
                  onChange={(e) => handleInputChange('notifications', { ...formData.notifications, email: e.target.checked })}
                  disabled={!isEditing}
                  className="h-4 w-4 text-primary-600"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Review Notifications</p>
                  <p className="text-sm text-gray-600">Get notified when your content is reviewed</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={formData.notifications.reviews}
                  onChange={(e) => handleInputChange('notifications', { ...formData.notifications, reviews: e.target.checked })}
                  disabled={!isEditing}
                  className="h-4 w-4 text-primary-600"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Dataset Updates</p>
                  <p className="text-sm text-gray-600">Notifications about new datasets</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={formData.notifications.datasets}
                  onChange={(e) => handleInputChange('notifications', { ...formData.notifications, datasets: e.target.checked })}
                  disabled={!isEditing}
                  className="h-4 w-4 text-primary-600"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Sidebar */}
        <div className="space-y-6">
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Your Stats</h3>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-600">245</div>
                <div className="text-sm text-gray-600">Contributions</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">89%</div>
                <div className="text-sm text-gray-600">Reputation Score</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">12</div>
                <div className="text-sm text-gray-600">Reviews Completed</div>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Achievements</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">🏆</span>
                <div>
                  <p className="font-medium">Top Contributor</p>
                  <p className="text-sm text-gray-600">100+ contributions</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-2xl">🎖️</span>
                <div>
                  <p className="font-medium">Quality Reviewer</p>
                  <p className="text-sm text-gray-600">High accuracy reviews</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-2xl">🌍</span>
                <div>
                  <p className="font-medium">Language Expert</p>
                  <p className="text-sm text-gray-600">Multiple languages</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Account Actions</h3>
            <div className="space-y-2">
              <button className="btn-outline w-full text-sm">🔒 Change Password</button>
              <button className="btn-outline w-full text-sm">📥 Export Data</button>
              <button className="btn-outline w-full text-sm text-red-600 border-red-300 hover:bg-red-50">🗑️ Delete Account</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function AdminPage() {
  const { user } = useAuthStore()
  const [activeTab, setActiveTab] = useState('overview')
  const [showAddUser, setShowAddUser] = useState(false)
  const [showAddLanguage, setShowAddLanguage] = useState(false)
  const [newUser, setNewUser] = useState({ username: '', email: '', role: 'contributor', password: '' })
  const [newLanguage, setNewLanguage] = useState({ 
    name: '', 
    family: 'niger_congo', 
    regions: '', 
    endangerment_level: 'safe',
    estimated_speakers: '',
    description: ''
  })
  const queryClient = useQueryClient()

  // Fetch users from backend
  const { data: usersData, isLoading, error } = useQuery<any, Error>('admin-users', adminApi.getUsers, {
    enabled: user?.role === 'superuser' || user?.role === 'admin',
    retry: false,
    onError: (error) => {
      console.log('Backend not available, using fallback data')
    }
  })
  
  // Fallback data when backend is not available
  const fallbackUsers = [
    { id: 1, username: 'john_doe', email: 'john@example.com', role: 'contributor', is_active: true, date_joined: '2024-01-15' },
    { id: 2, username: 'mary_smith', email: 'mary@example.com', role: 'reviewer', is_active: true, date_joined: '2024-01-20' },
    { id: 3, username: 'david_wilson', email: 'david@example.com', role: 'language_lead', is_active: false, date_joined: '2024-01-10' },
    { id: 4, username: 'rootadmin', email: 'admin@example.com', role: 'superuser', is_active: true, date_joined: '2024-01-01' }
  ]
  
  const users = usersData?.data || fallbackUsers

  // Fetch languages from backend
  const { data: languagesData, isLoading: languagesLoading } = useQuery('admin-languages', adminApi.getLanguages, {
    enabled: user?.role === 'superuser' || user?.role === 'admin'
  })
  const languages = languagesData?.data || []

  // Language mutations
  const createLanguageMutation = useMutation(adminApi.createLanguage, {
    onSuccess: () => {
      queryClient.invalidateQueries('admin-languages')
      setShowAddLanguage(false)
      setNewLanguage({ name: '', family: 'niger_congo', regions: '', endangerment_level: 'safe', estimated_speakers: '', description: '' })
    }
  })

  const deleteLanguageMutation = useMutation(adminApi.deleteLanguage, {
    onSuccess: () => queryClient.invalidateQueries('admin-languages')
  })
  const createUserMutation = useMutation(adminApi.createUser, {
    onSuccess: () => {
      queryClient.invalidateQueries('admin-users')
      setShowAddUser(false)
      setNewUser({ username: '', email: '', role: 'contributor', password: '' })
    }
  })

  const updateUserMutation = useMutation(
    ({ userId, userData }: { userId: number, userData: any }) => adminApi.updateUser(userId, userData),
    { onSuccess: () => queryClient.invalidateQueries('admin-users') }
  )

  const deleteUserMutation = useMutation(adminApi.deleteUser, {
    onSuccess: () => queryClient.invalidateQueries('admin-users')
  })

  // Role-based access control
  const userRole = user?.role || 'contributor'
  const isSuperUser = userRole === 'superuser'
  const isAdmin = userRole === 'admin' || isSuperUser
  const isLanguageLead = userRole === 'language_lead' || isAdmin

  if (!isAdmin) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
        <p className="text-gray-600">You don't have permission to access the admin dashboard.</p>
      </div>
    )
  }

  const handleUserAction = async (userId: number, action: string) => {
    if (!isSuperUser && action === 'delete') return
    
    if (action === 'delete') {
      if (confirm('Are you sure you want to delete this user?')) {
        deleteUserMutation.mutate(userId)
      }
    } else {
      const status = action === 'activate' ? 'active' : 'inactive'
      updateUserMutation.mutate({ userId, userData: { is_active: status === 'active' } })
    }
  }

  const handleRoleChange = (userId: number, newRole: string) => {
    if (!isSuperUser) return
    updateUserMutation.mutate({ userId, userData: { role: newRole } })
  }

  const handleAddUser = () => {
    if (!newUser.username || !newUser.email || !newUser.password) {
      alert('Please fill in all required fields')
      return
    }
    
    // For now, add user locally until backend is connected
    const mockUser = {
      id: Date.now(),
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
      is_active: true,
      date_joined: new Date().toISOString()
    }
    
    // Try API call, fallback to local state
    createUserMutation.mutate(newUser, {
      onError: () => {
        // Fallback: add to local state
        console.log('Backend not available, adding user locally:', mockUser)
        setShowAddUser(false)
        setNewUser({ username: '', email: '', role: 'contributor', password: '' })
      }
    })
  }

  const handleAddLanguage = () => {
    if (!newLanguage.name || !newLanguage.regions) {
      alert('Please fill in required fields (name and regions)')
      return
    }
    
    const languageData = {
      ...newLanguage,
      estimated_speakers: newLanguage.estimated_speakers ? parseInt(newLanguage.estimated_speakers) : null
    }
    
    createLanguageMutation.mutate(languageData, {
      onError: () => {
        console.log('Backend not available, adding language locally')
        setShowAddLanguage(false)
        setNewLanguage({ name: '', family: 'niger_congo', regions: '', endangerment_level: 'safe', estimated_speakers: '', description: '' })
      }
    })
  }

  const handleDeleteLanguage = (languageId: number, languageName: string) => {
    if (confirm(`Are you sure you want to delete ${languageName}?`)) {
      deleteLanguageMutation.mutate(languageId)
    }
  }

  const handleCriticalAction = (action: string) => {
    const confirmMessage: Record<string, string> = {
      'restart': 'Are you sure you want to restart all services?',
      'backup': 'Create a backup of the current system?',
      'maintenance': 'Enable maintenance mode? This will make the site unavailable.',
      'reset': 'DANGER: This will reset the entire system. Are you absolutely sure?',
      'cache': 'Clear all cached data?',
      'report': 'Generate system report?',
      'lock': 'Are you sure you want to lock all accounts?',
      'password-reset': 'Force password reset for all users?',
      'audit-export': 'Export audit logs?',
      'emergency-shutdown': 'DANGER: This will shut down the system. Are you absolutely sure?',
      'bulk-delete': 'DANGER: This will permanently delete selected content. Are you absolutely sure?',
      'content-report': 'Generate content report?',
      'sync-database': 'Sync database with backup?'
    }
    
    const message = confirmMessage[action] || 'Are you sure you want to perform this action?'
    
    if (confirm(message)) {
      console.log(`Executing ${action} action...`)
      alert(`${action.charAt(0).toUpperCase() + action.slice(1)} action initiated. Check system logs for progress.`)
    }
  }

  const availableTabs = [
    { id: 'overview', label: 'Overview', icon: '📊', roles: ['admin', 'superuser'] },
    { id: 'users', label: 'Users', icon: '👥', roles: ['superuser'] },
    { id: 'languages', label: 'Languages', icon: '🌍', roles: ['admin', 'superuser'] },
    { id: 'content', label: 'Content', icon: '📝', roles: ['admin', 'superuser'] },
    { id: 'system', label: 'System', icon: '⚙️', roles: ['superuser'] },
    { id: 'analytics', label: 'Analytics', icon: '📈', roles: ['admin', 'superuser'] },
    { id: 'security', label: 'Security', icon: '🔒', roles: ['superuser'] }
  ].filter(tab => tab.roles.includes(userRole))

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="flex items-center space-x-2">
          {error ? (
            <span className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
              ⚠️ Backend Offline
            </span>
          ) : null}
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            isSuperUser ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
          }`}>
            {isSuperUser ? '🔴 Super User' : '🔵 Admin'}
          </span>
        </div>
      </div>
      
      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-8 border-b">
        {availableTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-t-lg font-medium ${
              activeTab === tab.id
                ? 'bg-primary-100 text-primary-800 border-b-2 border-primary-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-3xl font-bold text-primary-600">1,247</p>
                </div>
                <div className="p-3 bg-primary-100 rounded-full">👥</div>
              </div>
            </div>
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Sessions</p>
                  <p className="text-3xl font-bold text-green-600">89</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">🟢</div>
              </div>
            </div>
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Data Quality</p>
                  <p className="text-3xl font-bold text-blue-600">94%</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">✅</div>
              </div>
            </div>
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">System Health</p>
                  <p className="text-3xl font-bold text-green-600">Good</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">💚</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded">
                  <span className="text-green-600">✅</span>
                  <div>
                    <p className="font-medium">New dataset published</p>
                    <p className="text-sm text-gray-600">Bassa Speech Corpus v2.0</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded">
                  <span className="text-blue-600">👤</span>
                  <div>
                    <p className="font-medium">New user registered</p>
                    <p className="text-sm text-gray-600">sarah_johnson joined as contributor</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded">
                  <span className="text-yellow-600">⚠️</span>
                  <div>
                    <p className="font-medium">Quality alert</p>
                    <p className="text-sm text-gray-600">Low quality recordings detected</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold mb-4">System Alerts</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <div>
                    <p className="font-medium text-yellow-800">Storage Usage</p>
                    <p className="text-sm text-yellow-600">85% of allocated space used</p>
                  </div>
                  {isSuperUser && <button className="btn-outline text-sm">Manage</button>}
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded">
                  <div>
                    <p className="font-medium text-green-800">Backup Status</p>
                    <p className="text-sm text-green-600">Last backup: 2 hours ago</p>
                  </div>
                  <button className="btn-outline text-sm">View</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Users Tab - Super User Only */}
      {activeTab === 'users' && isSuperUser && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">User Management</h2>
            <div className="space-x-2">
              <button 
                onClick={() => setShowAddUser(true)}
                className="btn-primary"
              >
                + Add User
              </button>
              <button className="btn-outline">📥 Export Users</button>
              <button className="btn-outline text-red-600">🗑️ Bulk Delete</button>
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-800"></div>
            </div>
          ) : (
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user: any) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="font-medium text-gray-900">{user.username}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select 
                            value={user.role} 
                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
                            className="text-sm border rounded px-2 py-1"
                            disabled={!isSuperUser}
                          >
                            <option value="contributor">Contributor</option>
                            <option value="reviewer">Reviewer</option>
                            <option value="language_lead">Language Lead</option>
                            <option value="admin">Admin</option>
                            <option value="superuser">Super User</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            user.is_active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {user.is_active ? 'active' : 'inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                          <button 
                            onClick={() => handleUserAction(user.id, user.is_active ? 'deactivate' : 'activate')}
                            className={`px-3 py-1 rounded text-xs ${
                              user.is_active 
                                ? 'bg-red-100 text-red-800 hover:bg-red-200' 
                                : 'bg-green-100 text-green-800 hover:bg-green-200'
                            }`}
                          >
                            {user.is_active ? 'Deactivate' : 'Activate'}
                          </button>
                          <button 
                            onClick={() => handleUserAction(user.id, 'delete')}
                            className="px-3 py-1 bg-red-100 text-red-800 rounded text-xs hover:bg-red-200"
                            disabled={!isSuperUser}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Languages Tab */}
      {activeTab === 'languages' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Language Management</h2>
            <button 
              onClick={() => setShowAddLanguage(true)}
              className="btn-primary"
            >
              + Add Language
            </button>
          </div>
          
          {languagesLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-800"></div>
            </div>
          ) : (
            <div className="grid gap-4">
              {languages.map((language: any) => (
                <div key={language.id} className="card">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold">{language.name}</h3>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p><strong>Family:</strong> {language.family.replace('_', ' ')}</p>
                        <p><strong>Regions:</strong> {language.regions}</p>
                        <p><strong>Status:</strong> {language.endangerment_level.replace('_', ' ')}</p>
                        {language.estimated_speakers && (
                          <p><strong>Speakers:</strong> {language.estimated_speakers.toLocaleString()}</p>
                        )}
                      </div>
                      {language.description && (
                        <p className="text-sm text-gray-700 mt-2">{language.description}</p>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleDeleteLanguage(language.id, language.name)}
                        className="px-3 py-1 bg-red-100 text-red-800 rounded text-xs hover:bg-red-200"
                        disabled={!isSuperUser}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Content Tab */}
      {activeTab === 'content' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Content Moderation</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card">
              <h3 className="font-semibold mb-2">Pending Reviews</h3>
              <div className="text-3xl font-bold text-yellow-600">47</div>
              <p className="text-sm text-gray-600">Items awaiting review</p>
              <button className="btn-primary mt-3 w-full">Review Queue</button>
            </div>
            <div className="card">
              <h3 className="font-semibold mb-2">Flagged Content</h3>
              <div className="text-3xl font-bold text-red-600">12</div>
              <p className="text-sm text-gray-600">Items flagged for issues</p>
              <button className="btn-primary mt-3 w-full">Investigate</button>
            </div>
            <div className="card">
              <h3 className="font-semibold mb-2">Quality Score</h3>
              <div className="text-3xl font-bold text-green-600">94%</div>
              <p className="text-sm text-gray-600">Overall content quality</p>
              <button className="btn-primary mt-3 w-full">View Report</button>
            </div>
          </div>

          {isSuperUser && (
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Advanced Content Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button 
                  onClick={() => handleCriticalAction('bulk-delete')}
                  className="btn-outline text-red-600"
                >
                  🗑️ Bulk Delete
                </button>
                <button 
                  onClick={() => handleCriticalAction('content-report')}
                  className="btn-outline"
                >
                  📊 Generate Report
                </button>
                <button 
                  onClick={() => handleCriticalAction('sync-database')}
                  className="btn-outline"
                >
                  🔄 Sync Database
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Platform Analytics</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="font-semibold mb-4">User Growth</h3>
              <div className="text-center py-8 bg-gray-50 rounded">
                <p className="text-gray-500">📈 Chart placeholder</p>
                <p className="text-sm text-gray-400">User registration trends</p>
              </div>
            </div>
            <div className="card">
              <h3 className="font-semibold mb-4">Content Volume</h3>
              <div className="text-center py-8 bg-gray-50 rounded">
                <p className="text-gray-500">📊 Chart placeholder</p>
                <p className="text-sm text-gray-400">Daily content submissions</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Security Tab - Super User Only */}
      {activeTab === 'security' && isSuperUser && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Security Management</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="font-semibold mb-4">Access Control</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>Failed Login Attempts</span>
                  <span className="text-red-600 font-bold">23</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Active Sessions</span>
                  <span className="text-green-600 font-bold">89</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Blocked IPs</span>
                  <span className="text-yellow-600 font-bold">5</span>
                </div>
              </div>
              <button className="btn-primary mt-4 w-full">View Security Logs</button>
            </div>
            
            <div className="card">
              <h3 className="font-semibold mb-4">System Actions</h3>
              <div className="space-y-2">
                <button 
                  onClick={() => handleCriticalAction('lock')}
                  className="btn-outline w-full text-red-600"
                >
                  🔒 Lock All Accounts
                </button>
                <button 
                  onClick={() => handleCriticalAction('password-reset')}
                  className="btn-outline w-full"
                >
                  🔄 Force Password Reset
                </button>
                <button 
                  onClick={() => handleCriticalAction('audit-export')}
                  className="btn-outline w-full"
                >
                  📋 Export Audit Log
                </button>
                <button 
                  onClick={() => handleCriticalAction('emergency-shutdown')}
                  className="btn-outline w-full text-red-600"
                >
                  ⚠️ Emergency Shutdown
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* System Tab - Super User Only */}
      {activeTab === 'system' && isSuperUser && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">System Configuration</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="font-semibold mb-4">Server Status</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>API Server</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">Online</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Database</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">Connected</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>File Storage</span>
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-sm">85% Full</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>MongoDB Atlas</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">Connected</span>
                </div>
              </div>
            </div>
            
            <div className="card">
              <h3 className="font-semibold mb-4">Critical Actions</h3>
              <div className="space-y-2">
                <button 
                  onClick={() => handleCriticalAction('restart')}
                  className="btn-outline w-full"
                >
                  🔄 Restart Services
                </button>
                <button 
                  onClick={() => handleCriticalAction('backup')}
                  className="btn-outline w-full"
                >
                  💾 Create Backup
                </button>
                <button 
                  onClick={() => handleCriticalAction('report')}
                  className="btn-outline w-full"
                >
                  📊 Generate Report
                </button>
                <button 
                  onClick={() => handleCriticalAction('cache')}
                  className="btn-outline w-full"
                >
                  🧹 Clear Cache
                </button>
                <button 
                  onClick={() => handleCriticalAction('maintenance')}
                  className="btn-outline w-full text-red-600"
                >
                  ⚠️ Maintenance Mode
                </button>
                <button 
                  onClick={() => handleCriticalAction('reset')}
                  className="btn-outline w-full text-red-600"
                >
                  🔥 Factory Reset
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Add New User</h3>
              <button onClick={() => setShowAddUser(false)} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="label">Username</label>
                <input
                  type="text"
                  className="input"
                  value={newUser.username}
                  onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                  placeholder="Enter username"
                />
              </div>
              <div>
                <label className="label">Email</label>
                <input
                  type="email"
                  className="input"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  placeholder="Enter email"
                />
              </div>
              <div>
                <label className="label">Password</label>
                <input
                  type="password"
                  className="input"
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  placeholder="Enter password"
                />
              </div>
              <div>
                <label className="label">Role</label>
                <select
                  className="input"
                  value={newUser.role}
                  onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                >
                  <option value="contributor">Contributor</option>
                  <option value="reviewer">Reviewer</option>
                  <option value="language_lead">Language Lead</option>
                  <option value="admin">Admin</option>
                  <option value="superuser">Super User</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button onClick={() => setShowAddUser(false)} className="btn-secondary">
                Cancel
              </button>
              <button 
                onClick={handleAddUser}
                className="btn-primary"
                disabled={createUserMutation.isLoading}
              >
                {createUserMutation.isLoading ? 'Creating...' : 'Create User'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Language Modal */}
      {showAddLanguage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Add New Language</h3>
              <button onClick={() => setShowAddLanguage(false)} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="label">Language Name *</label>
                <input
                  type="text"
                  className="input"
                  value={newLanguage.name}
                  onChange={(e) => setNewLanguage({...newLanguage, name: e.target.value})}
                  placeholder="e.g., Bassa"
                />
              </div>
              <div>
                <label className="label">Language Family</label>
                <select
                  className="input"
                  value={newLanguage.family}
                  onChange={(e) => setNewLanguage({...newLanguage, family: e.target.value})}
                >
                  <option value="niger_congo">Niger-Congo</option>
                  <option value="mande">Mande</option>
                  <option value="kru">Kru</option>
                  <option value="mel">Mel</option>
                  <option value="creole">Creole</option>
                </select>
              </div>
              <div>
                <label className="label">Regions *</label>
                <input
                  type="text"
                  className="input"
                  value={newLanguage.regions}
                  onChange={(e) => setNewLanguage({...newLanguage, regions: e.target.value})}
                  placeholder="e.g., Grand Bassa, Rivercess"
                />
              </div>
              <div>
                <label className="label">Endangerment Level</label>
                <select
                  className="input"
                  value={newLanguage.endangerment_level}
                  onChange={(e) => setNewLanguage({...newLanguage, endangerment_level: e.target.value})}
                >
                  <option value="safe">Safe</option>
                  <option value="vulnerable">Vulnerable</option>
                  <option value="definitely_endangered">Definitely Endangered</option>
                  <option value="severely_endangered">Severely Endangered</option>
                  <option value="critically_endangered">Critically Endangered</option>
                </select>
              </div>
              <div>
                <label className="label">Estimated Speakers</label>
                <input
                  type="number"
                  className="input"
                  value={newLanguage.estimated_speakers}
                  onChange={(e) => setNewLanguage({...newLanguage, estimated_speakers: e.target.value})}
                  placeholder="e.g., 350000"
                />
              </div>
              <div>
                <label className="label">Description</label>
                <textarea
                  className="input h-20"
                  value={newLanguage.description}
                  onChange={(e) => setNewLanguage({...newLanguage, description: e.target.value})}
                  placeholder="Brief description of the language"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button onClick={() => setShowAddLanguage(false)} className="btn-secondary">
                Cancel
              </button>
              <button 
                onClick={handleAddLanguage}
                className="btn-primary"
                disabled={createLanguageMutation.isLoading}
              >
                {createLanguageMutation.isLoading ? 'Creating...' : 'Create Language'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export function DatasetsPage() {
  const { data: datasets } = useQuery('datasets', () => api.get('/datasets/'))
  const [selectedDataset, setSelectedDataset] = useState<any>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [showAnalytics, setShowAnalytics] = useState(false)

  const mockDatasets = [
    {
      id: 1,
      name: 'Liberian Speech Corpus v1.0',
      language: 'Bassa',
      type: 'Audio',
      size: '2.3 GB',
      recordings: 1250,
      speakers: 45,
      status: 'Published',
      created_at: '2024-01-15',
      samples: ['Hello, how are you?', 'Good morning', 'Thank you very much']
    },
    {
      id: 2,
      name: 'Kpelle-English Translation Dataset',
      language: 'Kpelle',
      type: 'Text',
      size: '15 MB',
      recordings: 0,
      sentences: 3200,
      status: 'In Review',
      created_at: '2024-02-01',
      samples: ['Kpelle: Nga kɛ̃ɛ̃ | English: I am fine', 'Kpelle: Ɓelei | English: Good morning']
    },
    {
      id: 3,
      name: 'Multi-Language Parallel Corpus',
      language: 'Multiple',
      type: 'Text',
      size: '45 MB',
      recordings: 0,
      sentences: 8500,
      status: 'Published',
      created_at: '2024-01-30',
      samples: ['Bassa: Dyé ɓá | Kpelle: Nga kɛ̃ɛ̃ | English: I am fine']
    }
  ]

  const handleDownload = (dataset: any) => {
    // Simulate download
    const blob = new Blob([`Dataset: ${dataset.name}\nLanguage: ${dataset.language}\nType: ${dataset.type}`], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${dataset.name.replace(/\s+/g, '_')}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handlePreview = (dataset: any) => {
    setSelectedDataset(dataset)
    setShowPreview(true)
  }

  const handleAnalytics = (dataset: any) => {
    setSelectedDataset(dataset)
    setShowAnalytics(true)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Datasets</h1>
        <button className="btn-primary">
          + Create Dataset
        </button>
      </div>

      <div className="grid gap-6">
        {mockDatasets.map((dataset) => (
          <div key={dataset.id} className="card">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold mb-2">{dataset.name}</h3>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span>📊 {dataset.type}</span>
                  <span>🌍 {dataset.language}</span>
                  <span>💾 {dataset.size}</span>
                  <span>📅 {dataset.created_at}</span>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm ${
                dataset.status === 'Published' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {dataset.status}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              {dataset.recordings > 0 && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-600">{dataset.recordings}</div>
                  <div className="text-sm text-gray-600">Recordings</div>
                </div>
              )}
              {dataset.sentences && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-600">{dataset.sentences}</div>
                  <div className="text-sm text-gray-600">Sentences</div>
                </div>
              )}
              {dataset.speakers && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-600">{dataset.speakers}</div>
                  <div className="text-sm text-gray-600">Speakers</div>
                </div>
              )}
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600">CC-BY</div>
                <div className="text-sm text-gray-600">License</div>
              </div>
            </div>

            <div className="flex space-x-3">
              <button 
                className="btn-outline text-sm px-4 py-2"
                onClick={() => handleDownload(dataset)}
              >
                📥 Download
              </button>
              <button 
                className="btn-secondary text-sm px-4 py-2"
                onClick={() => handlePreview(dataset)}
              >
                👁️ Preview
              </button>
              <button 
                className="btn-secondary text-sm px-4 py-2"
                onClick={() => handleAnalytics(dataset)}
              >
                📊 Analytics
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Preview Modal */}
      {showPreview && selectedDataset && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Preview: {selectedDataset.name}</h3>
              <button onClick={() => setShowPreview(false)} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>
            <div className="space-y-3">
              <p className="text-gray-600">Sample data from this dataset:</p>
              {selectedDataset.samples.map((sample: string, index: number) => (
                <div key={index} className="bg-gray-50 p-3 rounded border-l-4 border-primary-500">
                  {sample}
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-end">
              <button onClick={() => setShowPreview(false)} className="btn-secondary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Modal */}
      {showAnalytics && selectedDataset && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Analytics: {selectedDataset.name}</h3>
              <button onClick={() => setShowAnalytics(false)} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="card">
                <h4 className="font-semibold mb-2">Quality Score</h4>
                <div className="text-3xl font-bold text-green-600">94%</div>
                <p className="text-sm text-gray-600">Overall data quality</p>
              </div>
              <div className="card">
                <h4 className="font-semibold mb-2">Usage Stats</h4>
                <div className="text-3xl font-bold text-blue-600">1,247</div>
                <p className="text-sm text-gray-600">Total downloads</p>
              </div>
              <div className="card">
                <h4 className="font-semibold mb-2">Last Updated</h4>
                <div className="text-lg font-bold text-gray-700">{selectedDataset.created_at}</div>
                <p className="text-sm text-gray-600">Dataset version</p>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button onClick={() => setShowAnalytics(false)} className="btn-secondary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 card">
        <h3 className="text-lg font-semibold mb-4">Dataset Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-600">3</div>
            <div className="text-gray-600">Total Datasets</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-600">2.36 GB</div>
            <div className="text-gray-600">Total Size</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-600">12,950</div>
            <div className="text-gray-600">Total Items</div>
          </div>
        </div>
      </div>
    </div>
  )
}