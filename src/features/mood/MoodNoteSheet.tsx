/* Ported from design_handoff_ceoos_pilot_app/design/ceoos-mood.jsx (MoodNoteSheet).
   Bottom sheet for adding a short note to today's mood entry. */
import { useEffect, useRef, useState } from 'react'
import { Button } from '@/design-system'

const M_FONT = 'var(--font-primary)'

export interface MoodNoteSheetProps {
  open: boolean
  moodLabel: string
  onClose: () => void
  onSave: (text: string) => void
}

export function MoodNoteSheet({ open, moodLabel, onClose, onSave }: MoodNoteSheetProps) {
  const [text, setText] = useState('')
  const [foc, setFoc] = useState(false)
  const ref = useRef<HTMLTextAreaElement | null>(null)

  useEffect(() => {
    if (open) {
      setText('')
      const t = setTimeout(() => ref.current && ref.current.focus(), 340)
      return () => clearTimeout(t)
    }
  }, [open])

  const can = text.trim().length > 1

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 70, pointerEvents: open ? 'auto' : 'none' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', opacity: open ? 1 : 0, transition: 'opacity 260ms ease' }} />
      <div
        role="dialog"
        aria-label="Add a note about your mood"
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
        <h2 style={{ fontFamily: M_FONT, fontSize: 20, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 6px' }}>
          What's behind &ldquo;{moodLabel}&rdquo;?
        </h2>
        <p style={{ fontFamily: M_FONT, fontSize: 13.5, fontWeight: 300, color: 'var(--text-secondary)', lineHeight: 1.45, margin: '0 0 16px' }}>
          A line is enough. Patterns show up faster when there's context.
        </p>
        <textarea
          ref={ref}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onFocus={() => setFoc(true)}
          onBlur={() => setFoc(false)}
          rows={3}
          placeholder="Today felt…"
          style={{
            width: '100%',
            boxSizing: 'border-box',
            resize: 'none',
            background: 'var(--surface-card)',
            border: `1px solid ${foc ? 'var(--accent)' : 'var(--border-strong)'}`,
            boxShadow: foc ? '0 0 0 3px rgba(202,219,43,0.22)' : 'none',
            borderRadius: 16,
            padding: '14px 16px',
            fontFamily: M_FONT,
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
            disabled={!can}
            onClick={() => {
              if (can) {
                onSave(text.trim())
                onClose()
              }
            }}
          >
            Save note
          </Button>
        </div>
      </div>
    </div>
  )
}
