import { useState, useEffect } from 'react'
import Icon from './Icon'
import { DifficultyBadge, STATUS_META, useToast } from './Shared'

const LANG_LABELS = { javascript: 'JavaScript', python: 'Python', java: 'Java', cpp: 'C++' }

function syntaxHighlight(code, lang) {
  if (!code) return ''
  let esc = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const keywords = {
    javascript: ['function','const','let','var','return','if','else','for','while','new','in','of','true','false','null','undefined','class','this','=>'],
    python: ['def','return','if','elif','else','for','while','in','not','and','or','True','False','None','class','self','lambda','import','from'],
    java: ['public','private','protected','class','static','void','int','String','return','if','else','for','while','new','true','false','null','List','ArrayList','Map','HashMap','int[]'],
    cpp: ['int','void','return','if','else','for','while','vector','string','bool','true','false','nullptr','auto','const','class','struct'],
  }[lang] || []
  esc = esc.replace(/("[^"\n]*"|'[^'\n]*')/g, '<span class="str">$1</span>')
  esc = esc.replace(/(\/\/[^\n]*|#[^\n]*)/g, '<span class="cm">$1</span>')
  esc = esc.replace(/\b(\d+\.?\d*)\b/g, '<span class="num-tok">$1</span>')
  keywords.forEach(k => {
    const safe = k.replace(/[[\]+.*]/g, '\\$&')
    const re = new RegExp(`\\b(${safe})\\b`, 'g')
    esc = esc.replace(re, '<span class="kw">$1</span>')
  })
  return esc
}

const Detail = ({ problem, problems, onUpdate, onClose, onNavigate }) => {
  const [tab, setTab] = useState('description')
  const [lang, setLang] = useState('javascript')
  const [notes, setNotes] = useState('')
  const [showHints, setShowHints] = useState(false)
  const [hintsRevealed, setHintsRevealed] = useState(0)
  const toast = useToast()

  const NOTES_KEY = `dsa-notes-${problem.id}`
  useEffect(() => {
    try { setNotes(localStorage.getItem(NOTES_KEY) || '') } catch {}
    setHintsRevealed(0); setShowHints(false); setTab('description')
  }, [problem.id])
  useEffect(() => {
    try { localStorage.setItem(NOTES_KEY, notes) } catch {}
  }, [notes])

  const idx = problems.findIndex(p => p.id === problem.id)
  const prev = idx > 0 ? problems[idx - 1] : null
  const next = idx < problems.length - 1 ? problems[idx + 1] : null

  const code = problem.code?.[lang] || ''
  const meta = STATUS_META[problem.status]

  const markSolved = () => {
    onUpdate(problem.id, { status: 'solved' })
    toast.push(`"${problem.title}" marked solved · +${problem.difficulty === 'hard' ? 80 : problem.difficulty === 'medium' ? 40 : 20} XP`, 'check')
  }

  return (
    <div className="content-inner col gap-16">
      {/* Breadcrumb + nav */}
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <div className="row gap-8 mono faint" style={{ fontSize: 12 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => onNavigate('explorer')}>
            <Icon name="chevron_left" size={12}/> Back to Explorer
          </button>
          <span>/</span>
          <span>{problem.categoryName}</span>
          <span>/</span>
          <span>#{String(problem.id).padStart(3, '0')}</span>
        </div>
        <div className="row gap-8">
          <button className="btn btn-sm" disabled={!prev} onClick={() => prev && onNavigate('detail', { problem: prev })}>
            <Icon name="chevron_left" size={12}/> Prev
          </button>
          <button className="btn btn-sm" disabled={!next} onClick={() => next && onNavigate('detail', { problem: next })}>
            Next <Icon name="chevron_right" size={12}/>
          </button>
        </div>
      </div>

      {/* Title row */}
      <div className="card card-pad">
        <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div className="col gap-8" style={{ flex: 1 }}>
            <div className="row gap-8">
              <span className="mono faint" style={{ fontSize: 12 }}>#{String(problem.id).padStart(3, '0')}</span>
              <DifficultyBadge value={problem.difficulty}/>
              <span className="badge"><Icon name="tag" size={10}/> {problem.topic}</span>
              {problem.frequency && (
                <span className="badge" title={`Interview frequency ${problem.frequency}%`}>
                  <Icon name="flame" size={10}/> {problem.frequency}%
                </span>
              )}
            </div>
            <h1 className="h1" style={{ fontSize: 24 }}>{problem.title}</h1>
            <div className="faint" style={{ fontSize: 13 }}>{problem.concept}</div>
            {problem.companies?.length > 0 && (
              <div className="row gap-4 mt-8" style={{ flexWrap: 'wrap' }}>
                <span className="faint mono" style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Asked at</span>
                {problem.companies.map(c => <span key={c} className="badge" style={{ fontSize: 10 }}>{c}</span>)}
              </div>
            )}
          </div>

          <div className="col gap-8" style={{ alignItems: 'flex-end' }}>
            <div className="row gap-8">
              <select className="select" value={problem.status} onChange={e => onUpdate(problem.id, { status: e.target.value })}>
                {Object.entries(STATUS_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
              <button className="btn" onClick={() => onUpdate(problem.id, { status: problem.status === 'bookmarked' ? 'not_started' : 'bookmarked' })}>
                <Icon name="bookmark" size={13} strokeWidth={problem.status === 'bookmarked' ? 2.4 : 1.75}/>
              </button>
            </div>
            <button className="btn btn-primary" onClick={markSolved} disabled={problem.status === 'solved'}>
              <Icon name="check" size={13} strokeWidth={2.4}/> {problem.status === 'solved' ? 'Solved' : 'Mark as solved'}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="row gap-4 mt-16" style={{ borderBottom: '1px solid var(--border)', marginBottom: -18, marginLeft: -18, marginRight: -18, padding: '0 18px' }}>
          {['description', 'solution', 'notes', 'meta'].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                border: 0, background: 'transparent',
                padding: '10px 14px',
                borderBottom: tab === t ? '2px solid var(--accent)' : '2px solid transparent',
                color: tab === t ? 'var(--text)' : 'var(--text-muted)',
                fontSize: 13, fontWeight: tab === t ? 600 : 500,
                cursor: 'pointer',
                textTransform: 'capitalize',
                marginBottom: -1,
              }}
            >
              {t === 'meta' ? 'Complexity' : t}
            </button>
          ))}
        </div>
      </div>

      {/* Content grid */}
      <div className="detail-grid">
        <div className="col gap-16">
          {tab === 'description' && (
            <div className="card card-pad col gap-16">
              <div>
                <h2 className="h3">Problem</h2>
                <div className="mt-8" style={{ fontSize: 14, lineHeight: 1.65, color: 'var(--text)' }}>
                  {problem.explanation}
                </div>
              </div>
              {problem.challenge && (
                <div style={{ padding: 12, borderRadius: 8, background: 'var(--accent-soft)', fontSize: 13 }}>
                  <div className="mono" style={{ fontSize: 10, letterSpacing: '0.06em', color: 'var(--accent)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Follow-up Challenge</div>
                  {problem.challenge}
                </div>
              )}
              {problem.hints?.length > 0 && (
                <div>
                  <div className="row" style={{ justifyContent: 'space-between' }}>
                    <h2 className="h3">Hints</h2>
                    <button className="btn btn-sm btn-ghost" onClick={() => setShowHints(s => !s)}>
                      {showHints ? 'Hide' : 'Reveal'}
                    </button>
                  </div>
                  {showHints && (
                    <div className="mt-12 col gap-8">
                      {problem.hints.map((h, i) => (
                        <div key={i} className="row gap-8" style={{ padding: 10, borderRadius: 8, border: '1px solid var(--border)', background: i < hintsRevealed ? 'var(--surface)' : 'var(--bg-2)' }}>
                          <div className="mono" style={{ width: 20, height: 20, borderRadius: 6, background: 'var(--accent-soft)', color: 'var(--accent)', display: 'grid', placeItems: 'center', fontSize: 10, fontWeight: 600, flexShrink: 0 }}>{i+1}</div>
                          {i < hintsRevealed ? (
                            <div style={{ fontSize: 13 }}>{h}</div>
                          ) : (
                            <button className="btn btn-sm btn-ghost" style={{ color: 'var(--text-muted)' }} onClick={() => setHintsRevealed(i+1)}>
                              Click to reveal hint {i+1}
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {tab === 'solution' && (
            <div className="card">
              <div className="row" style={{ justifyContent: 'space-between', padding: '10px 14px', borderBottom: '1px solid var(--border)' }}>
                <div className="segmented">
                  {Object.entries(LANG_LABELS).filter(([k]) => problem.code?.[k]).map(([k, v]) => (
                    <button key={k} className={lang === k ? 'active' : ''} onClick={() => setLang(k)}>{v}</button>
                  ))}
                </div>
                <button className="btn btn-sm btn-ghost" onClick={() => { navigator.clipboard?.writeText(code); toast.push('Code copied', 'copy') }}>
                  <Icon name="copy" size={12}/> Copy
                </button>
              </div>
              <pre className="code-block" style={{ border: 0, borderRadius: 0, margin: 0 }} dangerouslySetInnerHTML={{ __html: syntaxHighlight(code, lang) }}/>
            </div>
          )}

          {tab === 'notes' && (
            <div className="card card-pad">
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <h2 className="h3">Your notes</h2>
                <span className="faint mono" style={{ fontSize: 11 }}>auto-saved locally · {notes.length} chars</span>
              </div>
              <textarea
                className="notes-editor mt-12"
                placeholder="Write your approach, edge cases, gotchas, and what you'd do differently next time..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
                style={{ minHeight: 300 }}
              />
              <div className="row gap-8 mt-12 faint" style={{ fontSize: 11, fontFamily: 'var(--font-mono)' }}>
                <span>**bold**</span>
                <span>_italic_</span>
                <span>`code`</span>
                <span>- list</span>
              </div>
            </div>
          )}

          {tab === 'meta' && (
            <div className="card card-pad col gap-16">
              <div>
                <h2 className="h3">Complexity Analysis</h2>
                <div className="mt-12" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div style={{ padding: 16, borderRadius: 10, background: 'var(--bg-2)' }}>
                    <div className="faint mono" style={{ fontSize: 10, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Time</div>
                    <div className="mono mt-8" style={{ fontSize: 22, fontWeight: 600, color: 'var(--accent)' }}>{problem.complexity?.time || '—'}</div>
                  </div>
                  <div style={{ padding: 16, borderRadius: 10, background: 'var(--bg-2)' }}>
                    <div className="faint mono" style={{ fontSize: 10, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Space</div>
                    <div className="mono mt-8" style={{ fontSize: 22, fontWeight: 600, color: 'var(--accent)' }}>{problem.complexity?.space || '—'}</div>
                  </div>
                </div>
              </div>
              {problem.tags?.length > 0 && (
                <div>
                  <h2 className="h3">Tags</h2>
                  <div className="row gap-4 mt-8" style={{ flexWrap: 'wrap' }}>
                    {problem.tags.map(t => <span key={t} className="badge">{t}</span>)}
                  </div>
                </div>
              )}
              {problem.relatedProblems?.length > 0 && (
                <div>
                  <h2 className="h3">Related problems</h2>
                  <div className="col gap-4 mt-8">
                    {problem.relatedProblems.map(rid => {
                      const rp = problems.find(p => p.id === rid)
                      if (!rp) return null
                      return (
                        <div key={rid} className="row gap-8" style={{ padding: 10, borderRadius: 8, border: '1px solid var(--border)', cursor: 'pointer' }} onClick={() => onNavigate('detail', { problem: rp })}>
                          <span className="mono faint" style={{ fontSize: 11 }}>#{String(rp.id).padStart(3,'0')}</span>
                          <span style={{ flex: 1, fontSize: 13 }}>{rp.title}</span>
                          <DifficultyBadge value={rp.difficulty}/>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Side panel */}
        <div className="col gap-16">
          <div className="card card-pad">
            <h2 className="h3">Session</h2>
            <div className="mt-12 col gap-12">
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <span className="faint" style={{ fontSize: 12 }}>Status</span>
                <div className="row gap-8"><span className={`status-dot ${meta.cls}`}/><span style={{ fontSize: 13, fontWeight: 500 }}>{meta.label}</span></div>
              </div>
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <span className="faint" style={{ fontSize: 12 }}>Attempts</span>
                <span className="mono" style={{ fontSize: 13 }}>{problem.attempts || 0}</span>
              </div>
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <span className="faint" style={{ fontSize: 12 }}>Time spent</span>
                <span className="mono" style={{ fontSize: 13 }}>{problem.timeSpent ? `${problem.timeSpent}m` : '—'}</span>
              </div>
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <span className="faint" style={{ fontSize: 12 }}>Last touched</span>
                <span className="mono" style={{ fontSize: 13 }}>{problem.lastTouched !== null && problem.lastTouched !== undefined ? `${problem.lastTouched}d ago` : 'Never'}</span>
              </div>
            </div>
          </div>

          <div className="card card-pad">
            <h2 className="h3">Quick reference</h2>
            <div className="mt-12 col gap-8">
              <div className="row" style={{ justifyContent: 'space-between', fontSize: 12 }}>
                <span className="faint">Topic</span>
                <span style={{ fontWeight: 500, textAlign: 'right' }}>{problem.topic}</span>
              </div>
              <div className="row" style={{ justifyContent: 'space-between', fontSize: 12 }}>
                <span className="faint">Category</span>
                <span style={{ fontWeight: 500 }}>{problem.categoryName}</span>
              </div>
              <div className="row" style={{ justifyContent: 'space-between', fontSize: 12 }}>
                <span className="faint">Time</span>
                <span className="mono">{problem.complexity?.time || '—'}</span>
              </div>
              <div className="row" style={{ justifyContent: 'space-between', fontSize: 12 }}>
                <span className="faint">Space</span>
                <span className="mono">{problem.complexity?.space || '—'}</span>
              </div>
            </div>
          </div>

          <div className="card card-pad">
            <h2 className="h3">Jump to</h2>
            <div className="mt-12 col gap-4" style={{ maxHeight: 220, overflow: 'auto' }}>
              {problems.filter(p => p.category === problem.category).slice(0, 15).map(p => (
                <button
                  key={p.id}
                  className="row gap-8"
                  onClick={() => onNavigate('detail', { problem: p })}
                  style={{
                    padding: '6px 8px', borderRadius: 6, border: 0,
                    background: p.id === problem.id ? 'var(--accent-soft)' : 'transparent',
                    cursor: 'pointer', textAlign: 'left',
                    color: p.id === problem.id ? 'var(--accent)' : 'var(--text)',
                  }}
                >
                  <span className={`status-dot ${p.status}`} style={{ flexShrink: 0 }}/>
                  <span className="mono faint" style={{ fontSize: 10, width: 32 }}>#{String(p.id).padStart(3,'0')}</span>
                  <span style={{ fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Detail
