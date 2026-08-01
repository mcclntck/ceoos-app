/* Ported verbatim from ceoos-flow.jsx's `did` step body — "Did you follow
   through?" */
import { FlowHeader } from './FlowHeader'
import { GlassCard, Button, PillChip, SparkleIcon } from '@/design-system'
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

export interface DidStepProps {
  dept: DepartmentRuntime
  action: string | null
  dayLabel: string
  onBack: () => void
  onChat: () => void
  onDidIt: () => void
  onNotYet: () => void
}

export function DidStep({ dept, action, dayLabel, onBack, onChat, onDidIt, onNotYet }: DidStepProps) {
  return (
    <>
      <FlowHeader dept={dept} onBack={onBack} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 24px' }}>
        <PillChip sparkle style={{ border: 'none', background: 'rgba(0,0,0,0.04)', paddingLeft: 0, paddingRight: 0 }}>
          Reminder · {dayLabel}
        </PillChip>
        <h1 style={{ ...F_H1, margin: '20px 0 10px' }}>Your action</h1>
        <GlassCard radius={20} padding={18}>
          <div style={{ fontFamily: 'var(--font-primary)', fontSize: 17, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.35 }}>
            {action}
          </div>
        </GlassCard>
        <button
          onClick={onChat}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 7,
            width: '100%',
            minHeight: 52,
            padding: '14px 16px',
            marginTop: 10,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'var(--font-primary)',
            fontSize: 14,
            fontWeight: 600,
            color: 'var(--accent)',
          }}
        >
          <SparkleIcon size={15} color="var(--accent)" />
          Chat with your coach to change this
        </button>
      </div>
      <div style={{ padding: '14px var(--ceoos-gutter) calc(22px + env(safe-area-inset-bottom))', flexShrink: 0 }}>
        <Button variant="primary" size="lg" fullWidth onClick={onDidIt}>
          I did it
        </Button>
        <div style={{ marginTop: 8 }}>
          <Button variant="ghost" size="lg" fullWidth onClick={onNotYet}>
            Not yet
          </Button>
        </div>
      </div>
    </>
  )
}
