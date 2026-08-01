/* Ported from ceoos-flow.jsx's DepartmentFlow — the guided-conversation step
   machine: intro -> q -> action -> reminder -> scheduled -> did -> mood ->
   recommend/tada/done.

   This is a pure, controlled component: it receives `dept`/`moods`/`entry`/
   counts/conversations as props and calls `onBack`/`onComplete`/
   `onOpenActive`/`onAddAction` callbacks. It does NOT call usePlans() /
   useDepartments() / useConversations() itself — a routing wrapper (built in
   a later task) connects it to the real stores, matching source's own
   architecture (ceoos-app.jsx's root component wires the flow to state, the
   flow component itself doesn't know about global app state).

   Source's `sections`/`conversational` branch (ChatQuestions/buildTurns) does
   not apply here — see ChatQuestions.tsx's header comment: this data model's
   Department only ever has a flat `questions` array. */
import { useState } from 'react'
import { AppBackdrop } from '@/features/chrome'
import type { GlowKey } from '@/features/chrome'
import { StatusBar } from '@/features/chrome'
import type { DepartmentRuntime, DeptId, Plan } from '@/departments/types'
import type { Conversation } from '@/departments/types'

import { IntroStep } from './IntroStep'
import { ChatQuestions } from './ChatQuestions'
import type { ChatAnswer } from './ChatQuestions'
import { ActionStep } from './ActionStep'
import { CustomActionSheet } from './CustomActionSheet'
import { ReminderStep, F_DAYS, F_TIMES } from './ReminderStep'
import { DatePickerSheet, fmtDate } from './DatePickerSheet'
import { ScheduledStep } from './ScheduledStep'
import { DidStep } from './DidStep'
import { CompletedStep } from './CompletedStep'
import { TadaStep } from './TadaStep'
import { MoodSlider } from './MoodSlider'
import { RecommendStep } from './RecommendStep'
import { DoneStep } from './DoneStep'
import { FlowHeader } from './FlowHeader'
import { Button } from '@/design-system'

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
}

export interface DepartmentFlowProps {
  dept: DepartmentRuntime
  moods: readonly string[]
  onBack: () => void
  onComplete: (deptId: DeptId, level: 0 | 1 | 2 | 3, plan: Plan) => void
  entry?: FlowEntry | null
  doneCount?: number
  planCount?: number
  conversations?: Conversation[]
  onOpenActive?: (() => void) | null
  onAddAction?: ((deptId: DeptId) => void) | null
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
  onOpenActive = null,
  onAddAction = null,
}: DepartmentFlowProps) {
  const [step, setStep] = useState<FlowStep>(entry?.done ? 'completed' : entry?.step || 'intro')
  const [chat, setChat] = useState<Record<number, ChatAnswer>>({})
  const setChatAns = (i: number, v: ChatAnswer) => setChat((c) => ({ ...c, [i]: v }))
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

  const buildPlan = (): Plan => ({
    deptId: dept.id,
    action: action ?? '',
    dayLabel,
    timeLabel: F_TIMES[time],
    done: true,
    mood: moods[mood],
  })

  let body: React.ReactNode = null

  if (step === 'intro') {
    body = (
      <IntroStep
        dept={dept}
        doneCount={doneCount}
        planCount={planCount}
        conversations={conversations}
        onOpenActive={onOpenActive}
        onBack={onBack}
        onNewChat={() => setStep('q')}
      />
    )
  } else if (step === 'q') {
    body = <ChatQuestions dept={dept} answers={chat} setAnswer={setChatAns} onBack={() => setStep('intro')} onDone={() => setStep('action')} />
  } else if (step === 'action') {
    body = (
      <ActionStep
        dept={dept}
        action={action}
        customActions={customActions}
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
          <MoodSlider value={mood} onChange={setMood} moods={moods} />
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
                onComplete(dept.id, 3, buildPlan())
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
        onSelectAction={setAction}
        onBack={() => setStep('mood')}
        onNext={() => setStep('reminder')}
      />
    )
  } else if (step === 'done') {
    body = <DoneStep dept={dept} moodLabel={moods[mood]} onFinish={() => onComplete(dept.id, 3, buildPlan())} />
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
