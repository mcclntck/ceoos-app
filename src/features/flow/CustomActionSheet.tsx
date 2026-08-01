/* Ported verbatim from ceoos-flow.jsx's CustomActionSheet — bottom sheet for
   writing a custom action. */
import { useEffect, useRef, useState } from 'react'
import { Button } from '@/design-system'

export interface CustomActionSheetProps {
  open: boolean
  onClose: () => void
  onSave: (text: string) => void
}

export function CustomActionSheet({ open, onClose, onSave }: CustomActionSheetProps) {
  const [text, setText] = useState('')
  useEffect(() => {
    if (open) setText('')
  }, [open])
  const can = text.trim().length > 2
  const [foc, setFoc] = useState(false)
  const ref = useRef<HTMLTextAreaElement | null>(null)
  useEffect(() => {
    if (open) {
      const t = setTimeout(() => ref.current && ref.current.focus(), 340)
      return () => clearTimeout(t)
    }
    return undefined
  }, [open])

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 70, pointerEvents: open ? 'auto' : 'none' }}>
      <div
        onClick={onClose}
        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', opacity: open ? 1 : 0, transition: 'opacity 260ms ease' }}
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
          transform: open ? 'translateY(0)' : 'translateY(105%)',
          transition: 'transform 320ms cubic-bezier(0.16,1,0.3,1)',
        }}
      >
        <div style={{ width: 40, height: 4, borderRadius: 2, background: 'var(--border-strong)', margin: '0 auto 18px' }} />
        <h2 style={{ fontFamily: 'var(--font-primary)', fontSize: 20, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 6px' }}>
          Write your own action
        </h2>
        <p style={{ fontFamily: 'var(--font-primary)', fontSize: 13.5, fontWeight: 300, color: 'var(--text-secondary)', lineHeight: 1.45, margin: '0 0 16px' }}>
          Keep it small and real — something you could do this week.
        </p>
        <textarea
          ref={ref}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onFocus={() => setFoc(true)}
          onBlur={() => setFoc(false)}
          rows={3}
          placeholder="I will…"
          style={{
            width: '100%',
            boxSizing: 'border-box',
            resize: 'none',
            background: 'var(--surface-card)',
            border: `1px solid ${foc ? 'var(--accent)' : 'var(--border-strong)'}`,
            boxShadow: foc ? '0 0 0 3px rgba(202,219,43,0.22)' : 'none',
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
            disabled={!can}
            onClick={() => {
              if (can) {
                onSave(text.trim())
                onClose()
              }
            }}
          >
            Save action
          </Button>
        </div>
      </div>
    </div>
  )
}
