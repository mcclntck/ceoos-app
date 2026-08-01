/* Ported verbatim from ceoos-flow.jsx's MoodSlider — the discrete 5-stop
   mood slider used within the flow (single accent handle, 0-based index).

   This is intentionally NOT shared with a Mood tab's continuous slider
   (see README §8 MoodScreen) — that is a different, continuous 0-4 float
   component with notches; this one is the flow's own simple integer-index
   slider and stays local to this folder. */
export interface MoodSliderProps {
  value: number
  onChange: (value: number) => void
  moods: readonly string[]
}

export function MoodSlider({ value, onChange, moods }: MoodSliderProps) {
  const pct = (value / (moods.length - 1)) * 100
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 26 }}>
        <span style={{ fontFamily: 'var(--font-primary)', fontSize: 34, fontWeight: 400, color: 'var(--accent)' }}>{moods[value]}</span>
      </div>
      <div style={{ position: 'relative', height: 44 }}>
        <div style={{ position: 'absolute', top: 20, left: 0, right: 0, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.12)' }} />
        <div style={{ position: 'absolute', top: 20, left: 0, width: `${pct}%`, height: 4, borderRadius: 2, background: 'var(--accent)' }} />
        <div
          style={{
            position: 'absolute',
            top: 11,
            left: `calc(${pct}% )`,
            transform: 'translateX(-50%)',
            width: 24,
            height: 24,
            borderRadius: '50%',
            background: 'var(--accent)',
            boxShadow: '0 0 0 6px rgba(202,219,43,0.18), 0 2px 8px rgba(0,0,0,0.5)',
            pointerEvents: 'none',
          }}
        />
        <input
          type="range"
          min={0}
          max={moods.length - 1}
          step={1}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          style={{ position: 'absolute', top: 8, left: -2, right: -2, width: 'calc(100% + 4px)', margin: 0, opacity: 0, height: 28, cursor: 'pointer' }}
        />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontFamily: 'var(--font-primary)', fontSize: 12, color: 'var(--text-muted)' }}>
        <span>{moods[0]}</span>
        <span>{moods[moods.length - 1]}</span>
      </div>
    </div>
  )
}
