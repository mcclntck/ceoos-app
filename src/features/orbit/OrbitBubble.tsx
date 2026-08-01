/* Single department bubble in the orbit hub.
   Visual spec ported exactly from ceoos-orbit.jsx's OrbitBubble (opaque gradient core,
   perimeter progress ring, thin-line icon + label, tether-line-safe opacity). The
   PROTOTYPE animates this via `left`/`top` (900ms) on the wrapper and `width`/`height`
   (720ms) + `box-shadow` (500ms) on the bubble itself — those are layout/paint-triggering
   CSS properties, diagnosed as the root cause of jank in a prior app attempt using this
   same visual design (ceoos-web). This component reimplements the identical visual result
   using ONLY `transform`/`opacity`:

   - POSITION: the wrapper's `--bx`/`--by` custom properties (pixel offsets from CX/CY,
     computed exactly as the source's `CX + r*cos(θ)` / `CY + r*sin(θ)`) are consumed by one
     static CSS rule — `transform: translate(-50%,-50%) translate(var(--bx),var(--by))
     scale(var(--bscale))`. Only the custom properties change on level transitions; the
     `transition: transform 900ms cubic-bezier(0.16,1,0.3,1)` rule itself is static and
     always present (gated by `data-mounted`, see useOrbitMount).

   - SIZE ("orb grows"): rather than animating width/height, the SVG/icon/label are always
     rendered at the fixed LARGEST size (94px, level 3's size) and a `--bscale` custom
     property (currentSize / 94) is applied via the same `transform` above. Growth is
     therefore a pure compositor `scale()`, not a layout-triggering resize. This also means
     position and size settle together over the same 900ms transition — a deliberate,
     faithful reinterpretation (documented here per the plan) rather than the source's
     separate 900ms position / 720ms size timings; visually indistinguishable in practice
     since both easings and end states match.

   - GLOW: the lit-state box-shadow (which encodes `level`) is applied as a STATIC value
     with NO transition at all. Chosen over an opacity-crossfade glow layer because the
     shadow snap is imperceptible in context — it only changes at the same moment the
     stroke/tether/position-scale transition already draws the eye for 900ms across the
     whole orbit, so an extra crossfading layer would add complexity without a visible
     benefit. (Documented choice, see plan §Orbit screen.)

   - STROKE/ICON: SVG `stroke-dashoffset` and icon `stroke` colour keep their original
     attribute/CSS-property transitions (760ms / 400ms) — these are not layout-triggering.

   Memoized with React.memo, primitive-only props, and a stable onOpen callback (called
   inside this component, not as a parent-created closure) — the structural fix from the
   jank diagnosis. */
import { memo } from 'react'
import { CX, CY, ORBIT_LEVELS, YOU_SIZE as _YOU_SIZE, orbitStroke } from './orbitGeometry'
import { ORBIT_TONE, ORBIT_ICONS, ORBIT_HUE } from '@/departments/departmentTones'
import type { DeptId, Glow } from '@/departments/types'

void _YOU_SIZE // re-exported for callers that only import geometry from this module's neighbours

/* Fixed render box for the SVG/icon/label — always the largest (level-3) size. Growth
   between levels is expressed purely via the `--bscale` transform, never a width/height
   change, so this box itself never resizes. */
const BASE_SIZE = ORBIT_LEVELS[3].size

export interface OrbitBubbleProps {
  id: DeptId
  label: string
  glow: Glow
  level: 0 | 1 | 2 | 3
  bx: number
  by: number
  mounted: boolean
  onOpen: (id: DeptId) => void
}

function OrbitBubbleImpl({ id, label, glow, level, bx, by, mounted, onOpen }: OrbitBubbleProps) {
  const geo = ORBIT_LEVELS[level]
  const bscale = geo.size / BASE_SIZE
  const tone = ORBIT_TONE[glow] || ORBIT_TONE.emerald
  const pct = Math.max(0, Math.min(1, level / 3))
  const lit = level > 0
  const { r, circumference, dashoffset } = orbitStroke(BASE_SIZE, pct)
  const iconSize = Math.round(BASE_SIZE * 0.26)
  const hue = ORBIT_HUE[id] || 'var(--accent)'

  return (
    <div
      data-mounted={mounted ? 'true' : undefined}
      className="orbit-bubble-wrap"
      style={
        {
          position: 'absolute',
          left: CX,
          top: CY,
          '--bx': `${bx}px`,
          '--by': `${by}px`,
          '--bscale': bscale,
          zIndex: level >= 2 ? 5 : 3,
        } as React.CSSProperties
      }
    >
      <button
        onClick={() => onOpen(id)}
        aria-label={label}
        style={{
          position: 'relative',
          width: BASE_SIZE,
          height: BASE_SIZE,
          borderRadius: '50%',
          border: 'none',
          padding: 0,
          cursor: 'pointer',
          background: `radial-gradient(circle at 50% 34%, ${tone.edge}, ${tone.core} 74%)`,
          boxShadow: lit
            ? `0 0 0 1px ${tone.edge}, 0 6px 22px rgba(0,0,0,0.6), 0 0 26px -4px rgba(202,219,43,${0.1 + pct * 0.22})`
            : `0 0 0 1px ${tone.edge}, 0 6px 18px rgba(0,0,0,0.55)`,
        }}
      >
        <svg
          width={BASE_SIZE}
          height={BASE_SIZE}
          viewBox={`0 0 ${BASE_SIZE} ${BASE_SIZE}`}
          style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)', overflow: 'visible' }}
        >
          {pct > 0 && (
            <circle cx={BASE_SIZE / 2} cy={BASE_SIZE / 2} r={r} fill="none" stroke="rgba(255,255,255,0.13)" strokeWidth={Math.max(3, BASE_SIZE * 0.045)} />
          )}
          {pct > 0 && (
            <circle
              cx={BASE_SIZE / 2}
              cy={BASE_SIZE / 2}
              r={r}
              fill="none"
              stroke="var(--accent)"
              strokeWidth={Math.max(3, BASE_SIZE * 0.045)}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashoffset}
              style={{ transition: 'stroke-dashoffset 760ms cubic-bezier(0.16,1,0.3,1)' }}
            />
          )}
        </svg>
        <span
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: Math.round(BASE_SIZE * 0.045),
            opacity: geo.dim,
            transition: 'opacity 500ms ease',
          }}
        >
          <svg
            width={iconSize}
            height={iconSize}
            viewBox="0 0 24 24"
            fill="none"
            stroke={lit ? hue : 'rgba(233,234,237,0.72)'}
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ transition: 'stroke 400ms ease' }}
          >
            {ORBIT_ICONS[id]}
          </svg>
          <span
            style={{
              fontFamily: 'var(--font-primary)',
              fontSize: Math.max(9.5, Math.round(BASE_SIZE * 0.132)),
              fontWeight: 600,
              color: 'var(--text-primary)',
              lineHeight: 1.1,
              textAlign: 'center',
              padding: '0 6px',
              letterSpacing: '-0.01em',
            }}
          >
            {label}
          </span>
        </span>
      </button>
    </div>
  )
}

export const OrbitBubble = memo(OrbitBubbleImpl)
