import Icon from './Icon'

const ACCENTS = [
  { id: 'indigo', h: 258, name: 'Indigo' },
  { id: 'violet', h: 295, name: 'Violet' },
  { id: 'blue', h: 240, name: 'Blue' },
  { id: 'teal', h: 180, name: 'Teal' },
  { id: 'green', h: 150, name: 'Green' },
  { id: 'amber', h: 60, name: 'Amber' },
  { id: 'rose', h: 10, name: 'Rose' },
]

const Tweaks = ({ state, setState, onClose }) => {
  const accent = ACCENTS.find(a => a.h === state.accentH) || ACCENTS[0]
  return (
    <div className="tweaks-panel">
      <div className="tweaks-head">
        <div className="tweaks-head-title">
          <Icon name="sparkles" size={14}/> Tweaks
        </div>
        <button className="btn btn-ghost btn-sm" onClick={onClose} style={{ padding: 4 }}>
          <Icon name="x" size={14}/>
        </button>
      </div>
      <div className="tweaks-body">
        <div className="tweak-row">
          <div className="tweak-label">Accent</div>
          <div className="swatch-row">
            {ACCENTS.map(a => (
              <button
                key={a.id}
                className={`swatch ${accent.h === a.h ? 'active' : ''}`}
                style={{ background: `oklch(0.58 0.18 ${a.h})` }}
                onClick={() => setState({ accentH: a.h })}
                title={a.name}
              />
            ))}
          </div>
        </div>

        <div className="tweak-row">
          <div className="tweak-label">Theme</div>
          <div className="segmented">
            <button className={state.theme === 'light' ? 'active' : ''} onClick={() => setState({ theme: 'light' })}>Light</button>
            <button className={state.theme === 'dark' ? 'active' : ''} onClick={() => setState({ theme: 'dark' })}>Dark</button>
          </div>
        </div>

        <div className="tweak-row">
          <div className="tweak-label">Density</div>
          <div className="segmented">
            <button className={state.density === 'comfortable' ? 'active' : ''} onClick={() => setState({ density: 'comfortable' })}>Comfortable</button>
            <button className={state.density === 'compact' ? 'active' : ''} onClick={() => setState({ density: 'compact' })}>Compact</button>
          </div>
        </div>

        <div className="tweak-row">
          <div className="tweak-label">Progress ring style</div>
          <div className="segmented">
            <button className={state.ringStyle === 'solid' ? 'active' : ''} onClick={() => setState({ ringStyle: 'solid' })}>Solid</button>
            <button className={state.ringStyle === 'dashed' ? 'active' : ''} onClick={() => setState({ ringStyle: 'dashed' })}>Dashed</button>
          </div>
        </div>

        <div className="tweak-row">
          <div className="tweak-label">Sidebar</div>
          <div className="segmented">
            <button className={state.sidebar === 'expanded' ? 'active' : ''} onClick={() => setState({ sidebar: 'expanded' })}>Expanded</button>
            <button className={state.sidebar === 'collapsed' ? 'active' : ''} onClick={() => setState({ sidebar: 'collapsed' })}>Collapsed</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Tweaks
