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

/** Ephemeral, per-session events layered on top of a fixed question's turn index,
 *  in strict chronological order — not part of the persisted Conversation/
 *  Department domain model, and never saved to conversationsStore (deliberate
 *  scope cut, same as the original follow-up feature). This is the ONLY record of
 *  what happened on a turn and in what order — rendering must map this array
 *  directly with no separate "answer slot" rendered before/after it, otherwise an
 *  answer given after an earlier follow-up/side-question visually jumps out of
 *  chronological order (see the bug this replaced). Three kinds:
 *  - coach_followup: the model chose to probe the user's answer further. Purely a
 *    remark shown to the user — whatever they type next is classified fresh against
 *    the ORIGINAL fixed question (see ChatQuestions.send()), so this has no separate
 *    "answer" of its own to track.
 *  - user_question: the user asked the coach something instead of answering, and
 *    got an in-persona answer, before the fixed question was actually answered.
 *  - final_answer: the message that was actually recorded as the fixed question's
 *    answer (answers[i]), plus its acknowledgement — appended at the moment it
 *    happens, so it takes its real place in the timeline instead of always
 *    rendering first. acknowledgement may be empty (the model left it blank). */
export interface CoachFollowUp {
  kind: 'coach_followup'
  question: string
}

export interface UserQuestion {
  kind: 'user_question'
  question: string
  answer: string
}

export interface FinalAnswer {
  kind: 'final_answer'
  answer: string
  acknowledgement: string
}

export type Exchange = CoachFollowUp | UserQuestion | FinalAnswer

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
