import type { Handler } from '@netlify/functions'
import Anthropic from '@anthropic-ai/sdk'
import { buildDepartmentSystemPrompt } from './_lib/prompts'

/* LLM-powered coach acknowledgement — see plan §"LLM-powered coach acknowledgements".
   Scoped narrowly: a 1-2 sentence in-persona reaction to the user's answer,
   inserted before the next FIXED question in ChatQuestions.tsx — not a
   free-form chat backend. ANTHROPIC_API_KEY is a Netlify server env var only,
   never VITE_-prefixed, so it can never be inlined into the client bundle. */

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

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return { statusCode: 500, body: 'Server misconfigured: ANTHROPIC_API_KEY not set' }
  }

  const client = new Anthropic({ apiKey })

  // Keep the transcript short — this is a single acknowledgement, not a long conversation.
  const priorTurns = (body.priorTurns ?? []).slice(-20)

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 200,
      system: buildDepartmentSystemPrompt(body.deptId),
      messages: [
        ...priorTurns.map((t) => ({ role: t.role, content: t.content })),
        {
          role: 'user' as const,
          content: `Question asked: "${body.question}"\nUser's answer: "${body.userAnswer}"\n\nGive a brief, warm, in-persona acknowledgement of their answer.`,
        },
      ],
    })

    const textBlock = response.content.find((b) => b.type === 'text')
    const text = textBlock && textBlock.type === 'text' ? textBlock.text : ''

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
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
