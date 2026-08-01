import { useNavigate } from 'react-router-dom'
import { MoodScreen } from '@/features/mood'

export function MoodRoute() {
  const navigate = useNavigate()
  return <MoodScreen onOpenDept={(id) => navigate(`/departments/${id}/flow`)} />
}
