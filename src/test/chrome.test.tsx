import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AppBackdrop, Avatar, BackButton, TabBarDock } from '@/features/chrome'

describe('chrome shell', () => {
  it('renders AppBackdrop without throwing', () => {
    expect(() => render(<AppBackdrop glow="dept" vignette />)).not.toThrow()
  })

  it('renders Avatar without throwing', () => {
    expect(() => render(<Avatar initials="JM" />)).not.toThrow()
  })

  it('renders BackButton without throwing', () => {
    expect(() => render(<BackButton onClick={() => {}} />)).not.toThrow()
  })

  it('renders TabBarDock without throwing and shows 3 tab buttons', () => {
    expect(() =>
      render(<TabBarDock active="departments" onChange={vi.fn()} />),
    ).not.toThrow()

    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(3)
  })
})
