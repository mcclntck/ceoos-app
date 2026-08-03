/* Ported from ceoos-flow.jsx's DepartmentFlow — the guided-conversation step
   machine: intro -> q -> action -> reminder -> scheduled -> did -> mood ->
   recommend/tada/done.

   This is a pure, controlled component: it receives `dept`/`moods`/`entry`/
   counts/conversations as props and calls `onBack`/`onComplete`/
   `onOpenPlan`/`onAddAction` callbacks. It does NOT call usePlans() /
   useDepartments() / useConversations() itself — a routing wrapper (built in
   a later task) connects it to the real stores, matching source's own
   architecture (ceoos-app.jsx's root component wires the flow to state, the
   flow component itself doesn't know about global app state).

   Source's `sections`/`conversational` branch (ChatQuestions/buildTurns) does
   not apply here — see ChatQuestions.tsx's header comment: this data model's
   Department only ever has a flat `questions` array. */
import { useEffect, useRef, useState } from 'react'
import { AppBackdrop } from '@/features/chrome'
import type { GlowKey } from '@/features/chrome'
import { StatusBar } from '@/features/chrome'
import type { DepartmentRuntime, DeptId, Plan, ChatAnswer } from '@/departments/types'
import type { Conversation } from '@/departments/types'

import { IntroStep } from './IntroStep'
import { ChatQuestions } from './ChatQuestions'
import { ActionStep } from './ActionStep'
import { CustomActionSheet } from './CustomActionSheet'
import { ReminderStep, F_DAYS, F_TIMES } from './ReminderStep'
import { DatePickerSheet, fmtDate } from './DatePickerSheet'
import { ScheduledStep } from './ScheduledStep'
import { DidStep } from './DidStep'
import { CompletedStep } from './CompletedStep'
import { TadaStep } from './TadaStep'
import { MoodSlider } from '@/features/mood'
import { RecommendStep } from './RecommendStep'
import { DoneStep } from './DoneStep'
import { FlowHeader } from './FlowHeader'
import { Button } from '@/design-system'
import { fetchSuggestedActions } from './llmCoach'
import { answerText } from './ChatQuestions'
import type { Exchange } from './ChatBubbles'

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

export type FlowStep = 'intro' | 'q' | 'action' | 'reminder' | 'scheduled' | 'did' | 'completed' | 'mood' | 'recommend' | 'tada' | 'done'

export interface FlowEntry {
  step?: FlowStep
  done?: boolean
  action?: string | null
  dayLabel?: string
  timeLabel?: string
  /** Resuming an in-progress draft chat: the conversation id to keep updating
   *  (rather than starting a new one) and its previously-saved answers. */
  conversationId?: string
  answers?: Record<number, ChatAnswer>
  /** Resuming an existing plan (e.g. from the Active actions list) — the array
   *  index to keep updating rather than creating a second, duplicate plan. */
  planIndex?: number
}

export interface DepartmentFlowProps {
  dept: DepartmentRuntime
  moods: readonly string[]
  onBack: () => void
  onComplete: (deptId: DeptId, level: 0 | 1 | 2 | 3, plan: Plan, conversationId: string, planIndex: number | null) => void
  entry?: FlowEntry | null
  doneCount?: number
  planCount?: number
  conversations?: Conversation[]
  activePlans?: { plan: Plan; index: number }[]
  onOpenPlan?: ((planIndex: number) => void) | null
  onOpenConversation?: ((conversationId: string) => void) | null
  onAddAction?: ((deptId: DeptId) => void) | null
  /** Called every time the in-progress chat's answers change, so a resumable
   *  draft is saved continuously rather than only once the whole flow finishes —
   *  correctness shouldn't depend on catching any particular "the user left" moment. */
  onSaveDraft?: ((deptId: DeptId, conversationId: string, answers: Record<number, ChatAnswer>) => void) | null
  /** Called once an action + schedule are confirmed (tapping "Add to calendar"),
   *  so it's saved as an active plan immediately rather than only once the whole
   *  flow finishes — same reasoning as onSaveDraft. `planIndex` is null the first
   *  time (the route should addPlan), and the already-known index on every
   *  subsequent call (the route should upsertAt instead of creating a duplicate). */
  onSavePlan?: ((deptId: DeptId, plan: Plan, planIndex: number | null) => void) | null
}

