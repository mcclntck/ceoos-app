import { describe, expect, it } from 'vitest'
import { CX, CY, ORBIT_H, ORBIT_LEVELS, ORBIT_W, YOU_SIZE, orbitPosition, orbitStroke } from '@/features/orbit/orbitGeometry'

describe('orbit geometry constants', () => {
  it('matches the authored canvas size from the prototype', () => {
    expect(ORBIT_W).toBe(360)
    expect(ORBIT_H).toBe(392)
    expect(CX).toBe(180)
    expect(CY).toBe(196)
  })

  /* Orb sizes were deliberately bumped ~1.22x from ceoos-orbit.jsx's originals (product
     decision: the orbs read as too small) — see orbitGeometry.ts's ORBIT_LEVELS comment. */
  it('has the four level geometries r/size/dim at the current bumped sizes', () => {
    expect(ORBIT_LEVELS).toEqual([
      { r: 156, size: 78, dim: 0.62 },
      { r: 144, size: 90, dim: 0.82 },
      { r: 134, size: 102, dim: 1 },
      { r: 124, size: 115, dim: 1 },
    ])
    expect(YOU_SIZE).toBe(116)
  })

  it('radius shrinks and size grows monotonically as level increases (closer + bigger)', () => {
    for (let i = 1; i < ORBIT_LEVELS.length; i++) {
      expect(ORBIT_LEVELS[i].r).toBeLessThan(ORBIT_LEVELS[i - 1].r)
      expect(ORBIT_LEVELS[i].size).toBeGreaterThan(ORBIT_LEVELS[i - 1].size)
    }
  })

  it('clearance between orb edge and hub edge stays positive at every level', () => {
    const clearances = ORBIT_LEVELS.map((l) => l.r - l.size / 2 - YOU_SIZE / 2)
    expect(clearances.map((c) => Math.round(c))).toEqual([59, 41, 25, 9])
    clearances.forEach((c) => expect(c).toBeGreaterThan(0))
  })

  it('clearance between adjacent orbs (fixed 72deg apart) stays positive at every level', () => {
    const theta = (72 * Math.PI) / 180
    const gaps = ORBIT_LEVELS.map((l) => 2 * l.r * Math.sin(theta / 2) - l.size)
    gaps.forEach((g) => expect(g).toBeGreaterThan(0))
  })
})

describe('orbitPosition', () => {
  it('places career (angle -90deg) directly above the hub centre', () => {
    const radius = 152
    const { x, y } = orbitPosition(-90, radius)
    expect(x).toBeCloseTo(CX, 10)
    expect(y).toBeCloseTo(CY - radius, 10)
  })

  it('places a 0deg angle directly to the right of the hub centre', () => {
    const { x, y } = orbitPosition(0, 100)
    expect(x).toBeCloseTo(CX + 100, 10)
    expect(y).toBeCloseTo(CY, 10)
  })

  it('places a 90deg angle directly below the hub centre', () => {
    const { x, y } = orbitPosition(90, 100)
    expect(x).toBeCloseTo(CX, 10)
    expect(y).toBeCloseTo(CY + 100, 10)
  })

  it('places a 180deg angle directly to the left of the hub centre', () => {
    const { x, y } = orbitPosition(180, 100)
    expect(x).toBeCloseTo(CX - 100, 10)
    expect(y).toBeCloseTo(CY, 10)
  })

  it('matches x = CX + r*cos(theta), y = CY + r*sin(theta) for an arbitrary angle', () => {
    const angle = 54 // wealth's fixed angle
    const radius = 128
    const rad = (angle * Math.PI) / 180
    const { x, y } = orbitPosition(angle, radius)
    expect(x).toBeCloseTo(CX + radius * Math.cos(rad), 10)
    expect(y).toBeCloseTo(CY + radius * Math.sin(rad), 10)
  })
})

describe('orbitStroke', () => {
  it('renders no progress (dashoffset === circumference) at progress 0', () => {
    const { circumference, dashoffset } = orbitStroke(64, 0)
    expect(dashoffset).toBeCloseTo(circumference, 10)
  })

  it('renders full progress (dashoffset === 0) at progress 1', () => {
    const { dashoffset } = orbitStroke(64, 1)
    expect(dashoffset).toBeCloseTo(0, 10)
  })

  it('renders a third filled at progress 1/3 (level 1 of 3)', () => {
    const { circumference, dashoffset } = orbitStroke(84, 1 / 3)
    expect(dashoffset).toBeCloseTo(circumference * (2 / 3), 10)
  })

  it('renders two-thirds filled at progress 2/3 (level 2 of 3)', () => {
    const { circumference, dashoffset } = orbitStroke(84, 2 / 3)
    expect(dashoffset).toBeCloseTo(circumference * (1 / 3), 10)
  })

  it('computes stroke-width as max(3, size*0.045) and radius as (size - sw) / 2', () => {
    const size = 64
    const sw = Math.max(3, size * 0.045)
    const expectedR = (size - sw) / 2
    const { r, circumference } = orbitStroke(size, 0.5)
    expect(r).toBeCloseTo(expectedR, 10)
    expect(circumference).toBeCloseTo(2 * Math.PI * expectedR, 10)
  })

  it('clamps progress outside [0,1]', () => {
    const over = orbitStroke(64, 5)
    const under = orbitStroke(64, -5)
    expect(over.dashoffset).toBeCloseTo(0, 10)
    expect(under.dashoffset).toBeCloseTo(over.circumference, 10)
  })
})
