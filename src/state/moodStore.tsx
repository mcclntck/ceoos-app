import { createContext, useContext, useMemo, useReducer, useEffect, useCallback } from 'react'
import type { ReactNode } from 'react'
import { STORAGE_KEYS, readJSON, writeJSON } from './persistence/localStorage'

export interface MoodDay {
  day: string
  mood: number | null
}

export interface MoodNote {
  text: string
  at: number
  when: string
}

interface MoodState {
  log: MoodDay[]
  notes: MoodNote[]
}

type MoodAction = { type: 'LOG_TODAY'; value: number } | { type: 'ADD_NOTE'; note: MoodNote }

function initialLog(): MoodDay[] {
  return [
    { day: 'Mon', mood: null },
    { day: 'Tue', mood: null },
    { day: 'Wed', mood: null },
    { day: 'Thu', mood: null },
    { day: 'Fri', mood: null },
    { day: 'Sat', mood: null },
    { day: 'Sun', mood: null },
  ]
}

function moodReducer(state: MoodState, action: MoodAction): MoodState {
  switch (action.type) {
    case 'LOG_TODAY': {
      const log = state.log.map((e, i) => (i === state.log.length - 1 ? { ...e, mood: action.value } : e))
      return { ...state, log }
    }
    case 'ADD_NOTE':
      return { ...state, notes: [action.note, ...state.notes] }
    default:
      return state
  }
}

interface MoodContextValue {
  log: MoodDay[]
  notes: MoodNote[]
  todayMood: number | null
  logToday: (value: number) => void
  addNote: (note: MoodNote) => void
}

const MoodContext = createContext<MoodContextValue | null>(null)

export function MoodProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(moodReducer, undefined, () =>
    readJSON<MoodState>(STORAGE_KEYS.mood, { log: initialLog(), notes: [] }),
  )

  useEffect(() => {
    writeJSON(STORAGE_KEYS.mood, state)
  }, [state])

  const logToday = useCallback((value: number) => dispatch({ type: 'LOG_TODAY', value }), [])
  const addNote = useCallback((note: MoodNote) => dispatch({ type: 'ADD_NOTE', note }), [])

  const value = useMemo(
    () => ({ log: state.log, notes: state.notes, todayMood: state.log[state.log.length - 1]?.mood ?? null, logToday, addNote }),
    [state.log, state.notes, logToday, addNote],
  )

  return <MoodContext.Provider value={value}>{children}</MoodContext.Provider>
}

export function useMood(): MoodContextValue {
  const ctx = useContext(MoodContext)
  if (!ctx) throw new Error('useMood must be used within MoodProvider')
  return ctx
}
