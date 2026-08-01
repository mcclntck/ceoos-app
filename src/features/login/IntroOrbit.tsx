/* Ported verbatim from design_handoff_ceoos_pilot_app/design/ceoos-app.jsx
   (IntroOrbit, introBubbleStyle, useFitScale). This is the small, non-interactive
   orbit shown on the login screen before onboarding — a self-contained visual,
   distinct from the live/interactive OrbitBubble that will be built for the
   main orbit hub screen. */
import { useEffect, useRef, useState, type CSSProperties, type RefObject } from 'react'
import { CEOOS_DEPARTMENTS } from '@/departments/departments.config'
import { ORBIT_TONE } from '@/departments/departmentTones'
import type { Glow } from '@/departments/types'

const L_CX = 196
const L_CY = 150
const L_R = 118
const INTRO_W = 392
const INTRO_H = 300

/* Opaque bubble cores (same tones as the orbit hub) so orbit rings never show through. */
function introBubbleStyle(glow: Glow): CSSProperties {
  const t = ORBIT_TONE[glow] || { core: '#0b1e13', edge: '#1d4a2e' }
  return {
    background: `radial-gradient(circle at 50% 34%, ${t.edge}, ${t.core} 74%)`,
    border: `1px solid ${t.edge}`,
    boxShadow: '0 6px 18px rgba(0,0,0,0.55)',
  }
}

/* Scales the intro orbit to the browser's resolution — grows on larger viewports, shrinks on small,
   constrained by both available width and height. scale() needs a unitless number. */
function useFitScale(ref: RefObject<HTMLDivElement | null>, baseW: number, baseH: number, max = 1.3) {
  const [k, setK] = useState(1)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const fit = (w: number) => {
      const byW = w / baseW
      const byH = (window.innerHeight * 0.4) / baseH
      setK(Math.min(max, Math.max(0.7, Math.min(byW, byH))))
    }
    const measure = () => {
      const cs = getComputedStyle(el)
      fit(el.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight))
    }
    measure()
    window.addEventListener('resize', measure)
    if (typeof ResizeObserver === 'undefined') {
      return () => window.removeEventListener('resize', measure)
    }
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
  }, [ref, baseW, baseH, max])
  return k
}

export interface IntroOrbitProps {
  show: boolean
}

export function IntroOrbit({ show }: IntroOrbitProps) {
  const rad = (deg: number) => (deg * Math.PI) / 180
  const wrapRef = useRef<HTMLDivElement>(null)
  const k = useFitScale(wrapRef, INTRO_W + 16, INTRO_H)

  return (
    <div
      ref={wrapRef}
      style={{
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        padding: '0 var(--ceoos-gutter-sm)',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          position: 'relative',
          width: INTRO_W,
          height: INTRO_H,
          flexShrink: 0,
          transform: `scale(${k})`,
          transformOrigin: 'top center',
        }}
      >
        {/* rings */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            opacity: show ? 1 : 0,
            transition: 'opacity 900ms ease 200ms',
          }}
        >
          {[236, 300].map((d, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: L_CX,
                top: L_CY,
                width: d,
                height: d,
                marginLeft: -d / 2,
                marginTop: -d / 2,
                borderRadius: '50%',
                border: `1px ${i === 0 ? 'dashed' : 'solid'} rgba(255,255,255,${0.07 + i * 0.02})`,
              }}
            />
          ))}
          <div
            style={{
              position: 'absolute',
              left: L_CX,
              top: L_CY,
              width: 236,
              height: 236,
              marginLeft: -118,
              marginTop: -118,
              borderRadius: '50%',
              border: '1px solid rgba(202,219,43,0.16)',
            }}
          />
        </div>
        {/* You */}
        <div
          style={{
            position: 'absolute',
            left: L_CX,
            top: L_CY,
            transform: `translate(-50%,-50%) scale(${show ? 1 : 0.4})`,
            opacity: show ? 1 : 0,
            transition: 'all 700ms cubic-bezier(0.16,1,0.3,1)',
            width: 118,
            height: 118,
            borderRadius: '50%',
            background:
              'radial-gradient(circle at 50% 44%, rgba(190,200,165,0.5), rgba(202,219,43,0.12) 55%, rgba(20,20,20,0) 76%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontFamily: 'var(--font-primary)',
            fontSize: 30,
            fontWeight: 700,
            zIndex: 2,
          }}
        >
          You
        </div>
        {/* planets emit from center to orbit */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            transformOrigin: `${L_CX}px ${L_CY}px`,
            animation: show ? 'ceoOrbitSpin 60s linear infinite' : 'none',
          }}
        >
          {CEOOS_DEPARTMENTS.map((d, i) => {
            const x = L_CX + L_R * Math.cos(rad(d.angle))
            const y = L_CY + L_R * Math.sin(rad(d.angle))
            return (
              <div
                key={d.id}
                style={{
                  position: 'absolute',
                  left: show ? x : L_CX,
                  top: show ? y : L_CY,
                  transform: 'translate(-50%,-50%)',
                  opacity: show ? 1 : 0,
                  transition: `all 760ms cubic-bezier(0.16,1,0.3,1) ${350 + i * 90}ms`,
                }}
              >
                <div style={{ animation: show ? 'ceoOrbitSpinRev 60s linear infinite' : 'none' }}>
                  <div
                    style={{
                      width: 68,
                      height: 68,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textAlign: 'center',
                      padding: 4,
                      boxSizing: 'border-box',
                      fontFamily: 'var(--font-primary)',
                      fontSize: 10,
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      ...introBubbleStyle(d.glow),
                    }}
                  >
                    {d.label}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
