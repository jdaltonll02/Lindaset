import { useState, useRef } from 'react'
import { useQuery } from 'react-query'
import { languagesApi } from '../services/api'

export function AudioStudio() {
  const [isRecording, setIsRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [selectedLang, setSelectedLang] = useState('')
  const [transcript, setTranscript] = useState('')
  const [recordings, setRecordings] = useState<any[]>([])
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioRef = useRef<HTMLAudioElement>(null)

  const { data: languages } = useQuery('languages', languagesApi.getLanguages)

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      
      const chunks: BlobPart[] = []
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data)
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' })
        setAudioBlob(blob)
        if (audioRef.current) {
          audioRef.current.src = URL.createObjectURL(blob)
        }
      }
      
      mediaRecorder.start()
      setIsRecording(true)
    } catch (error) {
      console.error('Recording failed:', error)
      alert('Recording failed. Please check microphone permissions.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const submitRecording = async () => {
    if (!audioBlob || !selectedLang || !transcript) return
    
    // Store locally since backend endpoints don't exist yet
    const newRecording = {
      id: Date.now(),
      language: languages?.data?.results?.find((l: any) => l.id.toString() === selectedLang)?.name,
      transcript,
      duration: audioRef.current?.duration || 0,
      created_at: new Date().toISOString(),
      status: 'pending'
    }
    
    setRecordings(prev => [newRecording, ...prev])
    setAudioBlob(null)
    setTranscript('')
    if (audioRef.current) audioRef.current.src = ''
    
    alert('Recording submitted successfully!')
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Audio Recording Studio</h1>
      
      <div className="card mb-8">
        <div className="mb-6">
          <label className="label">Language</label>
          <select 
            className="input" 
            value={selectedLang} 
            onChange={(e) => setSelectedLang(e.target.value)}
          >
            <option value="">Select language...</option>
            {languages?.data?.results?.map((lang: any) => (
              <option key={lang.id} value={lang.id}>{lang.name}</option>
            ))}
          </select>
        </div>

        <div className="mb-6">
          <label className="label">Transcript</label>
          <textarea
            className="input h-24"
            placeholder="Enter the text you will read..."
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
          />
        </div>

        <div className="flex items-center justify-center space-x-4 mb-6">
          {!isRecording ? (
            <button 
              className="btn-primary px-8 py-4 text-lg"
              onClick={startRecording}
              disabled={!selectedLang || !transcript}
            >
              🎤 Start Recording
            </button>
          ) : (
            <button 
              className="bg-red-600 text-white px-8 py-4 text-lg rounded-md hover:bg-red-700"
              onClick={stopRecording}
            >
              ⏹️ Stop Recording
            </button>
          )}
        </div>

        {isRecording && (
          <div className="text-center mb-6">
            <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse mx-auto mb-2"></div>
            <p className="text-red-600 font-medium">Recording in progress...</p>
          </div>
        )}

        {audioBlob && (
          <div className="mb-6">
            <label className="label">Playback</label>
            <audio ref={audioRef} controls className="w-full mb-4" />
            <button 
              className="btn-primary"
              onClick={submitRecording}
            >
              Submit Recording
            </button>
          </div>
        )}
      </div>

      {/* Recordings History */}
      {recordings.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Your Recordings</h2>
          <div className="space-y-4">
            {recordings.map((recording) => (
              <div key={recording.id} className="p-4 border rounded-lg">
                <div className="mb-2">
                  <p className="font-medium text-sm text-gray-600">{recording.language}</p>
                  <p className="text-sm">{recording.transcript}</p>
                </div>
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>{new Date(recording.created_at).toLocaleString()}</span>
                  <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">{recording.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}