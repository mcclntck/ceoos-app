import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LoginScreen } from '@/features/login/LoginScreen'

describe('LoginScreen', () => {
  it('renders without throwing and shows the Log In button', () => {
    expect(() => render(<LoginScreen onEnter={() => {}} />)).not.toThrow()
    expect(screen.getByText('Log In')).toBeTruthy()
  })
})
