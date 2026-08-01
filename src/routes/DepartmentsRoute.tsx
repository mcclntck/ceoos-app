import { useNavigate } from 'react-router-dom'
import { OrbitStage } from '@/features/orbit'

export function DepartmentsRoute() {
  const navigate = useNavigate()
  return <OrbitStage onOpenDepartment={(id) => navigate(`/departments/${id}/flow`)} />
}
