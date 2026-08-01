/* Ported from ceoos-orbit.jsx's useOrbitScale. Measures the CONTENT box of the orbit's
   stage (padding excluded) and returns a uniform scale factor — the orbit is the primary
   interaction, so it grows to fill the space it's given without distorting its angular
   geometry (never reflowed, only scaled). */
import { useEffect, useState, type RefObject } from 'react'
import { ORBIT_H, ORBIT_W } from './orbitGeometry'

export interface OrbitPresenceSetting {
  cap: number
  target: number
  hub: number
  orb: number
  halo: boolean
}

/* Presence — how dominant the orbit is: scale ceiling/target, hub size, halo.
   Per the plan, tweak values ship hardcoded — 'balanced' is the only option actually
   used in production, but the table (and the hook below) stay generic. */
export const ORBIT_PRESENCE: Record<'calm' | 'balanced' | 'commanding', OrbitPresenceSetting> = {
  calm: { cap: 1.05, target: 0.95, hub: 0.9, orb: 0.94, halo: false },
  balanced: { cap: 1.4, target: 1.15, hub: 1, orb: 1, halo: true },
  commanding: { cap: 1.72, target: 1.34, hub: 1.16, orb: 1.08, halo: true },
}

/** Uniform orbit scale factor: clamp(0.8, min(w/baseW, max(target, h/ORBIT_H)), cap).
 *  Width is a hard constraint (the column clips); height is soft (the region scrolls),
 *  so the orbit never shrinks below a legible, tappable size just to fit vertically. */
export function useOrbitScale(ref: RefObject<HTMLElement | null>, cap = 1.4, target = 1.15): number {
  const [k, setK] = useState(1)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const baseW = ORBIT_W + 16 // bubbles overhang the authored box by ~4px each side

    const fit = (w: number, h: number) => {
      setK(Math.min(cap, Math.max(0.8, Math.min(w / baseW, Math.max(target, h / ORBIT_H)))))
    }

    const measure = () => {
      const cs = getComputedStyle(el)
      fit(
        el.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight),
        el.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom),
      )
    }

    measure()
    window.addEventListener('resize', measure)

    if (typeof ResizeObserver === 'undefined') {
      return () => window.removeEventListener('resize', measure)
    }

    const ro = new ResizeObserver((entries) => {
      const r = entries[0] && entries[0].contentRect
      if (r) fit(r.width, r.height)
      else measure()
    })
    ro.observe(el)

    return () => {
      ro.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [ref, cap, target])

  return k
}
