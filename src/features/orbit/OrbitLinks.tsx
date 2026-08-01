/* Two decorative background rings behind the orbit — ported from ceoos-orbit.jsx's
   `OrbitLinks`. The per-department tether lines (hub edge to orb edge) that used to
   render in this same SVG layer were removed per product decision — the rings alone
   are the intended background treatment. */
import { CX, CY, ORBIT_H, ORBIT_W } from './orbitGeometry'

export function OrbitLinks() {
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
    </svg>
  )
}
