import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { LoginScreen } from '@/features/login'
import { useIdentity } from '@/state/identityStore'

/* Precedence: identity already set -> skip straight past login/onboarding.
   Login itself has no persisted state (the prototype resets to login on
   reload for the demo click-through) — entering it just reveals onboarding. */
export function LoginRoute() {
  const { identity } = useIdentity()
  const [entered, setEntered] = useState(false)

  if (identity) return <Navigate to="/" replace />
  if (entered) return <Navigate to="/onboarding" replace />

  return <LoginScreen onEnter={() => setEntered(true)} />
}
