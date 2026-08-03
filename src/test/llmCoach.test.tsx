import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { act, render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ChatQuestions, TYPING_DELAY_MS } from '@/features/flow/ChatQuestions'
import { CEOOS_DEPARTMENTS } from '@/departments/departments.config'
import type { DepartmentRuntime } from '@/departments/types'
import type { Exchange } from '@/features/flow/ChatBubbles'

const sampleDept: DepartmentRuntime = { ...CEOOS_DEPARTMENTS.find((d) => d.id === 'career')!, level: 0 }

function renderChatQuestions(overrides: Partial<React.ComponentProps<typeof ChatQuestions>> = {}) {
  const answers: Record<number, { picks?: string[]; text?: string }> = {}
  const setAnswer = vi.fn((i: number, v: { picks?: string[]; text?: string }) => {
    answers[i] = v
  })
  const exchanges: Record<number, Exchange[]> = {}
  const appendExchange = vi.fn((i: number, exchange: Exchange) => {
    exchanges[i] = [...(exchanges[i] ?? []), exchange]
  })

  const utils = render(
    <ChatQuestions
      dept={sampleDept}
      answers={answers}
      setAnswer={setAnswer}
      exchanges={exchanges}
      appendExchange={appendExchange}
      onBack={() => {}}
      onDone={() => {}}
      canMakeLlmCall={() => true}
      recordLlmCall={() => {}}
      {...overrides}
    />,
  )
  return { ...utils, answers, setAnswer, exchanges, appendExchange }
}

describe('ChatQuestions LLM acknowledgement', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        json: async () => ({ kind: 'answer', acknowledgement: 'That focus block sounds like a solid start.' }),
      })),
    )
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('calls /.netlify/functions/chat with the answered question and renders the acknowledgement as a coach bubble', async () => {
    vi.useFakeTimers()
    const { setAnswer } = renderChatQuestions()

    act(() => {
      vi.advanceTimersByTime(TYPING_DELAY_MS + 50)
    })

    const textarea = screen.getByPlaceholderText('Answer in your own words…') as HTMLTextAreaElement
    fireEvent.change(textarea, { target: { value: '7 out of 10' } })
    const sendButton = screen.getByRole('button', { name: '' })
    fireEvent.click(sendButton)

    vi.useRealTimers()

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/.netlify/functions/chat', expect.objectContaining({ method: 'POST' }))
    })

    const [, options] = (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0]
    const body = JSON.parse(options.body)
    expect(body.deptId).toBe('career')
    expect(body.userMessage).toBe('7 out of 10')

    await waitFor(() => {
      expect(setAnswer).toHaveBeenCalledWith(1, { picks: [], text: '7 out of 10' })
    })

    await waitFor(() => {
      expect(screen.getByText('That focus block sounds like a solid start.')).toBeTruthy()
    })
  })

  it('does not throw, and falls open by taking the message as the answer, when the network call fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error('network down')
      }),
    )
    vi.useFakeTimers()
    const { setAnswer } = renderChatQuestions()
    act(() => {
      vi.advanceTimersByTime(TYPING_DELAY_MS + 50)
    })
    const textarea = screen.getByPlaceholderText('Answer in your own words…') as HTMLTextAreaElement
    fireEvent.change(textarea, { target: { value: 'fine' } })
    expect(() => fireEvent.click(screen.getByRole('button', { name: '' }))).not.toThrow()
    vi.useRealTimers()

    await waitFor(() => {
      expect(setAnswer).toHaveBeenCalledWith(1, { picks: [], text: 'fine' })
    })
  })

  it('does not fetch, and falls open by taking the message as the answer, when the session LLM call cap has been reached', async () => {
    vi.useFakeTimers()
    const recordLlmCall = vi.fn()
    const { setAnswer } = renderChatQuestions({ canMakeLlmCall: () => false, recordLlmCall })
    act(() => {
      vi.advanceTimersByTime(TYPING_DELAY_MS + 50)
    })
    const textarea = screen.getByPlaceholderText('Answer in your own words…') as HTMLTextAreaElement
    fireEvent.change(textarea, { target: { value: 'capped' } })
    fireEvent.click(screen.getByRole('button', { name: '' }))
    vi.useRealTimers()

    expect(recordLlmCall).not.toHaveBeenCalled()
    expect(fetch).not.toHaveBeenCalled()
    expect(setAnswer).toHaveBeenCalledWith(1, { picks: [], text: 'capped' })
  })

  it('answers a side-question in persona without advancing past the fixed question', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        json: async () => ({ kind: 'question', answerToUser: 'Great question — a score just means where you feel you are today.' }),
      })),
    )
    vi.useFakeTimers()
    const { setAnswer, appendExchange } = renderChatQuestions()
    act(() => {
      vi.advanceTimersByTime(TYPING_DELAY_MS + 50)
    })
    const textarea = screen.getByPlaceholderText('Answer in your own words…') as HTMLTextAreaElement
    fireEvent.change(textarea, { target: { value: 'what do you mean by score?' } })
    fireEvent.click(screen.getByRole('button', { name: '' }))
    vi.useRealTimers()

    await waitFor(() => {
      expect(appendExchange).toHaveBeenCalledWith(1, {
        kind: 'user_question',
        question: 'what do you mean by score?',
        answer: 'Great question — a score just means where you feel you are today.',
      })
    })
    expect(setAnswer).not.toHaveBeenCalled()

    await waitFor(() => {
      expect(screen.getByText('Great question — a score just means where you feel you are today.')).toBeTruthy()
    })
    // The fixed question is still visible/answerable — the composer is still up.
    expect(screen.getByPlaceholderText('Answer in your own words…')).toBeTruthy()

    // Bubble placement must not be swapped: the user's own question renders as a
    // right-aligned UserRow, and the coach's reply renders as a left-aligned
    // CoachRow (with the sparkle-icon avatar) — regression coverage for a bug
    // where these were flipped.
    const userQuestionBubbles = screen.getAllByText('what do you mean by score?')
    const userRow = userQuestionBubbles.map((el) => el.closest('div[style*="justify-content: flex-end"]')).find(Boolean)
    expect(userRow).toBeTruthy()

    const coachAnswerBubble = screen.getByText('Great question — a score just means where you feel you are today.')
    const coachRow = coachAnswerBubble.closest('div[style*="align-items: flex-end"]')
    expect(coachRow?.querySelector('svg')).toBeTruthy()
  })
})
