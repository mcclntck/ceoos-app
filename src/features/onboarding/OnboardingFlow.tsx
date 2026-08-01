/* Ported from design_handoff_ceoos_pilot_app/design/ceoos-onboarding.jsx
   (OStepDots + OnboardingFlow). 4-step flow: privacy -> departments -> coach -> name.

   Product rule (README): "Skip intro" jumps to the NAME step, not out of
   onboarding entirely, and is hidden on the name step itself. The name is
   mandatory — Continue stays disabled until one is entered. */
import { useState } from 'react'
import { AppBackdrop, StatusBar } from '@/features/chrome'
import { Button } from '@/design-system'
import { O_STEPS } from './steps'
import { NameStepInput } from './NameStep'

const O_FONT = 'var(--font-primary)'
const O_EYEBROW: React.CSSProperties = {
  fontFamily: O_FONT,
  fontSize: 11,
  letterSpacing: '0.2em',
  textTransform: 'uppercase',
  color: 'var(--accent)',
  fontWeight: 700,
}

interface OStepDotsProps {
  i: number
  n: number
}

function OStepDots({ i, n }: OStepDotsProps) {
  return (
    <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
      {Array.from({ length: n }).map((_, k) => (
        <span
          key={k}
          style={{
            width: k === i ? 22 : 8,
            height: 8,
            borderRadius: 999,
            background: k === i ? 'var(--accent)' : 'var(--border-strong)',
            transition: 'all 260ms ease',
          }}
        />
      ))}
    </div>
  )
}

export interface OnboardingFlowProps {
  onDone: (name: string) => void
}

export function OnboardingFlow({ onDone }: OnboardingFlowProps) {
  const [i, setI] = useState(0)
  const [name, setName] = useState('')
  const step = O_STEPS[i]
  const last = i === O_STEPS.length - 1
  const blocked = !!step.input && name.trim().length === 0

  const next = () => {
    if (blocked) return
    if (last) onDone(name.trim())
    else setI(i + 1)
  }

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>
      <AppBackdrop glow="onboarding" />
      <StatusBar />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px var(--ceoos-gutter) 0' }}>
        <OStepDots i={i} n={O_STEPS.length} />
      </div>

      <div
        key={step.key}
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          overflowX: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          padding: '0 var(--ceoos-gutter)',
          textAlign: 'center',
          animation: 'obFade 460ms ease',
        }}
      >
        <div style={{ margin: 'auto 0', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {step.art && (
            <div style={{ width: '100%', marginBottom: 'clamp(16px, 3vh, 34px)', display: 'flex', justifyContent: 'center' }}>
              {step.art}
            </div>
          )}
          <div style={{ ...O_EYEBROW, marginBottom: 14 }}>{step.eyebrow}</div>
          {step.title && (
            <h1
              style={{
                fontFamily: O_FONT,
                fontSize: 'calc(var(--ceoos-title) + 3px)',
                fontWeight: 300,
                color: 'var(--text-primary)',
                lineHeight: 1.18,
                margin: '0 0 16px',
                textWrap: 'pretty',
              }}
            >
              {step.title}
            </h1>
          )}
          <p
            style={{
              fontFamily: O_FONT,
              fontSize: 'var(--ceoos-body)',
              fontWeight: 300,
              color: 'var(--text-secondary)',
              lineHeight: 1.55,
              margin: 0,
              width: '100%',
              textWrap: 'pretty',
            }}
          >
            {step.body}
          </p>
          {step.input && <NameStepInput name={name} onChange={setName} onSubmit={next} />}
          {step.points && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                marginTop: 24,
                alignSelf: 'center',
                alignItems: 'flex-start',
                maxWidth: 360,
                width: '100%',
              }}
            >
              {step.points.map((p) => (
                <div key={p} style={{ display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left' }}>
                  <span
                    style={{
                      width: 22,
                      height: 22,
                      flexShrink: 0,
                      borderRadius: '50%',
                      background: 'rgba(202,219,43,0.14)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  </span>
                  <span style={{ fontFamily: O_FONT, fontSize: 14.5, color: 'var(--text-primary)', lineHeight: 1.35 }}>{p}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div
        style={{
          padding: '0 var(--ceoos-gutter) calc(34px + env(safe-area-inset-bottom))',
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 4,
        }}
      >
        <Button variant="primary" size="lg" fullWidth disabled={blocked} onClick={next}>
          {last ? "Let's get started!" : 'Continue'}
        </Button>
        {!last && (
          <button
            onClick={() => setI(O_STEPS.length - 1)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              minHeight: 44,
              padding: '0 16px',
              fontFamily: O_FONT,
              fontSize: 14,
              fontWeight: 600,
              color: 'var(--text-muted)',
            }}
          >
            Skip intro
          </button>
        )}
      </div>
      <style>{`@keyframes obFade{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}`}</style>
    </div>
  )
}
