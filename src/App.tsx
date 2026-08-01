import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppProviders } from '@/state/AppProviders'
import { LoginRoute } from '@/routes/LoginRoute'
import { OnboardingRoute } from '@/routes/OnboardingRoute'
import { RootLayout } from '@/routes/RootLayout'
import { TabsLayout } from '@/routes/TabsLayout'
import { DepartmentsRoute } from '@/routes/DepartmentsRoute'
import { DepartmentHomeRoute } from '@/routes/DepartmentHomeRoute'
import { DepartmentFlowRoute } from '@/routes/DepartmentFlowRoute'
import { ActionsRoute } from '@/routes/ActionsRoute'
import { MoodRoute } from '@/routes/MoodRoute'

function App() {
  return (
    <AppProviders>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginRoute />} />
          <Route path="/onboarding" element={<OnboardingRoute />} />
          <Route element={<RootLayout />}>
            <Route element={<TabsLayout />}>
              <Route path="/departments" element={<DepartmentsRoute />} />
              <Route path="/actions" element={<ActionsRoute />} />
              <Route path="/mood" element={<MoodRoute />} />
            </Route>
            <Route path="/departments/:deptId" element={<DepartmentHomeRoute />} />
            <Route path="/departments/:deptId/flow" element={<DepartmentFlowRoute />} />
            <Route path="/" element={<Navigate to="/departments" replace />} />
          </Route>
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProviders>
  )
}

export default App
