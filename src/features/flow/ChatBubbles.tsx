/* Ported verbatim from ceoos-flow.jsx: CoachRow, UserRow, SayContent, TypingDots
   — the chat-message bubble primitives used by ChatQuestions. */
import type { ReactNode } from 'react'
import { SparkleIcon } from '@/design-system'

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

/** Ephemeral, per-session follow-up question layered on top of a fixed question's
 *  turn index — not part of the persisted Conversation/Department domain model,
 *  and never saved to conversationsStore (see plan's "follow-ups are not persisted"). */
export interface FollowUp {
  question: string
  answer?: string
  skipped?: boolean
}

export function CoachRow({ children }: { children: ReactNode }) {
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
      <div
        style={{
          background: 'var(--surface-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '4px 18px 18px 18px',
          padding: '13px 16px',
          fontFamily: 'var(--font-primary)',
          fontSize: 15.5,
          lineHeight: 1.45,
          color: 'var(--text-primary)',
        }}
      >
        {children}
      </div>
    </div>
  )
}

export function UserRow({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 14, animation: 'ceoMsgIn 260ms ease' }}>
      <div
        style={{
          maxWidth: '82%',
          background: 'var(--accent)',
          color: 'var(--text-on-accent)',
          borderRadius: '18px 4px 18px 18px',
          padding: '13px 16px',
          fontFamily: 'var(--font-primary)',
          fontSize: 15.5,
          lineHeight: 1.4,
          fontWeight: 500,
        }}
      >
        {children}
      </div>
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
