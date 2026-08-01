/* Top safe-area inset only — no phone chrome. */
export function StatusBar() {
  return <div style={{ height: 'var(--ceoos-top)', flexShrink: 0, position: 'relative', zIndex: 5 }} />
}
