import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import Icon from './Icon'

export const DifficultyBadge = ({ value }) => (
  <span className={`badge badge-${value}`}>
    {value.charAt(0).toUpperCase() + value.slice(1)}
  </span>
)

export const STATUS_META = {
  not_started: { label: 'Not started', cls: 'not_started' },
  attempted: { label: 'Attempted', cls: 'attempted' },
  solved: { label: 'Solved', cls: 'solved' },
  revisit: { label: 'Revisit', cls: 'revisit' },
  stuck: { label: 'Stuck', cls: 'stuck' },
  bookmarked: { label: 'Bookmarked', cls: 'bookmarked' },
}

export const StatusPill = ({ value }) => {
  const meta = STATUS_META[value]
  return (
    <div className="row gap-8" style={{ color: 'var(--text-muted)', fontSize: 12 }}>
      <span className={`status-dot ${meta.cls}`}></span>
      <span>{meta.label}</span>
    </div>
  )
}

export const Ring = ({ value, size = 80, stroke = 7, label, sublabel, color }) => {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const pct = Math.max(0, Math.min(1, value))
  const offset = c * (1 - pct)
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg className="ring" width={size} height={size}>
        <circle className="ring-track" cx={size/2} cy={size/2} r={r} strokeWidth={stroke} />
        <circle
          className="ring-fill"
          cx={size/2} cy={size/2} r={r}
          strokeWidth={stroke}
          strokeDasharray={c}
          strokeDashoffset={offset}
          stroke={color || 'var(--accent)'}
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'grid', placeItems: 'center',
        textAlign: 'center',
      }}>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: size * 0.22, fontWeight: 600, letterSpacing: '-0.02em' }}>
            {label ?? `${Math.round(pct * 100)}%`}
          </div>
          {sublabel && <div style={{ fontSize: 10, color: 'var(--text-faint)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>{sublabel}</div>}
        </div>
      </div>
    </div>
  )
}

export const StatCard = ({ title, value, sub, accent, icon, children }) => (
  <div className="card card-pad">
    <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <div className="card-title">{title}</div>
        <div className="mt-8" style={{ fontFamily: 'var(--font-mono)', fontSize: 28, fontWeight: 600, letterSpacing: '-0.02em', color: accent || 'var(--text)' }}>
          {value}
        </div>
        {sub && <div className="faint" style={{ fontSize: 12, marginTop: 4 }}>{sub}</div>}
      </div>
      {icon && <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--accent-soft)', color: 'var(--accent)', display: 'grid', placeItems: 'center' }}>{icon}</div>}
    </div>
    {children}
  </div>
)

// Toast context
const ToastCtx = createContext({ push: () => {} })

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState(null)
  const push = useCallback((msg, icon = 'check') => {
    setToast({ msg, icon, id: Date.now() })
  }, [])
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 2200)
    return () => clearTimeout(t)
  }, [toast])
  return (
    <ToastCtx.Provider value={{ push }}>
      {children}
      {toast && (
        <div className="toast" key={toast.id}>
          <Icon name={toast.icon} size={14} />
          <span>{toast.msg}</span>
        </div>
      )}
    </ToastCtx.Provider>
  )
}

export const useToast = () => useContext(ToastCtx)
