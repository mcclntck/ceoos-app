import { AppProviders } from '@/state/AppProviders'

function App() {
  return (
    <AppProviders>
      <div
        style={{
          minHeight: '100dvh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-primary)',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: 'var(--ls-wordmark)',
              color: 'var(--zinc)',
              paddingLeft: 'var(--ls-wordmark)',
            }}
          >
            CEO OF SELF
          </div>
          <div style={{ marginTop: 12, color: 'var(--accent)' }}>state layer OK</div>
        </div>
      </div>
    </AppProviders>
  )
}

export default App
