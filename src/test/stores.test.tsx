import { describe, expect, it, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import type { ReactNode } from 'react'
import { DepartmentsProvider, useDepartments } from '@/state/departmentsStore'
import { PlansProvider, usePlans } from '@/state/plansStore'

beforeEach(() => {
  localStorage.clear()
})

describe('DepartmentsStore', () => {
  function wrapper({ children }: { children: ReactNode }) {
    return <DepartmentsProvider>{children}</DepartmentsProvider>
  }

  it('starts every department at level 0', () => {
    const { result } = renderHook(() => useDepartments(), { wrapper })
    expect(result.current.departments.every((d) => d.level === 0)).toBe(true)
  })

  it('ratchets level up via Math.max, never down', () => {
    const { result } = renderHook(() => useDepartments(), { wrapper })
    act(() => result.current.raiseLevel('career', 2))
    expect(result.current.getLevel('career')).toBe(2)
    act(() => result.current.raiseLevel('career', 1))
    expect(result.current.getLevel('career')).toBe(2)
    act(() => result.current.raiseLevel('career', 3))
    expect(result.current.getLevel('career')).toBe(3)
  })

  it('does not affect other departments', () => {
    const { result } = renderHook(() => useDepartments(), { wrapper })
    act(() => result.current.raiseLevel('health', 3))
    expect(result.current.getLevel('career')).toBe(0)
  })
})

describe('PlansStore', () => {
  function wrapper({ children }: { children: ReactNode }) {
    return <PlansProvider>{children}</PlansProvider>
  }

  it('seeds with CEOOS_SEED_PLANS', () => {
    const { result } = renderHook(() => usePlans(), { wrapper })
    expect(result.current.plans.length).toBeGreaterThan(0)
  })

  it('marks a plan done and records mood', () => {
    const { result } = renderHook(() => usePlans(), { wrapper })
    act(() => result.current.markDone(0, 'Good'))
    expect(result.current.plans[0].done).toBe(true)
    expect(result.current.plans[0].mood).toBe('Good')
  })
})
