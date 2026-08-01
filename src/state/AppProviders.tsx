import type { ReactNode } from 'react'
import { IdentityProvider } from './identityStore'
import { DepartmentsProvider } from './departmentsStore'
import { PlansProvider } from './plansStore'
import { ConversationsProvider } from './conversationsStore'
import { MoodProvider } from './moodStore'
import { UiProvider } from './uiStore'

/* Independent providers, not one root reducer — see plan §State & persistence.
   Unrelated updates (e.g. a mood log) must never cascade re-renders into the
   orbit tree, which depends on DepartmentsProvider alone. */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <IdentityProvider>
      <DepartmentsProvider>
        <PlansProvider>
          <ConversationsProvider>
            <MoodProvider>
              <UiProvider>{children}</UiProvider>
            </MoodProvider>
          </ConversationsProvider>
        </PlansProvider>
      </DepartmentsProvider>
    </IdentityProvider>
  )
}
