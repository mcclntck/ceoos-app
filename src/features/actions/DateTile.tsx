/* Ported from design_handoff_ceoos_pilot_app/design/ceoos-home.jsx (DateTile).
   Small date/time tile shown at the left of a ReminderCard. */

const A_FONT = 'var(--font-primary)'

const DAY_SHORT: Record<string, string> = { Today: 'TODAY', Tomorrow: 'TMRW', 'This weekend': 'WKND' }

export interface DateTileProps {
  dayLabel: string
  timeLabel: string
}

export function DateTile({ dayLabel, timeLabel }: DateTileProps) {
  const day = DAY_SHORT[dayLabel] || (dayLabel || '').split(' ')[0].toUpperCase()
  const time = (timeLabel || '').split('·')[1]?.trim() || ''
  return (
    <div
      style={{
        width: 50,
        height: 50,
        borderRadius: 13,
        background: 'var(--surface-card-strong)',
        border: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <span style={{ fontFamily: A_FONT, fontSize: 9.5, letterSpacing: '0.08em', color: 'var(--accent)', fontWeight: 700, textTransform: 'uppercase' }}>
        {day}
      </span>
      <span style={{ fontFamily: A_FONT, fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{time}</span>
    </div>
  )
}
