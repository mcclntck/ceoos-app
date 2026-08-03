import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { act, render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ChatQuestions, TYPING_DELAY_MS } from '@/features/flow/ChatQuestions'
import { CEOOS_DEPARTMENTS } from '@/departments/departments.config'
import type { DepartmentRuntime } from '@/departments/types'

const sampleDept: DepartmentRuntime = { ...CEOOS_DEPARTMENTS.find((d) => d.id === 'career')!, level: 0 }

describe('ChatQuestions LLM acknowledgement', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        json: async () => ({ acknowledgement: 'That focus block sounds like a solid start.' }),
      })),
    )
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('calls /.netlify/functions/chat with the answered question and renders the acknowledgement as a coach bubble', async () => {
    vi.useFakeTimers()
    const answers: Record<number, { picks?: string[]; text?: string }> = {}
    const setAnswer = vi.fn((i: number, v: { picks?: string[]; text?: string }) => {
      answers[i] = v
    })

    const { rerender } = render(
      <ChatQuestions
        dept={sampleDept}
        answers={answers}
        setAnswer={setAnswer}
        onBack={() => {}}
        onDone={() => {}}
        canMakeLlmCall={() => true}
        recordLlmCall={() => {}}
      />,
    )

    act(() => {
      vi.advanceTimersByTime(TYPING_DELAY_MS + 50)
    })

    const textarea = screen.getByPlaceholderText('Answer in your own words…') as HTMLTextAreaElement
    fireEvent.change(textarea, { target: { value: '7 out of 10' } })
    const sendButton = screen.getByRole('button', { name: '' })
    fireEvent.click(sendButton)

    expect(setAnswer).toHaveBeenCalledWith(1, { picks: [], text: '7 out of 10' })

    // Re-render with the answer applied (mirrors the parent DepartmentFlow re-rendering
    // ChatQuestions with the updated `answers` prop after setAnswer's state update).
    rerender(
      <ChatQuestions
        dept={sampleDept}
        answers={answers}
        setAnswer={setAnswer}
        onBack={() => {}}
        onDone={() => {}}
        canMakeLlmCall={() => true}
        recordLlmCall={() => {}}
      />,
    )

    vi.useRealTimers()

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        '/.netlify/functions/chat',
        expect.objectContaining({ method: 'POST' }),
      )
    })

    const [, options] = (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0]
    const body = JSON.parse(options.body)
    expect(body.deptId).toBe('career')
    expect(body.userAnswer).toBe('7 out of 10')

    await waitFor(() => {
      expect(screen.getByText('That focus block sounds like a solid start.')).toBeTruthy()
    })
  })

  it('does not throw and simply omits the acknowledgement when the network call fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error('network down')
      }),
    )
    vi.useFakeTimers()
    const answers: Record<number, { picks?: string[]; text?: string }> = {}
    const setAnswer = vi.fn((i: number, v: { picks?: string[]; text?: string }) => {
      answers[i] = v
    })

    render(
      <ChatQuestions
        dept={sampleDept}
        answers={answers}
        setAnswer={setAnswer}
        onBack={() => {}}
        onDone={() => {}}
        canMakeLlmCall={() => true}
        recordLlmCall={() => {}}
      />,
    )
    act(() => {
      vi.advanceTimersByTime(TYPING_DELAY_MS + 50)
    })
    const textarea = screen.getByPlaceholderText('Answer in your own words…') as HTMLTextAreaElement
    fireEvent.change(textarea, { target: { value: 'fine' } })
    expect(() => fireEvent.click(screen.getByRole('button', { name: '' }))).not.toThrow()
    vi.useRealTimers()
  })

  it('does not fetch when the session LLM call cap has been reached', async () => {
    vi.useFakeTimers()
    const answers: Record<number, { picks?: string[]; text?: string }> = {}
    const setAnswer = vi.fn((i: number, v: { picks?: string[]; text?: string }) => {
      answers[i] = v
    })
    const recordLlmCall = vi.fn()

    render(
      <ChatQuestions
        dept={sampleDept}
        answers={answers}
        setAnswer={setAnswer}
        onBack={() => {}}
        onDone={() => {}}
        canMakeLlmCall={() => false}
        recordLlmCall={recordLlmCall}
      />,
    )
    act(() => {
      vi.advanceTimersByTime(TYPING_DELAY_MS + 50)
    })
    const textarea = screen.getByPlaceholderText('Answer in your own words…') as HTMLTextAreaElement
    fireEvent.change(textarea, { target: { value: 'capped' } })
    fireEvent.click(screen.getByRole('button', { name: '' }))
    vi.useRealTimers()

    expect(recordLlmCall).not.toHaveBeenCalled()
    expect(fetch).not.toHaveBeenCalled()
  })
})
