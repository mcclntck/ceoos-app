/* Ported verbatim from ceoos-flow.jsx's DatePickerSheet — bottom-sheet
   calendar, Monday-first grid, single-select (closes immediately on pick). */
import { useEffect, useMemo, useState } from 'react'

export const F_MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
export const F_DOW = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

export const fmtDate = (d: Date): string => d.toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short' })

export interface DatePickerSheetProps {
  open: boolean
  value: Date | null
  onClose: () => void
  onSelect: (date: Date) => void
}

export function DatePickerSheet({ open, value, onClose, onSelect }: DatePickerSheetProps) {
  const today = useMemo(() => {
    const t = new Date()
    t.setHours(0, 0, 0, 0)
    return t
  }, [])
  const [cursor, setCursor] = useState(() => new Date((value || today).getFullYear(), (value || today).getMonth(), 1))
  useEffect(() => {
    if (open) setCursor(new Date((value || today).getFullYear(), (value || today).getMonth(), 1))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const y = cursor.getFullYear()
  const m = cursor.getMonth()
  const lead = (new Date(y, m, 1).getDay() + 6) % 7 // Monday-first
  const days = new Date(y, m + 1, 0).getDate()
  const cells: (Date | null)[] = [...Array(lead).fill(null), ...Array.from({ length: days }, (_, i) => new Date(y, m, i + 1))]
  const same = (a: Date | null, b: Date | null) => !!a && !!b && a.toDateString() === b.toDateString()
  const atMonthStart = y === today.getFullYear() && m === today.getMonth()

  const navBtn = (dir: -1 | 1, label: string, disabled: boolean) => (
    <button
      onClick={() => setCursor(new Date(y, m + dir, 1))}
      disabled={disabled}
      aria-label={label}
      style={{
        width: 44,
        height: 44,
        borderRadius: '50%',
        border: '1px solid var(--border-strong)',
        background: 'none',
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.35 : 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="var(--text-primary)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ transform: dir < 0 ? 'none' : 'rotate(180deg)' }}
      >
        <path d="M15 18l-6-6 6-6" />
      </svg>
    </button>
  )

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 70, pointerEvents: open ? 'auto' : 'none' }}>
      <div
        onClick={onClose}
        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', opacity: open ? 1 : 0, transition: 'opacity 260ms ease' }}
      />
      <div
        role="dialog"
        aria-label="Choose a date"
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          background: '#0a0a0a',
          borderTop: '1px solid var(--border-subtle)',
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          padding: '14px 22px calc(30px + env(safe-area-inset-bottom))',
          transform: open ? 'translateY(0)' : 'translateY(105%)',
          transition: 'transform 320ms cubic-bezier(0.16,1,0.3,1)',
        }}
      >
        <div style={{ width: 40, height: 4, borderRadius: 2, background: 'var(--border-strong)', margin: '0 auto 18px' }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 14 }}>
          {navBtn(-1, 'Previous month', atMonthStart)}
          <span style={{ fontFamily: 'var(--font-primary)', fontSize: 17, fontWeight: 600, color: 'var(--text-primary)' }}>
            {F_MONTHS[m]} {y}
          </span>
          {navBtn(1, 'Next month', false)}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 6 }}>
          {F_DOW.map((d, i) => (
            <div
              key={i}
              style={{ textAlign: 'center', fontFamily: 'var(--font-primary)', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.06em' }}
            >
              {d}
            </div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
          {cells.map((d, i) => {
            if (!d) return <div key={i} />
            const past = d < today
            const sel = same(d, value)
            return (
              <button
                key={i}
                disabled={past}
                onClick={() => {
                  onSelect(d)
                  onClose()
                }}
                style={{
                  height: 44,
                  borderRadius: 12,
                  border: same(d, today) && !sel ? '1px solid var(--border-strong)' : '1px solid transparent',
                  background: sel ? 'var(--accent)' : 'none',
                  color: sel ? 'var(--text-on-accent)' : past ? 'var(--text-muted)' : 'var(--text-primary)',
                  opacity: past ? 0.35 : 1,
                  cursor: past ? 'default' : 'pointer',
                  fontFamily: 'var(--font-primary)',
                  fontSize: 15,
                  fontWeight: sel ? 700 : 500,
                  transition: 'background 140ms ease',
                }}
              >
                {d.getDate()}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
