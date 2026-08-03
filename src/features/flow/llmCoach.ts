import type { DeptId } from '@/departments/types'

export interface AcknowledgementTurn {
  role: 'user' | 'assistant'
  content: string
}

export type CoachTurn =
  | { kind: 'answer'; acknowledgement: string; followUpQuestion?: string }
  | { kind: 'question'; answerToUser: string }

/** Calls the Netlify Function proxying to the Claude API — see netlify/functions/chat.ts.
 *  Classifies the user's message as either an answer (existing acknowledgement + optional
 *  follow-up) or a genuine question directed at the coach (answered in-persona). Returns
 *  null on any failure so the caller can fall back to treating the message as a plain
 *  answer rather than getting stuck (network hiccup, missing key locally, session cap hit,
 *  or a "question" classification with no usable answer text). */
export async function fetchCoachAcknowledgement(
  deptId: DeptId,
  question: string,
  userMessage: string,
  priorTurns: AcknowledgementTurn[],
): Promise<CoachTurn | null> {
  try {
    const res = await fetch('/.netlify/functions/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deptId, question, userMessage, priorTurns }),
    })
    if (!res.ok) return null
    const data = (await res.json()) as { kind?: string; acknowledgement?: string; followUpQuestion?: string; answerToUser?: string }
    if (data.kind === 'question') {
      const answerToUser = data.answerToUser?.trim() ?? ''
      if (!answerToUser) return null
      return { kind: 'question', answerToUser }
    }
    const acknowledgement = data.acknowledgement?.trim() ?? ''
    if (!acknowledgement) return null
    return { kind: 'answer', acknowledgement, followUpQuestion: data.followUpQuestion?.trim() || undefined }
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
