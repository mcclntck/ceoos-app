import { describe, expect, it, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { OnboardingFlow } from '@/features/onboarding/OnboardingFlow'

describe('OnboardingFlow', () => {
  it('renders without throwing and shows the first step eyebrow', () => {
    expect(() => render(<OnboardingFlow onDone={() => {}} />)).not.toThrow()
    expect(screen.getByText('Private by design')).toBeTruthy()
  })

  it('"Skip intro" jumps straight to the name step, skipping the middle steps', () => {
    render(<OnboardingFlow onDone={vi.fn()} />)
    expect(screen.queryByPlaceholderText('Your first name')).toBeNull()

    fireEvent.click(screen.getByText('Skip intro'))

    expect(screen.getByPlaceholderText('Your first name')).toBeTruthy()
    expect(screen.getByText('One last thing')).toBeTruthy()
    // Skip link is hidden on the name step itself.
    expect(screen.queryByText('Skip intro')).toBeNull()
  })

  it('disables Continue until a name is entered on the name step', () => {
    const onDone = vi.fn()
    render(<OnboardingFlow onDone={onDone} />)
    fireEvent.click(screen.getByText('Skip intro'))

    const cta = screen.getByText("Let's get started!").closest('button')!
    expect(cta.hasAttribute('disabled')).toBe(true)

    fireEvent.change(screen.getByPlaceholderText('Your first name'), { target: { value: 'Jack' } })
    expect(cta.hasAttribute('disabled')).toBe(false)

    fireEvent.click(cta)
    expect(onDone).toHaveBeenCalledWith('Jack')
  })
})
