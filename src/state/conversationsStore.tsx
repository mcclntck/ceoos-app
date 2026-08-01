import { createContext, useContext, useMemo, useReducer, useEffect, useCallback } from 'react'
import type { ReactNode } from 'react'
import { CEOOS_DEPARTMENTS, CEOOS_SEED_CONVERSATIONS } from '@/departments/departments.config'
import type { Conversation, DeptId } from '@/departments/types'
import { STORAGE_KEYS, readJSON, writeJSON } from './persistence/localStorage'

type ConversationsState = Record<DeptId, Conversation[]>

type ConversationsAction = { type: 'ADD'; deptId: DeptId; conversation: Conversation }

function initialConversations(): ConversationsState {
  const out = {} as ConversationsState
  for (const d of CEOOS_DEPARTMENTS) {
    out[d.id] = CEOOS_SEED_CONVERSATIONS[d.id] ?? []
  }
  return out
}

function conversationsReducer(state: ConversationsState, action: ConversationsAction): ConversationsState {
  switch (action.type) {
    case 'ADD':
      return { ...state, [action.deptId]: [action.conversation, ...(state[action.deptId] ?? [])] }
    default:
      return state
  }
}

interface ConversationsContextValue {
  conversationsByDept: ConversationsState
  addConversation: (deptId: DeptId, conversation: Conversation) => void
}

const ConversationsContext = createContext<ConversationsContextValue | null>(null)

export function ConversationsProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(conversationsReducer, undefined, () =>
    readJSON(STORAGE_KEYS.conversations, initialConversations()),
  )

  useEffect(() => {
    writeJSON(STORAGE_KEYS.conversations, state)
  }, [state])

  const addConversation = useCallback(
    (deptId: DeptId, conversation: Conversation) => dispatch({ type: 'ADD', deptId, conversation }),
    [],
  )

  const value = useMemo(() => ({ conversationsByDept: state, addConversation }), [state, addConversation])

  return <ConversationsContext.Provider value={value}>{children}</ConversationsContext.Provider>
}

export function useConversations(): ConversationsContextValue {
  const ctx = useContext(ConversationsContext)
  if (!ctx) throw new Error('useConversations must be used within ConversationsProvider')
  return ctx
}
