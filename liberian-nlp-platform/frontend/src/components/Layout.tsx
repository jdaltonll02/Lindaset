import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export function Layout() {
  const location = useLocation()
  const { user, logout } = useAuthStore()

  const userRole = user?.role || 'contributor'
  const isAdmin = userRole === 'admin' || userRole === 'superuser'

  const navigation = [
    { name: 'Home', href: '/', icon: '🏠' },
    { name: 'Dashboard', href: '/dashboard', icon: '📊' },
    { name: 'Languages', href: '/languages', icon: '🌍' },
    { name: 'Translate', href: '/translate', icon: '🔄' },
    { name: 'Record', href: '/record', icon: '🎤' },
    { name: 'Review', href: '/review', icon: '🔍' },
    { name: 'Datasets', href: '/datasets', icon: '📁' },
    ...(isAdmin ? [{ name: 'Admin', href: '/admin', icon: '⚙️' }] : []),
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <span className="text-2xl mr-3">🇱🇷</span>
                <h1 className="text-xl font-semibold text-gray-900">
                  Liberian NLP Platform
                </h1>
              </Link>
            </div>
            
            <div className="flex items-center space-x-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    location.pathname === item.href
                      ? 'bg-primary-100 text-primary-800'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.name}
                </Link>
              ))}
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Hello, {String(user?.username || 'User')}</span>
              <Link to="/profile" className="text-sm text-primary-600 hover:text-primary-800">
                Profile
              </Link>
              <button 
                onClick={logout}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  )
}