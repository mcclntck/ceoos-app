/* Ported from design_handoff_ceoos_pilot_app/design/ceoos-dept-home.jsx
   (DepartmentHome). Per-department hub: hero (progress ring, status, coach
   quote), conversation history, sticky "Start a conversation" CTA.

   The `DesignSpace` module-toggle block from the source is deliberately
   OMITTED — confirmed scope cut per the architecture plan: it's a workshop
   artefact for deciding page contents, not a shipping feature. */
import { AppBackdrop, StatusBar, BackButton } from '@/features/chrome'
import type { GlowKey } from '@/features/chrome'
import { Button, PillChip, ProgressRing, SparkleIcon } from '@/design-system'
import { useConversations } from '@/state/conversationsStore'
import type { DepartmentRuntime } from '@/departments/types'
import { ConversationRow, EmptyConversationCard } from './ConversationRow'

const DH_FONT = 'var(--font-primary)'
const DH_STATUS = ['Drifting — not yet led', 'Reflected on', 'Actively led', 'Thriving']

function glowForDept(glow: DepartmentRuntime['glow']): GlowKey {
  return glow === 'warm' ? 'warm' : glow === 'cool' ? 'cool' : glow === 'teal' ? 'teal' : 'dept'
}

function SectionHead({ title, right }: { title: string; right?: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', margin: '26px 0 14px' }}>
      <h2 style={{ fontFamily: DH_FONT, fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{title}</h2>
      {right}
    </div>
  )
}

export interface DepartmentHomeScreenProps {
  dept: DepartmentRuntime
  onBack: () => void
  onStart: () => void
}

export function DepartmentHomeScreen({ dept, onBack, onStart }: DepartmentHomeScreenProps) {
  const { conversationsByDept } = useConversations()
  const convs = conversationsByDept[dept.id] ?? []

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>
      <AppBackdrop glow={glowForDept(dept.glow)} />
      <StatusBar />
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '4px var(--ceoos-gutter-sm) 0' }}>
        <BackButton onClick={onBack} />
        <PillChip>{dept.head}</PillChip>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '0 24px 150px', WebkitOverflowScrolling: 'touch' }}>
        {/* Hero */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 18 }}>
          <ProgressRing value={dept.level} max={3} size={64} />
          <div style={{ minWidth: 0 }}>
            <h1 style={{ fontFamily: DH_FONT, fontSize: 27, fontWeight: 400, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.01em', lineHeight: 1.1 }}>
              {dept.label}
            </h1>
            <div style={{ fontFamily: DH_FONT, fontSize: 13.5, color: dept.level >= 2 ? 'var(--accent)' : 'var(--text-muted)', fontWeight: 600, marginTop: 4 }}>
              {DH_STATUS[dept.level]}
            </div>
          </div>
        </div>
        <p style={{ fontFamily: DH_FONT, fontSize: 14.5, fontWeight: 300, color: 'var(--text-secondary)', lineHeight: 1.5, margin: '16px 0 0', fontStyle: 'italic' }}>
          "{dept.coach}"
        </p>

        {/* Conversation history */}
        <SectionHead title="Conversations" right={<span style={{ fontFamily: DH_FONT, fontSize: 13, color: 'var(--text-muted)' }}>{convs.length}</span>} />
        {convs.length > 0 ? (
          convs.map((c) => <ConversationRow key={c.id} conv={c} onClick={onStart} />)
        ) : (
          <EmptyConversationCard deptLabel={dept.label} />
        )}
      </div>

      {/* Sticky start button */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          padding: '14px 24px 30px',
          background: 'linear-gradient(180deg,rgba(0,0,0,0) 0%,rgba(0,0,0,0.85) 34%,#000 100%)',
        }}
      >
        <Button variant="primary" size="lg" fullWidth iconLeft={<SparkleIcon size={18} color="var(--text-on-accent)" />} onClick={onStart}>
          Start a conversation
        </Button>
      </div>
    </div>
  )
}
