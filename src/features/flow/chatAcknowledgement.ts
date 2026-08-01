import type { DeptId } from '@/departments/types'

export interface AcknowledgementTurn {
  role: 'user' | 'assistant'
  content: string
}

/** Calls the Netlify Function proxying to the Claude API — see netlify/functions/chat.ts.
 *  Returns an empty string on any failure so the flow can proceed without the
 *  acknowledgement rather than getting stuck (network hiccup, missing key locally, etc). */
export async function fetchCoachAcknowledgement(
  deptId: DeptId,
  question: string,
  userAnswer: string,
  priorTurns: AcknowledgementTurn[],
): Promise<string> {
  try {
    const res = await fetch('/.netlify/functions/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deptId, question, userAnswer, priorTurns }),
    })
    if (!res.ok) return ''
    const data = (await res.json()) as { text?: string }
    return data.text?.trim() ?? ''
  } catch {
    return ''
  }
}
