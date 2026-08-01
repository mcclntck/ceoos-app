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
import type { DeptId, Plan } from '@/departments/types'

interface FlowLocationState {
  planIndex?: number
}

export function DepartmentFlowRoute() {
  const { deptId } = useParams<{ deptId: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { departments, raiseLevel } = useDepartments()
  const { plans, upsertAt, addPlan } = usePlans()
  const { conversationsByDept, addConversation } = useConversations()

  const dept = departments.find((d) => d.id === (deptId as DeptId))
  const planIndex = (location.state as FlowLocationState | null)?.planIndex ?? null
  const plan = planIndex != null ? plans[planIndex] : undefined

  if (!dept) return <Navigate to="/departments" replace />

  const conversations = conversationsByDept[dept.id] ?? []
  const doneCount = plans.filter((p) => p.deptId === dept.id && p.done).length
  const planCount = plans.filter((p) => p.deptId === dept.id).length

  const entry = plan
    ? { step: 'did' as const, done: plan.done, action: plan.action, dayLabel: plan.dayLabel, timeLabel: plan.timeLabel }
    : null

  return (
    <DepartmentFlow
      dept={dept}
      moods={CEOOS_MOODS}
      entry={entry}
      conversations={conversations}
      doneCount={doneCount}
      planCount={planCount}
      onBack={() => navigate('/departments')}
      onOpenActive={() => {
        const idx = plans.findIndex((p) => p.deptId === dept.id && !p.done)
        if (idx >= 0) navigate(`/departments/${dept.id}/flow`, { state: { planIndex: idx } })
      }}
      onAddAction={() => navigate('/actions')}
      onComplete={(completedDeptId, level, completedPlan: Plan) => {
        raiseLevel(completedDeptId, level)
        addConversation(completedDeptId, {
          id: `c-${completedDeptId}-${Date.now()}`,
          date: 'Just now',
          title: 'Reflection',
          summary: 'You reflected, committed to an action and logged how you feel.',
          action: completedPlan.action,
          mood: completedPlan.mood,
        })
        if (planIndex != null) {
          upsertAt(planIndex, completedPlan)
        } else {
          addPlan(completedPlan)
        }
        navigate('/departments')
      }}
    />
  )
}
