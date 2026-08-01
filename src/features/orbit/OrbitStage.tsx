/* Orbit hub ("My Departments") — the home view and emotional core of the app.
   Ported from ceoos-orbit.jsx's OrbitHub, assembled from the pieces built alongside
   this file (OrbitBubble, YouHub, OrbitLinks, NoteSheet, orbitGeometry, useOrbitScale,
   useOrbitMount). See those files for the documented CSS-technique deviation (transform/
   opacity instead of left/top/width/height/box-shadow) that fixes the jank diagnosed in
   a prior app attempt at this same visual design.

   Reads ONLY useDepartments() from @/state/departmentsStore for the orbit's own data —
   its only dependency, so unrelated store updates (mood logs, plan edits, note-sheet
   typing) can never cascade re-renders into the memoized bubble tree. Identity is read
   here in the header only (BrandRow/Avatar), which cannot affect OrbitBubble's re-render
   scope since OrbitBubble never consumes it. */
import { useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { useDepartments } from '@/state/departmentsStore'
import { AppBackdrop, StatusBar, BrandRow, AccountControls } from '@/features/chrome'
import type { DeptId } from '@/departments/types'
import { CX, CY, ORBIT_H, ORBIT_LEVELS, ORBIT_W, orbitPosition } from './orbitGeometry'
import { ORBIT_PRESENCE, useOrbitScale } from './useOrbitScale'
import { useOrbitMount } from './useOrbitMount'
import { OrbitBubble } from './OrbitBubble'
import { YouHub } from './YouHub'
import { OrbitLinks } from './OrbitLinks'
import { NoteSheet, type OrbitNote } from './NoteSheet'

/* Voice — the coaching register of the hub's copy, ported from ORBIT_VOICE in
   ceoos-orbit.jsx. Only 'coach' is hardcoded/used per the plan's confirmed tweak
   defaults (the stakeholder tweaks panel itself is not ported), but the shape stays
   generic so the other two registers remain available if ever revisited. */
interface OrbitVoiceCopy {
  none: ReactNode
  some: (done: number, total: number) => ReactNode
  all: (total: number) => ReactNode
  caption: string
  quote: string
}

const ORBIT_VOICE: Record<'coach' | 'direct' | 'reflective', OrbitVoiceCopy> = {
  coach: {
    none: (
      <>The more time you spend in each department, the more your department will shine! Literally. Tap on a department and try it out.</>
    ),
    some: (d, n) => (
      <>
        You&rsquo;re managing <b style={{ color: 'var(--accent)', fontWeight: 700 }}>{d} of {n}</b>. How do you think the other {n - d} feel?
      </>
    ),
    all: (_n) => (
      <>
        All <b style={{ color: 'var(--accent)', fontWeight: 700 }}>five</b> Depts are being managed. Not equally at all times — but all of them, always.
      </>
    ),
    caption: 'Closer to You means better managed',
    quote: '“These five Depts are as important today, as they will be ten years from now.”',
  },
  direct: {
    none: <>Five departments. All yours to lead. Pick one and start.</>,
    some: (d, n) => (
      <>
        <b style={{ color: 'var(--accent)', fontWeight: 700 }}>{d} of {n}</b> led. Choose the next one.
      </>
    ),
    all: () => <>All five led. Hold the line.</>,
    caption: 'Closer to You means better led',
    quote: '“Lead yourself first.”',
  },
  reflective: {
    none: <>Which department has been asking for your attention lately? Start there.</>,
    some: (d, n) => (
      <>
        You&rsquo;ve given time to <b style={{ color: 'var(--accent)', fontWeight: 700 }}>{d} of {n}</b>. What are you optimising for right now?
      </>
    ),
    all: () => <>All five have had your attention. Which one still feels unfinished?</>,
    caption: 'Distance shows where your attention has gone',
    quote: '“When you are sitting alone, are you in your own company?”',
  },
}

export interface OrbitStageProps {
  onOpenDepartment: (id: DeptId) => void
}

export function OrbitStage({ onOpenDepartment }: OrbitStageProps) {
  const { departments } = useDepartments()
  const [noteOpen, setNoteOpen] = useState(false)
  const [notes, setNotes] = useState<OrbitNote[]>([])
  const wrapRef = useRef<HTMLDivElement>(null)

  // Hardcoded tweak defaults per the plan — presence 'balanced', voice 'coach'.
  const presence = ORBIT_PRESENCE.balanced
  const voice = ORBIT_VOICE.coach

  const k = useOrbitScale(wrapRef, presence.cap, presence.target)
  const mounted = useOrbitMount()

  const done = departments.filter((d) => d.level >= 2).length

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>
      <AppBackdrop glow="hub" />
      <StatusBar />
      <BrandRow
        left={
          <span
            style={{
              fontFamily: 'var(--font-primary)',
              fontSize: 'var(--ceoos-title)',
              fontWeight: 600,
              color: 'var(--text-primary)',
              letterSpacing: '-0.015em',
              lineHeight: 1.12,
            }}
          >
            My Departments
          </span>
        }
        right={<AccountControls />}
      />

      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          overflowX: 'hidden',
          WebkitOverflowScrolling: 'touch',
          display: 'flex',
          flexDirection: 'column',
          paddingBottom: 14,
        }}
      >
        <div style={{ padding: '10px var(--ceoos-gutter) 0' }}>
          <p style={{ margin: 0, fontFamily: 'var(--font-primary)', fontSize: 'var(--ceoos-body)', lineHeight: 1.5, textWrap: 'pretty', color: 'var(--text-secondary)' }}>
            {done === 0 ? voice.none : done === departments.length ? voice.all(departments.length) : voice.some(done, departments.length)}
          </p>
        </div>

        {/* Orbit + caption — the hero interaction. The sizing wrapper reserves the SCALED
           size so the painted orbit can never overlap the copy above or the caption below. */}
        <div
          ref={wrapRef}
          style={{
            flex: '1 0 auto',
            padding: '0 var(--ceoos-gutter-sm)',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <div style={{ width: ORBIT_W * k, height: ORBIT_H * k, flexShrink: 0, position: 'relative' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: ORBIT_W, height: ORBIT_H, transform: `scale(${k})`, transformOrigin: 'top left' }}>
              <div style={{ position: 'relative', width: ORBIT_W, height: ORBIT_H, flexShrink: 0 }}>
                <OrbitLinks />
                <YouHub onClick={() => setNoteOpen(true)} sizeMul={presence.hub} halo={presence.halo} />
                {departments.map((d) => {
                  const geo = ORBIT_LEVELS[d.level]
                  const { x, y } = orbitPosition(d.angle, geo.r)
                  return (
                    <OrbitBubble
                      key={d.id}
                      id={d.id}
                      label={d.label}
                      glow={d.glow}
                      level={d.level}
                      bx={x - CX}
                      by={y - CY}
                      mounted={mounted}
                      onOpen={onOpenDepartment}
                    />
                  )
                })}
              </div>
            </div>
          </div>

          <div
            style={{
              display: 'inline-flex',
              gap: 7,
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-primary)',
              fontSize: 13,
              marginTop: 14,
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)' }} />
            {voice.caption}
          </div>
        </div>
      </div>

      {/* Quote sits outside the scroll region as chrome, clear of the floating dock. */}
      <div style={{ padding: '14px calc(var(--ceoos-gutter) + 10px) calc(var(--ceoos-dock) + 4px)', flexShrink: 0 }}>
        <p
          style={{
            margin: 0,
            color: 'var(--text-secondary)',
            fontFamily: 'var(--font-primary)',
            fontSize: 13,
            lineHeight: 1.5,
            fontStyle: 'italic',
            fontWeight: 400,
            textAlign: 'center',
            opacity: 0.72,
            textWrap: 'pretty',
          }}
        >
          {voice.quote}
        </p>
      </div>

      <NoteSheet
        open={noteOpen}
        notes={notes}
        onSave={(t) =>
          setNotes((ns) => [
            {
              text: t,
              at: Date.now(),
              when: new Date().toLocaleString('en-AU', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }),
            },
            ...ns,
          ])
        }
        onClose={() => setNoteOpen(false)}
      />
    </div>
  )
}
