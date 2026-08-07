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
  borderRadius: '4px 18px 18px 18px',
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
  borderRadius: '18px 4px 18px 18px',
  padding: '13px 16px',
  fontFamily: 'var(--font-primary)',
  fontSize: 15.5,
  lineHeight: 1.4,
  fontWeight: 500,
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 }}>
        {messages.map((m, i) => (
          <div key={i} style={COACH_BUBBLE_STYLE}>
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end', marginBottom: 14, animation: 'ceoMsgIn 260ms ease' }}>
      {messages.map((m, i) => (
        <div key={i} style={USER_BUBBLE_STYLE}>
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
