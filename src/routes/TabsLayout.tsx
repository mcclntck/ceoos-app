import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { TabBarDock } from '@/features/chrome'
import type { TabKey } from '@/features/chrome'

const TAB_PATHS: Record<TabKey, string> = {
  departments: '/departments',
  plan: '/actions',
  mood: '/mood',
}

function activeTabFromPath(pathname: string): TabKey {
  if (pathname.startsWith('/actions')) return 'plan'
  if (pathname.startsWith('/mood')) return 'mood'
  return 'departments'
}

export function TabsLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const active = activeTabFromPath(location.pathname)

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Outlet />
      <TabBarDock active={active} onChange={(key) => navigate(TAB_PATHS[key])} />
    </div>
  )
}
