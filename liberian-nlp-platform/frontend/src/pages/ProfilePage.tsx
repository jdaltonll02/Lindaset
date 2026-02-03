import { useState } from 'react'
import { useAuthStore } from '../store/authStore'

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