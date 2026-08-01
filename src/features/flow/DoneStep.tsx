/* Ported verbatim from ceoos-flow.jsx's `done` step body — "Full circle."
   payoff screen with the 4-up ticked-stages card. */
import { SparkleIcon, GlassCard, Button } from '@/design-system'
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

export interface DoneStepProps {
  dept: DepartmentRuntime
  moodLabel: string
  onFinish: () => void
}

export function DoneStep({ dept, moodLabel, onFinish }: DoneStepProps) {
  const stages: [string, boolean][] = [
    ['Reflected', true],
    ['Committed', true],
    ['Acted', true],
    [moodLabel, true],
  ]
  return (
    <>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 24px', textAlign: 'center' }}>
        <div style={{ margin: '0 auto 22px' }}>
          <SparkleIcon size={44} color="var(--accent)" />
        </div>
        <h1 style={{ ...F_H1, fontSize: 28, marginBottom: 12 }}>Full circle.</h1>
        <p style={{ fontFamily: 'var(--font-primary)', fontSize: 15.5, color: 'var(--text-secondary)', lineHeight: 1.55, margin: '0 0 26px' }}>
          You reflected, committed, followed through and checked in. Your{' '}
          <b style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{dept.label}</b> Dept just moved closer to You. Water it
          again soon.
        </p>
        <GlassCard radius={20} padding={20}>
          <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
            {stages.map(([l], i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1c1e00" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </div>
                <span style={{ fontFamily: 'var(--font-primary)', fontSize: 11.5, color: 'var(--text-secondary)' }}>{l}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
      <div style={{ padding: '14px var(--ceoos-gutter) calc(22px + env(safe-area-inset-bottom))', flexShrink: 0 }}>
        <Button variant="primary" size="lg" fullWidth onClick={onFinish}>
          Back to my departments
        </Button>
      </div>
    </>
  )
}
