/* Bottom sheet listing a department's active (not-done) actions — opened from
   IntroStep's "Active actions" stat ring when there's more than one, so a user
   with several active actions in a department can see and pick between them
   rather than only ever being able to reach the first one. Matches the existing
   sheet visual language (CustomActionSheet/NoteSheet/ResetConfirmDialog). */
import { ReminderCard } from '@/features/actions'
import type { Plan } from '@/departments/types'

export interface ActiveActionsSheetProps {
  open: boolean
  actions: { plan: Plan; index: number }[]
  onClose: () => void
  onSelect: (planIndex: number) => void
}

export function ActiveActionsSheet({ open, actions, onClose, onSelect }: ActiveActionsSheetProps) {
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 70, pointerEvents: open ? 'auto' : 'none' }}>
      <div
        onClick={onClose}
        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', opacity: open ? 1 : 0, transition: 'opacity 260ms ease' }}
      />
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          maxHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          background: '#0a0a0a',
          borderTop: '1px solid var(--border-subtle)',
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          padding: '14px 22px calc(24px + env(safe-area-inset-bottom))',
          transform: open ? 'translateY(0)' : 'translateY(105%)',
          transition: 'transform 320ms cubic-bezier(0.16,1,0.3,1)',
        }}
      >
        <div style={{ width: 40, height: 4, borderRadius: 2, background: 'var(--border-strong)', margin: '0 auto 18px', flexShrink: 0 }} />
        <h2 style={{ fontFamily: 'var(--font-primary)', fontSize: 20, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 14px', flexShrink: 0 }}>
          Active actions
        </h2>
        <div style={{ overflowY: 'auto' }}>
          {actions.map(({ plan, index }) => (
            <ReminderCard key={index} plan={plan} onClick={() => onSelect(index)} />
          ))}
        </div>
      </div>
    </div>
  )
}
