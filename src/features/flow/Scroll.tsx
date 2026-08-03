/* Ported verbatim from ceoos-flow.jsx's Scroll — the scrollable body region
   used by most flow steps. */
import type { ReactNode, UIEvent } from 'react'

export interface ScrollProps {
  children: ReactNode
  onScroll?: (e: UIEvent<HTMLDivElement>) => void
}

export function Scroll({ children, onScroll }: ScrollProps) {
  return (
    <div
      onScroll={onScroll}
      style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '0 24px', WebkitOverflowScrolling: 'touch' }}
    >
      {children}
    </div>
  )
}
