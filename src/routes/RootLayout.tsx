import { Navigate, Outlet } from 'react-router-dom'
import { useIdentity } from '@/state/identityStore'

/* Onboarding-completion gate: no identity yet -> force /onboarding.
   Login is a separate, earlier gate (see App.tsx). */
export function RootLayout() {
  const { identity } = useIdentity()
  if (!identity) return <Navigate to="/onboarding" replace />
  return <Outlet />
}
