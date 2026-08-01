import type { CSSProperties } from 'react'

export interface TabBarItem {
  key: string
  label: string
  icon: 'home' | 'plan' | 'reflect' | 'coach'
}

export interface TabBarProps {
  items?: TabBarItem[]
  active: string
  onChange?: (key: string) => void
  floating?: boolean
  style?: CSSProperties
}

/* Lucide icon path data (MIT) — thin rounded line icons matching the CEOOS UI. */
const ICONS: Record<TabBarItem['icon'], string> = {
  home: 'M3 9.5 12 3l9 6.5M5 10v10h14V10',
  plan: 'M3 6h11M3 12h11M3 18h11M18.5 5.5 20 7l2.5-3M18.5 11.5 20 13l2.5-3M18.5 17.5 20 19l2.5-3',
  reflect: 'M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8zM14 3v5h5',
  coach: 'M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM3 20a6 6 0 0 1 12 0M17 8a3 3 0 0 1 0 6M19 6a5 5 0 0 1 0 10',
}

function TabIcon({ name, color }: { name: TabBarItem['icon']; color: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d={ICONS[name] || ICONS.home} />
    </svg>
  )
}

const DEFAULT_ITEMS: TabBarItem[] = [
  { key: 'home', label: 'Home', icon: 'home' },
  { key: 'plan', label: 'Plan', icon: 'plan' },
  { key: 'reflect', label: 'Reflect', icon: 'reflect' },
  { key: 'coach', label: 'Coach', icon: 'coach' },
]

/** Bottom navigation. Active item = neon glyph + underline. */
export function TabBar({ items = DEFAULT_ITEMS, active, onChange = () => {}, floating = true, style }: TabBarProps) {
  return (
    <nav
      style={{
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        padding: '12px 8px 14px',
        background: 'var(--surface-glass)',
        backdropFilter: 'blur(var(--blur-chrome))',
        WebkitBackdropFilter: 'blur(var(--blur-chrome))',
        border: '1px solid var(--border-subtle)',
        borderRadius: floating ? 'var(--radius-lg)' : 0,
        ...style,
      }}
    >
      {items.map((t) => {
        const on = t.key === active
        const color = on ? 'var(--accent)' : 'var(--text-muted)'
        return (
          <button
            key={t.key}
            onClick={() => onChange(t.key)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 5,
              fontFamily: 'var(--font-primary)',
              fontSize: 12,
              fontWeight: on ? 600 : 500,
              color,
              padding: '2px 10px',
            }}
          >
            <TabIcon name={t.icon} color={color} />
            <span>{t.label}</span>
            <span
              style={{
                width: 16,
                height: 2,
                borderRadius: 2,
                background: 'var(--accent)',
                transform: on ? 'scaleX(1)' : 'scaleX(0)',
                transition: 'transform var(--dur-fast)',
              }}
            />
          </button>
        )
      })}
    </nav>
  )
}
