import { useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AppProviders } from '@/state/AppProviders'
import { LoginRoute } from '@/routes/LoginRoute'
import { OnboardingRoute } from '@/routes/OnboardingRoute'
import { RootLayout } from '@/routes/RootLayout'
import { TabsLayout } from '@/routes/TabsLayout'
import { DepartmentsRoute } from '@/routes/DepartmentsRoute'
import { DepartmentFlowRoute } from '@/routes/DepartmentFlowRoute'
import { ActionsRoute } from '@/routes/ActionsRoute'
import { MoodRoute } from '@/routes/MoodRoute'
import { useIdentity } from '@/state/identityStore'
import { trackPageView, trackEvent } from '@/lib/analytics'
import { STORAGE_KEYS, readJSON, writeJSON } from '@/state/persistence/localStorage'

/* Reports a GA4 pageview on every React Router navigation — index.html's gtag
   config disables the automatic pageview (send_page_view: false) specifically
   so this is the only source, since a plain <script> load only ever fires
   once and this is a client-routed SPA. Mounted as a sibling of <Routes>
   (not inside RootLayout, which redirects logged-out users away) so it sees
   every route including /login and /onboarding. */
function AnalyticsRouteTracker() {
  const location = useLocation()
  useEffect(() => {
    trackPageView(location.pathname)
  }, [location.pathname])
  return null
}

/* Gate for "/" — the entry point every hard navigation (e.g. account reset) lands
   on. Without an identity check here, "/" always fell through to /departments,
   bypassing Login entirely for logged-out users. */
function RootRedirect() {
  const { identity } = useIdentity()
  return <Navigate to={identity ? '/departments' : '/login'} replace />
}

/* Reports how many days it's been since the app was last opened (localStorage
   has no timestamp of its own, unlike GA4's own new/returning-user tracking —
   see the analytics plan) — checked once on mount, then the timestamp is
   refreshed for next time. */
function useSessionReopenedTracking() {
  useEffect(() => {
    const lastOpenAt = readJSON<number | null>(STORAGE_KEYS.lastOpenAt, null)
    if (lastOpenAt != null) {
      const daysSinceLastOpen = Math.floor((Date.now() - lastOpenAt) / (24 * 60 * 60 * 1000))
      trackEvent('session_reopened', { daysSinceLastOpen })
    }
    writeJSON(STORAGE_KEYS.lastOpenAt, Date.now())
  }, [])
}

function App() {
  useSessionReopenedTracking()
  return (
    <AppProviders>
      <BrowserRouter>
        <AnalyticsRouteTracker />
        <Routes>
          <Route path="/login" element={<LoginRoute />} />
          <Route path="/onboarding" element={<OnboardingRoute />} />
          <Route element={<RootLayout />}>
            <Route element={<TabsLayout />}>
              <Route path="/departments" element={<DepartmentsRoute />} />
              <Route path="/actions" element={<ActionsRoute />} />
              <Route path="/mood" element={<MoodRoute />} />
            </Route>
            <Route path="/departments/:deptId/flow" element={<DepartmentFlowRoute />} />
            <Route path="/" element={<RootRedirect />} />
          </Route>
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProviders>
  )
}

export default App
