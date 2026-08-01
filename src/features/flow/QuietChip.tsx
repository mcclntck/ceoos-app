/* Ported verbatim from ceoos-flow.jsx's QuietChip — quieter selectable pill
   (source uses this for conversational-mode suggestion chips; kept for
   parity/reuse even though this data model's ChatQuestions doesn't need it). */
export interface QuietChipProps {
  label: string
  selected: boolean
  onClick: () => void
}

export function QuietChip({ label, selected, onClick }: QuietChipProps) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '7px 13px',
        borderRadius: 999,
        cursor: 'pointer',
        background: selected ? 'var(--accent-dim)' : 'transparent',
        border: `1px solid ${selected ? 'var(--accent)' : 'var(--border-strong)'}`,
        color: selected ? 'var(--accent)' : 'var(--text-muted)',
        fontFamily: 'var(--font-primary)',
        fontSize: 12.5,
        fontWeight: 500,
        whiteSpace: 'nowrap',
        transition: 'all 150ms ease',
      }}
    >
      {label}
    </button>
  )
}
