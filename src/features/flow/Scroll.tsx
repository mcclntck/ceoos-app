/* Ported verbatim from ceoos-flow.jsx's Scroll — the scrollable body region
   used by most flow steps. */
import type { ReactNode } from 'react'

export function Scroll({ children }: { children: ReactNode }) {
  return (
    <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '0 24px', WebkitOverflowScrolling: 'touch' }}>
      {children}
    </div>
  )
}
