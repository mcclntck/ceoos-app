/* Ported from ceoos-flow.jsx's ChatQuestions/buildTurns/answerText.

   Source's `buildTurns` also supported a `conv` (conversational) branch that
   flattened `dept.sections` into section-intro + question turns. This data
   model's `Department` (see @/departments/types) only ever has a flat
   `questions: { q: string }[]` array — no `sections`, no `conversational`
   flag — so every department in CEOOS_DEPARTMENTS takes the non-conversational
   branch. That branch is the only one implemented here; the function keeps
   `buildTurns(dept)`'s shape/name close to source for clarity if a
   conversational data shape is ever reintroduced. */
import { useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '@/design-system'
import type { DepartmentRuntime } from '@/departments/types'
import { FlowHeader } from './FlowHeader'
import { CoachRow, UserRow, SayContent, TypingDots, CHAT_BUBBLE_KEYFRAMES } from './ChatBubbles'
import type { ChatTurn } from './ChatBubbles'
import { ChatInput } from './ChatInput'
import type { ChatDraft } from './ChatInput'

/** The prototype's hardcoded "coach is typing" pause before the next question appears. */
export const TYPING_DELAY_MS = 650

export function buildTurns(dept: DepartmentRuntime): ChatTurn[] {
  const turns: ChatTurn[] = [
    { type: 'say', text: `Let's look at your ${dept.label.toLowerCase()}. Answer honestly — this only works when you're candid. One question at a time.` },
  ]
  dept.questions.forEach((q) => turns.push({ type: 'ask', q: q.q }))
  return turns
}

export interface ChatAnswer {
  picks?: string[]
  text?: string
}

export function answerText(a: ChatAnswer | undefined | null): string {
  if (a == null) return ''
  const parts = [...(a.picks || [])]
  if (a.text && a.text.trim()) parts.push(a.text.trim())
  return parts.join(' · ')
}

export interface ChatQuestionsProps {
  dept: DepartmentRuntime
  answers: Record<number, ChatAnswer>
  setAnswer: (index: number, value: ChatAnswer) => void
  onBack: () => void
  onDone: () => void
}

export function ChatQuestions({ dept, answers, setAnswer, onBack, onDone }: ChatQuestionsProps) {
  const turns = useMemo(() => buildTurns(dept), [dept])

  const answered = (i: number): boolean => {
    const t = turns[i]
    if (t.type !== 'ask') return true
    const a = answers[i]
    return !!(a && ((a.picks && a.picks.length) || (a.text && a.text.trim())))
  }

  const visible: number[] = []
  let activeIdx: number | null = null
  for (let i = 0; i < turns.length; i++) {
    visible.push(i)
    if (turns[i].type === 'ask' && !answered(i)) {
      activeIdx = i
      break
    }
  }
  const allDone = activeIdx === null
  const active = activeIdx != null ? turns[activeIdx] : null

  const [typing, setTyping] = useState(true)
  const [draft, setDraft] = useState<ChatDraft>({ picks: [], text: '' })
  const scRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    setTyping(true)
    const t = setTimeout(() => setTyping(false), TYPING_DELAY_MS)
    return () => clearTimeout(t)
  }, [activeIdx])

  useEffect(() => {
    setDraft({ picks: [], text: '' })
  }, [activeIdx])

  useEffect(() => {
    const el = scRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [activeIdx, typing, answers])

  const canSend = draft.picks.length > 0 || draft.text.trim().length > 0
  const send = () => {
    if (!canSend || activeIdx == null) return
    // TODO(llm-ack): a parallel task will insert an async acknowledgement call
    // here before advancing to the next question — this is the exact seam:
    // the user's answer is recorded first, then `activeIdx` advances (via the
    // `visible`/`answered` scan above re-running on the next render) to reveal
    // the next fixed question. A later task should await an acknowledgement
    // response and insert it as an extra CoachRow between this answer and the
    // next question's reveal, reusing the `typing`/TypingDots state above for
    // pacing instead of the hardcoded TYPING_DELAY_MS.
    setAnswer(activeIdx, { picks: draft.picks, text: draft.text.trim() })
  }

  return (
    <>
      <FlowHeader
        dept={dept}
        onBack={onBack}
        right={
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontFamily: 'var(--font-primary)',
              fontSize: 12.5,
              color: 'var(--text-muted)',
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)' }} />
            Coach
          </span>
        }
      />
      <div
        ref={scRef}
        style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '18px 20px 8px', WebkitOverflowScrolling: 'touch' }}
      >
        {visible.map((i) => {
          const t = turns[i]
          if (i === activeIdx && typing) return null
          return (
            <div key={i}>
              <CoachRow>{t.type === 'say' ? <SayContent t={t} /> : t.q}</CoachRow>
              {t.type === 'ask' && answered(i) && <UserRow>{answerText(answers[i])}</UserRow>}
            </div>
          )
        })}
        {typing && active && (
          <CoachRow>
            <TypingDots />
          </CoachRow>
        )}
      </div>
      <div style={{ padding: '12px 16px 34px', borderTop: '1px solid var(--border-subtle)', background: 'rgba(0,0,0,0.35)' }}>
        {allDone ? (
          <Button variant="primary" size="lg" fullWidth onClick={onDone}>
            Pick my action
          </Button>
        ) : typing ? (
          <div style={{ height: 52 }} />
        ) : (
          <ChatInput
            draft={draft}
            setDraft={setDraft}
            canSend={canSend}
            send={send}
            onSuggest={onDone}
            suggestLabel={`Suggest actions to improve ${dept.label}`}
          />
        )}
      </div>
      <style>{CHAT_BUBBLE_KEYFRAMES}</style>
    </>
  )
}
