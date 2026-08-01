/* Avatar-triggered account menu — new chrome, not in the prototype (which has no
   account/reset concept per its "nothing persists" demo design). Visual language
   matches the app's existing card/pill/menu vocabulary: a small anchored glass
   panel, consistent with NoteSheet/CustomActionSheet's dark-surface + subtle-border
   treatment, scaled down to a compact dropdown rather than a full bottom sheet
   since this is a lightweight single-action menu, not a form. */
import { useEffect, useRef } from 'react'
import { Avatar } from './Avatar'

export interface AvatarMenuProps {
  initials: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onRequestReset: () => void
}

export function AvatarMenu({ initials, open, onOpenChange, onRequestReset }: AvatarMenuProps) {
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handlePointerDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        onOpenChange(false)
      }
    }
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onOpenChange(false)
    }
    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKey)
    }
  }, [open, onOpenChange])

  return (
    <div ref={rootRef} style={{ position: 'relative' }}>
      <button
        onClick={() => onOpenChange(!open)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', borderRadius: '50%' }}
      >
        <Avatar initials={initials} />
      </button>

      {open && (
        <div
          role="menu"
          style={{
            position: 'absolute',
            top: 48,
            right: 0,
            zIndex: 40,
            minWidth: 200,
            background: 'var(--surface-card-strong)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 16,
            padding: 6,
            boxShadow: '0 12px 40px rgba(0,0,0,0.55)',
            backdropFilter: 'blur(var(--blur-card))',
            WebkitBackdropFilter: 'blur(var(--blur-card))',
          }}
        >
          <button
            role="menuitem"
            onClick={() => {
              onOpenChange(false)
              onRequestReset()
            }}
            style={{
              width: '100%',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '12px 14px',
              borderRadius: 12,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'var(--font-primary)',
              fontSize: 14.5,
              fontWeight: 600,
              color: '#ff8b9a',
            }}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6" />
            </svg>
            Reset account
          </button>
        </div>
      )}
    </div>
  )
}
