/* Reset-account confirmation — bottom sheet matching the existing sheet visual
   language (NoteSheet/CustomActionSheet): scrim fade 260ms, panel slide-up 320ms
   cubic-bezier(0.16,1,0.3,1), 28px top radius, 40x4 grab handle. New chrome, not
   in the prototype (which has no accounts/reset concept). */
import { Button } from '@/design-system'

export interface ResetConfirmDialogProps {
  open: boolean
  onConfirm: () => void
  onClose: () => void
}

export function ResetConfirmDialog({ open, onConfirm, onClose }: ResetConfirmDialogProps) {
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 70, pointerEvents: open ? 'auto' : 'none' }}>
      <div
        onClick={onClose}
        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', opacity: open ? 1 : 0, transition: 'opacity 260ms ease' }}
      />
      <div
        role="alertdialog"
        aria-label="Reset account"
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          background: '#0a0a0a',
          borderTop: '1px solid var(--border-subtle)',
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          padding: '14px 22px calc(30px + env(safe-area-inset-bottom))',
          transform: open ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 320ms cubic-bezier(0.16,1,0.3,1)',
        }}
      >
        <div style={{ width: 40, height: 4, borderRadius: 2, background: 'var(--border-strong)', margin: '0 auto 18px' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ff8b9a" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6" />
          </svg>
          <h2 style={{ fontFamily: 'var(--font-primary)', fontSize: 20, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Reset account</h2>
        </div>
        <p style={{ fontFamily: 'var(--font-primary)', fontSize: 13.5, fontWeight: 300, color: 'var(--text-secondary)', lineHeight: 1.45, margin: '0 0 20px' }}>
          This deletes everything on this device — your name, department progress, conversations, actions, and mood history. It cannot be undone.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Button variant="primary" size="lg" fullWidth style={{ background: '#ff8b9a', color: '#1c1e00' }} onClick={onConfirm}>
            Delete everything
          </Button>
          <Button variant="ghost" size="lg" fullWidth onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}
