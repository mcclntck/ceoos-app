/* Bottom-sheet "Note to self" — ported exactly from ceoos-orbit.jsx's NoteSheet.
   Manages its own textarea/focus state locally (ui-local per the plan — notes
   persistence is NOT part of the state layer); a parent supplies `notes`/`onSave`
   so it can eventually be persisted, but an empty array + no-op works today. */
import { useEffect, useRef, useState } from 'react'
import { Button } from '@/design-system'

export interface OrbitNote {
  text: string
  at: number
  when: string
}

export interface NoteSheetProps {
  open: boolean
  notes: OrbitNote[]
  onSave: (text: string) => void
  onClose: () => void
}

export function NoteSheet({ open, notes, onSave, onClose }: NoteSheetProps) {
  const [text, setText] = useState('')
  const [focused, setFocused] = useState(false)
  const ref = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (open) {
      setText('')
      const t = setTimeout(() => ref.current?.focus(), 340)
      return () => clearTimeout(t)
    }
  }, [open])

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 60, pointerEvents: open ? 'auto' : 'none' }}>
      <div
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,0.6)',
          opacity: open ? 1 : 0,
          transition: 'opacity 260ms ease',
        }}
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
          padding: '14px 22px 30px',
          transform: open ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 320ms cubic-bezier(0.16,1,0.3,1)',
        }}
      >
        <div style={{ width: 40, height: 4, borderRadius: 2, background: 'var(--border-strong)', margin: '0 auto 18px' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4z" />
          </svg>
          <h2 style={{ fontFamily: 'var(--font-primary)', fontSize: 20, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Note to self</h2>
        </div>
        <p style={{ fontFamily: 'var(--font-primary)', fontSize: 13.5, fontWeight: 300, color: 'var(--text-secondary)', lineHeight: 1.45, margin: '0 0 16px' }}>
          CEO&rsquo;s need reflection and planning time too. Be sure to lean back and look around occasionally. Assess your culture, your leadership and ultimately your performance as leader of this organization!
        </p>
        <textarea
          ref={ref}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          rows={4}
          placeholder="What's on your mind right now?"
          style={{
            width: '100%',
            boxSizing: 'border-box',
            resize: 'none',
            background: 'var(--surface-card)',
            border: `1px solid ${focused ? 'var(--accent)' : 'var(--border-strong)'}`,
            boxShadow: focused ? '0 0 0 3px rgba(202,219,43,0.22)' : 'none',
            borderRadius: 16,
            padding: '14px 16px',
            fontFamily: 'var(--font-primary)',
            fontSize: 16,
            color: 'var(--text-primary)',
            lineHeight: 1.5,
            outline: 'none',
            transition: 'border-color 160ms ease, box-shadow 160ms ease',
          }}
        />
        <div style={{ marginTop: 16 }}>
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={() => {
              const t = text.trim()
              if (t) {
                onSave(t)
                setText('')
              }
              onClose()
            }}
          >
            Save note
          </Button>
        </div>
        {notes.length > 0 && (
          <div style={{ marginTop: 22 }}>
            <div style={{ fontFamily: 'var(--font-primary)', fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 10 }}>
              Earlier notes
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 190, overflowY: 'auto' }}>
              {notes.map((n) => (
                <div key={n.at} style={{ background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', borderRadius: 16, padding: '13px 15px' }}>
                  <div style={{ fontFamily: 'var(--font-primary)', fontSize: 11.5, color: 'var(--text-muted)', marginBottom: 5 }}>{n.when}</div>
                  <div style={{ fontFamily: 'var(--font-primary)', fontSize: 14.5, fontWeight: 300, color: 'var(--text-primary)', lineHeight: 1.45, whiteSpace: 'pre-wrap' }}>
                    {n.text}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
