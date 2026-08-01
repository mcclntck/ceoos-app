/* Ported verbatim from ceoos-flow.jsx's `completed` step body — shown when
   the flow is entered (via `entry`) pointing at a plan that's already done. */
import { FlowHeader } from './FlowHeader'
import { GlassCard, Button, SparkleIcon } from '@/design-system'
import type { DepartmentRuntime } from '@/departments/types'

const F_EYEBROW: React.CSSProperties = {
  fontFamily: 'var(--font-primary)',
  fontSize: 11,
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  color: 'var(--text-muted)',
  fontWeight: 600,
}

const F_H1: React.CSSProperties = {
  fontFamily: 'var(--font-primary)',
  fontSize: 26,
  fontWeight: 400,
  color: 'var(--text-primary)',
  margin: 0,
  letterSpacing: '-0.01em',
  lineHeight: 1.2,
}

export interface CompletedStepProps {
  dept: DepartmentRuntime
  action: string | null
  onBack: () => void
  onStartNewChat: () => void
  onAddAnotherAction: () => void
}

export function CompletedStep({ dept, action, onBack, onStartNewChat, onAddAnotherAction }: CompletedStepProps) {
  return (
    <>
      <FlowHeader dept={dept} onBack={onBack} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <span style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--text-on-accent)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </span>
          <span style={F_EYEBROW}>Already done</span>
        </div>
        <h1 style={{ ...F_H1, margin: '0 0 12px' }}>You followed through on this one.</h1>
        <GlassCard radius={20} padding={18}>
          <div style={{ fontFamily: 'var(--font-primary)', fontSize: 16.5, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.35 }}>{action}</div>
        </GlassCard>
        <p style={{ fontFamily: 'var(--font-primary)', fontSize: 15, fontWeight: 300, color: 'var(--text-secondary)', lineHeight: 1.5, margin: '16px 0 0' }}>
          Nothing left to do here. Keep the Dept moving — talk it through again, or commit to the next thing.
        </p>
      </div>
      <div style={{ padding: '14px var(--ceoos-gutter) calc(22px + env(safe-area-inset-bottom))', flexShrink: 0 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Button variant="primary" size="lg" fullWidth iconLeft={<SparkleIcon size={18} color="var(--text-on-accent)" />} onClick={onStartNewChat}>
            Start a new chat
          </Button>
          <Button variant="ghost" size="lg" fullWidth onClick={onAddAnotherAction}>
            Add another action
          </Button>
        </div>
      </div>
    </>
  )
}
