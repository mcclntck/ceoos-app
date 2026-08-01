/* Ported verbatim from ceoos-flow.jsx's `reminder` step body — day/time chip
   selection + "Pick a date". */
import { FlowHeader } from './FlowHeader'
import { Scroll } from './Scroll'
import { Chip } from './Chip'
import { fmtDate } from './DatePickerSheet'
import { GlassCard, Button } from '@/design-system'
import type { DepartmentRuntime } from '@/departments/types'

export const F_DAYS = ['Today', 'Tomorrow', 'This weekend']
export const F_TIMES = ['Morning · 8:00', 'Midday · 12:30', 'Evening · 6:30']

const F_H1: React.CSSProperties = {
  fontFamily: 'var(--font-primary)',
  fontSize: 26,
  fontWeight: 400,
  color: 'var(--text-primary)',
  margin: 0,
  letterSpacing: '-0.01em',
  lineHeight: 1.2,
}

export interface ReminderStepProps {
  dept: DepartmentRuntime
  action: string | null
  day: number
  pickedDate: Date | null
  time: number
  onBack: () => void
  onPickDay: (i: number) => void
  onOpenDatePicker: () => void
  onPickTime: (i: number) => void
  onNext: () => void
}

export function ReminderStep({
  dept,
  action,
  day,
  pickedDate,
  time,
  onBack,
  onPickDay,
  onOpenDatePicker,
  onPickTime,
  onNext,
}: ReminderStepProps) {
  return (
    <>
      <FlowHeader dept={dept} onBack={onBack} />
      <Scroll>
        <div style={{ paddingTop: 24 }}>
          <h1 style={{ ...F_H1, marginBottom: 18 }}>When will you do it?</h1>
          <GlassCard radius={20} padding={18} style={{ marginBottom: 24 }}>
            <div
              style={{
                fontFamily: 'var(--font-primary)',
                fontSize: 11,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: 'var(--text-muted)',
                fontWeight: 600,
                marginBottom: 8,
              }}
            >
              Your action
            </div>
            <div style={{ fontFamily: 'var(--font-primary)', fontSize: 17, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.35 }}>
              {action}
            </div>
          </GlassCard>
          <div style={{ fontFamily: 'var(--font-primary)', fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 12 }}>
            Day
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
            {F_DAYS.map((d, i) => (
              <Chip key={d} label={d} selected={!pickedDate && day === i} onClick={() => onPickDay(i)} />
            ))}
            <Chip label={pickedDate ? fmtDate(pickedDate) : 'Pick a date'} selected={!!pickedDate} onClick={onOpenDatePicker} />
          </div>
          <div style={{ fontFamily: 'var(--font-primary)', fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 12 }}>
            Time
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {F_TIMES.map((t, i) => (
              <Chip key={t} label={t} selected={time === i} onClick={() => onPickTime(i)} />
            ))}
          </div>
        </div>
      </Scroll>
      <div style={{ padding: '14px var(--ceoos-gutter) calc(22px + env(safe-area-inset-bottom))', flexShrink: 0 }}>
        <Button
          variant="primary"
          size="lg"
          fullWidth
          iconLeft={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="5" width="18" height="16" rx="3" />
              <path d="M3 9h18M8 3v4M16 3v4" />
            </svg>
          }
          onClick={onNext}
        >
          Add to calendar
        </Button>
      </div>
    </>
  )
}
