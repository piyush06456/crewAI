import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import './index.css'

function App() {
  const [jobDesc, setJobDesc] = useState('')
  const [candidateProfile, setCandidateProfile] = useState('')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleGenerate = async () => {
    if (!jobDesc || !candidateProfile) {
      setError('Please provide both a job description and your resume/profile.')
      return
    }

    setLoading(true)
    setError('')
    setResult('')

    try {
      const response = await fetch('http://127.0.0.1:8000/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          job_desc: jobDesc,
          candidate_profile: candidateProfile
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to generate application.')
      }

      const data = await response.json()
      setResult(data.result)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <div className="glass-panel main-panel">
        <header>
          <div className="logo-glow"></div>
          <h1>AI Application <span>Generator</span></h1>
          <p>Powered by CrewAI & Gemini 2.5 Flash</p>
        </header>

        <main>
          <div className="input-group">
            <label>Job Description</label>
            <textarea 
              placeholder="Paste the target job description here..."
              value={jobDesc}
              onChange={(e) => setJobDesc(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="input-group">
            <label>Your Resume / Profile</label>
            <textarea 
              placeholder="Paste your resume, skills, or LinkedIn summary here..."
              value={candidateProfile}
              onChange={(e) => setCandidateProfile(e.target.value)}
              disabled={loading}
            />
          </div>

          {error && <div className="error-box">{error}</div>}

          <button 
            className={`generate-btn ${loading ? 'loading' : ''}`}
            onClick={handleGenerate}
            disabled={loading}
          >
            {loading ? (
              <span className="loader-text">Analyzing Requirements...</span>
            ) : (
              'Generate Custom Application'
            )}
          </button>

          {result && (
            <div className="result-container">
              <h3>Your Tailored Application Package</h3>
              <div className="result-content">
                <ReactMarkdown>{result}</ReactMarkdown>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default App
