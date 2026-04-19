import { useState, useEffect, useMemo } from 'react'
import Icon from './Icon'
import { DifficultyBadge, StatusPill, useToast } from './Shared'

const STATUS_OPTIONS = [
  { id: 'all', label: 'All' },
  { id: 'not_started', label: 'Not started' },
  { id: 'attempted', label: 'Attempted' },
  { id: 'solved', label: 'Solved' },
  { id: 'revisit', label: 'Revisit' },
  { id: 'stuck', label: 'Stuck' },
  { id: 'bookmarked', label: 'Bookmarked' },
]

const DIFF_OPTIONS = [
  { id: 'all', label: 'All' },
  { id: 'easy', label: 'Easy' },
  { id: 'medium', label: 'Medium' },
  { id: 'hard', label: 'Hard' },
]

const Explorer = ({ problems, categories, initialFilters, onOpenProblem, onUpdate }) => {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState(initialFilters?.status || 'all')
  const [diffFilter, setDiffFilter] = useState('all')
  const [catFilter, setCatFilter] = useState(initialFilters?.category || 'all')
  const [sortKey, setSortKey] = useState('default')
  const toast = useToast()

  useEffect(() => {
    if (initialFilters?.category) setCatFilter(initialFilters.category)
    if (initialFilters?.status) setStatusFilter(initialFilters.status)
  }, [initialFilters])

  const filtered = useMemo(() => {
    let out = problems
    if (search.trim()) {
      const s = search.toLowerCase()
      out = out.filter(p => p.title.toLowerCase().includes(s) || p.categoryName.toLowerCase().includes(s))
    }
    if (statusFilter !== 'all') out = out.filter(p => p.status === statusFilter)
    if (diffFilter !== 'all') out = out.filter(p => p.difficulty === diffFilter)
    if (catFilter !== 'all') out = out.filter(p => p.category === catFilter)
    if (sortKey === 'difficulty') {
      const order = { easy: 0, medium: 1, hard: 2 }
      out = [...out].sort((a, b) => order[a.difficulty] - order[b.difficulty])
    } else if (sortKey === 'recent') {
      out = [...out].sort((a, b) => (a.lastTouched ?? 999) - (b.lastTouched ?? 999))
    }
    return out
  }, [problems, search, statusFilter, diffFilter, catFilter, sortKey])

  const counts = useMemo(() => ({
    total: problems.length,
    solved: problems.filter(p => p.status === 'solved').length,
    shown: filtered.length,
  }), [problems, filtered])

  const cycleStatus = (p, e) => {
    e.stopPropagation()
    const order = ['not_started', 'attempted', 'solved', 'revisit', 'stuck']
    const i = order.indexOf(p.status)
    const next = order[(i + 1) % order.length]
    onUpdate(p.id, { status: next })
    if (next === 'solved') toast.push(`Marked "${p.title}" as Solved`, 'check')
  }

  const toggleBookmark = (p, e) => {
    e.stopPropagation()
    const next = p.status === 'bookmarked' ? 'not_started' : 'bookmarked'
    onUpdate(p.id, { status: next })
    toast.push(next === 'bookmarked' ? 'Bookmarked' : 'Bookmark removed', 'bookmark')
  }

  return (
    <div className="content-inner col gap-16">
      <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 className="h1">Problem Explorer</h1>
          <div className="faint mt-8">
            Showing <span className="mono" style={{ color: 'var(--text)' }}>{counts.shown}</span> of{' '}
            <span className="mono" style={{ color: 'var(--text)' }}>{counts.total}</span> problems ·{' '}
            <span className="mono" style={{ color: 'var(--success)' }}>{counts.solved}</span> solved overall
          </div>
        </div>
        <div className="row gap-8">
          <select className="select" value={sortKey} onChange={e => setSortKey(e.target.value)}>
            <option value="default">Sort: Default</option>
            <option value="difficulty">Sort: Difficulty</option>
            <option value="recent">Sort: Recently touched</option>
          </select>
          <button className="btn btn-primary"><Icon name="plus" size={13}/> Add custom</button>
        </div>
      </div>

      {/* Search + filter chips */}
      <div className="card card-pad col gap-12">
        <div className="row gap-12">
          <div className="topbar-search" style={{ flex: 1, width: 'auto' }}>
            <Icon name="search" size={14} className="faint"/>
            <input
              placeholder="Search by title, category, tag..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && <button className="btn-ghost btn btn-sm" style={{padding:'2px 6px'}} onClick={() => setSearch('')}><Icon name="x" size={12}/></button>}
          </div>
        </div>

        <div className="col gap-8">
          <div className="row gap-8" style={{ flexWrap: 'wrap' }}>
            <div className="faint mono" style={{ fontSize: 11, letterSpacing: '0.04em', textTransform: 'uppercase', marginRight: 4, alignSelf: 'center' }}>Status</div>
            {STATUS_OPTIONS.map(o => (
              <button key={o.id} className={`chip ${statusFilter === o.id ? 'active' : ''}`} onClick={() => setStatusFilter(o.id)}>
                {o.id !== 'all' && <span className={`status-dot ${o.id}`}/>}
                {o.label}
              </button>
            ))}
          </div>
          <div className="row gap-8" style={{ flexWrap: 'wrap' }}>
            <div className="faint mono" style={{ fontSize: 11, letterSpacing: '0.04em', textTransform: 'uppercase', marginRight: 4, alignSelf: 'center' }}>Difficulty</div>
            {DIFF_OPTIONS.map(o => (
              <button key={o.id} className={`chip ${diffFilter === o.id ? 'active' : ''}`} onClick={() => setDiffFilter(o.id)}>
                {o.label}
              </button>
            ))}
          </div>
          <div className="row gap-8" style={{ flexWrap: 'wrap' }}>
            <div className="faint mono" style={{ fontSize: 11, letterSpacing: '0.04em', textTransform: 'uppercase', marginRight: 4, alignSelf: 'center' }}>Category</div>
            <button className={`chip ${catFilter === 'all' ? 'active' : ''}`} onClick={() => setCatFilter('all')}>All</button>
            {categories.slice(0, 10).map(c => (
              <button key={c.id} className={`chip ${catFilter === c.id ? 'active' : ''}`} onClick={() => setCatFilter(c.id)}>
                {c.name}
              </button>
            ))}
            {categories.length > 10 && (
              <select className="select" style={{ padding: '5px 24px 5px 10px', fontSize: 12 }} value={catFilter === 'all' || !categories.slice(10).find(c => c.id === catFilter) ? '' : catFilter} onChange={e => e.target.value && setCatFilter(e.target.value)}>
                <option value="">More...</option>
                {categories.slice(10).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ maxHeight: '65vh', overflow: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: 44 }}></th>
                <th style={{ width: 52 }}>#</th>
                <th>Problem</th>
                <th style={{ width: 180 }}>Category</th>
                <th style={{ width: 90 }}>Difficulty</th>
                <th style={{ width: 120 }}>Status</th>
                <th style={{ width: 70 }} className="mono">Time</th>
                <th style={{ width: 80 }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={8}><div className="empty">No problems match these filters.</div></td></tr>
              )}
              {filtered.slice(0, 200).map(p => (
                <tr key={p.id} onClick={() => onOpenProblem(p)}>
                  <td>
                    <button
                      className="icon-btn"
                      style={{ width: 24, height: 24, borderRadius: 6, background: p.status === 'solved' ? 'var(--easy-soft)' : 'var(--surface)', borderColor: p.status === 'solved' ? 'transparent' : 'var(--border)', color: p.status === 'solved' ? 'var(--easy)' : 'var(--text-faint)' }}
                      onClick={(e) => cycleStatus(p, e)}
                      title="Cycle status"
                    >
                      {p.status === 'solved' ? <Icon name="check" size={13} strokeWidth={2.4}/> : <Icon name="plus" size={12}/>}
                    </button>
                  </td>
                  <td className="mono faint" style={{ fontSize: 11 }}>#{String(p.id).padStart(3, '0')}</td>
                  <td>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{p.title}</div>
                  </td>
                  <td><div className="faint" style={{ fontSize: 12 }}>{p.categoryName}</div></td>
                  <td><DifficultyBadge value={p.difficulty}/></td>
                  <td><StatusPill value={p.status}/></td>
                  <td className="mono faint" style={{ fontSize: 12 }}>{p.timeSpent ? `${p.timeSpent}m` : '—'}</td>
                  <td>
                    <button className="icon-btn" style={{ width: 24, height: 24, border: 0 }} onClick={(e) => toggleBookmark(p, e)} title="Bookmark">
                      <Icon name="bookmark" size={13} className={p.status === 'bookmarked' ? '' : 'faint'} strokeWidth={p.status === 'bookmarked' ? 2.4 : 1.75}/>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length > 200 && (
          <div className="faint" style={{ padding: 12, fontSize: 12, textAlign: 'center', borderTop: '1px solid var(--border)' }}>
            Showing first 200 of {filtered.length}. Refine filters to see more.
          </div>
        )}
      </div>
    </div>
  )
}

export default Explorer
