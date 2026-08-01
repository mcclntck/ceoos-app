import type { HTMLAttributes, ReactNode } from 'react'

export interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode
  strong?: boolean
  padding?: number | string
  radius?: number | string
}

export function GlassCard({
  children,
  strong = false,
  padding = 20,
  radius = 'var(--radius-md)',
  style,
  ...rest
}: GlassCardProps) {
  return (
    <div
      style={{
        background: strong ? 'var(--surface-card-strong)' : 'var(--surface-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: radius,
        padding,
        backdropFilter: 'blur(var(--blur-card))',
        WebkitBackdropFilter: 'blur(var(--blur-card))',
        boxShadow: 'var(--shadow-card)',
        color: 'var(--text-primary)',
        fontFamily: 'var(--font-primary)',
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  )
}
