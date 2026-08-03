import type { DeptId } from '@/departments/types'

export interface AcknowledgementTurn {
  role: 'user' | 'assistant'
  content: string
}

export interface CoachResponse {
  acknowledgement: string
  followUpQuestion?: string
}

/** Calls the Netlify Function proxying to the Claude API — see netlify/functions/chat.ts.
 *  Returns null on any failure so the flow can proceed without the acknowledgement/follow-up
 *  rather than getting stuck (network hiccup, missing key locally, session cap hit, etc). */
export async function fetchCoachAcknowledgement(
  deptId: DeptId,
  question: string,
  userAnswer: string,
  priorTurns: AcknowledgementTurn[],
): Promise<CoachResponse | null> {
  try {
    const res = await fetch('/.netlify/functions/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deptId, question, userAnswer, priorTurns }),
    })
    if (!res.ok) return null
    const data = (await res.json()) as { acknowledgement?: string; followUpQuestion?: string }
    const acknowledgement = data.acknowledgement?.trim() ?? ''
    if (!acknowledgement) return null
    return { acknowledgement, followUpQuestion: data.followUpQuestion?.trim() || undefined }
  } catch {
    return null
  }
}

/** Calls netlify/functions/actions.ts to generate action suggestions grounded in
 *  the user's chat transcript. Returns an empty array on any failure so callers
 *  can fall back to the static per-department action list. */
export async function fetchSuggestedActions(deptId: DeptId, transcript: { question: string; answer: string }[]): Promise<string[]> {
  try {
    const res = await fetch('/.netlify/functions/actions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deptId, transcript }),
    })
    if (!res.ok) return []
    const data = (await res.json()) as { actions?: string[] }
    return Array.isArray(data.actions) ? data.actions : []
  } catch {
    return []
  }
}
