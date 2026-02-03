import { Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { ProtectedRoute } from '../components/ProtectedRoute'

// Public Pages
import { LandingPage } from '../pages/LandingPage'
import { LoginPage } from '../pages/LoginPage'
import { RegisterPage } from '../pages/RegisterPage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { ForgotPasswordPage } from '../pages/ForgotPasswordPage'
import { ResetPasswordPage } from '../pages/ResetPasswordPage'
import { TwoFactorPage } from '../pages/TwoFactorPage'

// Protected Pages
import { DashboardPage } from '../pages/DashboardPage'
import { LanguagesPage } from '../pages/LanguagesPage'
import { TranslationWorkspace } from '../pages/TranslationWorkspace'
import { AudioStudio } from '../pages/AudioStudio'
import { ReviewPage } from '../pages/ReviewPage'
import { ProfilePage } from '../pages/ProfilePage'
import { AdminPage } from '../pages/AdminPage'
import { DatasetsPage } from '../pages/DatasetsPage'

interface AppRoutesProps {
  isAuthenticated: boolean
}

export function AppRoutes({ isAuthenticated }: AppRoutesProps) {
  return (
    <Routes>
      {/* Public routes - accessible to all */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/home" element={<LandingPage />} />
      <Route 
        path="/login" 
        element={isAuthenticated ? <Navigate to="/" /> : <LoginPage />} 
      />
      <Route 
        path="/register" 
        element={isAuthenticated ? <Navigate to="/" /> : <RegisterPage />} 
      />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/2fa" element={<TwoFactorPage />} />

      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/languages" element={<LanguagesPage />} />
          <Route path="/translate" element={<TranslationWorkspace />} />
          <Route path="/record" element={<AudioStudio />} />
          <Route path="/review" element={<ReviewPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/datasets" element={<DatasetsPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Route>
      </Route>

      {/* Catch all */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}