/* Ported from design_handoff_ceoos_pilot_app/design/ceoos-home.jsx (AddActionSheet). */
import { useEffect, useRef, useState } from 'react'
import { Button } from '@/design-system'
import type { DepartmentRuntime } from '@/departments/types'
import type { DeptId, Plan } from '@/departments/types'

const A_FONT = 'var(--font-primary)'
const A_EYEBROW = { fontFamily: A_FONT, fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase' as const, color: 'var(--text-muted)', fontWeight: 600 as const }

const A_DEPT_HUE: Record<DeptId, string> = { career: '#3ad6c0', health: '#4fd97e', wealth: '#7fa8ff', fun: '#b58cff', love: '#ff8b9a' }

export const WHEN_OPTIONS = [
  { day: 'Today', time: 'Morning · 8:00' },
  { day: 'Today', time: 'Evening · 6:30' },
  { day: 'Tomorrow', time: 'Morning · 8:00' },
  { day: 'This week', time: 'Anytime' },
]

export interface AddActionSheetProps {
  open: boolean
  departments: DepartmentRuntime[]
  defaultDeptId?: DeptId | null
  onClose: () => void
  onAdd: (plan: Plan) => void
}

export function AddActionSheet({ open, departments, defaultDeptId, onClose, onAdd }: AddActionSheetProps) {
  const [deptId, setDeptId] = useState<DeptId | undefined>(defaultDeptId || departments[0]?.id)
  const [text, setText] = useState('')
  const [when, setWhen] = useState(0)
  const [focused, setFocused] = useState(false)
  const [err, setErr] = useState(false)
  const taRef = useRef<HTMLTextAreaElement | null>(null)

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => taRef.current && taRef.current.focus(), 340)
      return () => clearTimeout(t)
    }
  }, [open])

  useEffect(() => {
    if (open) {
      setDeptId(defaultDeptId || departments[0]?.id)
      setText('')
      setWhen(0)
      setErr(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, defaultDeptId])

  const valid = text.trim().length > 0 && !!deptId

  const submit = () => {
    if (!valid || !deptId) {
      setErr(true)
      if (taRef.current) taRef.current.focus()
      return
    }
    const w = WHEN_OPTIONS[when]
    onAdd({ deptId, action: text.trim(), dayLabel: w.day, timeLabel: w.time, done: false, mood: null })
    onClose()
  }

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 60, pointerEvents: open ? 'auto' : 'none' }}>
      <div
        onClick={onClose}
        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.65)', opacity: open ? 1 : 0, transition: 'opacity 260ms ease' }}
      />
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          background: '#0a0a0a',
          borderTop: '1px solid var(--border-subtle)',
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          padding: '14px 22px 28px',
          transform: open ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 320ms cubic-bezier(0.16,1,0.3,1)',
        }}
      >
        <div style={{ width: 40, height: 4, borderRadius: 2, background: 'var(--border-strong)', margin: '0 auto 18px' }} />
        <h2 style={{ fontFamily: A_FONT, fontSize: 20, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 6px' }}>Add an action</h2>
        <p style={{ fontFamily: A_FONT, fontSize: 13.5, fontWeight: 300, color: 'var(--text-secondary)', lineHeight: 1.45, margin: '0 0 16px' }}>
          One thing you'll actually do. Pick the Dept it belongs to and name it plainly.
        </p>

        <div style={{ ...A_EYEBROW, marginBottom: 9 }}>Department</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 18 }}>
          {departments.map((d) => {
            const on = d.id === deptId
            return (
              <button
                key={d.id}
                onClick={() => setDeptId(d.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 7,
                  padding: '9px 14px',
                  borderRadius: 999,
                  cursor: 'pointer',
                  background: on ? 'var(--accent)' : 'var(--surface-card)',
                  border: `1px solid ${on ? 'var(--accent)' : 'var(--border-subtle)'}`,
                  color: on ? 'var(--text-on-accent)' : 'var(--text-secondary)',
                  fontFamily: A_FONT,
                  fontSize: 13.5,
                  fontWeight: on ? 700 : 500,
                  transition: 'all 160ms ease',
                }}
              >
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: on ? 'var(--text-on-accent)' : A_DEPT_HUE[d.id] || 'var(--text-muted)' }} />
                {d.label}
              </button>
            )
          })}
        </div>

        <div style={{ ...A_EYEBROW, marginBottom: 9 }}>What will you do?</div>
        <textarea
          ref={taRef}
          value={text}
          onChange={(e) => {
            setText(e.target.value)
            if (err) setErr(false)
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          rows={3}
          placeholder="e.g. Book the conversation I've been avoiding"
          style={{
            width: '100%',
            boxSizing: 'border-box',
            resize: 'none',
            background: 'var(--surface-card)',
            border: `1px solid ${err ? '#ff8b9a' : focused ? 'var(--accent)' : 'var(--border-strong)'}`,
            boxShadow: focused && !err ? '0 0 0 3px rgba(202,219,43,0.22)' : err ? '0 0 0 3px rgba(255,139,154,0.18)' : 'none',
            borderRadius: 16,
            padding: '14px 16px',
            fontFamily: A_FONT,
            fontSize: 16,
            color: 'var(--text-primary)',
            lineHeight: 1.5,
            outline: 'none',
            marginBottom: 8,
            transition: 'border-color 160ms ease, box-shadow 160ms ease',
          }}
        />
        <div style={{ fontFamily: A_FONT, fontSize: 12.5, color: err ? '#ff8b9a' : 'var(--text-muted)', marginBottom: 18 }}>
          {err ? "Name the action before you add it — one concrete step." : 'Required — keep it to one concrete step.'}
        </div>

        <div style={{ ...A_EYEBROW, marginBottom: 9 }}>When</div>
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, marginBottom: 18, scrollbarWidth: 'none' }}>
          {WHEN_OPTIONS.map((w, i) => {
            const on = i === when
            return (
              <button
                key={i}
                onClick={() => setWhen(i)}
                style={{
                  padding: '9px 14px',
                  borderRadius: 999,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  background: on ? 'var(--accent)' : 'var(--surface-card)',
                  border: `1px solid ${on ? 'var(--accent)' : 'var(--border-subtle)'}`,
                  color: on ? 'var(--text-on-accent)' : 'var(--text-secondary)',
                  fontFamily: A_FONT,
                  fontSize: 13,
                  fontWeight: on ? 700 : 500,
                }}
              >
                {w.day} · {w.time.replace(' · ', ' ')}
              </button>
            )
          })}
        </div>

        <Button variant="primary" size="lg" fullWidth onClick={submit}>
          Add action
        </Button>
      </div>
    </div>
  )
}
