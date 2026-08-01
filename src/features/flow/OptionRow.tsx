/* Ported verbatim from ceoos-flow.jsx's OptionRow — full-width radio-style
   selectable row used on the action/recommend steps. */
export interface OptionRowProps {
  label: string
  selected: boolean
  onClick: () => void
}

export function OptionRow({ label, selected, onClick }: OptionRowProps) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%',
        textAlign: 'left',
        cursor: 'pointer',
        marginBottom: 12,
        padding: '18px 20px',
        borderRadius: 18,
        background: selected ? 'var(--accent-dim)' : 'var(--surface-card)',
        border: selected ? '1px solid var(--accent)' : '1px solid var(--border-subtle)',
        color: 'var(--text-primary)',
        fontFamily: 'var(--font-primary)',
        fontSize: 16.5,
        fontWeight: selected ? 600 : 500,
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        transition: 'background 180ms ease, border-color 180ms ease',
      }}
    >
      <span
        style={{
          width: 22,
          height: 22,
          flexShrink: 0,
          borderRadius: '50%',
          border: selected ? '6px solid var(--accent)' : '2px solid var(--steel)',
          boxSizing: 'border-box',
          transition: 'border 180ms ease',
        }}
      />
      <span style={{ lineHeight: 1.3 }}>{label}</span>
    </button>
  )
}
