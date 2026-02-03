import { useState } from 'react'
import { useQuery } from 'react-query'
import { languagesApi } from '../services/api'

export function ReviewPage() {
  const [selectedLanguage, setSelectedLanguage] = useState('')
  const { data: languages } = useQuery('languages', languagesApi.getLanguages)

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Review Contributions</h1>
      
      <div className="card mb-8">
        <div className="mb-6">
          <label className="label">Select Language to Review</label>
          <select 
            className="input" 
            value={selectedLanguage} 
            onChange={(e) => setSelectedLanguage(e.target.value)}
          >
            <option value="">Choose a language...</option>
            {languages?.data?.results?.map((lang: any) => (
              <option key={lang.id} value={lang.id}>{lang.name}</option>
            ))}
          </select>
        </div>
      </div>

      {selectedLanguage && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Pending Text Reviews</h2>
            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Translation Pair</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="font-medium">Source:</p>
                    <p className="text-sm">Sample text awaiting review...</p>
                  </div>
                  <div>
                    <p className="font-medium">Translation:</p>
                    <p className="text-sm">Sample translation awaiting review...</p>
                  </div>
                </div>
                <div className="flex space-x-2 mt-4">
                  <button className="btn-primary text-sm">Approve</button>
                  <button className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700">Reject</button>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Pending Audio Reviews</h2>
            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Audio Recording</p>
                <p className="font-medium mb-2">Transcript: Sample audio transcript...</p>
                <div className="mb-4">
                  <audio controls className="w-full">
                    <source src="" type="audio/wav" />
                    Your browser does not support audio playback.
                  </audio>
                </div>
                <div className="flex space-x-2">
                  <button className="btn-primary text-sm">Approve</button>
                  <button className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700">Reject</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {!selectedLanguage && (
        <div className="text-center py-12">
          <p className="text-gray-500">Select a language to start reviewing contributions</p>
        </div>
      )}
    </div>
  )
}