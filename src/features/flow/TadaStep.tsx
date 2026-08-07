/* Ported verbatim from ceoos-flow.jsx's `tada` step body — "Followed
   through" celebration screen with floating spark particles. */
import { SparkleIcon, Button } from '@/design-system'
import type { DepartmentRuntime } from '@/departments/types'

const F_EYEBROW: React.CSSProperties = {
  fontFamily: 'var(--font-primary)',
  fontSize: 11,
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  color: 'var(--text-muted)',
  fontWeight: 600,
}

const F_H1: React.CSSProperties = {
  fontFamily: 'var(--font-primary)',
  fontSize: 26,
  fontWeight: 400,
  color: 'var(--text-primary)',
  margin: 0,
  letterSpacing: '-0.01em',
  lineHeight: 1.2,
}

const SPARK_PARTICLES = [
  { x: 14, y: 20, s: 16, d: 0.1, t: 3.4 },
  { x: 78, y: 15, s: 12, d: 0.9, t: 4.2 },
  { x: 30, y: 68, s: 10, d: 1.6, t: 3.8 },
  { x: 84, y: 58, s: 20, d: 0.5, t: 4.6 },
  { x: 8, y: 46, s: 9, d: 2.2, t: 3.2 },
  { x: 62, y: 78, s: 14, d: 1.2, t: 4.0 },
  { x: 46, y: 8, s: 8, d: 2.6, t: 3.6 },
  { x: 90, y: 86, s: 11, d: 1.9, t: 4.4 },
]

export interface TadaStepProps {
  dept: DepartmentRuntime
  onNext: () => void
}

export function TadaStep({ dept, onNext }: TadaStepProps) {
  return (
    <>
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        {SPARK_PARTICLES.map((p, k) => (
          <span
            key={k}
            style={{ position: 'absolute', left: `${p.x}%`, top: `${p.y}%`, opacity: 0, animation: `ceoSparkFloat ${p.t}s ease-in-out ${p.d}s infinite` }}
          >
            <SparkleIcon size={p.s} color="var(--accent)" />
          </span>
        ))}
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '0 32px', textAlign: 'center', position: 'relative' }}>
        <div style={{ marginBottom: 24, animation: 'ceoTada 700ms cubic-bezier(0.16,1,0.3,1), ceoSpin 4s cubic-bezier(0.4,0,0.25,1) 0.2s 1 forwards' }}>
          <SparkleIcon size={64} color="var(--accent)" />
        </div>
        <div style={{ ...F_EYEBROW, marginBottom: 12 }}>Followed through</div>
        <h1 style={{ ...F_H1, marginBottom: 14 }}>You led your {dept.label.toLowerCase()}.</h1>
        <p style={{ fontFamily: 'var(--font-primary)', fontSize: 15.5, fontWeight: 300, color: 'var(--text-secondary)', lineHeight: 1.5, maxWidth: 300 }}>
          Following through is how a Department pulls closer to you. Not a trend, not a hack — leadership.
        </p>
      </div>
      <div style={{ padding: '14px var(--ceoos-gutter) calc(22px + env(safe-area-inset-bottom))', flexShrink: 0 }}>
        <Button variant="primary" size="lg" fullWidth onClick={onNext}>
          Log how I feel
        </Button>
      </div>
      <style>{`@keyframes ceoTada{0%{opacity:0;transform:scale(0.4) rotate(-12deg)}60%{transform:scale(1.15) rotate(6deg)}100%{opacity:1;transform:scale(1) rotate(0)}}@keyframes ceoSpin{from{transform:rotate(0)}to{transform:rotate(360deg)}}@keyframes ceoSparkFloat{0%{opacity:0;transform:scale(0.5) rotate(-20deg)}25%{opacity:0.5}50%{opacity:0.28;transform:scale(1) rotate(10deg)}75%{opacity:0.42}100%{opacity:0;transform:scale(0.6) rotate(30deg)}}`}</style>
    </>
  )
}
