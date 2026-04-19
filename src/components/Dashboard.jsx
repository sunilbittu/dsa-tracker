import { useMemo } from 'react'
import Icon from './Icon'
import { DifficultyBadge, Ring, StatCard } from './Shared'
import { RECENT } from '../data'

const getGreeting = () => {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

const Dashboard = ({ problems, categories, onOpenProblem, onNavigate, ringStyle, user }) => {
  const stats = useMemo(() => {
    const total = problems.length
    const solved = problems.filter(p => p.status === 'solved').length
    const attempted = problems.filter(p => p.status === 'attempted' || p.status === 'stuck').length
    const revisit = problems.filter(p => p.status === 'revisit').length
    const byDiff = { easy: { s: 0, t: 0 }, medium: { s: 0, t: 0 }, hard: { s: 0, t: 0 } }
    problems.forEach(p => {
      byDiff[p.difficulty].t++
      if (p.status === 'solved') byDiff[p.difficulty].s++
    })
    return { total, solved, attempted, revisit, byDiff }
  }, [problems])

  const catProgress = useMemo(() => (
    categories.map(cat => {
      const items = problems.filter(p => p.category === cat.id)
      const solved = items.filter(p => p.status === 'solved').length
      return { ...cat, solved, total: items.length, pct: items.length ? solved / items.length : 0 }
    })
  ), [problems, categories])

  const weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

  return (
    <div className="content-inner col gap-20">
      {/* Header row */}
      <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 className="h1">{getGreeting()}, {user?.name || 'there'}</h1>
          <div className="faint mt-8">Sunday, April 19 · You have <span className="mono" style={{ color: 'var(--text)' }}>{stats.total - stats.solved}</span> problems remaining</div>
        </div>
        <div className="row gap-8">
          <button className="btn" onClick={() => onNavigate('explorer')}>
            <Icon name="list" size={14}/> Browse all
          </button>
          <button className="btn btn-primary" onClick={() => onNavigate('explorer')}>
            <Icon name="play" size={13}/> Resume session
          </button>
        </div>
      </div>

      {/* Top stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        <StatCard
          title="Total solved"
          value={<span>{stats.solved}<span className="faint" style={{ fontSize: 18, fontWeight: 400 }}>/{stats.total}</span></span>}
          sub={`${Math.round(stats.solved / stats.total * 100)}% complete`}
          icon={<Icon name="check" size={18}/>}
        >
          <div className="mt-16 bar-track"><div className="bar-fill" style={{ width: `${stats.solved / stats.total * 100}%` }}/></div>
        </StatCard>

        <StatCard
          title="Current streak"
          value={<span>18<span className="faint" style={{ fontSize: 18, fontWeight: 400 }}> days</span></span>}
          sub="Longest: 34 days · Keep it going"
          icon={<Icon name="flame" size={18}/>}
        >
          <div className="mt-16 row gap-4">
            {weekDays.map((d, i) => (
              <div key={i} style={{ flex: 1, textAlign: 'center' }}>
                <div style={{
                  height: 28, borderRadius: 6,
                  background: i < 6 ? 'var(--accent)' : 'var(--border)',
                  opacity: i < 6 ? (0.4 + i * 0.1) : 1,
                  display: 'grid', placeItems: 'center',
                  color: i < 6 ? 'white' : 'var(--text-faint)',
                  fontSize: 10, fontFamily: 'var(--font-mono)', fontWeight: 600,
                }}>
                  {i < 6 ? '✓' : ''}
                </div>
                <div className="faint" style={{ fontSize: 10, marginTop: 4, fontFamily: 'var(--font-mono)' }}>{d}</div>
              </div>
            ))}
          </div>
        </StatCard>

        <StatCard
          title="This week"
          value={<span>11<span className="faint" style={{ fontSize: 18, fontWeight: 400 }}> solved</span></span>}
          sub="+3 vs last week"
          icon={<Icon name="lightning" size={18}/>}
        >
          <div className="mt-16 row gap-4" style={{ alignItems: 'flex-end', height: 32 }}>
            {[3, 1, 2, 4, 1, 0, 0].map((v, i) => (
              <div key={i} style={{
                flex: 1,
                height: `${8 + v * 6}px`,
                background: v > 0 ? 'var(--accent)' : 'var(--border)',
                borderRadius: 3,
                opacity: v > 0 ? 0.3 + v * 0.15 : 1,
              }}/>
            ))}
          </div>
        </StatCard>

        <StatCard
          title="Avg. per problem"
          value={<span>27<span className="faint" style={{ fontSize: 18, fontWeight: 400 }}>m</span></span>}
          sub="–8m vs last week"
          icon={<Icon name="clock" size={18}/>}
        >
          <div className="mt-16 row gap-8" style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
            <div className="row gap-4"><span className="status-dot" style={{ background: 'var(--easy)'}}></span>18m</div>
            <div className="row gap-4"><span className="status-dot" style={{ background: 'var(--medium)'}}></span>29m</div>
            <div className="row gap-4"><span className="status-dot" style={{ background: 'var(--hard)'}}></span>52m</div>
          </div>
        </StatCard>
      </div>

      {/* Middle row: difficulty + level/badges */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
        <div className="card card-pad">
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <div>
              <h2 className="h2">By difficulty</h2>
              <div className="faint" style={{ fontSize: 12, marginTop: 4 }}>Track your balance across easy, medium and hard</div>
            </div>
            <div className="faint mono" style={{ fontSize: 12 }}>{stats.solved} / {stats.total}</div>
          </div>
          <div className="mt-20" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {['easy', 'medium', 'hard'].map(d => {
              const v = stats.byDiff[d]
              const pct = v.t ? v.s / v.t : 0
              return (
                <div key={d} className="col gap-8" style={{ alignItems: 'center' }}>
                  <Ring
                    value={pct}
                    size={110}
                    stroke={9}
                    label={<span className="mono">{v.s}<span className="faint" style={{ fontSize: 14 }}>/{v.t}</span></span>}
                    sublabel={d.toUpperCase()}
                    color={`var(--${d})`}
                  />
                  <div className="faint" style={{ fontSize: 11, fontFamily: 'var(--font-mono)' }}>
                    {Math.round(pct * 100)}% complete
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="card card-pad">
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <h2 className="h2">Level & badges</h2>
            <Icon name="trophy" size={16} className="faint"/>
          </div>
          <div className="mt-16">
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <div className="mono" style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 600 }}>LEVEL 14</div>
              <div className="mono faint" style={{ fontSize: 11 }}>2,340 / 3,000 XP</div>
            </div>
            <div className="xp-bar mt-8"><div className="xp-fill" style={{ width: '78%' }}/></div>
            <div className="faint" style={{ fontSize: 11, marginTop: 6 }}>660 XP to "Pattern Breaker"</div>
          </div>
          <div className="mt-20" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {[
              { name: '50 Solved', earned: true, icon: 'check' },
              { name: 'Graph Initiate', earned: true, icon: 'target' },
              { name: '7-day streak', earned: true, icon: 'flame' },
              { name: 'DP Brawler', earned: false, icon: 'sparkles' },
              { name: '100 Solved', earned: false, icon: 'trophy' },
              { name: 'Hard Mode', earned: false, icon: 'lightning' },
            ].map((b, i) => (
              <div key={i} className="col gap-4" style={{ alignItems: 'center', padding: 10, borderRadius: 8, background: b.earned ? 'var(--accent-soft)' : 'var(--bg-2)', opacity: b.earned ? 1 : 0.5 }}>
                <Icon name={b.icon} size={18} className={b.earned ? '' : 'faint'}/>
                <div style={{ fontSize: 10, textAlign: 'center', fontWeight: 500, color: b.earned ? 'var(--accent)' : 'var(--text-muted)' }}>{b.name}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Categories grid */}
      <div className="card card-pad">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <h2 className="h2">Category progress</h2>
          <button className="btn btn-sm" onClick={() => onNavigate('explorer')}>View all <Icon name="chevron_right" size={12}/></button>
        </div>
        <div className="mt-20" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
          {catProgress.slice(0, 12).map(cat => (
            <div key={cat.id} className={`card card-pad ${ringStyle === 'dashed' ? 'ring-style-dashed' : ''}`} style={{ padding: 14, cursor: 'pointer' }} onClick={() => onNavigate('explorer', { category: cat.id })}>
              <div className="row gap-12">
                <Ring value={cat.pct} size={52} stroke={5} label={<span style={{ fontSize: 10 }}>{Math.round(cat.pct*100)}%</span>} />
                <div className="col" style={{ gap: 2, minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cat.name}</div>
                  <div className="faint mono" style={{ fontSize: 11 }}>{cat.solved} / {cat.total} solved</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent activity + next up */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
        <div className="card">
          <div className="card-pad" style={{ paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>
            <h2 className="h2">Recent activity</h2>
          </div>
          <div>
            {RECENT.map(r => (
              <div key={r.id} style={{ padding: '12px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }} onClick={() => {
                const p = problems.find(p => p.title === r.title)
                if (p) onOpenProblem(p)
              }}>
                <div className={`status-dot ${r.status}`} style={{ width: 10, height: 10 }}/>
                <div className="col" style={{ gap: 2, flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{r.title}</div>
                  <div className="faint" style={{ fontSize: 11 }}>{r.category} · {r.duration}</div>
                </div>
                <DifficultyBadge value={r.difficulty}/>
                <div className="faint mono" style={{ fontSize: 11, width: 80, textAlign: 'right' }}>{r.time}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card card-pad">
          <h2 className="h2">Suggested next</h2>
          <div className="faint" style={{ fontSize: 12, marginTop: 4 }}>Based on your revisit queue</div>
          <div className="mt-16 col gap-8">
            {problems.filter(p => p.status === 'revisit' || p.status === 'stuck').slice(0, 4).map(p => (
              <div key={p.id} className="row gap-8" style={{ padding: 10, borderRadius: 8, border: '1px solid var(--border)', cursor: 'pointer' }} onClick={() => onOpenProblem(p)}>
                <div className={`status-dot ${p.status}`}/>
                <div className="col" style={{ gap: 0, flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</div>
                  <div className="faint" style={{ fontSize: 10 }}>{p.categoryName}</div>
                </div>
                <DifficultyBadge value={p.difficulty}/>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
