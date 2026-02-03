import { useState } from 'react'
import { useQuery } from 'react-query'
import { languagesApi } from '../services/api'

export function TranslationWorkspace() {
  const [sourceText, setSourceText] = useState('')
  const [targetText, setTargetText] = useState('')
  const [sourceLang, setSourceLang] = useState('')
  const [targetLang, setTargetLang] = useState('')
  const [submissions, setSubmissions] = useState<any[]>([])

  const { data: languages } = useQuery('languages', languagesApi.getLanguages)

  const handleSubmit = async () => {
    if (!sourceText || !targetText || !sourceLang || !targetLang) return
    
    // Store locally since backend endpoints don't exist yet
    const newSubmission = {
      id: Date.now(),
      source_text: sourceText,
      target_text: targetText,
      source_language: languages?.data?.results?.find((l: any) => l.id.toString() === sourceLang)?.name,
      target_language: languages?.data?.results?.find((l: any) => l.id.toString() === targetLang)?.name,
      created_at: new Date().toISOString(),
      status: 'pending'
    }
    
    setSubmissions(prev => [newSubmission, ...prev])
    setSourceText('')
    setTargetText('')
    
    // Show success message
    alert('Translation pair submitted successfully!')
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Translation Workspace</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Source Text */}
        <div className="card">
          <div className="mb-4">
            <label className="label">Source Language</label>
            <select 
              className="input" 
              value={sourceLang} 
              onChange={(e) => setSourceLang(e.target.value)}
            >
              <option value="">Select language...</option>
              {languages?.data?.results?.map((lang: any) => (
                <option key={lang.id} value={lang.id}>{lang.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Source Text</label>
            <textarea
              className="input h-40 resize-none"
              placeholder="Enter text to translate..."
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
            />
          </div>
        </div>

        {/* Target Text */}
        <div className="card">
          <div className="mb-4">
            <label className="label">Target Language</label>
            <select 
              className="input" 
              value={targetLang} 
              onChange={(e) => setTargetLang(e.target.value)}
            >
              <option value="">Select language...</option>
              {languages?.data?.results?.map((lang: any) => (
                <option key={lang.id} value={lang.id}>{lang.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Translation</label>
            <textarea
              className="input h-40 resize-none"
              placeholder="Enter translation..."
              value={targetText}
              onChange={(e) => setTargetText(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-center mb-8">
        <button 
          className="btn-primary px-8 py-3"
          onClick={handleSubmit}
          disabled={!sourceText || !targetText || !sourceLang || !targetLang}
        >
          Submit Translation
        </button>
      </div>

      {/* Submissions History */}
      {submissions.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Your Submissions</h2>
          <div className="space-y-4">
            {submissions.map((submission) => (
              <div key={submission.id} className="p-4 border rounded-lg">
                <div className="grid grid-cols-2 gap-4 mb-2">
                  <div>
                    <p className="font-medium text-sm text-gray-600">{submission.source_language}</p>
                    <p className="text-sm">{submission.source_text}</p>
                  </div>
                  <div>
                    <p className="font-medium text-sm text-gray-600">{submission.target_language}</p>
                    <p className="text-sm">{submission.target_text}</p>
                  </div>
                </div>
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>{new Date(submission.created_at).toLocaleString()}</span>
                  <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">{submission.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}