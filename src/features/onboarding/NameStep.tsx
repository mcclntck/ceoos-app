/* Step 4 of onboarding — capture the user's first name. Ported from
   ceoos-onboarding.jsx O_STEPS[3] + the `step.input` rendering block in
   OnboardingFlow. Bottom-border text input, large 26px centred text, submits
   on Enter. */
import { useEffect, useRef } from 'react'

const O_FONT = 'var(--font-primary)'

export interface NameStepInputProps {
  name: string
  onChange: (name: string) => void
  onSubmit: () => void
  autoFocus?: boolean
}

export function NameStepInput({ name, onChange, onSubmit, autoFocus = true }: NameStepInputProps) {
  const nameRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!autoFocus) return
    const t = setTimeout(() => nameRef.current?.focus(), 380)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <input
      ref={nameRef}
      value={name}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault()
          onSubmit()
        }
      }}
      placeholder="Your first name"
      autoComplete="given-name"
      enterKeyHint="done"
      style={{
        marginTop: 26,
        alignSelf: 'stretch',
        boxSizing: 'border-box',
        background: 'transparent',
        border: 'none',
        borderBottom: '2px solid var(--accent)',
        boxShadow: '0 6px 18px -14px var(--accent)',
        padding: '10px 2px',
        fontFamily: O_FONT,
        fontSize: 26,
        fontWeight: 300,
        color: 'var(--text-primary)',
        textAlign: 'center',
        outline: 'none',
        caretColor: 'var(--accent)',
      }}
    />
  )
}
