import type { Handler } from '@netlify/functions'
import type Anthropic from '@anthropic-ai/sdk'
import { buildDepartmentSystemPrompt } from './_lib/prompts'
import { getAnthropicClient } from './_lib/anthropicClient'

/* LLM-powered coach turn — see plan §"Let the user ask the coach questions
   mid-chat". Every user message on a fixed question is classified by the
   model as either an answer (today's existing acknowledgement + optional
   follow-up question) or a genuine question directed at the coach (answered
   in-persona, then the app re-shows the same fixed question — never
   replacing the fixed 6-question backbone). Not a free-form chat backend.
   ANTHROPIC_API_KEY is a Netlify server env var only, never VITE_-prefixed,
   so it can never be inlined into the client bundle. */

const DEPT_IDS = ['career', 'health', 'wealth', 'fun', 'love'] as const
type DeptId = (typeof DEPT_IDS)[number]

interface ChatRequestBody {
  deptId: DeptId
  question: string
  userMessage: string
  priorTurns?: { role: 'user' | 'assistant'; content: string }[]
}

function isValidBody(body: unknown): body is ChatRequestBody {
  if (!body || typeof body !== 'object') return false
  const b = body as Record<string, unknown>
  return (
    typeof b.deptId === 'string' &&
    (DEPT_IDS as readonly string[]).includes(b.deptId) &&
    typeof b.question === 'string' &&
    typeof b.userMessage === 'string'
  )
}

const RESPOND_TOOL: Anthropic.Tool = {
  name: 'respond_to_message',
  description:
    "Classify the user's message as an answer or a question, then respond accordingly.",
  input_schema: {
    type: 'object',
    properties: {
      kind: {
        type: 'string',
        enum: ['answer', 'question'],
        description:
          '"answer" if the user answered (even briefly/vaguely) the question asked. "question" if they instead asked YOU something rather than answering.',
      },
      acknowledgement: {
        type: 'string',
        description:
          'When kind is "answer": EXACTLY ONE short sentence (roughly 15 words or fewer), in persona, reacting to what the user said. No em dashes/semicolons/"and"/"but" chaining a second clause on. Never two sentences.',
      },
      follow_up_question: {
        type: 'string',
        description:
          'When kind is "answer": ONE short, natural, in-persona follow-up question — a single short sentence, roughly 15 words or fewer, no chained clauses — probing something specific, surprising, or incomplete in their answer. Omit this field entirely if no follow-up is warranted (which should be the common case).',
      },
      answer_to_user: {
        type: 'string',
        description:
          'When kind is "question": EXACTLY ONE short sentence (roughly 15 words or fewer) genuinely answering what they asked, grounded in this Department and the conversation so far, optionally followed by ONE more short sentence (also roughly 15 words or fewer) handing back to the original question. Two short sentences maximum, total — no chaining extra clauses onto either one.',
      },
    },
    required: ['kind'],
  },
}

interface RespondToMessageInput {
  kind?: unknown
  acknowledgement?: unknown
  follow_up_question?: unknown
  answer_to_user?: unknown
}

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  let body: unknown
  try {
    body = JSON.parse(event.body ?? '{}')
  } catch {
    return { statusCode: 400, body: 'Invalid JSON' }
  }

  if (!isValidBody(body)) {
    return { statusCode: 400, body: 'Missing or invalid deptId/question/userMessage' }
  }

  const client = getAnthropicClient()
  if (!client) {
    return { statusCode: 500, body: 'Server misconfigured: ANTHROPIC_API_KEY not set' }
  }

  // Keep the transcript short — this is a single acknowledgement, not a long conversation.
  const priorTurns = (body.priorTurns ?? []).slice(-20)

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 500,
      system: buildDepartmentSystemPrompt(body.deptId),
      tools: [RESPOND_TOOL],
      tool_choice: { type: 'tool', name: 'respond_to_message' },
      messages: [
        ...priorTurns.map((t) => ({ role: t.role, content: t.content })),
        {
          role: 'user' as const,
          content: `Question asked: "${body.question}"\nUser's message: "${body.userMessage}"`,
        },
      ],
    })

    const toolUseBlock = response.content.find((b) => b.type === 'tool_use' && b.name === 'respond_to_message')

    let kind: 'answer' | 'question' = 'answer'
    let acknowledgement = ''
    let followUpQuestion: string | undefined
    let answerToUser: string | undefined

    if (toolUseBlock && toolUseBlock.type === 'tool_use') {
      try {
        const input = toolUseBlock.input as RespondToMessageInput
        kind = input.kind === 'question' ? 'question' : 'answer'
        acknowledgement = typeof input.acknowledgement === 'string' ? input.acknowledgement.trim() : ''
        followUpQuestion = typeof input.follow_up_question === 'string' ? input.follow_up_question.trim() || undefined : undefined
        answerToUser = typeof input.answer_to_user === 'string' ? input.answer_to_user.trim() || undefined : undefined
      } catch {
        kind = 'answer'
        acknowledgement = ''
        followUpQuestion = undefined
        answerToUser = undefined
      }
    }

    // A "question" classification with no usable answer degrades to the fail-open
    // "answer" path client-side (see llmCoach.ts) rather than leaving the user stuck.
    if (kind === 'question' && !answerToUser) kind = 'answer'

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kind, acknowledgement, followUpQuestion, answerToUser }),
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return {
      statusCode: 502,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: message }),
    }
  }
}
