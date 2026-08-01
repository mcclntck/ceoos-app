/* Ported from design_handoff_ceoos_pilot_app/design/ceoos-dept-home.jsx
   (ConversationRow). Past-conversation card: topic pill, date, mood
   right-aligned, summary, and — above a divider — the resulting action with
   a neon checkmark. */
import { GlassCard, PillChip } from '@/design-system'
import type { Conversation } from '@/departments/types'

const DH_FONT = 'var(--font-primary)'

export interface ConversationRowProps {
  conv: Conversation
  onClick?: () => void
}

export function ConversationRow({ conv, onClick }: ConversationRowProps) {
  return (
    <button
      onClick={onClick}
      style={{ width: '100%', textAlign: 'left', cursor: 'pointer', display: 'block', background: 'none', border: 'none', padding: 0, marginBottom: 12 }}
    >
      <GlassCard radius={18} padding={16}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <PillChip>{conv.title}</PillChip>
          <span style={{ fontFamily: DH_FONT, fontSize: 12, color: 'var(--text-muted)' }}>{conv.date}</span>
          {conv.mood && (
            <span style={{ marginLeft: 'auto', fontFamily: DH_FONT, fontSize: 11.5, color: 'var(--accent)', fontWeight: 600 }}>{conv.mood}</span>
          )}
        </div>
        <div
          style={{
            fontFamily: DH_FONT,
            fontSize: 14.5,
            fontWeight: 300,
            color: 'var(--text-secondary)',
            lineHeight: 1.45,
            marginBottom: conv.action ? 12 : 0,
          }}
        >
          {conv.summary}
        </div>
        {conv.action && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, paddingTop: 12, borderTop: '1px solid var(--border-subtle)' }}>
            <span
              style={{
                width: 20,
                height: 20,
                flexShrink: 0,
                borderRadius: '50%',
                background: 'var(--accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#1c1e00" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </span>
            <span style={{ fontFamily: DH_FONT, fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.3 }}>{conv.action}</span>
          </div>
        )}
      </GlassCard>
    </button>
  )
}

export function EmptyConversationCard({ deptLabel }: { deptLabel: string }) {
  return (
    <GlassCard radius={18} padding={20}>
      <div style={{ fontFamily: DH_FONT, fontSize: 14.5, fontWeight: 300, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
        No conversations yet. Start one to reflect on your {deptLabel.toLowerCase()} and commit to an action.
      </div>
    </GlassCard>
  )
}
