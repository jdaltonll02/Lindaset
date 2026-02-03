import { useState } from 'react'
import { useQuery } from 'react-query'
import { languagesApi } from '../services/api'
import { useCreateLanguage } from '../hooks/useAdmin'
import { useAuthStore } from '../store/authStore'

export function LanguagesPage() {
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    iso_code: '',
    family: 'niger_congo',
    estimated_speakers: '',
    endangerment_level: 'safe',
    regions: '',
    description: ''
  })
  
  const { data: languages, isLoading } = useQuery('languages', languagesApi.getLanguages, {
    retry: false,
    onError: () => console.log('Languages API failed, using fallback')
  })
  const createLanguage = useCreateLanguage()
  const { user } = useAuthStore()
  const isAdmin = user?.role === 'admin' || user?.role === 'superuser'
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createLanguage.mutateAsync({
        ...formData,
        estimated_speakers: formData.estimated_speakers ? parseInt(formData.estimated_speakers) : null
      })
      setShowAddForm(false)
      setFormData({ name: '', iso_code: '', family: 'niger_congo', estimated_speakers: '', endangerment_level: 'safe', regions: '', description: '' })
    } catch (error) {
      console.error('Failed to create language:', error)
    }
  }

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
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600">
            {languages?.data?.results?.length || 0} languages available
          </div>
          {isAdmin && (
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-primary-800 text-white px-4 py-2 rounded-lg hover:bg-primary-900"
            >
              Add Language
            </button>
          )}
        </div>
      </div>
      
      {!languages?.data?.results || languages.data.results.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🌍</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Languages Found</h3>
          <p className="text-gray-600">Languages will appear here once they are added by administrators.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {languages.data.results.map((language: any) => (
            <div key={language.id} className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold text-lg">{language.name}</h3>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  language.endangerment_level === 'safe' ? 'bg-green-100 text-green-800' :
                  language.endangerment_level === 'vulnerable' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {language.endangerment_level?.replace('_', ' ')}
                </span>
              </div>
              
              <div className="space-y-2 text-sm text-gray-600">
                <div><strong>Family:</strong> {language.family?.replace('_', ' ')}</div>
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
      
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add New Language</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">ISO Code</label>
                <input
                  type="text"
                  value={formData.iso_code}
                  onChange={(e) => setFormData({...formData, iso_code: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Family *</label>
                <select
                  required
                  value={formData.family}
                  onChange={(e) => setFormData({...formData, family: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="niger_congo">Niger-Congo</option>
                  <option value="mande">Mande</option>
                  <option value="kru">Kru</option>
                  <option value="atlantic">Atlantic</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Speakers</label>
                <input
                  type="number"
                  value={formData.estimated_speakers}
                  onChange={(e) => setFormData({...formData, estimated_speakers: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  value={formData.endangerment_level}
                  onChange={(e) => setFormData({...formData, endangerment_level: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="safe">Safe</option>
                  <option value="vulnerable">Vulnerable</option>
                  <option value="definitely_endangered">Definitely Endangered</option>
                  <option value="severely_endangered">Severely Endangered</option>
                  <option value="critically_endangered">Critically Endangered</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Regions</label>
                <input
                  type="text"
                  value={formData.regions}
                  onChange={(e) => setFormData({...formData, regions: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2 h-20"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  disabled={createLanguage.isLoading}
                  className="flex-1 bg-primary-800 text-white py-2 rounded-lg hover:bg-primary-900 disabled:opacity-50"
                >
                  {createLanguage.isLoading ? 'Adding...' : 'Add Language'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}