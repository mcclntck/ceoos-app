/* Ported from design_handoff_ceoos_pilot_app/design/ceoos-home.jsx (ReminderCard, Chevron). */
import { GlassCard } from '@/design-system'
import { deptById } from '@/departments/departments.config'
import type { Plan } from '@/departments/types'
import { DateTile } from './DateTile'

const A_FONT = 'var(--font-primary)'
const A_EYEBROW = { fontFamily: A_FONT, fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase' as const, fontWeight: 600 as const }

export function Chevron() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <path d="M9 6l6 6-6 6" />
    </svg>
  )
}

export interface ReminderCardProps {
  plan: Plan
  onClick?: () => void
}

export function ReminderCard({ plan, onClick }: ReminderCardProps) {
  const dept = deptById(plan.deptId)
  return (
    <button onClick={onClick} style={{ width: '100%', textAlign: 'left', cursor: 'pointer', display: 'block', background: 'none', border: 'none', padding: 0, marginBottom: 12 }}>
      <GlassCard radius={18} padding={16}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <DateTile dayLabel={plan.dayLabel} timeLabel={plan.timeLabel} />
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
              <span style={{ ...A_EYEBROW, color: 'var(--accent)' }}>{dept ? dept.label : plan.deptId}</span>
              {plan.done && <span style={{ ...A_EYEBROW, color: 'var(--text-muted)' }}>· Done</span>}
            </div>
            <div style={{ fontFamily: A_FONT, fontSize: 15.5, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.3 }}>{plan.action}</div>
          </div>
          {plan.done ? (
            <span
              style={{
                width: 26,
                height: 26,
                flexShrink: 0,
                borderRadius: '50%',
                background: 'var(--accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#1c1e00" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </span>
          ) : (
            <Chevron />
          )}
        </div>
      </GlassCard>
    </button>
  )
}
