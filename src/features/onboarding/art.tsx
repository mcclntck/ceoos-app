/* Ported from design_handoff_ceoos_pilot_app/design/ceoos-onboarding.jsx.
   Step art: OLockArt (privacy), OOrbitArt (departments — a non-animated, simpler
   sibling of the main orbit screen), OCoachArt (Tim Simons). */
import { useEffect, useRef, useState } from 'react'
import { CEOOS_DEPARTMENTS } from '@/departments/departments.config'
import { ORBIT_TONE } from '@/departments/departmentTones'
import { SparkleIcon } from '@/design-system'
import type { Glow } from '@/departments/types'

const O_FONT = 'var(--font-primary)'

export function OLockArt() {
  return (
    <div style={{ position: 'relative', width: 'clamp(88px, 18vh, 132px)', height: 'clamp(88px, 18vh, 132px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'radial-gradient(circle, rgba(202,219,43,0.16), rgba(0,0,0,0) 70%)' }} />
      <div style={{ width: 'clamp(64px, 13vh, 96px)', height: 'clamp(64px, 13vh, 96px)', borderRadius: 28, background: 'var(--surface-card-strong)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ width: 'clamp(32px, 6.4vh, 46px)', height: 'clamp(32px, 6.4vh, 46px)' }}>
          <rect x="4" y="10.5" width="16" height="10.5" rx="3" />
          <path d="M8 10.5V7a4 4 0 0 1 8 0v3.5" />
          <circle cx="12" cy="15.5" r="1.4" fill="var(--accent)" stroke="none" />
        </svg>
      </div>
    </div>
  )
}

/* Non-animated orbit for the departments slide — authored at 344px, sized to fill
   the art area, scales with the viewport. Distinct from (and simpler than) the
   main orbit screen: no level-based sizing, just a static display. */
const OART = 344

function useOArtScale(ref: React.RefObject<HTMLDivElement | null>): number {
  const [k, setK] = useState(1)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const fit = (w: number) => setK(Math.min(1.22, Math.max(0.62, Math.min(w / OART, (window.innerHeight * 0.42) / OART))))
    const measure = () => {
      const cs = getComputedStyle(el)
      fit(el.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight))
    }
    measure()
    window.addEventListener('resize', measure)
    if (typeof ResizeObserver === 'undefined') return () => window.removeEventListener('resize', measure)
    const ro = new ResizeObserver((entries) => {
      const r = entries[0] && entries[0].contentRect
      if (r) fit(r.width)
      else measure()
    })
    ro.observe(el)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [ref])
  return k
}

/* Opaque cores so the orbit rings never show through the bubbles. */
function oBubbleStyle(glow: Glow): React.CSSProperties {
  const t = ORBIT_TONE[glow] ?? { core: '#0b1e13', edge: '#1d4a2e' }
  return {
    background: `radial-gradient(circle at 50% 34%, ${t.edge}, ${t.core} 74%)`,
    border: `1px solid ${t.edge}`,
    boxShadow: '0 6px 18px rgba(0,0,0,0.55)',
  }
}

export function OOrbitArt() {
  const CX = OART / 2
  const CY = OART / 2
  const R = 130
  const rad = (deg: number) => (deg * Math.PI) / 180
  const wrapRef = useRef<HTMLDivElement>(null)
  const k = useOArtScale(wrapRef)
  return (
    <div ref={wrapRef} style={{ width: '100%', display: 'flex', justifyContent: 'center', padding: '0 var(--ceoos-gutter-sm)', boxSizing: 'border-box' }}>
      <div
        style={{
          position: 'relative',
          width: OART,
          height: OART,
          flexShrink: 0,
          transform: `scale(${k})`,
          transformOrigin: 'center center',
          margin: `${((k - 1) * OART) / 2}px 0`,
        }}
      >
        {[268, 344].map((d, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: CX,
              top: CY,
              width: d,
              height: d,
              marginLeft: -d / 2,
              marginTop: -d / 2,
              borderRadius: '50%',
              border: `1px ${i === 0 ? 'dashed' : 'solid'} rgba(255,255,255,0.09)`,
            }}
          />
        ))}
        <div
          style={{
            position: 'absolute',
            left: CX,
            top: CY,
            width: 128,
            height: 128,
            borderRadius: '50%',
            background: 'radial-gradient(circle at 50% 44%, rgba(190,200,165,0.5), rgba(202,219,43,0.12) 55%, rgba(20,20,20,0) 78%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: 'translate(-50%,-50%)',
            color: '#fff',
            fontFamily: O_FONT,
            fontSize: 32,
            fontWeight: 700,
          }}
        >
          You
        </div>
        {CEOOS_DEPARTMENTS.map((d) => {
          const x = CX + R * Math.cos(rad(d.angle))
          const y = CY + R * Math.sin(rad(d.angle))
          return (
            <div key={d.id} style={{ position: 'absolute', left: x, top: y, transform: 'translate(-50%,-50%)' }}>
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  ...oBubbleStyle(d.glow),
                }}
              >
                <span
                  style={{
                    fontFamily: O_FONT,
                    fontSize: 9.5,
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    textAlign: 'center',
                    lineHeight: 1.2,
                    padding: '0 4px',
                  }}
                >
                  {d.label}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function OCoachArt() {
  return (
    <div style={{ position: 'relative', width: 'clamp(100px, 20vh, 150px)', height: 'clamp(100px, 20vh, 150px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'radial-gradient(circle, rgba(202,219,43,0.14), rgba(0,0,0,0) 70%)' }} />
      <div
        style={{
          position: 'relative',
          width: 'clamp(74px, 15vh, 112px)',
          height: 'clamp(74px, 15vh, 112px)',
          borderRadius: '50%',
          background: 'linear-gradient(135deg,#6b6f2e,#2d3320)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontFamily: O_FONT,
          fontSize: 34,
          fontWeight: 700,
          border: '1px solid var(--border-subtle)',
        }}
      >
        <svg
          width="52"
          height="52"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--accent)"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ width: 'clamp(35px, 7vh, 52px)', height: 'clamp(35px, 7vh, 52px)' }}
        >
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
        </svg>
        <span
          style={{
            position: 'absolute',
            right: -6,
            top: -6,
            width: 'clamp(28px, 5.4vh, 40px)',
            height: 'clamp(28px, 5.4vh, 40px)',
            borderRadius: '50%',
            background: 'var(--accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '3px solid #05060a',
          }}
        >
          <SparkleIcon size={20} color="var(--text-on-accent)" />
        </span>
      </div>
    </div>
  )
}
