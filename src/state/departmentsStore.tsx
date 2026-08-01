import { createContext, useContext, useMemo, useReducer, useEffect, useCallback } from 'react'
import type { ReactNode } from 'react'
import { CEOOS_DEPARTMENTS } from '@/departments/departments.config'
import type { DeptId, DepartmentRuntime } from '@/departments/types'
import { STORAGE_KEYS, readJSON, writeJSON } from './persistence/localStorage'

type Level = 0 | 1 | 2 | 3

interface DepartmentsState {
  levels: Record<DeptId, Level>
}

type DepartmentsAction = { type: 'RAISE_LEVEL'; deptId: DeptId; level: Level }

function initialLevels(): Record<DeptId, Level> {
  return Object.fromEntries(CEOOS_DEPARTMENTS.map((d) => [d.id, 0])) as Record<DeptId, Level>
}

function departmentsReducer(state: DepartmentsState, action: DepartmentsAction): DepartmentsState {
  switch (action.type) {
    case 'RAISE_LEVEL': {
      const current = state.levels[action.deptId] ?? 0
      const next = Math.max(current, action.level) as Level
      if (next === current) return state
      return { levels: { ...state.levels, [action.deptId]: next } }
    }
    default:
      return state
  }
}

interface DepartmentsContextValue {
  departments: DepartmentRuntime[]
  getLevel: (deptId: DeptId) => Level
  raiseLevel: (deptId: DeptId, level: Level) => void
}

const DepartmentsContext = createContext<DepartmentsContextValue | null>(null)

export function DepartmentsProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(
    departmentsReducer,
    undefined,
    () => ({ levels: readJSON(STORAGE_KEYS.departments, initialLevels()) }),
  )

  useEffect(() => {
    writeJSON(STORAGE_KEYS.departments, state.levels)
  }, [state.levels])

  const raiseLevel = useCallback((deptId: DeptId, level: Level) => {
    dispatch({ type: 'RAISE_LEVEL', deptId, level })
  }, [])

  const getLevel = useCallback((deptId: DeptId) => state.levels[deptId] ?? 0, [state.levels])

  const departments = useMemo<DepartmentRuntime[]>(
    () => CEOOS_DEPARTMENTS.map((d) => ({ ...d, level: state.levels[d.id] ?? 0 })),
    [state.levels],
  )

  const value = useMemo(() => ({ departments, getLevel, raiseLevel }), [departments, getLevel, raiseLevel])

  return <DepartmentsContext.Provider value={value}>{children}</DepartmentsContext.Provider>
}

export function useDepartments(): DepartmentsContextValue {
  const ctx = useContext(DepartmentsContext)
  if (!ctx) throw new Error('useDepartments must be used within DepartmentsProvider')
  return ctx
}
