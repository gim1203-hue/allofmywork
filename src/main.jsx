import React, { lazy, Suspense, useEffect, useRef, useState } from 'react'
import ReactDOM from 'react-dom/client'
import './App.css'
import './PasswordGate.css'

const App = lazy(() => import('./App.jsx'))
const passwordDigest = '43426e829864db40a1cfa41936314298a64583c44ee947a525cb14e13234992b'

function PasswordGate() {
  const [unlocked, setUnlocked] = useState(false)
  const [showPin, setShowPin] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [checking, setChecking] = useState(false)
  const [visible, setVisible] = useState(false)
  const input = useRef(null)

  function lock() {
    setUnlocked(false)
    setShowPin(false)
    setPassword('')
    setError('')
    setVisible(false)
  }

  useEffect(() => {
    function restore(event) { if (event.persisted) lock() }
    window.addEventListener('pageshow', restore)
    return () => window.removeEventListener('pageshow', restore)
  }, [])

  useEffect(() => { if (!unlocked && showPin) input.current?.focus() }, [unlocked, showPin])

  async function unlock(event) {
    event.preventDefault()
    if (checking) return
    setChecking(true)
    setError('')
    try {
      const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(password))
      const digest = Array.from(new Uint8Array(bytes), b => b.toString(16).padStart(2, '0')).join('')
      if (digest === passwordDigest) {
        setPassword('')
        setVisible(false)
        setUnlocked(true)
      } else {
        setError('Incorrect PIN. Please try again.')
        setPassword('')
        input.current?.focus()
      }
    } catch {
      setError('Unable to unlock. Please open this site using HTTPS and try again.')
    } finally {
      setChecking(false)
    }
  }

  if (unlocked) return <>
    <button className="work-lock-button" type="button" onClick={lock}>Lock site</button>
    <Suspense fallback={<div className="work-gate">Opening your workspace…</div>}><App /></Suspense>
  </>

  return <main className="work-gate">
    <section className="work-gate-card" aria-labelledby="gate-title">
      <p className="work-gate-eyebrow">ALLOFMYWORK.COM</p>
      <h1 id="gate-title"><button className="linkdeck-logo" type="button" aria-expanded={showPin} aria-controls="pin-entry" onClick={() => setShowPin(true)}>
        <svg viewBox="0 0 48 48" width="48" height="48" fill="none" aria-hidden="true"><rect x="5" y="9" width="27" height="33" rx="7" fill="currentColor" opacity=".25"/><rect x="15" y="4" width="28" height="34" rx="7" stroke="currentColor" strokeWidth="3"/><path d="M23 15h12M23 23h12M23 31h7" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/></svg>
        <span>LinkDeck</span><span className="logo-arrow" aria-hidden="true">↗</span>
      </button></h1>
      <p className="work-gate-intro">All your work, in one place. Explore your live projects, useful tools, learning resources, and AI assistant—plus search, weather, radio, calendar, and files.</p>
      {!showPin && <p className="work-gate-prompt">Tap LinkDeck to enter your PIN.</p>}
      {showPin && <form id="pin-entry" onSubmit={unlock}>
        <label htmlFor="work-password">Enter your PIN</label>
        <div className="work-password-row">
          <input ref={input} id="work-password" type={visible ? 'text' : 'password'} value={password}
            onChange={e => setPassword(e.target.value)} required inputMode="numeric" pattern="[0-9]*" autoComplete="current-password"
            aria-invalid={Boolean(error)} aria-describedby={error ? 'work-gate-error' : undefined} />
          <button type="button" onClick={() => setVisible(v => !v)} aria-pressed={visible}>
            {visible ? 'Hide' : 'Show'}
          </button>
        </div>
        <p className="work-gate-error" id="work-gate-error" role="alert">{error}</p>
        <button className="work-unlock-button" type="submit" disabled={checking}>{checking ? 'Checking…' : 'Unlock workspace'}</button>
      </form>}
      <p className="work-gate-note">Your workspace locks each time you open or refresh this page.</p>
    </section>
  </main>
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode><PasswordGate /></React.StrictMode>,
)
