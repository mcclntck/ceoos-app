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

export interface Conversation {
  id: string
  date: string
  title: string
  summary: string
  action: string
  mood: string | null
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
