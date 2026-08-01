import { describe, expect, it, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import type { ReactNode } from 'react'
import { MyActionsScreen } from '@/features/actions'
import { PlansProvider } from '@/state/plansStore'
import { DepartmentsProvider } from '@/state/departmentsStore'

beforeEach(() => {
  localStorage.clear()
})

function wrapper({ children }: { children: ReactNode }) {
  return (
    <DepartmentsProvider>
      <PlansProvider>{children}</PlansProvider>
    </DepartmentsProvider>
  )
}

describe('MyActionsScreen', () => {
  it('renders without throwing and shows the My Actions title', () => {
    expect(() =>
      render(<MyActionsScreen onOpenDept={() => {}} onOpenReminder={() => {}} />, { wrapper }),
    ).not.toThrow()

    expect(screen.getByText('My Actions')).toBeTruthy()
  })

  it('adds a new action via AddActionSheet and shows it in the active list', () => {
    render(<MyActionsScreen onOpenDept={() => {}} onOpenReminder={() => {}} />, { wrapper })

    // The sheet's submit button ("Add action") is always mounted (hidden via pointer-events),
    // so both it and the header pill button share the accessible name "Add action" — the
    // header button renders first in DOM order, the sheet's submit button second.
    const [openButton, submitButton] = screen.getAllByRole('button', { name: 'Add action' })
    fireEvent.click(openButton)

    const textarea = screen.getByPlaceholderText("e.g. Book the conversation I've been avoiding")
    fireEvent.change(textarea, { target: { value: 'Write down the one skill I will practise' } })

    fireEvent.click(submitButton)

    // The sheet stays mounted (hidden, not unmounted) after close, and its <textarea>
    // still carries the typed value as a text node in jsdom — so scope the assertion to
    // the rendered ReminderCard title (a <div>), not the textarea, to avoid a duplicate match.
    const matches = screen.getAllByText('Write down the one skill I will practise')
    expect(matches.some((el) => el.tagName === 'DIV')).toBe(true)
  })

  it('shows an error state when submitting an empty action', () => {
    render(<MyActionsScreen onOpenDept={() => {}} onOpenReminder={() => {}} />, { wrapper })

    const [openButton, submitButton] = screen.getAllByRole('button', { name: 'Add action' })
    fireEvent.click(openButton)
    fireEvent.click(submitButton)

    expect(screen.getByText('Name the action before you add it — one concrete step.')).toBeTruthy()
  })
})
