import type { ReactNode } from 'react'
import logoMarkWhite from '@/assets/logo-mark-white.png'

export interface BrandRowProps {
  left?: ReactNode
  right?: ReactNode
}

export function BrandRow({ right = null, left = null }: BrandRowProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        padding: '4px var(--ceoos-gutter) 0',
        minHeight: 60,
      }}
    >
      {left || <img src={logoMarkWhite} alt="CEO of Self" style={{ height: 22, opacity: 0.9 }} />}
      {right}
    </div>
  )
}
