/* Ported from design_handoff_ceoos_pilot_app/design/ceoos-mood.jsx (MoodSlider, MoodFace,
   mixHex/moodTone). Continuous, notched slider: value is a float 0-4 across five named
   states. Tone interpolates between the two neighbouring mood colours. */
import { useRef, useState } from 'react'

const M_FONT = 'var(--font-primary)'

/* mood index 0-4 -> tone. Drained reads red, energised reads green. */
export const M_TONE = ['#ff6b6b', '#ff9f5a', '#e8d44d', '#9ed455', '#4fd97e']

const mixHex = (a: string, b: string, t: number) => {
  const p = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16))
  const [r1, g1, b1] = p(a)
  const [r2, g2, b2] = p(b)
  const c = (x: number, y: number) => Math.round(x + (y - x) * t).toString(16).padStart(2, '0')
  return `#${c(r1, r2)}${c(g1, g2)}${c(b1, b2)}`
}

export const moodTone = (v: number) => {
  const i = Math.max(0, Math.min(3, Math.floor(v)))
  return mixHex(M_TONE[i], M_TONE[i + 1], v - i)
}

export function MoodFace({ i, size = 26, color }: { i: number; size?: number; color: string }) {
  const mouths = [
    'M8.5 16c1-1.2 2.1-1.8 3.5-1.8s2.5.6 3.5 1.8',
    'M8.5 15.4c1-.6 2.1-.9 3.5-.9s2.5.3 3.5.9',
    'M8.5 15.2h7',
    'M8.5 14.4c1 .9 2.1 1.4 3.5 1.4s2.5-.5 3.5-1.4',
    'M8 13.8c1 1.6 2.4 2.4 4 2.4s3-.8 4-2.4',
  ]
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9.2" />
      <path d={mouths[i]} />
      <path d="M9 9.6h.01M15 9.6h.01" strokeWidth="2.2" />
    </svg>
  )
}

export interface MoodSliderProps {
  value: number
  moods: readonly string[]
  onChange: (value: number) => void
  onCommit: () => void
}

export function MoodSlider({ value, moods, onChange, onCommit }: MoodSliderProps) {
  const trackRef = useRef<HTMLDivElement | null>(null)
  const [drag, setDrag] = useState(false)
  const max = moods.length - 1
  const tone = moodTone(value)
  const pct = (value / max) * 100

  const fromEvent = (e: { clientX: number }) => {
    const r = trackRef.current!.getBoundingClientRect()
    return Math.max(0, Math.min(max, ((e.clientX - r.left) / r.width) * max))
  }

  const down = (e: React.PointerEvent<HTMLDivElement>) => {
    setDrag(true)
    onChange(fromEvent(e))
    try {
      e.currentTarget.setPointerCapture(e.pointerId)
    } catch {
      /* no capture */
    }
  }
  const move = (e: React.PointerEvent<HTMLDivElement>) => {
    if (drag) onChange(fromEvent(e))
  }
  const up = () => {
    if (drag) {
      setDrag(false)
      onCommit()
    }
  }
  const key = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const step = e.shiftKey ? 1 : 0.25
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault()
      onChange(Math.min(max, value + step))
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault()
      onChange(Math.max(0, value - step))
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onCommit()
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
        <MoodFace i={Math.round(value)} size={38} color={tone} />
        <div>
          <div style={{ fontFamily: M_FONT, fontSize: 20, fontWeight: 600, color: tone, lineHeight: 1.15 }}>{moods[Math.round(value)]}</div>
          <div style={{ fontFamily: M_FONT, fontSize: 12.5, color: 'var(--text-muted)' }}>Drag to where you actually are</div>
        </div>
      </div>
      <div
        ref={trackRef}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
        onKeyDown={key}
        role="slider"
        tabIndex={0}
        aria-label="How are you showing up today?"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={Math.round(value * 100) / 100}
        aria-valuetext={moods[Math.round(value)]}
        style={{ position: 'relative', height: 44, cursor: 'pointer', touchAction: 'none', outline: 'none' }}
      >
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 19,
            height: 6,
            borderRadius: 3,
            background: 'var(--surface-card)',
            border: '1px solid var(--border-subtle)',
            boxSizing: 'border-box',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: 0,
            width: `${pct}%`,
            top: 19,
            height: 6,
            borderRadius: 3,
            background: `linear-gradient(90deg, ${M_TONE[0]}, ${tone})`,
            transition: drag ? 'none' : 'width 200ms ease',
          }}
        />
        {moods.map((m, i) => {
          const at = (i / max) * 100
          const passed = value >= i - 0.001
          return (
            <div
              key={m}
              style={{
                position: 'absolute',
                left: `${at}%`,
                top: 16,
                width: 2,
                height: 12,
                marginLeft: -1,
                borderRadius: 1,
                background: passed ? 'rgba(0,0,0,0.45)' : 'var(--border-strong)',
              }}
            />
          )
        })}
        <div
          style={{
            position: 'absolute',
            left: `${pct}%`,
            top: 22,
            width: 30,
            height: 30,
            marginLeft: -15,
            marginTop: -15,
            borderRadius: '50%',
            background: tone,
            border: '3px solid #0a0a0a',
            boxShadow: `0 0 0 ${drag ? 6 : 3}px ${tone}33`,
            transition: drag ? 'box-shadow 140ms ease' : 'left 200ms ease, box-shadow 140ms ease',
          }}
        />
      </div>
      <div style={{ position: 'relative', height: 46, marginTop: 6 }}>
        {moods.map((m, i) => {
          const at = (i / max) * 100
          const sel = Math.round(value) === i
          return (
            <button
              key={m}
              onClick={() => {
                onChange(i)
                onCommit()
              }}
              style={{
                position: 'absolute',
                left: `${at}%`,
                top: 0,
                transform: i === 0 ? 'none' : i === max ? 'translateX(-100%)' : 'translateX(-50%)',
                minHeight: 44,
                display: 'flex',
                alignItems: 'flex-start',
                padding: '6px 8px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontFamily: M_FONT,
                fontSize: 12,
                fontWeight: sel ? 700 : 500,
                color: sel ? tone : 'var(--text-muted)',
                whiteSpace: 'nowrap',
                letterSpacing: '0.01em',
              }}
            >
              {m}
            </button>
          )
        })}
      </div>
    </div>
  )
}
