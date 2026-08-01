/* Ported verbatim from ceoos-orbit.jsx (ORBIT_TONE, ORBIT_ICONS, ORBIT_HUE)
   and ceoos-flow.jsx (F_DEPT_TONE). */
import type { ReactNode } from 'react'
import type { DeptId, Glow } from './types'

export interface OrbitTone {
  core: string
  edge: string
}

/* Opaque bubble cores per department tone — solid so orbit lines never show through. */
export const ORBIT_TONE: Record<Glow, OrbitTone> = {
  teal: { core: '#0f1f1c', edge: '#1d3b35' },
  emerald: { core: '#0b1e13', edge: '#1d4a2e' },
  violet: { core: '#17111f', edge: '#3a2a55' },
  cool: { core: '#101521', edge: '#22304a' },
  warm: { core: '#1d160f', edge: '#3b2c1c' },
}

/* Thin-line department icons (lucide-derived, MIT). */
export const ORBIT_ICONS: Record<DeptId, ReactNode> = {
  career: (
    <g>
      <rect x="2.5" y="7" width="19" height="13" rx="2.5" />
      <path d="M8.5 7V5.5A2 2 0 0 1 10.5 3.5h3a2 2 0 0 1 2 2V7M2.5 12.5h19" />
    </g>
  ),
  health: (
    <g>
      <path d="M20.4 5.6a5 5 0 0 0-7.1 0L12 6.9l-1.3-1.3a5 5 0 1 0-7.1 7.1L12 21l8.4-8.3a5 5 0 0 0 0-7.1z" />
    </g>
  ),
  wealth: (
    <g>
      <path d="M12 1V21M7 16.3033L8.465 17.4017C10.4167 18.8667 13.5817 18.8667 15.535 17.4017C17.4883 15.9367 17.4883 13.5633 15.535 12.0983C14.56 11.365 13.28 11 12 11C10.7917 11 9.58333 10.6333 8.66167 9.90167C6.81833 8.43667 6.81833 6.06333 8.66167 4.59833C10.505 3.13333 13.495 3.13333 15.3383 4.59833L16.03 5.14833" />
    </g>
  ),
  fun: (
    <g>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.5v2.6M12 18.9v2.6M2.5 12h2.6M18.9 12h2.6M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M18.7 5.3l-1.8 1.8M7.1 16.9l-1.8 1.8" />
    </g>
  ),
  love: (
    <g>
      <path d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
    </g>
  ),
}

/* Perimeter progress stroke hue — fills as engagement strengthens (0–3 of 3). */
export const ORBIT_HUE: Record<DeptId, string> = {
  career: '#3ad6c0',
  health: '#4fd97e',
  wealth: '#7fa8ff',
  fun: '#b58cff',
  love: '#ff8b9a',
}

export interface DeptToneTokens {
  hue: string
  soft: string
  edge: string
}

/* Per-department accent hue — makes each department's screens recognisable (ceoos-flow.jsx). */
export const F_DEPT_TONE: Record<DeptId, DeptToneTokens> = {
  career: { hue: '#3ad6c0', soft: 'rgba(58,214,192,0.12)', edge: 'rgba(58,214,192,0.34)' },
  health: { hue: '#4fd97e', soft: 'rgba(79,217,126,0.12)', edge: 'rgba(79,217,126,0.34)' },
  wealth: { hue: '#7fa8ff', soft: 'rgba(127,168,255,0.12)', edge: 'rgba(127,168,255,0.34)' },
  fun: { hue: '#b58cff', soft: 'rgba(181,140,255,0.12)', edge: 'rgba(181,140,255,0.34)' },
  love: { hue: '#ff8b9a', soft: 'rgba(255,139,154,0.12)', edge: 'rgba(255,139,154,0.34)' },
}

export function fTone(deptId: DeptId): DeptToneTokens {
  return F_DEPT_TONE[deptId] || F_DEPT_TONE.health
}
