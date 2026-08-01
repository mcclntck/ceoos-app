import { CEOOS_DEPARTMENTS } from '@/departments/departments.config'
import { STORAGE_KEYS, chatHistoryKey, removeKey } from './localStorage'

export function resetAccount(): void {
  for (const key of Object.values(STORAGE_KEYS)) {
    removeKey(key)
  }
  for (const dept of CEOOS_DEPARTMENTS) {
    removeKey(chatHistoryKey(dept.id))
  }
}
