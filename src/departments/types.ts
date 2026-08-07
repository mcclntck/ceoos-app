import type { Exchange } from '../features/flow/exchange'

export type DeptId = 'career' | 'health' | 'wealth' | 'fun' | 'love'
export type Glow = 'teal' | 'emerald' | 'cool' | 'violet' | 'warm'

export interface DepartmentQuestion {
  q: string
}

export interface Department {
  id: DeptId
  label: string
  head: string
  glow: Glow
  angle: number
  coach: string
  questions: DepartmentQuestion[]
  actions: string[]
}

export interface DepartmentRuntime extends Department {
  level: 0 | 1 | 2 | 3
}

export interface ChatAnswer {
  picks?: string[]
  text?: string
}

export interface Conversation {
  id: string
  date: string
  title: string
  summary: string
  action: string
  mood: string | null
  /** 'in-progress' for a resumable draft chat, 'done' once completed. Missing/older
   *  persisted data with no status is treated as 'done' — see conversationsStore. */
  status?: 'in-progress' | 'done'
  /** Saved answers for a resumable draft — only present while status is 'in-progress'. */
  answers?: Record<number, ChatAnswer>
  /** Saved chat transcript (follow-ups, side-questions, and each answer's own
   *  acknowledgement) for a resumable draft — only present while status is
   *  'in-progress'. Without this, resuming a draft would restore which questions
   *  are answered but show an empty transcript, since answers[] alone is never
   *  itself rendered as a chat bubble — see ChatQuestions.tsx. */
  exchanges?: Record<number, Exchange[]>
}

export interface Plan {
  deptId: DeptId
  action: string
  dayLabel: string
  timeLabel: string
  done: boolean
  mood: string | null
}

export interface Article {
  id: string
  deptId: DeptId
  title: string
  date: string
  readTime: string
  author: string
  image?: string
}
