/* Ported from design_handoff_ceoos_pilot_app/design/ceoos-mood.jsx (MoodScreen).
   Wired to real state: useMood() for log/notes/todayMood/logToday/addNote,
   useDepartments() for the "Where it points" department pills. */
import { useEffect, useRef, useState } from 'react'
import { AppBackdrop, StatusBar, BrandRow } from '@/features/chrome'
import { GlassCard, CoachMoment } from '@/design-system'
import { useMood } from '@/state/moodStore'
import { useDepartments } from '@/state/departmentsStore'
import { CEOOS_MOODS } from '@/departments/departments.config'
import type { DeptId } from '@/departments/types'
import { MoodSlider } from './MoodSlider'
import { MoodToast } from './MoodToast'
import { MoodNoteSheet } from './MoodNoteSheet'
import { WeekStrip } from './WeekStrip'

const M_FONT = 'var(--font-primary)'
const M_EYEBROW = { fontFamily: M_FONT, fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase' as const, color: 'var(--text-muted)', fontWeight: 600 as const }

const M_CULTURE = [
  'A depleted culture. Nothing gets led well from here — this is a signal, not a failure.',
  'A cautious culture. You are managing, not leading. Worth asking which Department is draining the others.',
  'A steady culture. Reliable, but rarely the version of you that people remember.',
  'A generous culture. You have capacity for others, and it shows in every Department.',
  'A high-performing culture. Protect it — this is the state you want to be able to repeat.',
]

function ScreenScroll({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '0 var(--ceoos-gutter) 128px', WebkitOverflowScrolling: 'touch' }}>
      {children}
    </div>
  )
}

function SectionHead({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', margin: '26px 0 14px' }}>
      <h2 style={{ fontFamily: M_FONT, fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{title}</h2>
      {action}
    </div>
  )
}

export interface MoodScreenProps {
  onOpenDept: (id: DeptId) => void
}

export function MoodScreen({ onOpenDept }: MoodScreenProps) {
  const { log, notes, todayMood, logToday, addNote } = useMood()
  const { departments } = useDepartments()
  const moods = CEOOS_MOODS

  const [pick, setPick] = useState(todayMood != null ? todayMood : 2)
  const [toast, setToast] = useState(false)
  const [noteOpen, setNoteOpen] = useState(false)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const idx = Math.round(pick)
  const logged = todayMood != null
  const note = notes[0]?.text ?? null
  const rated = log.filter((e) => e.mood != null)
  const avg = rated.length ? rated.reduce((s, e) => s + (e.mood as number), 0) / rated.length : null

  // Mirrors `pick` synchronously (not via React's render cycle) because MoodSlider's
  // notch buttons call onChange(i) immediately followed by onCommit() in the same
  // handler — onCommit's rAF must read the just-chosen value, not the value from the
  // render that scheduled it (setPick hasn't re-rendered yet at that point).
  const idxRef = useRef(idx)
  idxRef.current = idx
  const handlePick = (v: number) => {
    idxRef.current = Math.round(v)
    setPick(v)
  }

  const commit = () => {
    setToast(true)
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(false), 6000)
    requestAnimationFrame(() => logToday(idxRef.current))
  }

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current)
    }
  }, [])

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>
      <AppBackdrop glow="default" />
      <StatusBar />
      <BrandRow
        left={
          <span
            style={{
              fontFamily: M_FONT,
              fontSize: 'var(--ceoos-title)',
              fontWeight: 600,
              color: 'var(--text-primary)',
              letterSpacing: '-0.015em',
              lineHeight: 1.12,
            }}
          >
            My Mood
          </span>
        }
      />
      <ScreenScroll>
        <p style={{ margin: '2px 0 0', fontFamily: M_FONT, fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          Your mood is your internal culture—how you show up in your own world. Keep logging it, the way a staff engagement
          survey tracks a company's. The blindspots and patterns will surface. Some, impossible to ignore.
        </p>

        <SectionHead title={logged ? 'Today — logged' : 'How are you showing up today?'} />
        <MoodSlider value={pick} moods={moods} onChange={handlePick} onCommit={commit} />

        <div style={{ marginTop: 18 }}>
          <GlassCard radius={20} padding={18}>
            <div style={{ ...M_EYEBROW, marginBottom: 8 }}>Your internal culture</div>
            <div style={{ fontFamily: M_FONT, fontSize: 15, color: 'var(--text-primary)', lineHeight: 1.5, fontWeight: 300 }}>{M_CULTURE[idx]}</div>
            {note && (
              <div
                style={{
                  marginTop: 12,
                  paddingTop: 12,
                  borderTop: '1px solid var(--border-subtle)',
                  fontFamily: M_FONT,
                  fontSize: 14,
                  color: 'var(--text-secondary)',
                  lineHeight: 1.5,
                  fontStyle: 'italic',
                }}
              >
                &ldquo;{note}&rdquo;
              </div>
            )}
          </GlassCard>
        </div>

        <SectionHead
          title="This week"
          action={avg != null ? <span style={{ fontFamily: M_FONT, fontSize: 13, color: 'var(--text-muted)' }}>avg {moods[Math.round(avg)]}</span> : null}
        />
        <WeekStrip log={log} moods={moods} />

        <SectionHead title="Where it points" />
        <p style={{ margin: '0 0 14px', fontFamily: M_FONT, fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          When your culture dips, one Department is usually behind it. Pick the one you suspect and open it up with your coach.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 9, marginBottom: 22 }}>
          {departments.map((d) => (
            <button
              key={d.id}
              onClick={() => onOpenDept(d.id)}
              style={{
                padding: '10px 16px',
                borderRadius: 999,
                cursor: 'pointer',
                background: 'var(--surface-card)',
                border: '1px solid var(--border-subtle)',
                fontFamily: M_FONT,
                fontSize: 13.5,
                fontWeight: 500,
                color: 'var(--text-primary)',
                whiteSpace: 'nowrap',
              }}
            >
              {d.label}
            </button>
          ))}
        </div>

        <CoachMoment>
          "Your own mood drives your own internal culture. That is how you show up in your world as CEO of Self."
        </CoachMoment>
      </ScreenScroll>

      <MoodToast
        open={toast}
        label={moods[idx]}
        onAddNote={() => {
          setToast(false)
          setNoteOpen(true)
        }}
        onClose={() => setToast(false)}
      />
      <MoodNoteSheet
        open={noteOpen}
        moodLabel={moods[idx]}
        onClose={() => setNoteOpen(false)}
        onSave={(text) => addNote({ text, at: Date.now(), when: moods[idx] })}
      />
    </div>
  )
}
