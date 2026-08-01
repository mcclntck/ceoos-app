import type { CSSProperties, ReactNode } from 'react'
import { PillChip } from './PillChip'

export interface CoachMomentProps {
  children?: ReactNode
  label?: string
  tone?: 'neon' | 'muted'
  italic?: boolean
  style?: CSSProperties
}

/** A quote/callout block: a "Coach moment" pill over neon or italic coach copy. */
export function CoachMoment({ children, label = 'Coach moment', tone = 'neon', italic = false, style }: CoachMomentProps) {
  const color = tone === 'neon' ? 'var(--accent)' : 'var(--text-secondary)'
  return (
    <div
      style={{
        background: 'var(--surface-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: 20,
        backdropFilter: 'blur(var(--blur-card))',
        WebkitBackdropFilter: 'blur(var(--blur-card))',
        ...style,
      }}
    >
      <PillChip sparkle style={{ marginBottom: 16 }}>
        {label}
      </PillChip>
      <p
        style={{
          margin: 0,
          color,
          fontFamily: 'var(--font-primary)',
          fontSize: 18,
          lineHeight: 1.5,
          fontWeight: 500,
          fontStyle: italic ? 'italic' : 'normal',
        }}
      >
        {children}
      </p>
    </div>
  )
}
