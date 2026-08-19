import { useNavigate } from 'react-router-dom'
import { OrbitStage } from '@/features/orbit'
import { trackEvent } from '@/lib/analytics'

export function DepartmentsRoute() {
  const navigate = useNavigate()
  return (
    <OrbitStage
      onOpenDepartment={(id) => {
        trackEvent('department_opened', { deptId: id })
        navigate(`/departments/${id}/flow`)
      }}
    />
  )
}
