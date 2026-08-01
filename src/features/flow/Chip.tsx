/* Ported verbatim from ceoos-flow.jsx's Chip — used for day/time selection. */
export interface ChipProps {
  label: string
  selected: boolean
  onClick: () => void
}

export function Chip({ label, selected, onClick }: ChipProps) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '12px 18px',
        borderRadius: 999,
        cursor: 'pointer',
        background: selected ? 'var(--accent)' : 'var(--surface-card)',
        border: selected ? '1px solid var(--accent)' : '1px solid var(--border-subtle)',
        color: selected ? 'var(--text-on-accent)' : 'var(--text-primary)',
        fontFamily: 'var(--font-primary)',
        fontSize: 14.5,
        fontWeight: selected ? 700 : 500,
        transition: 'all 160ms ease',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </button>
  )
}
