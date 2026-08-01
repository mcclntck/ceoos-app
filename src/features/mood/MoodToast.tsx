/* Ported from design_handoff_ceoos_pilot_app/design/ceoos-mood.jsx (MoodToast).
   Rises from the bottom after a mood is logged. Viewport-fixed, centred in the
   app column so it always clears the floating tab dock. */

const M_FONT = 'var(--font-primary)'

export interface MoodToastProps {
  open: boolean
  label: string
  onAddNote: () => void
  onClose: () => void
}

export function MoodToast({ open, label, onAddNote, onClose }: MoodToastProps) {
  return (
    <div style={{ position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 60, pointerEvents: 'none', display: 'flex', justifyContent: 'center' }}>
      <div
        style={{
          width: '100%',
          maxWidth: 'var(--ceoos-col)',
          padding: '0 var(--ceoos-gutter-sm)',
          boxSizing: 'border-box',
          paddingBottom: 'calc(var(--ceoos-dock) + 10px)',
          pointerEvents: open ? 'auto' : 'none',
          transform: open ? 'translateY(0)' : 'translateY(140%)',
          opacity: open ? 1 : 0,
          transition: 'transform 340ms cubic-bezier(0.16,1,0.3,1), opacity 220ms ease',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            background: '#141414',
            border: '1px solid var(--border-strong)',
            borderRadius: 18,
            padding: '12px 12px 12px 16px',
            boxShadow: '0 12px 32px rgba(0,0,0,0.55)',
          }}
        >
          <span
            style={{
              width: 22,
              height: 22,
              flexShrink: 0,
              borderRadius: '50%',
              background: 'var(--accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--text-on-accent)" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </span>
          <span style={{ flex: 1, minWidth: 0, fontFamily: M_FONT, fontSize: 13.5, fontWeight: 500, color: 'var(--text-primary)' }}>
            Mood logged · {label}
          </span>
          <button
            onClick={onAddNote}
            style={{
              flexShrink: 0,
              minHeight: 36,
              padding: '0 14px',
              borderRadius: 999,
              border: '1px solid var(--border-strong)',
              background: 'none',
              cursor: 'pointer',
              fontFamily: M_FONT,
              fontSize: 13,
              fontWeight: 600,
              color: 'var(--accent)',
            }}
          >
            Add note
          </button>
          <button
            onClick={onClose}
            aria-label="Dismiss"
            style={{
              flexShrink: 0,
              width: 36,
              height: 36,
              borderRadius: '50%',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2.2" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
