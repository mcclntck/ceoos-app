import type { Handler } from '@netlify/functions'
import type Anthropic from '@anthropic-ai/sdk'
import { buildDepartmentSystemPrompt } from './_lib/prompts'
import { getAnthropicClient } from './_lib/anthropicClient'

/* LLM-powered coach acknowledgement + optional follow-up question — see plan
   §"LLM integration: natural follow-up questions". Scoped narrowly: a 1-2
   sentence in-persona reaction to the user's answer, with an OPTIONAL single
   natural follow-up question the model includes only when an answer is
   genuinely worth probing — inserted before the next FIXED question in
   ChatQuestions.tsx, never replacing it. Not a free-form chat backend.
   ANTHROPIC_API_KEY is a Netlify server env var only, never VITE_-prefixed,
   so it can never be inlined into the client bundle. */

const DEPT_IDS = ['career', 'health', 'wealth', 'fun', 'love'] as const
type DeptId = (typeof DEPT_IDS)[number]

interface ChatRequestBody {
  deptId: DeptId
  question: string
  userAnswer: string
  priorTurns?: { role: 'user' | 'assistant'; content: string }[]
}

function isValidBody(body: unknown): body is ChatRequestBody {
  if (!body || typeof body !== 'object') return false
  const b = body as Record<string, unknown>
  return (
    typeof b.deptId === 'string' &&
    (DEPT_IDS as readonly string[]).includes(b.deptId) &&
    typeof b.question === 'string' &&
    typeof b.userAnswer === 'string'
  )
}

const RESPOND_TOOL: Anthropic.Tool = {
  name: 'respond_to_answer',
  description: "Return your in-persona reaction to the user's answer, and optionally one natural follow-up question.",
  input_schema: {
    type: 'object',
    properties: {
      acknowledgement: {
        type: 'string',
        description: '1-2 short sentences, in persona, reacting to what the user said.',
      },
      follow_up_question: {
        type: 'string',
        description:
          'ONE natural, in-persona follow-up question probing something specific, surprising, or incomplete in their answer. Omit this field entirely if no follow-up is warranted (which should be the common case).',
      },
    },
    required: ['acknowledgement'],
  },
}

interface RespondToAnswerInput {
  acknowledgement?: unknown
  follow_up_question?: unknown
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
    return { statusCode: 400, body: 'Missing or invalid deptId/question/userAnswer' }
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
      max_tokens: 300,
      system: buildDepartmentSystemPrompt(body.deptId),
      tools: [RESPOND_TOOL],
      tool_choice: { type: 'tool', name: 'respond_to_answer' },
      messages: [
        ...priorTurns.map((t) => ({ role: t.role, content: t.content })),
        {
          role: 'user' as const,
          content: `Question asked: "${body.question}"\nUser's answer: "${body.userAnswer}"`,
        },
      ],
    })

    const toolUseBlock = response.content.find((b) => b.type === 'tool_use' && b.name === 'respond_to_answer')

    let acknowledgement = ''
    let followUpQuestion: string | undefined

    if (toolUseBlock && toolUseBlock.type === 'tool_use') {
      try {
        const input = toolUseBlock.input as RespondToAnswerInput
        acknowledgement = typeof input.acknowledgement === 'string' ? input.acknowledgement.trim() : ''
        followUpQuestion = typeof input.follow_up_question === 'string' ? input.follow_up_question.trim() : undefined
        if (!followUpQuestion) followUpQuestion = undefined
      } catch {
        acknowledgement = ''
        followUpQuestion = undefined
      }
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ acknowledgement, followUpQuestion }),
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
