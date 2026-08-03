import type { Handler } from '@netlify/functions'
import type Anthropic from '@anthropic-ai/sdk'
import { buildActionsSystemPrompt } from './_lib/prompts'
import { getAnthropicClient } from './_lib/anthropicClient'

/* LLM-generated action suggestions — see plan §"LLM integration: natural
   follow-up questions". Called once per chat session, after the fixed
   6-question flow finishes, to replace the static per-department suggestion
   list in ActionStep.tsx with 2-3 suggestions grounded in what the user
   actually said. Same env-var handling as chat.ts — see that file's header
   comment. */

const DEPT_IDS = ['career', 'health', 'wealth', 'fun', 'love'] as const
type DeptId = (typeof DEPT_IDS)[number]

interface ActionsRequestBody {
  deptId: DeptId
  transcript: { question: string; answer: string }[]
}

function isValidBody(body: unknown): body is ActionsRequestBody {
  if (!body || typeof body !== 'object') return false
  const b = body as Record<string, unknown>
  if (typeof b.deptId !== 'string' || !(DEPT_IDS as readonly string[]).includes(b.deptId)) return false
  if (!Array.isArray(b.transcript)) return false
  return b.transcript.every(
    (t) => t && typeof t === 'object' && typeof (t as Record<string, unknown>).question === 'string' && typeof (t as Record<string, unknown>).answer === 'string',
  )
}

const SUGGEST_TOOL: Anthropic.Tool = {
  name: 'suggest_actions',
  description: 'Suggest 2-3 concrete, achievable actions based on the user’s reflection.',
  input_schema: {
    type: 'object',
    properties: {
      actions: {
        type: 'array',
        items: { type: 'string' },
        description:
          'Each action: a short, concrete, imperative, time-boxed suggestion the user could realistically do this week — matching the style of "Book a 20-min career chat with my manager" or "Schedule three 20-min walks this week". No generic advice, no vague verbs like "focus on" or "work on". 2-3 items.',
      },
    },
    required: ['actions'],
  },
}

interface SuggestActionsInput {
  actions?: unknown
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
    return { statusCode: 400, body: 'Missing or invalid deptId/transcript' }
  }

  const client = getAnthropicClient()
  if (!client) {
    return { statusCode: 500, body: 'Server misconfigured: ANTHROPIC_API_KEY not set' }
  }

  const transcriptText = body.transcript.map((t) => `Q: ${t.question}\nA: ${t.answer}`).join('\n\n')

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 300,
      system: buildActionsSystemPrompt(body.deptId),
      tools: [SUGGEST_TOOL],
      tool_choice: { type: 'tool', name: 'suggest_actions' },
      messages: [{ role: 'user', content: transcriptText }],
    })

    const toolUseBlock = response.content.find((b) => b.type === 'tool_use' && b.name === 'suggest_actions')

    let actions: string[] = []
    if (toolUseBlock && toolUseBlock.type === 'tool_use') {
      try {
        const input = toolUseBlock.input as SuggestActionsInput
        if (Array.isArray(input.actions)) {
          actions = input.actions.filter((a): a is string => typeof a === 'string' && a.trim().length > 0).map((a) => a.trim()).slice(0, 3)
        }
      } catch {
        actions = []
      }
    }
    if (actions.length < 2) actions = []

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actions }),
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
