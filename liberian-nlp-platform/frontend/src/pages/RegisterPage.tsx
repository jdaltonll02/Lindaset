import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authApi } from '../services/api'
import { useAuthStore } from '../store/authStore'
import { LIBERIAN_LANGUAGES, VALIDATION_RULES } from '../utils/constants'
import { isValidEmail } from '../utils/helpers'

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
  const { register } = useAuthStore()

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.username.trim()) newErrors.username = 'Username is required'
    if (formData.username.length < VALIDATION_RULES.MIN_USERNAME_LENGTH) {
      newErrors.username = `Username must be at least ${VALIDATION_RULES.MIN_USERNAME_LENGTH} characters`
    }
    
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    if (!isValidEmail(formData.email)) newErrors.email = 'Invalid email format'
    
    if (!formData.password) newErrors.password = 'Password is required'
    if (formData.password.length < VALIDATION_RULES.MIN_PASSWORD_LENGTH) {
      newErrors.password = `Password must be at least ${VALIDATION_RULES.MIN_PASSWORD_LENGTH} characters`
    }
    
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
      await register(formData)
      setShowSuccess(true)
      setTimeout(() => navigate('/dashboard'), 2000)
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
                {LIBERIAN_LANGUAGES.map(language => (
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