/* Ported verbatim from ceoos-flow.jsx: CoachRow, UserRow, SayContent, TypingDots
   — the chat-message bubble primitives used by ChatQuestions. */
import type { ReactNode } from 'react'
import { SparkleIcon } from '@/design-system'

export type { CoachFollowUp, UserQuestion, FinalAnswer, Exchange } from './exchange'

export interface ChatTurnSay {
  type: 'say'
  text: string
}

export interface ChatTurnAsk {
  type: 'ask'
  q: string
  options?: string[]
}

export type ChatTurn = ChatTurnSay | ChatTurnAsk

const COACH_BUBBLE_STYLE: React.CSSProperties = {
  background: 'var(--surface-card)',
  border: '1px solid var(--border-subtle)',
  padding: '13px 16px',
  fontFamily: 'var(--font-primary)',
  fontSize: 15.5,
  lineHeight: 1.45,
  color: 'var(--text-primary)',
}

const USER_BUBBLE_STYLE: React.CSSProperties = {
  maxWidth: '82%',
  background: 'var(--accent)',
  color: 'var(--text-on-accent)',
  padding: '13px 16px',
  fontFamily: 'var(--font-primary)',
  fontSize: 15.5,
  lineHeight: 1.4,
  fontWeight: 500,
}

/** A stacked group's bubbles read as one connected shape rather than N separate
 *  pills: the first bubble keeps the full rounded corners on top, the last keeps
 *  them on bottom, and any bubble in between (or the seam between two bubbles)
 *  gets a small "joint" radius instead of none — fully square would look like a
 *  seam had broken off from the group, not joined it. The group's avatar sits at
 *  the BOTTOM (both groups are bottom-aligned, `alignItems: 'flex-end'`), so the
 *  tight "this is the one speaking" corner belongs on the LAST bubble, nearest
 *  the avatar — not the first. `tightCorner` is that near-avatar/near-accent-edge
 *  corner (bottom-left for coach, bottom-right for user). */
function groupRadius(position: 'only' | 'first' | 'middle' | 'last', tightCorner: 'bottom-left' | 'bottom-right'): string {
  const FULL = 18
  const JOINT = 6
  const TIGHT = 4
  const top = position === 'only' || position === 'first' ? FULL : JOINT
  const bottom = position === 'only' || position === 'last' ? FULL : JOINT
  const isLast = position === 'only' || position === 'last'
  const bottomLeft = tightCorner === 'bottom-left' && isLast ? TIGHT : bottom
  const bottomRight = tightCorner === 'bottom-right' && isLast ? TIGHT : bottom
  return `${top}px ${top}px ${bottomRight}px ${bottomLeft}px`
}

function positionOf(index: number, length: number): 'only' | 'first' | 'middle' | 'last' {
  if (length === 1) return 'only'
  if (index === 0) return 'first'
  if (index === length - 1) return 'last'
  return 'middle'
}

/** A run of consecutive coach messages sharing a single avatar, stacked
 *  vertically beside it — the avatar only repeats when the sender actually
 *  changes, matching standard chat-app grouping (see ChatQuestions.tsx, which
 *  flattens the transcript into sender-grouped runs before rendering). */
export function CoachGroup({ messages }: { messages: ReactNode[] }) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 10,
        alignItems: 'flex-end',
        marginBottom: 14,
        maxWidth: '88%',
        animation: 'ceoMsgIn 320ms ease',
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          background: 'var(--accent-dim)',
          border: '1px solid var(--accent)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <SparkleIcon size={16} color="var(--accent)" />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ ...COACH_BUBBLE_STYLE, borderRadius: groupRadius(positionOf(i, messages.length), 'bottom-left') }}>
            {m}
          </div>
        ))}
      </div>
    </div>
  )
}

/** A run of consecutive user messages, stacked vertically — user messages never
 *  had an avatar, so grouping here is purely about tightening the vertical gap
 *  between them relative to the gap before/after a different sender's group. */
export function UserGroup({ messages }: { messages: ReactNode[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end', marginBottom: 14, animation: 'ceoMsgIn 260ms ease' }}>
      {messages.map((m, i) => (
        <div key={i} style={{ ...USER_BUBBLE_STYLE, borderRadius: groupRadius(positionOf(i, messages.length), 'bottom-right') }}>
          {m}
        </div>
      ))}
    </div>
  )
}

export function SayContent({ t }: { t: ChatTurnSay }) {
  return <>{t.text}</>
}

export function TypingDots() {
  return (
    <div style={{ display: 'flex', gap: 5, padding: '4px 2px' }}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            background: 'var(--text-muted)',
            animation: `ceoTyping 1s ${i * 0.15}s infinite ease-in-out`,
          }}
        />
      ))}
    </div>
  )
}

/* Keyframes shared by CoachRow/UserRow (message entrance) and TypingDots. */
export const CHAT_BUBBLE_KEYFRAMES = `@keyframes ceoTyping{0%,60%,100%{opacity:0.3;transform:translateY(0)}30%{opacity:1;transform:translateY(-3px)}}@keyframes ceoMsgIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}`
