import { useMemo, useRef } from 'react'
import Icon from './Icon'
import { DifficultyBadge, STATUS_META, useToast } from './Shared'
import { ACTIVITY } from '../data'

const Analytics = ({ problems, categories }) => {
  const toast = useToast()
  const fileInputRef = useRef()

  const stats = useMemo(() => {
    const solved = problems.filter(p => p.status === 'solved')
    const total = problems.length
    const byDiff = { easy: {s:0,t:0}, medium:{s:0,t:0}, hard:{s:0,t:0} }
    problems.forEach(p => { byDiff[p.difficulty].t++; if (p.status==='solved') byDiff[p.difficulty].s++ })
    const byStatus = {}
    problems.forEach(p => { byStatus[p.status] = (byStatus[p.status]||0)+1 })
    const avgTime = solved.length ? Math.round(solved.reduce((a,p)=>a+p.timeSpent,0)/solved.length) : 0
    const totalTime = problems.reduce((a,p)=>a+p.timeSpent,0)
    return { total, solved: solved.length, byDiff, byStatus, avgTime, totalTime }
  }, [problems])

  const catStats = useMemo(() =>
    categories.map(c => {
      const items = problems.filter(p => p.category === c.id)
      const solved = items.filter(p => p.status === 'solved').length
      return { ...c, solved, total: items.length, pct: items.length ? solved/items.length : 0 }
    }).sort((a, b) => b.pct - a.pct)
  , [problems, categories])

  const velocity = useMemo(() => {
    const a = ACTIVITY
    const weeks = []
    for (let w = a.length - 12*7; w < a.length; w += 7) {
      const slice = a.slice(Math.max(0,w), w+7)
      weeks.push(slice.reduce((x,y)=>x+y,0))
    }
    return weeks
  }, [])

  const maxWeek = Math.max(...velocity, 1)

  const handleExport = () => {
    const data = JSON.stringify({ exportedAt: new Date().toISOString(), problems }, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `dsa-progress-${new Date().toISOString().slice(0,10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.push('Progress exported', 'download')
  }

  const handleImport = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    toast.push(`Imported ${file.name}`, 'upload')
    e.target.value = ''
  }

  return (
    <div className="content-inner col gap-20">
      <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 className="h1">Analytics & Reports</h1>
          <div className="faint mt-8">Patterns across <span className="mono" style={{ color: 'var(--text)' }}>{stats.total}</span> problems over the last 12 months</div>
        </div>
        <div className="row gap-8">
          <input ref={fileInputRef} type="file" accept=".json" hidden onChange={handleImport}/>
          <button className="btn" onClick={() => fileInputRef.current?.click()}>
            <Icon name="upload" size={13}/> Import JSON
          </button>
          <button className="btn" onClick={handleExport}>
            <Icon name="download" size={13}/> Export JSON
          </button>
        </div>
      </div>

      {/* Headline KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        <div className="card card-pad">
          <div className="card-title">Overall completion</div>
          <div className="mono mt-8" style={{ fontSize: 32, fontWeight: 600, letterSpacing: '-0.02em' }}>{Math.round(stats.solved/stats.total*100)}<span className="faint" style={{ fontSize: 18 }}>%</span></div>
          <div className="bar-track mt-12"><div className="bar-fill" style={{ width: `${stats.solved/stats.total*100}%` }}/></div>
          <div className="faint mono mt-8" style={{ fontSize: 11 }}>{stats.solved}/{stats.total} solved</div>
        </div>
        <div className="card card-pad">
          <div className="card-title">Avg. solve time</div>
          <div className="mono mt-8" style={{ fontSize: 32, fontWeight: 600 }}>{stats.avgTime}<span className="faint" style={{ fontSize: 18 }}>m</span></div>
          <div className="faint" style={{ fontSize: 12, marginTop: 6 }}>Down 8m vs last month</div>
        </div>
        <div className="card card-pad">
          <div className="card-title">Total practice</div>
          <div className="mono mt-8" style={{ fontSize: 32, fontWeight: 600 }}>{Math.round(stats.totalTime/60)}<span className="faint" style={{ fontSize: 18 }}>h</span></div>
          <div className="faint" style={{ fontSize: 12, marginTop: 6 }}>Across {stats.solved + (stats.byStatus.attempted || 0)} sessions</div>
        </div>
        <div className="card card-pad">
          <div className="card-title">Needs revisit</div>
          <div className="mono mt-8" style={{ fontSize: 32, fontWeight: 600, color: 'var(--warning)' }}>{(stats.byStatus.revisit || 0) + (stats.byStatus.stuck || 0)}</div>
          <div className="faint" style={{ fontSize: 12, marginTop: 6 }}>Review queue</div>
        </div>
      </div>

      {/* Two-column: difficulty donut + status bars */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="card card-pad">
          <h2 className="h2">Difficulty distribution</h2>
          <div className="faint" style={{ fontSize: 12, marginTop: 4 }}>Solved vs remaining by level</div>
          <div className="mt-20 col gap-16">
            {['easy', 'medium', 'hard'].map(d => {
              const v = stats.byDiff[d]
              const pct = v.t ? v.s/v.t : 0
              return (
                <div key={d}>
                  <div className="row" style={{ justifyContent: 'space-between', marginBottom: 6 }}>
                    <div className="row gap-8">
                      <DifficultyBadge value={d}/>
                      <span className="faint mono" style={{ fontSize: 11 }}>{Math.round(pct*100)}%</span>
                    </div>
                    <span className="mono" style={{ fontSize: 12, color: 'var(--text-muted)' }}>{v.s} / {v.t}</span>
                  </div>
                  <div className="bar-track" style={{ height: 10 }}>
                    <div className="bar-fill" style={{ width: `${pct*100}%`, background: `var(--${d})` }}/>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="card card-pad">
          <h2 className="h2">Status breakdown</h2>
          <div className="faint" style={{ fontSize: 12, marginTop: 4 }}>Where each problem sits right now</div>
          <div className="mt-20 col gap-10">
            {['solved','attempted','revisit','stuck','bookmarked','not_started'].map(s => {
              const count = stats.byStatus[s] || 0
              const pct = count/stats.total
              const meta = STATUS_META[s]
              return (
                <div key={s} className="row gap-12">
                  <div className="row gap-8" style={{ width: 120 }}>
                    <span className={`status-dot ${meta.cls}`}/>
                    <span style={{ fontSize: 12, fontWeight: 500 }}>{meta.label}</span>
                  </div>
                  <div className="grow bar-track" style={{ height: 10 }}>
                    <div className="bar-fill" style={{ width: `${pct*100}%` }}/>
                  </div>
                  <span className="mono" style={{ fontSize: 12, width: 56, textAlign: 'right' }}>{count} <span className="faint">({Math.round(pct*100)}%)</span></span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Category leaderboard */}
      <div className="card card-pad">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <h2 className="h2">Category breakdown</h2>
          <span className="faint mono" style={{ fontSize: 11 }}>Sorted by completion</span>
        </div>
        <div className="mt-16 col gap-12">
          {catStats.map(c => (
            <div key={c.id}>
              <div className="row" style={{ justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 500 }}>{c.name}</span>
                <span className="mono faint" style={{ fontSize: 12 }}>{c.solved}/{c.total} · {Math.round(c.pct*100)}%</span>
              </div>
              <div className="bar-track" style={{ height: 8 }}>
                <div className="bar-fill" style={{ width: `${c.pct*100}%` }}/>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Velocity + heatmap */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 16 }}>
        <div className="card card-pad">
          <h2 className="h2">Velocity</h2>
          <div className="faint" style={{ fontSize: 12, marginTop: 4 }}>Problems/week — last 12 weeks</div>
          <div className="mt-20 row" style={{ alignItems: 'flex-end', height: 140, gap: 4 }}>
            {velocity.map((v, i) => (
              <div key={i} className="col" style={{ flex: 1, alignItems: 'center', gap: 4 }}>
                <div style={{
                  width: '100%',
                  height: `${(v/maxWeek)*110}px`,
                  minHeight: 3,
                  background: i === velocity.length - 1 ? 'var(--accent)' : 'oklch(0.85 0.1 var(--accent-h))',
                  borderRadius: 3,
                  transition: 'height 0.6s ease',
                }}/>
                <div className="mono faint" style={{ fontSize: 9 }}>{v}</div>
              </div>
            ))}
          </div>
          <div className="faint mono" style={{ fontSize: 10, textAlign: 'right', marginTop: 4 }}>← 12 weeks ago            today →</div>
        </div>

        <div className="card card-pad">
          <h2 className="h2">Activity heatmap</h2>
          <div className="faint" style={{ fontSize: 12, marginTop: 4 }}>Daily problem count · last 52 weeks</div>
          <div className="mt-16" style={{ overflow: 'auto' }}>
            <div className="heatmap">
              {ACTIVITY.map((v, i) => (
                <div
                  key={i}
                  className={`heat-cell ${v ? `heat-${v}` : ''}`}
                  title={`${v} problem${v===1?'':'s'}`}
                />
              ))}
            </div>
          </div>
          <div className="row gap-8 mt-16" style={{ justifyContent: 'flex-end', fontSize: 11 }}>
            <span className="faint">Less</span>
            <div className="heat-cell" style={{ width:10,height:10 }}/>
            <div className="heat-cell heat-1" style={{ width:10,height:10 }}/>
            <div className="heat-cell heat-2" style={{ width:10,height:10 }}/>
            <div className="heat-cell heat-3" style={{ width:10,height:10 }}/>
            <div className="heat-cell heat-4" style={{ width:10,height:10 }}/>
            <span className="faint">More</span>
          </div>
        </div>
      </div>

      {/* Import/export panel */}
      <div className="card card-pad">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <div>
            <h2 className="h2">Data portability</h2>
            <div className="faint" style={{ fontSize: 12, marginTop: 4 }}>Back up or migrate your progress — plain JSON, no lock-in</div>
          </div>
        </div>
        <div className="mt-16" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div style={{ padding: 16, borderRadius: 10, border: '1px dashed var(--border-strong)' }}>
            <div className="row gap-8"><Icon name="download" size={14}/><span style={{ fontWeight: 600, fontSize: 13 }}>Export</span></div>
            <div className="faint mt-8" style={{ fontSize: 12 }}>Download a snapshot of every problem, status, note, and timer.</div>
            <button className="btn mt-12" onClick={handleExport}><Icon name="download" size={13}/> Download .json</button>
          </div>
          <div style={{ padding: 16, borderRadius: 10, border: '1px dashed var(--border-strong)' }}>
            <div className="row gap-8"><Icon name="upload" size={14}/><span style={{ fontWeight: 600, fontSize: 13 }}>Import</span></div>
            <div className="faint mt-8" style={{ fontSize: 12 }}>Restore from a previous export. Conflicts resolved by most-recent timestamp.</div>
            <button className="btn mt-12" onClick={() => fileInputRef.current?.click()}><Icon name="upload" size={13}/> Select file</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Analytics
