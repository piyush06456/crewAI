import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import './index.css'

function App() {
  const [jobDesc, setJobDesc] = useState('')
  const [candidateProfile, setCandidateProfile] = useState('')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const profileReady = candidateProfile.trim().length > 0
  const jobReady = jobDesc.trim().length > 0

  const loadExample = () => {
    setJobDesc('We are looking for a Product Designer to shape clear, intuitive experiences for a fast-growing climate technology company. You will partner with engineering and research to turn complex workflows into simple tools. The ideal candidate has 3+ years of product design experience, strong Figma skills, and a thoughtful approach to accessibility and systems thinking.')
    setCandidateProfile('Product designer with 5 years of experience designing B2B SaaS products from discovery through launch. Led a redesign that improved activation by 28%, built a shared component library used by four product teams, and regularly facilitate workshops with customers and engineers. Figma, prototyping, user research, accessibility, and design systems.')
    setError('')
  }

  const clearAll = () => {
    setJobDesc('')
    setCandidateProfile('')
    setResult('')
    setError('')
  }

  const handleGenerate = async () => {
    if (!jobDesc.trim() || !candidateProfile.trim()) {
      setError('Please provide both a job description and your resume/profile.')
      return
    }

    setLoading(true)
    setError('')
    setResult('')

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 180000)

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'
      const response = await fetch(`${apiUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
        body: JSON.stringify({
          job_desc: jobDesc.trim(),
          candidate_profile: candidateProfile.trim()
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        let detail = 'Failed to generate application.'
        try {
          detail = JSON.parse(errorText).detail || detail
        } catch {
          if (errorText) detail = errorText
        }
        throw new Error(detail)
      }

      const data = await response.json()
      if (!data.result) throw new Error('The AI returned an empty application package.')
      setResult(data.result)
    } catch (err) {
      setError(err.name === 'AbortError' ? 'Generation timed out. Please try again.' : err.message || 'Unable to reach the application server.')
    } finally {
      clearTimeout(timeoutId)
      setLoading(false)
    }
  }

  return (
    <div className="app-shell">
      <nav className="topbar">
        <a className="brand" href="/" aria-label="CREWAI home">
          <span className="brand-mark" aria-hidden="true">C</span>
          <span>CREWAI</span>
        </a>
        <div className="topbar-meta">
          <span className="status-dot"></span>
          <span>AI workspace</span>
          <button className="text-button" onClick={loadExample}>Load example</button>
        </div>
      </nav>

      <main className="workspace">
        <section className="intro">
          <div>
            <p className="eyebrow">Your next application, considered</p>
            <h1>Make your experience<br /><em>impossible to miss.</em></h1>
          </div>
          <p className="intro-copy">Share the role and your story. We will shape a focused application package around the overlap.</p>
        </section>

        <section className="studio-grid">
          <div className="input-column">
            <div className="section-heading">
              <div><span className="step-number">01</span><h2>Set the context</h2></div>
              <button className="clear-button" onClick={clearAll} disabled={!jobDesc && !candidateProfile && !result}>Clear all</button>
            </div>

            <div className="input-group">
              <div className="label-row"><label htmlFor="job-description">The role</label><span>{jobReady ? 'Ready' : 'Required'}</span></div>
            <textarea 
                id="job-description"
              placeholder="Paste the target job description here..."
              value={jobDesc}
              onChange={(e) => setJobDesc(e.target.value)}
              disabled={loading}
            />
          </div>

            <div className="input-group">
              <div className="label-row"><label htmlFor="candidate-profile">Your story</label><span>{profileReady ? 'Ready' : 'Required'}</span></div>
            <textarea 
                id="candidate-profile"
              placeholder="Paste your resume, skills, or LinkedIn summary here..."
              value={candidateProfile}
              onChange={(e) => setCandidateProfile(e.target.value)}
              disabled={loading}
            />
          </div>

            {error && <div className="error-box" role="alert">{error}</div>}

            <div className="action-row">
              <button className={`generate-btn ${loading ? 'loading' : ''}`} onClick={handleGenerate} disabled={loading}>
                {loading ? <><span className="spinner"></span> Building your package</> : <>Generate package <span className="button-arrow">-&gt;</span></>}
              </button>
              <span className="secure-note">Private to this session</span>
            </div>
          </div>

          <aside className={`result-container ${result ? 'has-result' : ''}`}>
            <div className="result-heading">
              <div><span className="step-number">02</span><h2>Your package</h2></div>
              {result && <span className="result-badge">Generated</span>}
            </div>
            {result ? <div className="result-content"><ReactMarkdown>{result}</ReactMarkdown></div> : (
              <div className="empty-result">
                <div className="empty-icon">+</div>
                <h3>A sharper application is waiting.</h3>
                <p>Your tailored cover letter, resume highlights, interview prompts, and salary guidance will appear here.</p>
              </div>
            )}
          </aside>
        </section>

      </main>

        <footer><span>Built for thoughtful applications</span><span>Powered by CrewAI + Gemini</span></footer>
      </div>
  )
}

export default App
