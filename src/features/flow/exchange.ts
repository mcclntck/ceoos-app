/** Ephemeral, per-session events layered on top of a fixed question's turn index,
 *  in strict chronological order — not part of the persisted Conversation/
 *  Department domain model, and never saved to conversationsStore (deliberate
 *  scope cut, same as the original follow-up feature). This is the ONLY record of
 *  what happened on a turn and in what order — rendering must map this array
 *  directly with no separate "answer slot" rendered before/after it, otherwise an
 *  answer given after an earlier follow-up/side-question visually jumps out of
 *  chronological order (see the bug this replaced). Three kinds:
 *  - coach_followup: the model chose to probe the user's answer further. Purely a
 *    remark shown to the user — whatever they type next is classified fresh against
 *    the ORIGINAL fixed question (see ChatQuestions.send()), so this has no separate
 *    "answer" of its own to track.
 *  - user_question: the user asked the coach something instead of answering, and
 *    got an in-persona answer, before the fixed question was actually answered.
 *  - final_answer: the message that was actually recorded as the fixed question's
 *    answer (answers[i]), plus its acknowledgement — appended at the moment it
 *    happens, so it takes its real place in the timeline instead of always
 *    rendering first. acknowledgement may be empty (the model left it blank).
 *
 *  Kept in its own plain .ts file (no JSX/React imports) so departments/types.ts
 *  can reference it without pulling ChatBubbles.tsx's component/JSX code into the
 *  Netlify Functions build (see netlify/functions/tsconfig.json, which has no
 *  --jsx flag and no @/ path aliases). */
export interface CoachFollowUp {
  kind: 'coach_followup'
  question: string
}

export interface UserQuestion {
  kind: 'user_question'
  question: string
  answer: string
}

export interface FinalAnswer {
  kind: 'final_answer'
  answer: string
  acknowledgement: string
}

export type Exchange = CoachFollowUp | UserQuestion | FinalAnswer
