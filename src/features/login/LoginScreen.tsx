/* Ported verbatim from design_handoff_ceoos_pilot_app/design/ceoos-app.jsx (LoginScreen).
   Phased reveal: 0 logo centered · 1 (900ms) logo rises to header · 2 (1700ms) orbit
   appears · 3 (2200ms) tagline + CTA fade in. */
import { useEffect, useState } from 'react'
import { AppBackdrop } from '@/features/chrome'
import { Button } from '@/design-system'
import logoMarkWhite from '@/assets/logo-mark-white.png'
import { IntroOrbit } from './IntroOrbit'

export interface LoginScreenProps {
  onEnter: () => void
}

export function LoginScreen({ onEnter }: LoginScreenProps) {
  const [phase, setPhase] = useState(0) // 0 logo centered · 1 logo up · 2 orbit · 3 content

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 900)
    const t2 = setTimeout(() => setPhase(2), 1700)
    const t3 = setTimeout(() => setPhase(3), 2200)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
    }
  }, [])

  const raised = phase >= 1

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <AppBackdrop glow="login" vignette />
      <style>{`@keyframes ceoOrbitSpin{to{transform:rotate(360deg)}}@keyframes ceoOrbitSpinRev{to{transform:rotate(-360deg)}}`}</style>
      <div style={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* logo — travels from vertical center up to the header */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: raised ? 78 : '50%',
            transform: raised ? 'none' : 'translateY(-50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 10,
            transition: 'top 900ms cubic-bezier(0.16,1,0.3,1), transform 900ms cubic-bezier(0.16,1,0.3,1)',
            zIndex: 6,
          }}
        >
          <img src={logoMarkWhite} style={{ height: 40 }} alt="CEO of Self" />
          <span
            style={{
              color: 'var(--zinc)',
              fontWeight: 600,
              letterSpacing: '0.34em',
              fontSize: 13,
              paddingLeft: '0.34em',
              fontFamily: 'var(--font-primary)',
            }}
          >
            CEO OF SELF
          </span>
        </div>
        {/* orbit sits below the raised logo, vertically centred in the space that's left */}
        <div style={{ position: 'absolute', left: 0, right: 0, top: 'clamp(168px, 26vh, 300px)' }}>
          <IntroOrbit show={phase >= 2} />
        </div>
        <div
          style={{
            marginTop: 'auto',
            padding: '0 var(--ceoos-gutter) calc(40px + env(safe-area-inset-bottom))',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 14,
            opacity: phase >= 3 ? 1 : 0,
            transform: phase >= 3 ? 'none' : 'translateY(16px)',
            transition: 'all 600ms ease',
            zIndex: 6,
          }}
        >
          <p
            style={{
              fontFamily: 'var(--font-primary)',
              fontSize: 'calc(var(--ceoos-body) + 5px)',
              fontWeight: 300,
              color: 'var(--text-primary)',
              textAlign: 'center',
              margin: '0 0 12px',
              lineHeight: 1.35,
              textWrap: 'pretty',
            }}
          >
            The better you lead these five departments,
            <br />
            the better your You will be!
          </p>
          <Button variant="primary" size="lg" fullWidth onClick={onEnter}>
            Log In
          </Button>
        </div>
      </div>
    </div>
  )
}
