/* Ported verbatim from ceoos-flow.jsx's `action` step body (inside
   DepartmentFlow) — "Pick one thing you'll actually do". */
import { FlowHeader } from './FlowHeader'
import { Scroll } from './Scroll'
import { OptionRow } from './OptionRow'
import { Button } from '@/design-system'
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

export interface ActionStepProps {
  dept: DepartmentRuntime
  action: string | null
  customActions: string[]
  onSelectAction: (action: string) => void
  onOpenCustom: () => void
  onBack: () => void
  onNext: () => void
}

export function ActionStep({ dept, action, customActions, onSelectAction, onOpenCustom, onBack, onNext }: ActionStepProps) {
  return (
    <>
      <FlowHeader dept={dept} onBack={onBack} />
      <Scroll>
        <div style={{ paddingTop: 24 }}>
          <div
            style={{
              fontFamily: 'var(--font-primary)',
              fontSize: 11,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
              fontWeight: 600,
              marginBottom: 12,
            }}
          >
            Commitment to action
          </div>
          <h1 style={{ ...F_H1, marginBottom: 8 }}>Pick one thing you&rsquo;ll actually do</h1>
          <p style={{ fontFamily: 'var(--font-primary)', fontSize: 14.5, color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 22px' }}>
            Small and real beats big and someday. Nobody hands you a KPI for this one — choose it yourself.
          </p>
          {[...dept.actions, ...customActions].map((a) => (
            <OptionRow key={a} label={a} selected={action === a} onClick={() => onSelectAction(a)} />
          ))}
          <button
            onClick={onOpenCustom}
            style={{
              width: '100%',
              textAlign: 'left',
              cursor: 'pointer',
              marginBottom: 12,
              padding: '18px 20px',
              borderRadius: 18,
              background: 'transparent',
              border: '1px dashed var(--border-strong)',
              color: 'var(--accent)',
              fontFamily: 'var(--font-primary)',
              fontSize: 16,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 14,
            }}
          >
            <span
              style={{
                width: 22,
                height: 22,
                flexShrink: 0,
                borderRadius: '50%',
                border: '1.5px solid var(--accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.4" strokeLinecap="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </span>
            Write my own action
          </button>
        </div>
      </Scroll>
      <div style={{ padding: '14px var(--ceoos-gutter) calc(22px + env(safe-area-inset-bottom))', flexShrink: 0 }}>
        <Button variant="primary" size="lg" fullWidth disabled={!action} onClick={onNext}>
          Set a reminder
        </Button>
      </div>
    </>
  )
}
