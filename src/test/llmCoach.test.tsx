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
    // The fixed question is still visible/answerable — the composer is still up,
    // and cleared (activeIdx never changed, so the composer must be cleared
    // eagerly in send() rather than relying on the activeIdx-keyed effect).
    const composer = screen.getByPlaceholderText('Answer in your own words…') as HTMLTextAreaElement
    expect(composer.value).toBe('')

    // Bubble placement must not be swapped: the user's own question renders in a
    // right-aligned UserGroup, and the coach's reply renders in a left-aligned
    // CoachGroup (with the sparkle-icon avatar) — regression coverage for a bug
    // where these were flipped.
    const userQuestionBubbles = screen.getAllByText('what do you mean by score?')
    const userRow = userQuestionBubbles.map((el) => el.closest('div[style*="align-items: flex-end"]')).find(Boolean)
    expect(userRow?.querySelector('svg')).toBeFalsy()

    const coachAnswerBubble = screen.getByText('Great question — a score just means where you feel you are today.')
    const coachRow = coachAnswerBubble.closest('div[style*="align-items: flex-end"]')
    expect(coachRow?.querySelector('svg')).toBeTruthy()
  })

  it('still surfaces a follow-up question when the model classifies "answer" but leaves the acknowledgement blank', async () => {
    // Regression: an "answer" classification with an empty acknowledgement used to
    // collapse the WHOLE response to null in llmCoach.ts (treated identically to a
    // network failure), which discarded any follow_up_question the model DID
    // provide — the coach's follow-up would silently vanish with no visible trace.
    // The classification itself ("answer") is still valid and must be honoured.
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        json: async () => ({ kind: 'answer', acknowledgement: '', followUpQuestion: 'What made you land on that number?' }),
      })),
    )
    vi.useFakeTimers()
    const { setAnswer } = renderChatQuestions()
    act(() => {
      vi.advanceTimersByTime(TYPING_DELAY_MS + 50)
    })
    const textarea = screen.getByPlaceholderText('Answer in your own words…') as HTMLTextAreaElement
    fireEvent.change(textarea, { target: { value: '7 out of 10' } })
    fireEvent.click(screen.getByRole('button', { name: '' }))
    vi.useRealTimers()

    await waitFor(() => {
      expect(setAnswer).toHaveBeenCalledWith(1, { picks: [], text: '7 out of 10' })
    })
    await waitFor(() => {
      expect(screen.getByText('What made you land on that number?')).toBeTruthy()
    })
  })

  it('keeps the composer live after every question is answered, and shows an in-chat prompt instead of replacing it with a button', async () => {
    // Regression: the footer used to swap the composer out entirely for a
    // full-width "Pick my action" button once allDone — the user could no
    // longer type. Chat must stay available the whole time; the action prompt
    // is just another turn in the transcript, not a takeover of the footer.
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false }))) // force the fail-open "take as answer" path for every send
    vi.useFakeTimers()
    const onDone = vi.fn()
    let answers: Record<number, { picks?: string[]; text?: string }> = {}
    const setAnswer = vi.fn((i: number, v: { picks?: string[]; text?: string }) => {
      answers = { ...answers, [i]: v }
    })
    const { rerender } = render(
      <ChatQuestions
        dept={sampleDept}
        answers={answers}
        setAnswer={setAnswer}
        exchanges={{}}
        appendExchange={() => {}}
        onBack={() => {}}
        onDone={onDone}
        canMakeLlmCall={() => true}
        recordLlmCall={() => {}}
      />,
    )

    for (let q = 0; q < sampleDept.questions.length; q++) {
      act(() => {
        vi.advanceTimersByTime(TYPING_DELAY_MS + 50)
      })
      const textarea = screen.getByPlaceholderText('Answer in your own words…') as HTMLTextAreaElement
      fireEvent.change(textarea, { target: { value: `answer ${q}` } })
      fireEvent.click(screen.getByRole('button', { name: '' }))
      await act(async () => {
        await Promise.resolve()
      })
      rerender(
        <ChatQuestions
          dept={sampleDept}
          answers={answers}
          setAnswer={setAnswer}
          exchanges={{}}
          appendExchange={() => {}}
          onBack={() => {}}
          onDone={onDone}
          canMakeLlmCall={() => true}
          recordLlmCall={() => {}}
        />,
      )
    }
    act(() => {
      vi.advanceTimersByTime(TYPING_DELAY_MS + 50)
    })
    vi.useRealTimers()

    // The composer must still be present and usable — no full-width takeover.
    const composer = screen.getByPlaceholderText('Answer in your own words…') as HTMLTextAreaElement
    expect(composer).toBeTruthy()

    // The in-chat prompt appears as a coach turn, not a footer button.
    const prompt = screen.getByText('Pick my action')
    expect(prompt.tagName).toBe('BUTTON')
    fireEvent.click(prompt)
    expect(onDone).toHaveBeenCalled()
  })

  it('renders exchange entries for a turn in the order they were appended, not with the final answer always first', () => {
    // Regression: answers[i]/acknowledgements[i] used to render in a fixed slot
    // that always came before the exchanges[i] array, regardless of when the
    // answer actually happened. A coach_followup appended BEFORE the eventual
    // final_answer must still render above it — exchanges[i] is now the single
    // ordered timeline for a turn (see ChatBubbles.tsx's Exchange doc comment),
    // and the render loop must map it directly with no separate answer slot.
    const exchanges: Record<number, Exchange[]> = {
      1: [
        { kind: 'coach_followup', question: "What's pulling you down from six or seven?" },
        { kind: 'final_answer', answer: 'running. def low on energy to run well now.', acknowledgement: 'Running without energy will drain you.' },
      ],
    }
    render(
      <ChatQuestions
        dept={sampleDept}
        answers={{ 1: { picks: [], text: 'running. def low on energy to run well now.' } }}
        setAnswer={() => {}}
        exchanges={exchanges}
        appendExchange={() => {}}
        onBack={() => {}}
        onDone={() => {}}
        canMakeLlmCall={() => true}
        recordLlmCall={() => {}}
      />,
    )

    const followUpEl = screen.getByText("What's pulling you down from six or seven?")
    const replyEl = screen.getByText('running. def low on energy to run well now.')
    // DOCUMENT_POSITION_FOLLOWING on the reply (as seen from the follow-up) means
    // the reply comes AFTER the follow-up in the DOM — the correct chronological order.
    expect(followUpEl.compareDocumentPosition(replyEl) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('groups consecutive coach messages under a single avatar instead of repeating it per message', () => {
    // The fixed question and an immediately-following coach_followup are both
    // coach messages with nothing from the user in between — they must share
    // one avatar (one <svg>), stacked in one CoachGroup, not one avatar each.
    const exchanges: Record<number, Exchange[]> = {
      1: [{ kind: 'coach_followup', question: "What's pulling you down from six or seven?" }],
    }
    vi.useFakeTimers()
    render(
      <ChatQuestions
        dept={sampleDept}
        answers={{}}
        setAnswer={() => {}}
        exchanges={exchanges}
        appendExchange={() => {}}
        onBack={() => {}}
        onDone={() => {}}
        canMakeLlmCall={() => true}
        recordLlmCall={() => {}}
      />,
    )
    act(() => {
      vi.advanceTimersByTime(TYPING_DELAY_MS + 50)
    })
    vi.useRealTimers()

    const question = screen.getByText("Let's see where you're at. Give yourself a score out of 10 for this Department — honest, not generous.")
    const followUp = screen.getByText("What's pulling you down from six or seven?")
    const group = question.closest('div[style*="align-items: flex-end"]')
    expect(group).toBeTruthy()
    // Both messages belong to the same group (same nearest coach-group ancestor).
    expect(followUp.closest('div[style*="align-items: flex-end"]')).toBe(group)
    // Exactly one avatar for the whole group, not one per message.
    expect(group?.querySelectorAll('svg').length).toBe(1)
  })

  it('restores the full transcript on resume instead of just the fixed-question answers', () => {
    // Regression: exchanges (the only source of rendered chat bubbles) never
    // persisted and always reset to {} on mount, including on resume — so a
    // resumed draft correctly skipped past already-answered questions but showed
    // an empty transcript for them. Simulates a resume by mounting with both
    // `answers` and `exchanges` pre-populated, as DepartmentFlow now seeds both
    // from entry.answers/entry.exchanges (see DepartmentFlow.tsx/DepartmentFlowRoute.tsx).
    const exchanges: Record<number, Exchange[]> = {
      1: [{ kind: 'final_answer', answer: '7 out of 10', acknowledgement: 'A solid seven.' }],
    }
    render(
      <ChatQuestions
        dept={sampleDept}
        answers={{ 1: { picks: [], text: '7 out of 10' } }}
        setAnswer={() => {}}
        exchanges={exchanges}
        appendExchange={() => {}}
        onBack={() => {}}
        onDone={() => {}}
        canMakeLlmCall={() => true}
        recordLlmCall={() => {}}
      />,
    )

    expect(screen.getByText('7 out of 10')).toBeTruthy()
    expect(screen.getByText('A solid seven.')).toBeTruthy()
  })
})
