/* Pure geometry ported from design_handoff_ceoos_pilot_app/design/ceoos-orbit.jsx.
   No DOM, no React — deterministic math only, so it can be unit-tested directly. */

export interface OrbitLevelGeometry {
  r: number
  size: number
  dim: number
}

/* Engagement level -> orbit geometry. Higher level = smaller radius (closer) + bigger bubble.
   Sizes are ~1.22x the original ceoos-orbit.jsx values (product decision: orbs read as too
   small); radii nudged up slightly alongside them so clearance to the hub and between
   adjacent orbs (departments are fixed 72deg apart) both stay comfortably positive at every
   level, and the largest orbs still stay inside the authored ORBIT_W x ORBIT_H canvas. */
export const ORBIT_LEVELS: OrbitLevelGeometry[] = [
  { r: 156, size: 78, dim: 0.62 }, // 0 untouched — furthest out
  { r: 144, size: 90, dim: 0.82 }, // 1 reflected
  { r: 134, size: 102, dim: 1 }, // 2 committed (has action)
  { r: 124, size: 115, dim: 1 }, // 3 done + mood logged — closest
]

export const YOU_SIZE = 116

/* Orbit canvas is authored at this size, then uniformly scaled to fit narrow screens. */
export const ORBIT_W = 360
export const ORBIT_H = 392
export const CX = ORBIT_W / 2
export const CY = 196

export interface Point {
  x: number
  y: number
}

/** x = CX + r·cos(θ), y = CY + r·sin(θ), θ in degrees, 0° = right. */
export function orbitPosition(angleDeg: number, radius: number): Point {
  const rad = (angleDeg * Math.PI) / 180
  return {
    x: CX + radius * Math.cos(rad),
    y: CY + radius * Math.sin(rad),
  }
}

export interface OrbitStroke {
  r: number
  circumference: number
  dashoffset: number
}

/** SVG perimeter-progress ring math: stroke-width, radius, dasharray/dashoffset for a given
 *  bubble size and 0..1 progress (level / 3). */
export function orbitStroke(size: number, progress: number): OrbitStroke {
  const pct = Math.max(0, Math.min(1, progress))
  const sw = Math.max(3, size * 0.045)
  const r = (size - sw) / 2
  const circumference = 2 * Math.PI * r
  return {
    r,
    circumference,
    dashoffset: circumference * (1 - pct),
  }
}
