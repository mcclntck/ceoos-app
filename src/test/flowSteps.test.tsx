import { describe, expect, it, vi } from 'vitest'
import { act, render, screen, fireEvent } from '@testing-library/react'
import { DepartmentFlow } from '@/features/flow/DepartmentFlow'
import { ChatQuestions, TYPING_DELAY_MS } from '@/features/flow/ChatQuestions'
import { DatePickerSheet } from '@/features/flow/DatePickerSheet'
import { CEOOS_DEPARTMENTS, CEOOS_MOODS } from '@/departments/departments.config'
import type { DepartmentRuntime } from '@/departments/types'

const sampleDept: DepartmentRuntime = { ...CEOOS_DEPARTMENTS.find((d) => d.id === 'career')!, level: 0 }

describe('DepartmentFlow', () => {
  it('renders the intro step without throwing and shows the department label', () => {
    expect(() =>
      render(
        <DepartmentFlow
          dept={sampleDept}
          moods={CEOOS_MOODS}
          onBack={() => {}}
          onComplete={() => {}}
        />,
      ),
    ).not.toThrow()

    expect(screen.getByText(sampleDept.label)).toBeTruthy()
    expect(screen.getByText('New chat')).toBeTruthy()
  })

  it('advances from intro to the chat questions step on New chat', () => {
    render(<DepartmentFlow dept={sampleDept} moods={CEOOS_MOODS} onBack={() => {}} onComplete={() => {}} />)
    fireEvent.click(screen.getByText('New chat'))
    // First turn is the coach's opening line; question text appears once typing settles.
    expect(screen.getByText('Coach')).toBeTruthy()
  })

  it('enters directly at the did step and shows the completed screen when entry.done is set', () => {
    render(
      <DepartmentFlow
        dept={sampleDept}
        moods={CEOOS_MOODS}
        onBack={() => {}}
        onComplete={() => {}}
        entry={{ done: true, action: 'Block 90 minutes of deep-focus time', dayLabel: 'Today', timeLabel: 'Morning · 8:00' }}
      />,
    )
    expect(screen.getByText('You followed through on this one.')).toBeTruthy()
    expect(screen.getByText('Block 90 minutes of deep-focus time')).toBeTruthy()
  })
})

describe('ChatQuestions', () => {
  it('shows a typing indicator then the first question, and accepts a typed answer via the composer', () => {
    vi.useFakeTimers()
    try {
      const answers: Record<number, { picks?: string[]; text?: string }> = {}
      const setAnswer = vi.fn((i: number, v: { picks?: string[]; text?: string }) => {
        answers[i] = v
      })

      render(<ChatQuestions dept={sampleDept} answers={answers} setAnswer={setAnswer} onBack={() => {}} onDone={() => {}} />)

      // Immediately after mount the coach is "typing" (TYPING_DELAY_MS timeout pending)
      // — the composer is not rendered yet, only a placeholder-height spacer.
      expect(screen.getByText('Coach')).toBeTruthy()
      expect(screen.queryByPlaceholderText('Answer in your own words…')).toBeNull()

      act(() => {
        vi.advanceTimersByTime(TYPING_DELAY_MS + 50)
      })

      // The composer textarea should now be present (typing indicator resolved).
      const textarea = screen.getByPlaceholderText('Answer in your own words…') as HTMLTextAreaElement
      fireEvent.change(textarea, { target: { value: '7 out of 10' } })

      const sendButton = screen.getByRole('button', { name: '' }) // send button has no aria-label
      fireEvent.click(sendButton)

      // Turn 0 is the coach's opening "say" line; turn 1 is the first "ask" question.
      expect(setAnswer).toHaveBeenCalledWith(1, { picks: [], text: '7 out of 10' })
    } finally {
      vi.useRealTimers()
    }
  })
})

describe('DatePickerSheet', () => {
  it('renders a calendar grid without throwing when open', () => {
    expect(() =>
      render(<DatePickerSheet open value={null} onClose={() => {}} onSelect={() => {}} />),
    ).not.toThrow()

    expect(screen.getByRole('dialog', { name: 'Choose a date' })).toBeTruthy()
    // Monday-first day-of-week headers.
    expect(screen.getAllByText('M').length).toBeGreaterThan(0)
  })
})
