/* Temporary stand-in for screens not yet built in this build pass
   (My Actions, Mood, the guided-conversation flow). Replaced as each
   feature lands — see the build plan's remaining phases. */
import { AppBackdrop, StatusBar } from '@/features/chrome'

export function PlaceholderScreen({ title }: { title: string }) {
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>
      <AppBackdrop glow="default" />
      <StatusBar />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontFamily: 'var(--font-primary)', fontSize: 20, color: 'var(--text-secondary)' }}>{title} — coming soon</span>
      </div>
    </div>
  )
}
