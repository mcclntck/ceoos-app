import type { CSSProperties } from 'react'

export interface ProgressRingProps {
  value?: number
  max?: number
  size?: number
  stroke?: number
  label?: string | null
  showFraction?: boolean
  style?: CSSProperties
}

/** Neon sweep ring used for weekly progress (e.g. "4/6"). */
export function ProgressRing({
  value = 0,
  max = 6,
  size = 72,
  stroke = 6,
  label = null,
  showFraction = true,
  style,
}: ProgressRingProps) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const pct = Math.max(0, Math.min(1, max ? value / max : 0))
  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 8, ...style }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--ink-600)" strokeWidth={stroke} />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="var(--accent)"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={c * (1 - pct)}
            style={{ transition: 'stroke-dashoffset var(--dur-slow) var(--ease-emphasis)' }}
          />
        </svg>
        {showFraction && (
          <span
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'var(--font-primary)',
              fontSize: size * 0.2,
              fontWeight: 600,
              color: 'var(--text-primary)',
            }}
          >
            {value}
            <span style={{ color: 'var(--text-muted)', fontSize: size * 0.14 }}>/{max}</span>
          </span>
        )}
      </div>
      {label && (
        <span style={{ fontFamily: 'var(--font-primary)', fontSize: 14, color: 'var(--text-secondary)' }}>{label}</span>
      )}
    </div>
  )
}
