import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@clerk/react'
import LandingPage from './pages/LandingPage'
import DashboardPage from './pages/DashboardPage'
import OnboardingPage from './pages/OnboardingPage'
import ProfilePage from './pages/ProfilePage'
import NotFoundPage from './pages/NotFoundPage'
import AppLoader from './components/ui/AppLoader'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded } = useAuth()
  if (!isLoaded) return <AppLoader />
  if (!isSignedIn) return <Navigate to="/" replace />
  return <>{children}</>
}

export default function App() {
  const { isSignedIn, isLoaded } = useAuth()

  if (!isLoaded) return <AppLoader />

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={isSignedIn ? <Navigate to="/dashboard" replace /> : <LandingPage />}
        />
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute>
              <OnboardingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}