function glowForDept(glow: DepartmentRuntime['glow']): GlowKey {
  return glow === 'warm' ? 'warm' : glow === 'cool' ? 'cool' : glow === 'teal' ? 'teal' : 'dept'
}

export function DepartmentFlow({
  dept,
  moods,
  onBack,
  onComplete,
  entry = null,
  doneCount = 0,
  planCount = 0,
  conversations = [],
  activePlans = [],
  onOpenPlan = null,
  onOpenConversation = null,
  onAddAction = null,
  onSaveDraft = null,
  onSavePlan = null,
}: DepartmentFlowProps) {
  const [step, setStep] = useState<FlowStep>(entry?.done ? 'completed' : entry?.step || 'intro')
  const [chat, setChat] = useState<Record<number, ChatAnswer>>(entry?.answers ?? {})
  const setChatAns = (i: number, v: ChatAnswer) => setChat((c) => ({ ...c, [i]: v }))
  /* Ordered side-exchanges (coach follow-ups + user side-questions) per fixed
     question index — lifted up from ChatQuestions (rather than owned locally
     there) so the /actions transcript builder below can fold them in. Not
     persisted to conversationsStore (deliberate scope cut, same as answers'
     resumable-draft feature not covering this either — see ChatBubbles.tsx). */
  const [exchanges, setExchanges] = useState<Record<number, Exchange[]>>({})
  const appendExchange = (i: number, exchange: Exchange) => setExchanges((e) => ({ ...e, [i]: [...(e[i] ?? []), exchange] }))
  /* Stable id for this chat session — reused from a resumed draft (entry.conversationId)
     or generated the first time an answer is saved. Kept in a ref (not state) since it
     never needs to trigger a re-render on its own; onSaveDraft/onComplete just read it. */
  const conversationIdRef = useRef<string | null>(entry?.conversationId ?? null)
  /* onSaveDraft/dept are read via refs, not effect deps — DepartmentFlowRoute passes a new
     inline callback (and a freshly `.find()`-derived dept object) on every render, and
     onSaveDraft itself triggers a store update that re-renders the route, so including
     either directly in the deps array would loop forever. The effect should only re-run
     when `chat` (the actual answers) changes; it always calls the LATEST onSaveDraft/dept.id. */
  const onSaveDraftRef = useRef(onSaveDraft)
  onSaveDraftRef.current = onSaveDraft
  const deptIdRef = useRef(dept.id)
  deptIdRef.current = dept.id
  useEffect(() => {
    if (Object.keys(chat).length === 0) return
    if (!conversationIdRef.current) {
      conversationIdRef.current = `c-${deptIdRef.current}-${Date.now()}`
    }
    onSaveDraftRef.current?.(deptIdRef.current, conversationIdRef.current, chat)
  }, [chat])
  const [action, setAction] = useState<string | null>(entry?.action ?? null)
  const [lastAction, setLastAction] = useState<string | null>(null)
  const [customActions, setCustomActions] = useState<string[]>([])
  const [customOpen, setCustomOpen] = useState(false)
  const [day, setDay] = useState<number>(() => Math.max(0, F_DAYS.indexOf(entry?.dayLabel ?? '')))
  const [pickedDate, setPickedDate] = useState<Date | null>(null)
  const [dateOpen, setDateOpen] = useState(false)
  const dayLabel = pickedDate ? fmtDate(pickedDate) : F_DAYS[day]
  const [time, setTime] = useState<number>(() => Math.max(0, F_TIMES.indexOf(entry?.timeLabel ?? '')))
  const [mood, setMood] = useState(3)
  const [scheduledOnce, setScheduledOnce] = useState(false)
  const [inLoop, setInLoop] = useState(false)
  const didEntry = entry?.step === 'did'
  /* Index of the plan this flow session is building, once it's been saved at
     least once — seeded from a resumed plan (entry.planIndex) so re-saving or
     completing it updates that SAME row instead of creating a duplicate. Null
     means "not saved yet"; the route addPlan()s on the first save (always
     landing at index 0, since addPlan prepends) and upsertAt()s on every one
     after, mirroring the conversationId/onSaveDraft pattern above. */
  const planIndexRef = useRef<number | null>(entry?.planIndex ?? null)

  /* Session-wide LLM call budget — a client-only pilot app with no database or
     server-side session state, so this useRef counter (reset every new mount,
     i.e. every new chat session or resumed draft) is the pragmatic cap. Combines
     every call type (ack/follow-up decisions + the one action-generation call). */
  const llmCallCountRef = useRef(0)
  const LLM_CALL_CAP = 12
  const canMakeLlmCall = () => llmCallCountRef.current < LLM_CALL_CAP
  const recordLlmCall = () => {
    llmCallCountRef.current += 1
  }

  /* LLM-generated action suggestions, fetched once per session the first time
     the action step is reached, then reused for the RecommendStep retry loop
     (no second fetch). Falls back to the static dept.actions list on any
     failure/timeout/too-short result — see ActionStep/RecommendStep. */
  const [suggestedActions, setSuggestedActions] = useState<string[] | null>(null)
  const hasFetchedActionsRef = useRef(false)

  const buildPlan = (overrides: Partial<Plan> = {}): Plan => ({
    deptId: dept.id,
    action: action ?? '',
    dayLabel,
    timeLabel: F_TIMES[time],
    done: false,
    mood: null,
    ...overrides,
  })

  const onSavePlanRef = useRef(onSavePlan)
  onSavePlanRef.current = onSavePlan

  /* Fires once the user confirms an action + schedule ("Add to calendar"), so
     it's preserved as an active plan even if they leave before finishing the
     rest of the flow (did/tada/mood) — see onSavePlan's doc comment. */
  const savePlanActive = () => {
    onSavePlanRef.current?.(dept.id, buildPlan(), planIndexRef.current)
    if (planIndexRef.current == null) planIndexRef.current = 0
  }

  useEffect(() => {
    if (step !== 'action' || hasFetchedActionsRef.current) return
    hasFetchedActionsRef.current = true
    if (!canMakeLlmCall()) return
    recordLlmCall()

    // Turn 0 is buildTurns' fixed intro "say" line, so dept.questions[i] lives at
    // turn index i + 1 in `chat`/`exchanges` — see ChatQuestions.tsx's buildTurns.
    const transcript = dept.questions
      .map((q, i) => {
        const turnIdx = i + 1
        const parts = [answerText(chat[turnIdx])]
        for (const ex of exchanges[turnIdx] ?? []) {
          if (ex.kind === 'user_question') parts.push(`(user also asked: "${ex.question}" — coach answered: "${ex.answer}")`)
        }
        return { question: q.q, answer: parts.filter(Boolean).join(' ') }
      })
      .filter((t) => t.answer.trim().length > 0)
    if (transcript.length === 0) return

    const timeout = new Promise<string[]>((resolve) => setTimeout(() => resolve([]), 2500))
    void Promise.race([fetchSuggestedActions(dept.id, transcript), timeout]).then((actions) => {
      if (actions.length >= 2) setSuggestedActions(actions)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step])

  /* Completion always updates the SAME conversation/plan this session has been
     saving under (generating a conversation id now in the rare case no answer
     was ever saved), so finishing a chat never creates a duplicate entry
     alongside its own draft/active-plan row. */
  const finish = (level: 0 | 1 | 2 | 3) => {
    if (!conversationIdRef.current) {
      conversationIdRef.current = `c-${dept.id}-${Date.now()}`
    }
    onComplete(dept.id, level, buildPlan({ done: true, mood: moods[mood] }), conversationIdRef.current, planIndexRef.current)
  }

  let body: React.ReactNode = null

  if (step === 'intro') {
    body = (
      <IntroStep
        dept={dept}
        doneCount={doneCount}
        planCount={planCount}
        conversations={conversations}
        activePlans={activePlans}
        onOpenPlan={onOpenPlan}
        onOpenConversation={onOpenConversation}
        onBack={onBack}
        onNewChat={() => setStep('q')}
      />
    )
  } else if (step === 'q') {
    body = (
      <ChatQuestions
        dept={dept}
        answers={chat}
        setAnswer={setChatAns}
        exchanges={exchanges}
        appendExchange={appendExchange}
        onBack={() => setStep('intro')}
        onDone={() => setStep('action')}
        canMakeLlmCall={canMakeLlmCall}
        recordLlmCall={recordLlmCall}
      />
    )
  } else if (step === 'action') {
    body = (
      <ActionStep
        dept={dept}
        action={action}
        customActions={customActions}
        suggestedActions={suggestedActions}
        onSelectAction={setAction}
        onOpenCustom={() => setCustomOpen(true)}
        onBack={() => setStep('q')}
        onNext={() => setStep('reminder')}
      />
    )
  } else if (step === 'reminder') {
    body = (
      <ReminderStep
        dept={dept}
        action={action}
        day={day}
        pickedDate={pickedDate}
        time={time}
        onBack={() => setStep(inLoop ? 'recommend' : 'action')}
        onPickDay={(i) => {
          setPickedDate(null)
          setDay(i)
        }}
        onOpenDatePicker={() => setDateOpen(true)}
        onPickTime={setTime}
        onNext={() => {
          setScheduledOnce(true)
          savePlanActive()
          setStep('scheduled')
        }}
      />
    )
  } else if (step === 'scheduled') {
    body = (
      <ScheduledStep
        dept={dept}
        action={action}
        dayLabel={dayLabel}
        pickedDate={pickedDate}
        time={time}
        onBack={() => setStep('reminder')}
        onDone={() => setStep('did')}
      />
    )
  } else if (step === 'did') {
    body = (
      <DidStep
        dept={dept}
        action={action}
        dayLabel={dayLabel}
        onBack={() => (didEntry && !scheduledOnce ? onBack() : setStep('scheduled'))}
        onChat={() => setStep('q')}
        onDidIt={() => setStep('tada')}
        onNotYet={onBack}
      />
    )
  } else if (step === 'completed') {
    body = (
      <CompletedStep
        dept={dept}
        action={entry?.action ?? action}
        onBack={onBack}
        onStartNewChat={() => setStep('q')}
        onAddAnotherAction={() => (onAddAction ? onAddAction(dept.id) : onBack())}
      />
    )
  } else if (step === 'tada') {
    body = <TadaStep dept={dept} onNext={() => setStep('mood')} />
  } else if (step === 'mood') {
    body = (
      <>
        <FlowHeader dept={dept} onBack={() => setStep('tada')} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 24px' }}>
          <div style={{ ...F_EYEBROW, marginBottom: 12, textAlign: 'center' }}>Log your mood</div>
          <h1 style={{ ...F_H1, textAlign: 'center', marginBottom: 40 }}>
            How do you feel
            <br />
            now you&rsquo;ve followed through?
          </h1>
          <MoodSlider value={mood} onChange={setMood} moods={moods} onCommit={() => {}} />
        </div>
        <div style={{ padding: '14px var(--ceoos-gutter) calc(22px + env(safe-area-inset-bottom))', flexShrink: 0 }}>
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={() => {
              if (mood <= 1) {
                setLastAction(action)
                setAction(null)
                setInLoop(true)
                setScheduledOnce(false)
                setStep('recommend')
              } else {
                finish(3)
              }
            }}
          >
            Log &amp; finish
          </Button>
        </div>
      </>
    )
  } else if (step === 'recommend') {
    body = (
      <RecommendStep
        dept={dept}
        lastAction={lastAction}
        action={action}
        mood={mood}
        moods={moods}
        suggestedActions={suggestedActions}
        onSelectAction={setAction}
        onBack={() => setStep('mood')}
        onNext={() => setStep('reminder')}
      />
    )
  } else if (step === 'done') {
    body = <DoneStep dept={dept} moodLabel={moods[mood]} onFinish={() => finish(3)} />
  }

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>
      <AppBackdrop glow={glowForDept(dept.glow)} />
      <StatusBar />
      {body}
      <CustomActionSheet
        open={customOpen}
        onClose={() => setCustomOpen(false)}
        onSave={(t) => {
          setCustomActions((c) => [...c, t])
          setAction(t)
        }}
      />
      <DatePickerSheet open={dateOpen} value={pickedDate} onClose={() => setDateOpen(false)} onSelect={setPickedDate} />
    </div>
  )
}
