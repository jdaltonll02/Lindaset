import { useAuthStore } from '../store/authStore'

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
              <p className="text-2xl font-bold">12</p>
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
              <p className="text-2xl font-bold">8</p>
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
              <p className="text-2xl font-bold">0</p>
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
              <span className="text-sm text-gray-600">4 sentences</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Kpelle</span>
              <span className="text-sm text-gray-600">3 sentences</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Gio</span>
              <span className="text-sm text-gray-600">2 sentences</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Vai</span>
              <span className="text-sm text-gray-600">2 sentences</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Mano</span>
              <span className="text-sm text-gray-600">1 sentence</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Content Status</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Submitted</span>
              <span className="text-sm text-gray-600">12 items</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Validated</span>
              <span className="text-sm text-gray-600">8 items</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Pending Review</span>
              <span className="text-sm text-gray-600">4 items</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}