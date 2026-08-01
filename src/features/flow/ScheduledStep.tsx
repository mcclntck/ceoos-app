/* Ported from ceoos-flow.jsx's `scheduled` step body — "Added to your
   calendar" confirmation with the mock calendar-event card.

   Per the architecture plan (§ Strip per the README's own explicit
   instructions), the "Fast-forward: I've done it" demo link that sat below
   the primary CTA in source is deliberately NOT ported — it's called out as
   a demo-only affordance to remove in production. */
import { FlowHeader } from './FlowHeader'
import { F_TIMES } from './ReminderStep'
import { GlassCard, Button } from '@/design-system'
import type { DepartmentRuntime } from '@/departments/types'

const F_H1: React.CSSProperties = {
  fontFamily: 'var(--font-primary)',
  fontSize: 26,
  fontWeight: 400,
  color: 'var(--text-primary)',
  margin: 0,
  letterSpacing: '-0.01em',
  lineHeight: 1.2,
}

export interface ScheduledStepProps {
  dept: DepartmentRuntime
  action: string | null
  dayLabel: string
  pickedDate: Date | null
  time: number
  onBack: () => void
  onDone: () => void
}

export function ScheduledStep({ dept, action, dayLabel, pickedDate, time, onBack, onDone }: ScheduledStepProps) {
  return (
    <>
      <FlowHeader dept={dept} onBack={onBack} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 24px' }}>
        <div
          style={{
            width: 76,
            height: 76,
            borderRadius: '50%',
            background: 'var(--accent-dim)',
            border: '1px solid var(--accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 22px',
          }}
        >
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="5" width="18" height="16" rx="3" />
            <path d="M3 9h18M8 3v4M16 3v4M9 15l2 2 4-4" />
          </svg>
        </div>
        <h1 style={{ ...F_H1, textAlign: 'center', marginBottom: 10 }}>Added to your calendar</h1>
        <p style={{ fontFamily: 'var(--font-primary)', fontSize: 15, color: 'var(--text-secondary)', textAlign: 'center', lineHeight: 1.5, margin: '0 0 24px' }}>
          We&rsquo;ll remind you {pickedDate ? 'on ' + dayLabel : dayLabel.toLowerCase()} in the {F_TIMES[time].split('·')[0].trim().toLowerCase()}.
        </p>
        <GlassCard radius={20} padding={18}>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
            <div
              style={{
                width: 46,
                height: 46,
                borderRadius: 12,
                background: 'var(--surface-card-strong)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <span style={{ fontFamily: 'var(--font-primary)', fontSize: 9, letterSpacing: '0.1em', color: 'var(--accent)', fontWeight: 700, textTransform: 'uppercase' }}>
                {dayLabel.slice(0, 3)}
              </span>
              <span style={{ fontFamily: 'var(--font-primary)', fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>
                {F_TIMES[time].split('·')[1].trim()}
              </span>
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: 'var(--font-primary)', fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.3 }}>
                {action}
              </div>
              <div style={{ fontFamily: 'var(--font-primary)', fontSize: 12.5, color: 'var(--text-muted)', marginTop: 3 }}>
                CEO of Self · {dept.label}
              </div>
            </div>
          </div>
        </GlassCard>
      </div>
      <div style={{ padding: '14px var(--ceoos-gutter) calc(22px + env(safe-area-inset-bottom))', flexShrink: 0 }}>
        <Button variant="primary" size="lg" fullWidth onClick={onDone}>
          Done — take me back
        </Button>
      </div>
    </>
  )
}
