import type { CSSProperties, HTMLAttributes } from 'react'
import logoMarkWhite from '@/assets/logo-mark-white.png'

export interface LogoProps extends HTMLAttributes<HTMLSpanElement> {
  markSrc?: string
  wordmark?: boolean
  size?: number
  color?: string
  style?: CSSProperties
}

/**
 * Renders the "coo" mark PNG plus the wide-tracked wordmark.
 * Never redraws the mark — always uses the provided asset.
 */
export function Logo({ markSrc = logoMarkWhite, wordmark = true, size = 44, color = 'var(--zinc)', style, ...rest }: LogoProps) {
  return (
    <span style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: size * 0.22, ...style }} {...rest}>
      <img src={markSrc} alt="CEO of Self" style={{ height: size, width: 'auto', display: 'block' }} />
      {wordmark && (
        <span
          style={{
            fontFamily: 'var(--font-primary)',
            fontWeight: 600,
            fontSize: size * 0.26,
            letterSpacing: 'var(--ls-wordmark)',
            color,
            paddingLeft: '0.34em',
          }}
        >
          CEO OF SELF
        </span>
      )}
    </span>
  )
}
