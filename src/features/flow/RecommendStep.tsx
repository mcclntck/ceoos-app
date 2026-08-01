/* Ported verbatim from ceoos-flow.jsx's `recommend` step body — "That one
   didn't land" gentler-next-step screen shown when mood is low. */
import { FlowHeader } from './FlowHeader'
import { Scroll } from './Scroll'
import { OptionRow } from './OptionRow'
import { GlassCard, Button } from '@/design-system'
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

export interface RecommendStepProps {
  dept: DepartmentRuntime
  lastAction: string | null
  action: string | null
  mood: number
  moods: readonly string[]
  onSelectAction: (action: string) => void
  onBack: () => void
  onNext: () => void
}

export function RecommendStep({ dept, lastAction, action, mood, moods, onSelectAction, onBack, onNext }: RecommendStepProps) {
  const alts = dept.actions.filter((a) => a !== lastAction)
  return (
    <>
      <FlowHeader dept={dept} onBack={onBack} />
      <Scroll>
        <div style={{ paddingTop: 24 }}>
          <div style={{ ...F_EYEBROW, marginBottom: 12 }}>A gentler next step</div>
          <h1 style={{ ...F_H1, marginBottom: 8 }}>That one didn&rsquo;t land</h1>
          <p style={{ fontFamily: 'var(--font-primary)', fontSize: 14.5, color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 18px' }}>
            Feeling {moods[mood].toLowerCase()} afterwards is a useful signal, not a failure. Both are useful signals. Try one that might sit better.
          </p>
          <div style={{ marginBottom: 18 }}>
            <GlassCard radius={18} padding={16}>
              <div style={{ ...F_EYEBROW, fontSize: 10, marginBottom: 6 }}>You tried</div>
              <div style={{ fontFamily: 'var(--font-primary)', fontSize: 15, color: 'var(--text-secondary)', textDecoration: 'line-through', lineHeight: 1.35 }}>
                {lastAction}
              </div>
            </GlassCard>
          </div>
          {alts.map((a) => (
            <OptionRow key={a} label={a} selected={action === a} onClick={() => onSelectAction(a)} />
          ))}
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
