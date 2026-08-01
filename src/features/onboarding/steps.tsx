/* Ported from design_handoff_ceoos_pilot_app/design/ceoos-onboarding.jsx (O_STEPS).
   Copy, art and bullet points for the 4 onboarding steps: privacy, departments,
   coach (Tim Simons), name. */
import type { ReactNode } from 'react'
import { OLockArt, OOrbitArt, OCoachArt } from './art'

export interface OnboardingStep {
  key: 'privacy' | 'departments' | 'coach' | 'name'
  eyebrow: ReactNode
  art: ReactNode
  title: ReactNode
  body: ReactNode
  points: string[] | null
  input?: boolean
}

export const O_STEPS: OnboardingStep[] = [
  {
    key: 'privacy',
    eyebrow: 'Private by design',
    art: <OLockArt />,
    title: (
      <>
        Your reflections stay <b style={{ fontWeight: 700 }}>yours</b>.
      </>
    ),
    body: "Every note you write and every conversation you have with your coach stays yours. Nothing goes to your employer, your manager or anyone else. This only works if you can be candid, so we built it that way.",
    points: [
      'Private journaling, end to end',
      'Never shared with employers or clients',
      'Your data — delete it whenever you like',
      'Deepen your relationship with your self',
    ],
  },
  {
    key: 'departments',
    eyebrow: 'The five departments',
    art: <OOrbitArt />,
    title: null,
    body: (
      <>
        When you are sitting alone, are you in your own company? It's up to you to run that company. Step into your CEO role
        to lead your five depts.
        <br />
        Career. Health. Love &amp; Family. Wealth. Fun.
      </>
    ),
    points: null,
  },
  {
    key: 'coach',
    eyebrow: (
      <>
        You are the system.
        <br />
        We help your run it.
      </>
    ),
    art: <OCoachArt />,
    title: (
      <>
        <b style={{ fontWeight: 700 }}>20 years</b> of coaching,
        <br />
        in your pocket.
      </>
    ),
    body: (
      <>
        CEO OF SELF is built on Tim Simons’ two decades of real coaching conversations — not a generic AI guessing at your
        life. He knows the method. He has set up your Depts ready for you to lead. CEO OF SELF will ask you questions rather
        than handing you scripts.
      </>
    ),
    points: ['Used by thousands of clients', 'Will help you run your departments', 'Partnership over instructions', 'Designed for You'],
  },
  {
    key: 'name',
    eyebrow: 'One last thing',
    art: null,
    title: (
      <>
        What should we <b style={{ fontWeight: 700 }}>call you</b>?
      </>
    ),
    body: <>Let’s use your name when we speak. Not your title. Not your company. We are here for your self to become the CEO.</>,
    points: null,
    input: true,
  },
]
