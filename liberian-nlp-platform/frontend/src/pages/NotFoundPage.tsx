import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="text-9xl font-bold text-primary-600 mb-4">404</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Page Not Found</h1>
          <p className="text-gray-600 mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        
        <div className="space-y-4">
          <Link 
            to="/dashboard" 
            className="btn-primary w-full py-3 text-lg"
          >
            🏠 Go to Dashboard
          </Link>
          <Link 
            to="/" 
            className="btn-outline w-full py-3 text-lg"
          >
            🇱🇷 Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}