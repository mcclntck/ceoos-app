/* The "You" center hub — ported exactly from ceoos-orbit.jsx's `You` component.
   104px circle + a 186px breathing halo behind it (9s ease-in-out, opacity .45<->.7,
   scale 1<->1.04) — the ONLY idle motion on the orbit screen. `prefers-reduced-motion`
   is respected via the static `.ceoos-halo` CSS rule in styles/global.css. */
import { CX, CY, YOU_SIZE } from './orbitGeometry'

export interface YouHubProps {
  onClick: () => void
  sizeMul?: number
  halo?: boolean
}

export function YouHub({ onClick, sizeMul = 1, halo = true }: YouHubProps) {
  const size = Math.round(YOU_SIZE * sizeMul)
  const haloSize = Math.round(186 * sizeMul)

  return (
    <>
      <div
        className={halo ? 'ceoos-halo' : undefined}
        style={{
          position: 'absolute',
          left: CX,
          top: CY,
          width: haloSize,
          height: haloSize,
          transform: 'translate(-50%,-50%)',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(202,219,43,0.10), rgba(202,219,43,0) 68%)',
          pointerEvents: 'none',
          zIndex: 1,
          animation: halo ? 'ceoos-halo 9s ease-in-out infinite' : 'none',
          opacity: halo ? 1 : 0.55,
        }}
      />
      <button
        onClick={onClick}
        style={{
          position: 'absolute',
          left: CX,
          top: CY,
          transform: 'translate(-50%,-50%)',
          width: size,
          height: size,
          borderRadius: '50%',
          border: 'none',
          cursor: 'pointer',
          background:
            'radial-gradient(circle at 50% 44%, rgba(190,200,165,0.5), rgba(202,219,43,0.12) 55%, rgba(20,20,20,0) 76%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontFamily: 'var(--font-primary)',
          fontSize: Math.round(27 * sizeMul),
          fontWeight: 700,
          letterSpacing: '-0.01em',
          zIndex: 2,
        }}
      >
        You
      </button>
    </>
  )
}
