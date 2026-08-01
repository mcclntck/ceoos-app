/* Ported verbatim from ceoos-flow.jsx's DeptBadge — a zoomed-in department
   badge with a perimeter progress ring, used at the top of the intro step. */
import { ORBIT_TONE, ORBIT_ICONS } from '@/departments/departmentTones'
import { fTone } from '@/departments/departmentTones'
import type { DepartmentRuntime } from '@/departments/types'

export interface DeptBadgeProps {
  dept: DepartmentRuntime
  size?: number
  done?: number
  total?: number
}

export function DeptBadge({ dept, size = 62, done = 0, total = 0 }: DeptBadgeProps) {
  const t = fTone(dept.id)
  const tone = ORBIT_TONE[dept.glow] ?? { core: '#151515', edge: 'rgba(255,255,255,0.14)' }
  const icons = ORBIT_ICONS
  const sw = Math.max(3, size * 0.05)
  const r = (size - sw) / 2
  const c = 2 * Math.PI * r
  const pct = total > 0 ? Math.max(0, Math.min(1, done / total)) : 0
  return (
    <span
      style={{
        position: 'relative',
        width: size,
        height: size,
        flexShrink: 0,
        borderRadius: '50%',
        background: `radial-gradient(circle at 50% 34%, ${tone.edge}, ${tone.core} 74%)`,
        boxShadow: `0 0 0 1px ${tone.edge}, 0 6px 22px rgba(0,0,0,0.6), 0 0 26px -4px ${t.soft}`,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)', overflow: 'visible' }}
      >
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.13)" strokeWidth={sw} />
        {pct > 0 && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={t.hue}
            strokeWidth={sw}
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={c * (1 - pct)}
          />
        )}
      </svg>
      <svg
        width={Math.round(size * 0.42)}
        height={Math.round(size * 0.42)}
        viewBox="0 0 24 24"
        fill="none"
        stroke="rgba(233,234,237,0.78)"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {icons[dept.id]}
      </svg>
    </span>
  )
}
