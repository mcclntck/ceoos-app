import { describe, expect, it } from 'vitest'
import { CEOOS_DEPARTMENTS } from '@/departments/departments.config'

describe('CEOOS_DEPARTMENTS', () => {
  it('has exactly 5 departments', () => {
    expect(CEOOS_DEPARTMENTS).toHaveLength(5)
  })

  it('each department has 6 questions and 3 actions', () => {
    for (const d of CEOOS_DEPARTMENTS) {
      expect(d.questions).toHaveLength(6)
      expect(d.actions).toHaveLength(3)
    }
  })

  it('fixed angles match the prototype spec', () => {
    const angles = Object.fromEntries(CEOOS_DEPARTMENTS.map((d) => [d.id, d.angle]))
    expect(angles).toEqual({ career: -90, health: -18, wealth: 54, fun: 126, love: 198 })
  })
})
