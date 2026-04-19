import { useState, useRef, useEffect } from 'react'

const AVATAR_COLORS = [
  { bg: 'oklch(0.58 0.18 258)', label: 'Purple' },
  { bg: 'oklch(0.58 0.18 220)', label: 'Blue' },
  { bg: 'oklch(0.60 0.16 170)', label: 'Teal' },
  { bg: 'oklch(0.62 0.15 150)', label: 'Green' },
  { bg: 'oklch(0.65 0.16 75)', label: 'Amber' },
  { bg: 'oklch(0.58 0.18 25)', label: 'Red' },
  { bg: 'oklch(0.55 0.18 320)', label: 'Pink' },
  { bg: 'oklch(0.50 0.14 260)', label: 'Indigo' },
]

const FEATURES = [
  { icon: '🔥', title: 'Streaks', desc: 'Daily tracking with heatmaps. Don\'t break the chain.' },
  { icon: '⚡', title: 'Multi-language', desc: 'Save solutions in C++, Java, Python — all in one place.' },
  { icon: '📊', title: 'Progress analytics', desc: 'See where you stand across topics and difficulty.' },
]

const Landing = ({ onSetup }) => {
  const [step, setStep] = useState('hero')
  const [name, setName] = useState('')
  const [avatarIdx, setAvatarIdx] = useState(0)
  const inputRef = useRef(null)

  useEffect(() => {
    const prev = document.documentElement.getAttribute('data-theme')
    document.documentElement.setAttribute('data-theme', 'dark')
    return () => {
      if (prev) {
        document.documentElement.setAttribute('data-theme', prev)
      } else {
        document.documentElement.removeAttribute('data-theme')
      }
    }
  }, [])

  const initials = name.trim()
    ? name.trim().split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : '?'

  const handleGetStarted = () => {
    setStep('setup')
    setTimeout(() => inputRef.current?.focus(), 300)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim()) return
    onSetup({ name: name.trim(), avatar: AVATAR_COLORS[avatarIdx].bg })
  }

  return (
    <div className="landing">
      <div className={`landing-hero ${step === 'setup' ? 'landing-hero--shifted' : ''}`}>
        <div className="landing-brand">
          <div className="landing-logo">DS</div>
          <span className="landing-logo-text">DSA Tracker</span>
        </div>

        <h1 className="landing-title">Level up your DSA game</h1>
        <p className="landing-subtitle">
          Track your progress, build streaks, and see exactly where you stand.
        </p>

        <div className="landing-features">
          {FEATURES.map((f, i) => (
            <div key={i} className="landing-feature-card">
              <span className="landing-feature-icon">{f.icon}</span>
              <div>
                <div className="landing-feature-title">{f.title}</div>
                <div className="landing-feature-desc">{f.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <button className="landing-cta" onClick={handleGetStarted}>
          Get started
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10m0 0L9 4m4 4L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      </div>

      <div className={`landing-setup ${step === 'setup' ? 'landing-setup--visible' : ''}`}>
        <form className="landing-setup-card" onSubmit={handleSubmit}>
          <h2 className="landing-setup-title">Set up your profile</h2>
          <p className="landing-setup-sub">Pick a name and color to get started.</p>

          <div className="landing-avatar-preview" style={{ background: AVATAR_COLORS[avatarIdx].bg }}>
            {initials}
          </div>

          <label className="landing-label">Your name</label>
          <input
            ref={inputRef}
            className="landing-input"
            type="text"
            placeholder="e.g. Aarav"
            value={name}
            onChange={e => setName(e.target.value)}
            maxLength={30}
          />

          <label className="landing-label">Avatar color</label>
          <div className="landing-avatar-picker">
            {AVATAR_COLORS.map((c, i) => (
              <button
                key={i}
                type="button"
                className={`landing-avatar-swatch ${avatarIdx === i ? 'active' : ''}`}
                style={{ background: c.bg }}
                onClick={() => setAvatarIdx(i)}
                title={c.label}
              />
            ))}
          </div>

          <button
            type="submit"
            className="landing-cta landing-cta--full"
            disabled={!name.trim()}
          >
            Start tracking
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10m0 0L9 4m4 4L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </form>
      </div>
    </div>
  )
}

export default Landing
