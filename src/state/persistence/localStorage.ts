const PREFIX = 'ceoos.v1.'

export function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    if (raw == null) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function writeJSON<T>(key: string, value: T): void {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value))
  } catch {
    // localStorage unavailable (private mode, quota) — state stays in-memory for this session
  }
}

export function removeKey(key: string): void {
  try {
    localStorage.removeItem(PREFIX + key)
  } catch {
    // ignore
  }
}

export const STORAGE_KEYS = {
  identity: 'identity',
  departments: 'departments',
  plans: 'plans',
  conversations: 'conversations',
  mood: 'mood',
  onboardingDone: 'onboardingDone',
} as const

export function chatHistoryKey(deptId: string): string {
  return `chat.${deptId}`
}
