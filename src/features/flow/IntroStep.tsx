/* Ported verbatim from ceoos-flow.jsx's `intro` step body (inside
   DepartmentFlow) — the zoomed-in department hero, stat rings, and chat
   history list, ending in the "New chat" CTA. */
import { BackButton } from '@/features/chrome'
import { GlassCard, Button, SparkleIcon } from '@/design-system'
import { ORBIT_TONE, ORBIT_ICONS, fTone } from '@/departments/departmentTones'
import type { DepartmentRuntime, Conversation } from '@/departments/types'
import { Scroll } from './Scroll'

interface StatRingProps {
  value: number | string
  label: string
  pct: number
  ringHue: string
  onPress?: (() => void) | null
}

function StatRing({ value, label, pct, ringHue, onPress }: StatRingProps) {
  const S = 54
  const sw = 4
  const r = (S - sw) / 2
  const C = 2 * Math.PI * r
  const Tag = onPress ? 'button' : 'div'
  return (
    <Tag
      onClick={onPress ?? undefined}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 9, flex: 1, background: 'none', border: 'none', padding: 0, cursor: onPress ? 'pointer' : 'default' }}
    >
      <span style={{ position: 'relative', width: S, height: S, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width={S} height={S} viewBox={`0 0 ${S} ${S}`} style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)' }}>
          <circle cx={S / 2} cy={S / 2} r={r} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={sw} />
          {pct > 0 && (
            <circle cx={S / 2} cy={S / 2} r={r} fill="none" stroke={ringHue} strokeWidth={sw} strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - pct)} />
          )}
        </svg>
        <span style={{ fontFamily: 'var(--font-primary)', fontSize: 17, fontWeight: 700, color: 'var(--text-primary)' }}>{value}</span>
      </span>
      <span style={{ fontFamily: 'var(--font-primary)', fontSize: 11.5, color: onPress ? 'var(--text-secondary)' : 'var(--text-muted)', textAlign: 'center', lineHeight: 1.2 }}>
        {label}
      </span>
    </Tag>
  )
}

export interface IntroStepProps {
  dept: DepartmentRuntime
  doneCount: number
  planCount: number
  conversations: Conversation[]
  onOpenActive?: (() => void) | null
  onBack: () => void
  onNewChat: () => void
}

export function IntroStep({ dept, doneCount, planCount, conversations, onOpenActive, onBack, onNewChat }: IntroStepProps) {
  const hue = fTone(dept.id).hue
  const tone = ORBIT_TONE[dept.glow] ?? { core: '#151515', edge: 'rgba(255,255,255,0.16)' }
  const icons = ORBIT_ICONS

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', padding: '4px 20px 0' }}>
        <BackButton onClick={onBack} />
      </div>
      <Scroll>
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 4 }}>
          <svg width="300" height="86" viewBox="0 0 300 86" style={{ position: 'absolute', top: -28, left: '50%', transform: 'translateX(-50%)', pointerEvents: 'none' }}>
            <path d="M4 8C40 66 110 82 150 82s110-16 146-74" fill="none" stroke="rgba(233,234,237,0.20)" strokeWidth="1" />
          </svg>
          <span
            style={{
              position: 'relative',
              width: 100,
              height: 100,
              borderRadius: '50%',
              background: `radial-gradient(circle at 50% 30%, ${tone.edge}, ${tone.core} 76%)`,
              boxShadow: `0 0 0 1px ${tone.edge}, 0 0 54px -8px ${fTone(dept.id).soft}, 0 14px 34px rgba(0,0,0,0.6)`,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1,
            }}
          >
            <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke={hue} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              {icons[dept.id]}
            </svg>
          </span>
          <h1 style={{ fontFamily: 'var(--font-primary)', fontSize: 30, fontWeight: 700, color: 'var(--text-primary)', margin: '18px 0 0', letterSpacing: '-0.01em', textAlign: 'center' }}>
            {dept.label}
          </h1>
          <p
            style={{
              fontFamily: 'var(--font-primary)',
              fontSize: 13.5,
              fontWeight: 300,
              fontStyle: 'italic',
              color: 'var(--text-secondary)',
              lineHeight: 1.45,
              margin: '10px 0 0',
              textAlign: 'center',
              textWrap: 'pretty',
            }}
          >
            {dept.coach}
          </p>
          <div style={{ display: 'flex', alignSelf: 'stretch', gap: 8, margin: '22px 0 4px' }}>
            <StatRing
              value={doneCount}
              label={doneCount === 1 ? 'Action completed' : 'Actions completed'}
              pct={planCount ? doneCount / planCount : 0}
              ringHue={hue}
            />
            <StatRing value={`${conversations.length}x`} label="Chat streak" pct={Math.min(1, conversations.length / 5)} ringHue="var(--accent)" />
            <StatRing
              value={Math.max(0, planCount - doneCount)}
              label="Active actions"
              pct={planCount ? (planCount - doneCount) / planCount : 0}
              ringHue={hue}
              onPress={planCount - doneCount > 0 && onOpenActive ? onOpenActive : null}
            />
          </div>
        </div>

        <div style={{ paddingBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', margin: '26px 0 12px' }}>
            <div style={{ fontFamily: 'var(--font-primary)', fontSize: 17, fontWeight: 600, color: 'var(--text-primary)' }}>Chat history</div>
            <span style={{ fontFamily: 'var(--font-primary)', fontSize: 13, color: 'var(--text-muted)' }}>{conversations.length}</span>
          </div>
          {conversations.length === 0 ? (
            <GlassCard radius={18} padding={18}>
              <div style={{ fontFamily: 'var(--font-primary)', fontSize: 14.5, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                No chats here yet. Six questions, honest answers, then one thing you&rsquo;ll actually do.
              </div>
            </GlassCard>
          ) : (
            conversations.map((c) => (
              <div key={c.id} style={{ marginBottom: 12 }}>
                <GlassCard radius={18} padding={16}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke={hue} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                      <path d="M21 12a8 8 0 0 1-8 8H8l-5 2 1.5-4.2A8 8 0 0 1 13 4a8 8 0 0 1 8 8z" />
                    </svg>
                    <span style={{ fontFamily: 'var(--font-primary)', fontSize: 14.5, fontWeight: 600, color: 'var(--text-primary)', minWidth: 0 }}>{c.title}</span>
                    <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-primary)', fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{c.date}</span>
                  </div>
                  <div style={{ fontFamily: 'var(--font-primary)', fontSize: 13.5, fontWeight: 300, color: 'var(--text-secondary)', lineHeight: 1.5, marginTop: 9 }}>
                    {c.summary}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border-subtle)' }}>
                    <span style={{ width: 20, height: 20, flexShrink: 0, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text-on-accent)" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    </span>
                    <span style={{ fontFamily: 'var(--font-primary)', fontSize: 13.5, fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1.3 }}>{c.action}</span>
                    {c.mood && (
                      <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-primary)', fontSize: 12, fontWeight: 600, color: hue, whiteSpace: 'nowrap' }}>{c.mood}</span>
                    )}
                  </div>
                </GlassCard>
              </div>
            ))
          )}
        </div>
      </Scroll>
      <div style={{ padding: '14px var(--ceoos-gutter) calc(22px + env(safe-area-inset-bottom))', flexShrink: 0 }}>
        <Button variant="primary" size="lg" fullWidth iconLeft={<SparkleIcon size={18} color="var(--text-on-accent)" />} onClick={onNewChat}>
          New chat
        </Button>
      </div>
    </>
  )
}
