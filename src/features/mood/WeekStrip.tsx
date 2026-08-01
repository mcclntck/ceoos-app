/* Ported from design_handoff_ceoos_pilot_app/design/ceoos-mood.jsx (WeekStrip). */
import type { MoodDay } from '@/state/moodStore'
import { M_TONE } from './MoodSlider'

const M_FONT = 'var(--font-primary)'

export interface WeekStripProps {
  log: MoodDay[]
  moods: readonly string[]
}

export function WeekStrip({ log }: WeekStripProps) {
  return (
    <div style={{ display: 'flex', gap: 7 }}>
      {log.map((e) => {
        const has = e.mood != null
        return (
          <div key={e.day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: '100%',
                height: 78,
                borderRadius: 12,
                background: 'var(--surface-card)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                overflow: 'hidden',
              }}
            >
              {has && (
                <div
                  style={{
                    height: `${20 + (e.mood as number) * 20}%`,
                    background: M_TONE[e.mood as number],
                    opacity: 0.85,
                    borderRadius: '8px 8px 11px 11px',
                  }}
                />
              )}
            </div>
            <span style={{ fontFamily: M_FONT, fontSize: 11, fontWeight: 600, color: has ? 'var(--text-secondary)' : 'var(--text-muted)' }}>{e.day}</span>
          </div>
        )
      })}
    </div>
  )
}
