/* Ported from ceoos-flow.jsx's ChatQuestions/buildTurns/answerText.

   Source's `buildTurns` also supported a `conv` (conversational) branch that
   flattened `dept.sections` into section-intro + question turns. This data
   model's `Department` (see @/departments/types) only ever has a flat
   `questions: { q: string }[]` array — no `sections`, no `conversational`
   flag — so every department in CEOOS_DEPARTMENTS takes the non-conversational
   branch. That branch is the only one implemented here; the function keeps
   `buildTurns(dept)`'s shape/name close to source for clarity if a
   conversational data shape is ever reintroduced. */
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Button } from '@/design-system'
import type { DepartmentRuntime, ChatAnswer } from '@/departments/types'
import { FlowHeader } from './FlowHeader'
import { CoachRow, UserRow, SayContent, TypingDots, CHAT_BUBBLE_KEYFRAMES } from './ChatBubbles'
import type { ChatTurn, FollowUp } from './ChatBubbles'
import { ChatInput } from './ChatInput'
import type { ChatDraft } from './ChatInput'
import { fetchCoachAcknowledgement } from './llmCoach'
import type { AcknowledgementTurn } from './llmCoach'
import { useKeyboardInset } from './useKeyboardInset'

/** The prototype's hardcoded "coach is typing" pause before the next question appears. */
export const TYPING_DELAY_MS = 650

export function buildTurns(dept: DepartmentRuntime): ChatTurn[] {
  const turns: ChatTurn[] = [
    { type: 'say', text: `Let's look at your ${dept.label.toLowerCase()}. Answer honestly — this only works when you're candid. One question at a time.` },
  ]
  dept.questions.forEach((q) => turns.push({ type: 'ask', q: q.q }))
  return turns
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
  /** Session-wide LLM call budget, owned by DepartmentFlow — see its
   *  llmCallCountRef. Every acknowledgement/follow-up fetch attempt must check
   *  canMakeLlmCall() before firing and call recordLlmCall() on attempt. */
  canMakeLlmCall: () => boolean
  recordLlmCall: () => void
}

