import { useNavigate } from 'react-router-dom'
import { MyActionsScreen } from '@/features/actions'
import { usePlans } from '@/state/plansStore'

export function ActionsRoute() {
  const navigate = useNavigate()
  const { plans } = usePlans()

  return (
    <MyActionsScreen
      onOpenDept={(id) => navigate(`/departments/${id}`)}
      onOpenReminder={(planIndex) => {
        const plan = plans[planIndex]
        if (!plan) return
        navigate(`/departments/${plan.deptId}/flow`, { state: { planIndex } })
      }}
    />
  )
}
