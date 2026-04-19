import { useState, useEffect, useMemo, useCallback } from 'react'
import Icon from './Icon'
import { DifficultyBadge, ToastProvider } from './Shared'
import Landing from './Landing'
import Dashboard from './Dashboard'
import Explorer from './Explorer'
import Detail from './Detail'
import Analytics from './Analytics'
import Tweaks from './Tweaks'
import { PROBLEMS, CATEGORIES } from '../data'

const DEFAULT_TWEAKS = {
  accentH: 258,
  theme: 'light',
  density: 'comfortable',
  ringStyle: 'solid',
  sidebar: 'expanded',
}

const STORAGE_KEY = 'dsa-tracker-v1'

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
    return {
      problems: saved.problems || PROBLEMS,
      activeScreen: saved.activeScreen || 'dashboard',
      tweaks: { ...DEFAULT_TWEAKS, ...(saved.tweaks || {}) },
      activeProblemId: saved.activeProblemId || null,
      user: saved.user || null,
    }
  } catch {
    return {
      problems: PROBLEMS,
      activeScreen: 'dashboard',
      tweaks: { ...DEFAULT_TWEAKS },
      activeProblemId: null,
      user: null,
    }
  }
}

const App = () => {
  const [problems, setProblems] = useState(() => loadState().problems)
  const [activeScreen, setActiveScreen] = useState(() => loadState().activeScreen)
  const [activeProblem, setActiveProblem] = useState(() => {
    const s = loadState()
    return s.activeProblemId ? (s.problems.find(p => p.id === s.activeProblemId) || null) : null
  })
  const [explorerFilters, setExplorerFilters] = useState(null)
  const [tweaks, setTweaks] = useState(() => loadState().tweaks)
  const [user, setUser] = useState(() => loadState().user)
  const [showTweaks, setShowTweaks] = useState(false)
  const [cmdKOpen, setCmdKOpen] = useState(false)
  const [cmdKQuery, setCmdKQuery] = useState('')

  // Apply tweaks to :root
  useEffect(() => {
    const root = document.documentElement
    root.setAttribute('data-theme', tweaks.theme)
    root.setAttribute('data-density', tweaks.density)
    root.style.setProperty('--accent-h', tweaks.accentH)
    root.style.setProperty('--accent', `oklch(0.58 0.18 ${tweaks.accentH})`)
    root.style.setProperty('--accent-hover', `oklch(0.53 0.19 ${tweaks.accentH})`)
    root.style.setProperty('--accent-ring', `oklch(0.58 0.18 ${tweaks.accentH} / 0.25)`)
    if (tweaks.theme === 'light') {
      root.style.setProperty('--accent-soft', `oklch(0.96 0.03 ${tweaks.accentH})`)
    } else {
      root.style.setProperty('--accent-soft', `oklch(0.28 0.08 ${tweaks.accentH})`)
    }
  }, [tweaks])

  // Persist
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        problems, activeScreen, tweaks,
        activeProblemId: activeProblem?.id || null,
        user,
      }))
    } catch {}
  }, [problems, activeScreen, tweaks, activeProblem, user])

  const updateTweaks = (patch) => {
    setTweaks(t => ({ ...t, ...patch }))
  }

  // Keyboard shortcut for search
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setCmdKOpen(v => !v)
      } else if (e.key === 'Escape') {
        setCmdKOpen(false)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const updateProblem = useCallback((id, patch) => {
    setProblems(ps => ps.map(p => p.id === id ? { ...p, ...patch, lastTouched: 0 } : p))
    if (activeProblem?.id === id) setActiveProblem(p => ({ ...p, ...patch }))
  }, [activeProblem])

  const openProblem = useCallback((p) => {
    setActiveProblem(p)
    setActiveScreen('detail')
  }, [])

  const navigate = useCallback((screen, opts) => {
    if (screen === 'detail' && opts?.problem) {
      setActiveProblem(opts.problem)
    }
    if (screen === 'explorer' && opts) {
      setExplorerFilters(opts)
    } else if (screen === 'explorer') {
      setExplorerFilters(null)
    }
    setActiveScreen(screen)
    document.querySelector('.content')?.scrollTo({ top: 0 })
  }, [])

  const categories = CATEGORIES
  const solvedCount = problems.filter(p => p.status === 'solved').length
  const bookmarkedCount = problems.filter(p => p.status === 'bookmarked').length
  const revisitCount = problems.filter(p => p.status === 'revisit' || p.status === 'stuck').length

  const screenMeta = {
    dashboard: { title: 'Dashboard', sub: 'Overview' },
    explorer: { title: 'Problem Explorer', sub: 'Browse · Filter · Track' },
    detail: { title: activeProblem?.title || 'Problem', sub: activeProblem?.categoryName },
    analytics: { title: 'Analytics', sub: 'Patterns & reports' },
  }
  const meta = screenMeta[activeScreen]

  // Command palette matches
  const cmdKMatches = useMemo(() => {
    if (!cmdKQuery.trim()) return problems.slice(0, 8)
    const q = cmdKQuery.toLowerCase()
    return problems.filter(p => p.title.toLowerCase().includes(q) || p.categoryName.toLowerCase().includes(q)).slice(0, 10)
  }, [cmdKQuery, problems])

  if (!user) {
    return <Landing onSetup={(u) => setUser(u)} />
  }

  return (
    <ToastProvider>
      <div className="app" data-nav={tweaks.sidebar}>
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="sidebar-brand">
            <div className="brand-mark">DS</div>
            {tweaks.sidebar === 'expanded' && (
              <div className="col" style={{ gap: 0 }}>
                <div className="brand-name">DSA Tracker</div>
                <div className="brand-sub">{problems.length} problems</div>
              </div>
            )}
          </div>

          <nav className="sidebar-nav">
            {tweaks.sidebar === 'expanded' && <div className="nav-section-label">Workspace</div>}
            <button className={`nav-item ${activeScreen === 'dashboard' ? 'active' : ''}`} onClick={() => navigate('dashboard')}>
              <Icon name="dashboard" className="icon"/>
              {tweaks.sidebar === 'expanded' && <span>Dashboard</span>}
            </button>
            <button className={`nav-item ${activeScreen === 'explorer' ? 'active' : ''}`} onClick={() => navigate('explorer')}>
              <Icon name="list" className="icon"/>
              {tweaks.sidebar === 'expanded' && <><span>Problems</span><span className="count">{problems.length}</span></>}
            </button>
            <button className={`nav-item ${activeScreen === 'analytics' ? 'active' : ''}`} onClick={() => navigate('analytics')}>
              <Icon name="chart" className="icon"/>
              {tweaks.sidebar === 'expanded' && <span>Analytics</span>}
            </button>

            {tweaks.sidebar === 'expanded' && (
              <>
                <div className="nav-section-label">Queues</div>
                <button className="nav-item" onClick={() => navigate('explorer', { status: 'revisit' })}>
                  <span className="status-dot revisit" style={{ width: 10, height: 10 }}/>
                  <span>Revisit</span>
                  <span className="count">{revisitCount}</span>
                </button>
                <button className="nav-item" onClick={() => navigate('explorer', { status: 'bookmarked' })}>
                  <Icon name="bookmark" className="icon"/>
                  <span>Bookmarked</span>
                  <span className="count">{bookmarkedCount}</span>
                </button>
                <button className="nav-item" onClick={() => navigate('explorer', { status: 'solved' })}>
                  <Icon name="check" className="icon"/>
                  <span>Solved</span>
                  <span className="count">{solvedCount}</span>
                </button>

                <div className="nav-section-label">Categories</div>
                {categories.map(c => {
                  const cSolved = problems.filter(p => p.category === c.id && p.status === 'solved').length
                  return (
                    <button key={c.id} className="nav-item" onClick={() => navigate('explorer', { category: c.id })}>
                      <div style={{ width: 14, height: 14, borderRadius: 4, background: `oklch(0.85 0.08 ${({arrays: 258, 'binary-search': 180, recursion: 295, 'linked-list': 60})[c.id] || 258})`, flexShrink: 0 }}/>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</span>
                      <span className="count">{cSolved}/{c.total}</span>
                    </button>
                  )
                })}
              </>
            )}
          </nav>

          {tweaks.sidebar === 'expanded' && (
            <div className="sidebar-footer">
              <div className="level-card">
                <div className="level-top">
                  <span className="level-badge">LEVEL 14</span>
                  <span className="mono faint" style={{ fontSize: 10 }}>{solvedCount * 30} XP</span>
                </div>
                <div className="level-name">Pattern Apprentice</div>
                <div className="xp-bar mt-8"><div className="xp-fill" style={{ width: `${Math.min(100, (solvedCount / problems.length) * 100)}%` }}/></div>
                <div className="xp-label">
                  <span>{solvedCount}/{problems.length}</span>
                  <span>next: Pattern Breaker</span>
                </div>
              </div>
            </div>
          )}
        </aside>

        {/* Main */}
        <main className="main">
          <header className="topbar">
            <button className="icon-btn" onClick={() => updateTweaks({ sidebar: tweaks.sidebar === 'expanded' ? 'collapsed' : 'expanded' })} title="Toggle sidebar">
              <Icon name="menu" size={16}/>
            </button>
            <div className="col" style={{ gap: 0 }}>
              <div className="topbar-title">{meta.title}</div>
              {meta.sub && <div className="topbar-crumbs">{meta.sub}</div>}
            </div>
            <div className="topbar-spacer"/>
            <button className="topbar-search" onClick={() => setCmdKOpen(true)} style={{ cursor: 'pointer' }}>
              <Icon name="search" size={13} className="faint"/>
              <span className="faint" style={{ fontSize: 13, flex: 1, textAlign: 'left' }}>Search problems...</span>
              <kbd>⌘K</kbd>
            </button>
            <button className="icon-btn" onClick={() => updateTweaks({ theme: tweaks.theme === 'light' ? 'dark' : 'light' })} title="Toggle theme">
              <Icon name={tweaks.theme === 'light' ? 'moon' : 'sun'} size={15}/>
            </button>
            <button className="icon-btn" onClick={() => setShowTweaks(v => !v)} title="Tweaks">
              <Icon name="settings" size={15}/>
            </button>
          </header>

          <div className="content">
            {activeScreen === 'dashboard' && (
              <Dashboard problems={problems} categories={categories} onOpenProblem={openProblem} onNavigate={navigate} ringStyle={tweaks.ringStyle} user={user}/>
            )}
            {activeScreen === 'explorer' && (
              <Explorer problems={problems} categories={categories} initialFilters={explorerFilters} onOpenProblem={openProblem} onUpdate={updateProblem}/>
            )}
            {activeScreen === 'detail' && activeProblem && (
              <Detail problem={activeProblem} problems={problems} onUpdate={updateProblem} onClose={() => navigate('explorer')} onNavigate={navigate}/>
            )}
            {activeScreen === 'analytics' && (
              <Analytics problems={problems} categories={categories}/>
            )}
          </div>
        </main>

        {showTweaks && (
          <Tweaks state={tweaks} setState={updateTweaks} onClose={() => setShowTweaks(false)}/>
        )}

        {cmdKOpen && (
          <div className="modal-backdrop" onClick={() => setCmdKOpen(false)}>
            <div className="modal" onClick={e => e.stopPropagation()} style={{ width: 600 }}>
              <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <Icon name="search" size={16} className="faint"/>
                <input
                  autoFocus
                  placeholder="Search problems, categories, tags..."
                  value={cmdKQuery}
                  onChange={e => setCmdKQuery(e.target.value)}
                  style={{ flex: 1, border: 0, outline: 'none', background: 'transparent', fontSize: 15 }}
                />
                <kbd style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-faint)', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 4, padding: '1px 5px' }}>ESC</kbd>
              </div>
              <div style={{ maxHeight: 400, overflow: 'auto', padding: 8 }}>
                {cmdKMatches.length === 0 && <div className="empty">No matches</div>}
                {cmdKMatches.map(p => (
                  <button
                    key={p.id}
                    className="row gap-8"
                    onClick={() => { openProblem(p); setCmdKOpen(false); setCmdKQuery('') }}
                    style={{ width: '100%', padding: '10px 12px', border: 0, background: 'transparent', borderRadius: 6, cursor: 'pointer', textAlign: 'left' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--hover)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <span className={`status-dot ${p.status}`}/>
                    <span className="mono faint" style={{ fontSize: 11 }}>#{String(p.id).padStart(3,'0')}</span>
                    <span style={{ flex: 1, fontSize: 13, fontWeight: 500 }}>{p.title}</span>
                    <span className="faint" style={{ fontSize: 11 }}>{p.categoryName}</span>
                    <DifficultyBadge value={p.difficulty}/>
                  </button>
                ))}
              </div>
              <div style={{ padding: '10px 14px', borderTop: '1px solid var(--border)', fontSize: 11, color: 'var(--text-faint)', display: 'flex', gap: 14, fontFamily: 'var(--font-mono)' }}>
                <span>↑↓ navigate</span>
                <span>⏎ open</span>
                <span style={{ marginLeft: 'auto' }}>{problems.length} problems</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </ToastProvider>
  )
}

export default App
