import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { DepartmentHomeScreen } from '@/features/departmentHome'
import { useDepartments } from '@/state/departmentsStore'
import type { DeptId } from '@/departments/types'

export function DepartmentHomeRoute() {
  const { deptId } = useParams<{ deptId: string }>()
  const navigate = useNavigate()
  const { departments } = useDepartments()
  const dept = departments.find((d) => d.id === (deptId as DeptId))

  if (!dept) return <Navigate to="/departments" replace />

  return (
    <DepartmentHomeScreen
      dept={dept}
      onBack={() => navigate('/departments')}
      onStart={() => navigate(`/departments/${dept.id}/flow`)}
    />
  )
}
