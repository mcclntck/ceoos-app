import { Navigate, Outlet } from 'react-router-dom'
import { useIdentity } from '@/state/identityStore'

/* Auth gate: no identity yet -> force /login, the correct entry point for a
   logged-out user (Login's own "Log In" button is what leads into onboarding). */
export function RootLayout() {
  const { identity } = useIdentity()
  if (!identity) return <Navigate to="/login" replace />
  return <Outlet />
}
