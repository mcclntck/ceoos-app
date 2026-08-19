import { Navigate, useNavigate } from 'react-router-dom'
import { OnboardingFlow } from '@/features/onboarding'
import { useIdentity } from '@/state/identityStore'
import { trackEvent } from '@/lib/analytics'

export function OnboardingRoute() {
  const { identity, setName } = useIdentity()
  const navigate = useNavigate()

  if (identity) return <Navigate to="/" replace />

  return (
    <OnboardingFlow
      onDone={(name) => {
        trackEvent('onboarding_completed')
        setName(name)
        navigate('/', { replace: true })
      }}
    />
  )
}
