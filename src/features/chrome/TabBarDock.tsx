/* App-specific bottom tab bar (Departments/My Actions/Mood) with the custom planet
   glyph. Mirrors the DS TabBar styling but this is the one actually wired into the
   real screens — the generic design-system/TabBar.tsx is unused by the app. */

export type TabKey = 'departments' | 'plan' | 'mood'

interface TabDef {
  key: TabKey
  label: string
  icon: 'planet' | 'plan' | 'mood'
}

const TABS: TabDef[] = [
  { key: 'departments', label: 'Departments', icon: 'planet' },
  { key: 'plan', label: 'My Actions', icon: 'plan' },
  { key: 'mood', label: 'Mood', icon: 'mood' },
]

const TAB_ICON_PATHS: Record<'plan' | 'mood', string> = {
  plan: 'M3 6h11M3 12h11M3 18h11M18.5 5.5 20 7l2.5-3M18.5 11.5 20 13l2.5-3M18.5 17.5 20 19l2.5-3',
  mood: 'M15.182 15.182a4.5 4.5 0 0 1-6.364 0M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Z',
}

function TabGlyph({ name, color }: { name: TabDef['icon']; color: string }) {
  if (name === 'planet') {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18.816 13.58c2.292 2.138 3.546 4 3.092 4.9c-.745 1.46-5.783-.259-11.255-3.838c-5.47-3.579-9.304-7.664-8.56-9.123c.464-.91 2.926-.444 5.803.805" />
        <circle cx="12" cy="12" r="7" />
      </svg>
    )
  }
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d={TAB_ICON_PATHS[name] || TAB_ICON_PATHS.plan} />
    </svg>
  )
}

export interface CeoTabBarProps {
  active: TabKey
  onChange: (key: TabKey) => void
}

/* Mirrors the DS TabBar styling but allows the custom planet glyph. */
export function CeoTabBar({ active, onChange }: CeoTabBarProps) {
  return (
    <nav
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        padding: '12px 8px 14px',
        background: 'var(--surface-glass)',
        backdropFilter: 'blur(var(--blur-chrome))',
        WebkitBackdropFilter: 'blur(var(--blur-chrome))',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
      }}
    >
      {TABS.map((t) => {
        const on = t.key === active
        const color = on ? 'var(--accent)' : 'var(--text-muted)'
        return (
          <button
            key={t.key}
            onClick={() => onChange(t.key)}
            style={{
              flex: 1,
              minHeight: 48,
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
              padding: '2px 4px',
            }}
          >
            <TabGlyph name={t.icon} color={color} />
            <span>{t.label}</span>
            <span style={{ width: on ? 16 : 0, height: 2, borderRadius: 2, background: 'var(--accent)', transition: 'width var(--dur-fast)' }} />
          </button>
        )
      })}
    </nav>
  )
}

export interface TabBarDockProps {
  active: TabKey
  onChange: (key: TabKey) => void
}

export function TabBarDock({ active, onChange }: TabBarDockProps) {
  return (
    <div
      style={{
        position: 'absolute',
        left: 'var(--ceoos-gutter-sm)',
        right: 'var(--ceoos-gutter-sm)',
        bottom: 'calc(18px + env(safe-area-inset-bottom))',
        zIndex: 20,
      }}
    >
      <CeoTabBar active={active} onChange={onChange} />
    </div>
  )
}
