/* Connects the pure, controlled DepartmentFlow component to the real stores —
   mirrors ceoos-app.jsx's App.completeDept: raises the department's level
   (ratchet-up only, via raiseLevel), prepends a conversation record, and
   upserts the plan that opened the flow (or prepends a new one if it wasn't
   opened from an existing reminder). */
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'
import { DepartmentFlow } from '@/features/flow'
import { useDepartments } from '@/state/departmentsStore'
import { usePlans } from '@/state/plansStore'
import { useConversations } from '@/state/conversationsStore'
import { CEOOS_MOODS } from '@/departments/departments.config'
import type { ChatAnswer, DeptId, Plan } from '@/departments/types'
import type { Exchange } from '@/features/flow/ChatBubbles'
import { trackEvent } from '@/lib/analytics'

interface FlowLocationState {
  planIndex?: number
  conversationId?: string
}

export function DepartmentFlowRoute() {
  const { deptId } = useParams<{ deptId: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { departments, raiseLevel } = useDepartments()
  const { plans, upsertAt, addPlan } = usePlans()
  const { conversationsByDept, upsertConversation } = useConversations()

  const dept = departments.find((d) => d.id === (deptId as DeptId))
  const locationState = location.state as FlowLocationState | null
  const planIndex = locationState?.planIndex ?? null
  const plan = planIndex != null ? plans[planIndex] : undefined
  const resumeConversationId = locationState?.conversationId ?? null
  const resumeConversation = resumeConversationId
    ? (conversationsByDept[deptId as DeptId] ?? []).find((c) => c.id === resumeConversationId)
    : undefined

  if (!dept) return <Navigate to="/departments" replace />

  const conversations = conversationsByDept[dept.id] ?? []
  const doneCount = plans.filter((p) => p.deptId === dept.id && p.done).length
  const planCount = plans.filter((p) => p.deptId === dept.id).length
  const activePlans = plans
    .map((plan, index) => ({ plan, index }))
    .filter(({ plan }) => plan.deptId === dept.id && !plan.done)

  const entry = resumeConversation
    ? {
        step: 'q' as const,
        conversationId: resumeConversation.id,
        answers: resumeConversation.answers ?? {},
        exchanges: resumeConversation.exchanges ?? {},
      }
    : plan
      ? { step: 'did' as const, done: plan.done, action: plan.action, dayLabel: plan.dayLabel, timeLabel: plan.timeLabel, planIndex: planIndex! }
      : null

  /* Forces a fresh DepartmentFlow instance whenever what's being resumed changes —
     otherwise a same-path navigation (e.g. tapping a different in-progress chat, or
     a different reminder, while already on this route) would just update props on
     the SAME mounted instance, and DepartmentFlow's useState(entry?.step ?? 'intro')
     initializer would never re-run to pick up the new entry. */
  const flowKey = `${dept.id}:${resumeConversationId ?? ''}:${planIndex ?? ''}`

  return (
    <DepartmentFlow
      key={flowKey}
      dept={dept}
      moods={CEOOS_MOODS}
      entry={entry}
      conversations={conversations}
      doneCount={doneCount}
      planCount={planCount}
      activePlans={activePlans}
      onBack={() => navigate('/departments')}
      onOpenPlan={(idx) => navigate(`/departments/${dept.id}/flow`, { state: { planIndex: idx } })}
      onOpenConversation={(conversationId) => {
        trackEvent('chat_started', { deptId: dept.id, resumed: true })
        navigate(`/departments/${dept.id}/flow`, { state: { conversationId } })
      }}
      onAddAction={() => navigate('/actions')}
      onSaveDraft={(draftDeptId, conversationId, answers: Record<number, ChatAnswer>, exchanges: Record<number, Exchange[]>) => {
        const answeredCount = Object.values(answers).filter(
          (a) => (a.picks && a.picks.length) || (a.text && a.text.trim()),
        ).length
        upsertConversation(draftDeptId, {
          id: conversationId,
          date: 'In progress',
          title: 'Reflection',
          summary: `${answeredCount} of ${dept.questions.length} questions answered.`,
          action: '',
          mood: null,
          status: 'in-progress',
          answers,
          exchanges,
        })
      }}
      onSavePlan={(_saveDeptId, plan, existingIndex) => {
        if (existingIndex != null) upsertAt(existingIndex, plan)
        else addPlan(plan)
      }}
      onComplete={(completedDeptId, level, completedPlan: Plan, conversationId: string, completedPlanIndex: number | null) => {
        trackEvent('chat_completed', { deptId: completedDeptId })
        raiseLevel(completedDeptId, level)
        upsertConversation(completedDeptId, {
          id: conversationId,
          date: 'Just now',
          title: 'Reflection',
          summary: 'You reflected, committed to an action and logged how you feel.',
          action: completedPlan.action,
          mood: completedPlan.mood,
          status: 'done',
        })
        if (completedPlanIndex != null) {
          upsertAt(completedPlanIndex, completedPlan)
        } else {
          addPlan(completedPlan)
        }
        navigate('/departments')
      }}
    />
  )
}
