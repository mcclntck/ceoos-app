/* Tether lines (one per department, hub edge to orb edge) + the two decorative
   background rings — ported from ceoos-orbit.jsx's `OrbitLinks`.
   NOTE: the source file's OrbitLinks as shipped only renders the two decorative rings
   (hairline + dashed) — the per-department tether line described in the README's
   "Tether lines" section is rendered as part of this same SVG layer per the spec
   (hub edge to orb edge, dashed+faint at level 0, solid+brighter as level increases,
   700ms transition). Both are ported here since they share one z-index:0 SVG layer
   sitting behind the bubbles and the hub.

   This is plain SVG attribute/CSS-property animation (stroke opacity/width/color), not a
   DOM layout property — ported as-is per the plan, no transform/opacity technique needed. */
import { CX, CY, ORBIT_H, ORBIT_LEVELS, ORBIT_W, YOU_SIZE } from './orbitGeometry'
import type { DeptId } from '@/departments/types'

export interface OrbitLinkDept {
  id: DeptId
  angle: number
  level: 0 | 1 | 2 | 3
}

export interface OrbitLinksProps {
  departments: OrbitLinkDept[]
}

export function OrbitLinks({ departments }: OrbitLinksProps) {
  return (
    <svg
      viewBox={`0 0 ${ORBIT_W} ${ORBIT_H}`}
      width="100%"
      height="100%"
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}
    >
      {/* Decorative concentric rings — hairline + dashed (source: OrbitLinks). */}
      <circle cx={CX} cy={CY} r={170} fill="none" stroke="rgba(233,234,237,0.16)" strokeWidth="1" />
      <circle cx={CX} cy={CY} r={140} fill="none" stroke="rgba(233,234,237,0.22)" strokeWidth="1" strokeDasharray="4 7" />

      {/* Tether lines — hub edge to orb edge, one per department. */}
      {departments.map((d) => {
        const geo = ORBIT_LEVELS[d.level]
        const rad = (d.angle * Math.PI) / 180
        const hubEdgeR = YOU_SIZE / 2 - 4
        const orbEdgeR = geo.r - geo.size / 2 - 2
        const x1 = CX + hubEdgeR * Math.cos(rad)
        const y1 = CY + hubEdgeR * Math.sin(rad)
        const x2 = CX + orbEdgeR * Math.cos(rad)
        const y2 = CY + orbEdgeR * Math.sin(rad)
        const pct = Math.max(0, Math.min(1, d.level / 3))
        const lit = d.level > 0

        return (
          <line
            key={d.id}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={lit ? 'var(--accent)' : 'rgba(233,234,237,0.22)'}
            strokeWidth={lit ? 1 + pct * 1.4 : 1}
            strokeDasharray={lit ? undefined : '2 5'}
            style={{
              opacity: lit ? 0.2 + pct * 0.5 : 1,
              transition: 'stroke 700ms cubic-bezier(0.16,1,0.3,1), stroke-width 700ms cubic-bezier(0.16,1,0.3,1), opacity 700ms cubic-bezier(0.16,1,0.3,1)',
            }}
          />
        )
      })}
    </svg>
  )
}
