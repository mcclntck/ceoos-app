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
      // No usable answer text despite the "question" classification — fall back
      // to the "answer" path below rather than discarding the message entirely
      // (the classification itself doesn't change what the user actually typed).
      if (answerToUser) return { kind: 'question', answerToUser }
    }
    // A classified "answer" is honoured even if the acknowledgement text is empty
    // (e.g. the model classified correctly but left the field blank) — the message
    // must still be recorded as the answer, just without an acknowledgement bubble.
    // Only a genuine transport/parse failure (caught below) should return null.
    return { kind: 'answer', acknowledgement: data.acknowledgement?.trim() ?? '', followUpQuestion: data.followUpQuestion?.trim() || undefined }
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
