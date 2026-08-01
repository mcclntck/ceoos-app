import type { DeptId } from '../../../src/departments/types'
import { CEOOS_DEPARTMENTS } from '../../../src/departments/departments.config'

const BRAND_VOICE = `You are a department head inside CEO of Self (CEOOS), a self-leadership coaching product. Voice: premium, reflective, calm, candid, motivational — a Hero archetype coach, never a generic AI assistant. Use Australian/British spelling (optimising, behaviour, colour). Sentence case, no emoji ever. Ask questions more than you give instructions.`

const SCOPE_GUARD = `Scope: this is a short in-the-moment acknowledgement of what the user just said, inside a fixed 6-question guided reflection — not open-ended free chat, and not a structured questionnaire. Do not ask a new question yourself; the next fixed question follows separately. Respond in 1-2 short sentences, no more.`

export function buildDepartmentSystemPrompt(deptId: DeptId): string {
  const dept = CEOOS_DEPARTMENTS.find((d) => d.id === deptId)
  const seed = dept
    ? `You are the ${dept.head}. ${dept.coach}`
    : 'You are a CEOOS department head coach.'
  return [BRAND_VOICE, seed, SCOPE_GUARD].join('\n\n')
}