export function ChatQuestions({ dept, answers, setAnswer, onBack, onDone, canMakeLlmCall, recordLlmCall }: ChatQuestionsProps) {
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
  /* LLM-generated acknowledgements, keyed by the turn index they follow.
     Populated after the real network call resolves — see send() below. */
  const [acknowledgements, setAcknowledgements] = useState<Record<number, string>>({})
  /* Ephemeral follow-up questions, keyed by the fixed turn index they follow —
     layered on top of the fixed 6-question backbone, never touching turns/
     activeIdx/answered(). Not persisted (see plan's accepted scope cut). */
  const [followUps, setFollowUps] = useState<Record<number, FollowUp>>({})

  /* First visible turn with a follow-up question still awaiting an answer/skip.
     When set, the composer targets the follow-up instead of the next fixed question. */
  let pendingFollowUpIdx: number | null = null
  for (const i of visible) {
    const f = followUps[i]
    if (f && f.question && f.answer === undefined && !f.skipped) {
      pendingFollowUpIdx = i
      break
    }
  }

  /* Keyboard-aware composer: the footer is pinned with `position: fixed` and
     offset by the on-screen keyboard's height (via VisualViewport) so it floats
     just above the keyboard instead of the whole layout reflowing/squeezing when
     the keyboard opens — standard chat-app behaviour. The scroll area's bottom
     padding mirrors the footer's own height so messages never sit underneath it. */
  const keyboardInset = useKeyboardInset()
  const footerRef = useRef<HTMLDivElement | null>(null)
  const [footerHeight, setFooterHeight] = useState(0)

  useLayoutEffect(() => {
    const el = footerRef.current
    if (!el) return
    setFooterHeight(el.offsetHeight)
    if (typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(() => setFooterHeight(el.offsetHeight))
    ro.observe(el)
    return () => ro.disconnect()
  }, [allDone, typing])

  useEffect(() => {
    setTyping(true)
    const t = setTimeout(() => setTyping(false), TYPING_DELAY_MS)
    return () => clearTimeout(t)
  }, [activeIdx])

  useEffect(() => {
    setDraft({ picks: [], text: '' })
  }, [activeIdx, pendingFollowUpIdx])

  useEffect(() => {
    const el = scRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [activeIdx, typing, answers, acknowledgements, followUps])

  /* Tapping the chat (not the composer itself) dismisses the keyboard, matching
     standard chat-app tap-to-dismiss behaviour. */
  const dismissKeyboard = () => {
    const active = document.activeElement
    if (active instanceof HTMLElement && (active.tagName === 'TEXTAREA' || active.tagName === 'INPUT')) {
      active.blur()
    }
  }

  const canSend = draft.picks.length > 0 || draft.text.trim().length > 0

  /* Answering a follow-up never triggers a network call — it's folded into
     priorTurns context for the NEXT fixed question's ack/follow-up call, but
     doesn't itself spawn another decision (runaway chains are structurally
     impossible). */
  const sendFollowUp = () => {
    if (!canSend || pendingFollowUpIdx == null) return
    const idx = pendingFollowUpIdx
    const answer = answerText({ picks: draft.picks, text: draft.text.trim() })
    setFollowUps((prev) => ({ ...prev, [idx]: { ...prev[idx], answer } }))
  }

  const skipFollowUp = () => {
    if (pendingFollowUpIdx == null) return
    const idx = pendingFollowUpIdx
    setFollowUps((prev) => ({ ...prev, [idx]: { ...prev[idx], skipped: true } }))
  }

  const send = () => {
    if (pendingFollowUpIdx != null) {
      sendFollowUp()
      return
    }
    if (!canSend || activeIdx == null) return
    const answeredIdx = activeIdx
    const question = turns[answeredIdx].type === 'ask' ? turns[answeredIdx].q : ''
    const userAnswer = answerText({ picks: draft.picks, text: draft.text.trim() })
    setAnswer(answeredIdx, { picks: draft.picks, text: draft.text.trim() })

    const priorTurns: AcknowledgementTurn[] = visible
      .filter((i) => i < answeredIdx)
      .flatMap((i): AcknowledgementTurn[] => {
        const t = turns[i]
        const say: AcknowledgementTurn[] = [{ role: 'assistant', content: t.type === 'say' ? t.text ?? '' : t.q }]
        if (t.type === 'ask' && answered(i)) {
          say.push({ role: 'user', content: answerText(answers[i]) })
          const ack = acknowledgements[i]
          if (ack) say.push({ role: 'assistant', content: ack })
          const f = followUps[i]
          if (f?.question) {
            say.push({ role: 'assistant', content: f.question })
            if (f.answer) say.push({ role: 'user', content: f.answer })
          }
        }
        return say
      })

    if (!canMakeLlmCall()) return
    recordLlmCall()
    void fetchCoachAcknowledgement(dept.id, question, userAnswer, priorTurns).then((res) => {
      if (!res) return
      setAcknowledgements((prev) => ({ ...prev, [answeredIdx]: res.acknowledgement }))
      if (res.followUpQuestion) {
        // Staleness guard: drop silently if the user has already moved past the
        // point this follow-up would attach to (the next fixed question is answered).
        const nextFixedIdx = turns.findIndex((t, i) => i > answeredIdx && t.type === 'ask')
        if (nextFixedIdx !== -1 && answered(nextFixedIdx)) return
        setFollowUps((prev) => ({ ...prev, [answeredIdx]: { question: res.followUpQuestion! } }))
      }
    })
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
        onPointerDown={dismissKeyboard}
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: `18px 20px ${footerHeight + 8}px`,
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {visible.map((i) => {
          const t = turns[i]
          if (i === activeIdx && typing) return null
          const followUp = followUps[i]
          return (
            <div key={i}>
              <CoachRow>{t.type === 'say' ? <SayContent t={t} /> : t.q}</CoachRow>
              {t.type === 'ask' && answered(i) && <UserRow>{answerText(answers[i])}</UserRow>}
              {t.type === 'ask' && answered(i) && acknowledgements[i] && <CoachRow>{acknowledgements[i]}</CoachRow>}
              {followUp?.question && (
                <>
                  <CoachRow>{followUp.question}</CoachRow>
                  {followUp.answer !== undefined && <UserRow>{followUp.answer}</UserRow>}
                  {followUp.skipped && <UserRow>Skipped</UserRow>}
                </>
              )}
            </div>
          )
        })}
        {typing && active && (
          <CoachRow>
            <TypingDots />
          </CoachRow>
        )}
      </div>
      <div
        ref={footerRef}
        style={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: keyboardInset,
          padding: '12px 16px calc(12px + env(safe-area-inset-bottom))',
          borderTop: '1px solid var(--border-subtle)',
          background: '#0a0a0a',
        }}
      >
        {pendingFollowUpIdx != null ? (
          <>
            <ChatInput draft={draft} setDraft={setDraft} canSend={canSend} send={send} onSuggest={onDone} suggestLabel={`Suggest actions to improve ${dept.label}`} />
            <button
              onClick={skipFollowUp}
              style={{
                marginTop: 8,
                width: '100%',
                textAlign: 'center',
                cursor: 'pointer',
                padding: '8px 12px',
                borderRadius: 999,
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                fontFamily: 'var(--font-primary)',
                fontSize: 13,
                fontWeight: 500,
              }}
            >
              Skip
            </button>
          </>
        ) : allDone ? (
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
