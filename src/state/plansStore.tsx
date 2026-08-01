import { createContext, useContext, useMemo, useReducer, useEffect, useCallback } from 'react'
import type { ReactNode } from 'react'
import { CEOOS_SEED_PLANS } from '@/departments/departments.config'
import type { Plan } from '@/departments/types'
import { STORAGE_KEYS, readJSON, writeJSON } from './persistence/localStorage'

interface PlansState {
  plans: Plan[]
}

type PlansAction =
  | { type: 'ADD_PLAN'; plan: Plan }
  | { type: 'UPSERT_AT'; index: number; plan: Plan }
  | { type: 'MARK_DONE'; index: number; mood: string | null }

function plansReducer(state: PlansState, action: PlansAction): PlansState {
  switch (action.type) {
    case 'ADD_PLAN':
      return { plans: [action.plan, ...state.plans] }
    case 'UPSERT_AT': {
      if (action.index < 0 || action.index >= state.plans.length) {
        return { plans: [action.plan, ...state.plans] }
      }
      const next = state.plans.slice()
      next[action.index] = action.plan
      return { plans: next }
    }
    case 'MARK_DONE': {
      if (action.index < 0 || action.index >= state.plans.length) return state
      const next = state.plans.slice()
      next[action.index] = { ...next[action.index], done: true, mood: action.mood ?? next[action.index].mood }
      return { plans: next }
    }
    default:
      return state
  }
}

interface PlansContextValue {
  plans: Plan[]
  addPlan: (plan: Plan) => void
  upsertAt: (index: number, plan: Plan) => void
  markDone: (index: number, mood: string | null) => void
}

const PlansContext = createContext<PlansContextValue | null>(null)

export function PlansProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(plansReducer, undefined, () => ({
    plans: readJSON(STORAGE_KEYS.plans, CEOOS_SEED_PLANS),
  }))

  useEffect(() => {
    writeJSON(STORAGE_KEYS.plans, state.plans)
  }, [state.plans])

  const addPlan = useCallback((plan: Plan) => dispatch({ type: 'ADD_PLAN', plan }), [])
  const upsertAt = useCallback((index: number, plan: Plan) => dispatch({ type: 'UPSERT_AT', index, plan }), [])
  const markDone = useCallback((index: number, mood: string | null) => dispatch({ type: 'MARK_DONE', index, mood }), [])

  const value = useMemo(() => ({ plans: state.plans, addPlan, upsertAt, markDone }), [state.plans, addPlan, upsertAt, markDone])

  return <PlansContext.Provider value={value}>{children}</PlansContext.Provider>
}

export function usePlans(): PlansContextValue {
  const ctx = useContext(PlansContext)
  if (!ctx) throw new Error('usePlans must be used within PlansProvider')
  return ctx
}
