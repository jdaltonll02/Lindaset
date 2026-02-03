import { useState } from 'react'
import { useQuery } from 'react-query'
import { api } from '../services/api'

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