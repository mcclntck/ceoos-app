import type { HTMLAttributes, ReactNode } from 'react'
import { SparkleIcon } from './SparkleIcon'

export interface PillChipProps extends HTMLAttributes<HTMLSpanElement> {
  children?: ReactNode
  sparkle?: boolean
  meta?: ReactNode
}

/** Faint dark-glass pill used for labels like "CEO Moment · Tuesday". */
export function PillChip({ children, sparkle = false, meta = null, style, ...rest }: PillChipProps) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        height: 38,
        padding: '0 16px',
        borderRadius: 'var(--radius-pill)',
        background: 'var(--surface-card)',
        border: '1px solid var(--border-subtle)',
        backdropFilter: 'blur(var(--blur-card))',
        WebkitBackdropFilter: 'blur(var(--blur-card))',
        fontFamily: 'var(--font-primary)',
        fontSize: 14,
        fontWeight: 600,
        color: 'var(--text-primary)',
        ...style,
      }}
      {...rest}
    >
      {sparkle && <SparkleIcon size={15} color="var(--zinc)" />}
      <span>{children}</span>
      {meta != null && <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>· {meta}</span>}
    </span>
  )
}
