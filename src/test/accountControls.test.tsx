import { describe, expect, it, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import type { ReactNode } from 'react'
import { IdentityProvider } from '@/state/identityStore'
import { UiProvider } from '@/state/uiStore'
import { AccountControls } from '@/features/chrome/AccountControls'

beforeEach(() => {
  localStorage.clear()
})

function Providers({ children }: { children: ReactNode }) {
  return (
    <IdentityProvider>
      <UiProvider>{children}</UiProvider>
    </IdentityProvider>
  )
}

describe('AccountControls', () => {
  it('opens the avatar menu and reveals the Reset account menu item', () => {
    render(<AccountControls />, { wrapper: Providers })
    expect(screen.queryByRole('menuitem')).toBeNull()
    fireEvent.click(screen.getByLabelText('Account menu'))
    expect(screen.getByRole('menuitem').textContent).toContain('Reset account')
  })

  it('opens the reset-confirm dialog from the menu', () => {
    render(<AccountControls />, { wrapper: Providers })
    fireEvent.click(screen.getByLabelText('Account menu'))
    fireEvent.click(screen.getByRole('menuitem'))
    expect(screen.getByText('Delete everything')).toBeTruthy()
  })
})
