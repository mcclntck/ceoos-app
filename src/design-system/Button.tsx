import type { ButtonHTMLAttributes, ReactNode } from 'react'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outlineAccent'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
  iconLeft?: ReactNode
  iconRight?: ReactNode
}

const SIZES: Record<ButtonSize, { height: number; fontSize: number; padding: string }> = {
  sm: { height: 40, fontSize: 14, padding: '0 20px' },
  md: { height: 52, fontSize: 16, padding: '0 28px' },
  lg: { height: 58, fontSize: 17, padding: '0 34px' },
}

const VARIANTS: Record<ButtonVariant, React.CSSProperties> = {
  primary: {
    background: 'var(--accent)',
    color: 'var(--text-on-accent)',
    border: '1px solid transparent',
    fontWeight: 700,
  },
  secondary: {
    background: 'var(--surface-card)',
    color: 'var(--text-primary)',
    border: '1px solid var(--border-strong)',
    fontWeight: 600,
  },
  ghost: {
    background: 'transparent',
    color: 'var(--text-primary)',
    border: '1px solid transparent',
    fontWeight: 600,
  },
  outlineAccent: {
    background: 'transparent',
    color: 'var(--accent)',
    border: '1px solid var(--accent)',
    fontWeight: 700,
  },
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  iconLeft = null,
  iconRight = null,
  style,
  onMouseDown,
  onMouseUp,
  onMouseLeave,
  ...rest
}: ButtonProps) {
  const s = SIZES[size]
  const v = VARIANTS[variant]
  return (
    <button
      disabled={disabled}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        height: s.height,
        padding: s.padding,
        fontSize: s.fontSize,
        width: fullWidth ? '100%' : 'auto',
        fontFamily: 'var(--font-primary)',
        letterSpacing: '0.01em',
        borderRadius: 'var(--radius-pill)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1,
        transition:
          'transform var(--dur-fast) var(--ease-standard), filter var(--dur-fast) var(--ease-standard), background var(--dur-fast)',
        ...v,
        ...style,
      }}
      onMouseDown={(e) => {
        if (!disabled) e.currentTarget.style.transform = 'scale(0.98)'
        onMouseDown?.(e)
      }}
      onMouseUp={(e) => {
        e.currentTarget.style.transform = 'scale(1)'
        onMouseUp?.(e)
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)'
        onMouseLeave?.(e)
      }}
      {...rest}
    >
      {iconLeft}
      {children}
      {iconRight}
    </button>
  )
}
