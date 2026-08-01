/* Full-bleed page backdrop. Fixed to the viewport (not the content column) so the glow
   fills any desktop width while content stays in a readable centred column. */

export type GlowKey =
  | 'hub'
  | 'default'
  | 'warm'
  | 'cool'
  | 'teal'
  | 'dept'
  | 'login'
  | 'onboarding'

export const CEOOS_GLOWS: Record<GlowKey, string> = {
  hub: 'radial-gradient(circle var(--ceoos-glow-size, min(820px, 110vh)) at 50% 30%, #14160c 0%, #000 100%)',
  default: 'radial-gradient(circle var(--ceoos-glow-size, min(820px, 110vh)) at 50% 24%, #14160c 0%, #000 100%)',
  warm: 'radial-gradient(circle var(--ceoos-glow-size, min(820px, 110vh)) at 50% 12%, #17120e 0%, #000 100%)',
  cool: 'radial-gradient(circle var(--ceoos-glow-size, min(820px, 110vh)) at 50% 14%, #0d1018 0%, #000 100%)',
  teal: 'radial-gradient(circle var(--ceoos-glow-size, min(820px, 110vh)) at 50% 12%, #0c1613 0%, #000 100%)',
  dept: 'radial-gradient(circle var(--ceoos-glow-size, min(820px, 110vh)) at 50% 12%, #12160a 0%, #000 100%)',
  login: 'radial-gradient(circle var(--ceoos-glow-size, min(900px, 115vh)) at 50% 22%, #1a1c14 0%, #0a0b08 45%, #000 100%)',
  onboarding: 'radial-gradient(circle var(--ceoos-glow-size, min(900px, 115vh)) at 50% 20%, #16180f 0%, #0a0b08 46%, #000 100%)',
}

export interface AppBackdropProps {
  glow?: GlowKey
  vignette?: boolean
}

export function AppBackdrop({ glow = 'default', vignette = false }: AppBackdropProps) {
  return (
    <div
      aria-hidden="true"
      style={{ position: 'fixed', inset: 0, zIndex: -1, pointerEvents: 'none', background: '#000' }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: CEOOS_GLOWS[glow] || CEOOS_GLOWS.default,
          opacity: 'var(--ceoos-glow-op, 1)',
        }}
      />
      {/* Aurora — a wide neon wash, off by default (ambience tweak). */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 'var(--ceoos-aurora-op, 0)',
          background:
            'radial-gradient(ellipse 120% 60% at 50% 8%, rgba(202,219,43,0.16), rgba(0,0,0,0) 62%), radial-gradient(ellipse 90% 55% at 18% 88%, rgba(90,110,150,0.16), rgba(0,0,0,0) 66%)',
        }}
      />
      {vignette && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg,rgba(0,0,0,0) 55%,rgba(0,0,0,0.5) 100%)',
          }}
        />
      )}
    </div>
  )
}
