import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authApi } from '../services/api'
import { useAuthStore } from '../store/authStore'

export function TwoFactorPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [activeTab, setActiveTab] = useState<'setup' | 'verify'>('setup')
  const [verificationCode, setVerificationCode] = useState('')
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSendCode = async () => {
    if (!email) return
    
    setIsSubmitting(true)
    setError('')
    
    try {
      await authApi.send2FACode(email)
      setSuccess('Verification code sent to your email!')
      setActiveTab('verify')
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to send verification code')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleVerifyCode = async () => {
    if (!verificationCode) return
    
    setIsSubmitting(true)
    setError('')
    
    try {
      await authApi.verify2FACode(verificationCode)
      setSuccess('2FA enabled successfully!')
      setTimeout(() => navigate('/dashboard'), 2000)
    } catch (error: any) {
      setError(error.response?.data?.message || 'Invalid verification code')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🔐</div>
            <h2 className="text-3xl font-bold text-gray-900">Two-Factor Authentication</h2>
            <p className="text-gray-600 mt-2">
              Secure your account with email verification
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex mb-6 border-b">
            <button
              onClick={() => setActiveTab('setup')}
              className={`flex-1 py-2 px-4 text-center ${
                activeTab === 'setup'
                  ? 'border-b-2 border-primary-600 text-primary-600 font-medium'
                  : 'text-gray-600'
              }`}
            >
              Setup
            </button>
            <button
              onClick={() => setActiveTab('verify')}
              className={`flex-1 py-2 px-4 text-center ${
                activeTab === 'verify'
                  ? 'border-b-2 border-primary-600 text-primary-600 font-medium'
                  : 'text-gray-600'
              }`}
            >
              Verify
            </button>
          </div>

          {success && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
              {success}
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {/* Setup Tab */}
          {activeTab === 'setup' && (
            <div className="space-y-6">
              <div>
                <label className="label">Email Address</label>
                <input
                  type="email"
                  className="input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email for 2FA"
                />
              </div>

              <button
                onClick={handleSendCode}
                disabled={isSubmitting || !email}
                className="w-full btn-primary py-3 disabled:opacity-50"
              >
                {isSubmitting ? 'Sending...' : 'Send Verification Code'}
              </button>
            </div>
          )}

          {/* Verify Tab */}
          {activeTab === 'verify' && (
            <div className="space-y-6">
              <div>
                <label className="label">Verification Code</label>
                <input
                  type="text"
                  className="input text-center text-2xl tracking-widest"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="000000"
                  maxLength={6}
                />
                <p className="text-sm text-gray-600 mt-1">
                  Enter the 6-digit code sent to your email
                </p>
              </div>

              <button
                onClick={handleVerifyCode}
                disabled={isSubmitting || verificationCode.length !== 6}
                className="w-full btn-primary py-3 disabled:opacity-50"
              >
                {isSubmitting ? 'Verifying...' : 'Verify & Enable 2FA'}
              </button>

              <button
                onClick={() => setActiveTab('setup')}
                className="w-full btn-outline py-2"
              >
                Resend Code
              </button>
            </div>
          )}

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-gray-600 hover:underline"
            >
              Skip for now
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}