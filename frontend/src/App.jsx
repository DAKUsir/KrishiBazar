import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'

// Pages
import LandingPage from './pages/LandingPage'
import AuthPage from './pages/AuthPage'
import AuthCallback from './pages/AuthCallback'
import OnboardingPage from './pages/OnboardingPage'
import Dashboard from './pages/Dashboard'
import CropLibrary from './pages/CropLibrary'
import Community from './pages/Community'
import Marketplace from './pages/Marketplace'
import AIAssistant from './pages/AIAssistant'
import MandiPrices from './pages/MandiPrices'
import YieldPredictor from './pages/YieldPredictor'

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/auth/callback" element={<AuthCallback />} />

        {/* Protected routes with sidebar layout */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/crops" element={<CropLibrary />} />
            <Route path="/community" element={<Community />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/mandi" element={<MandiPrices />} />
            <Route path="/yield-predictor" element={<YieldPredictor />} />
            <Route path="/assistant" element={<AIAssistant />} />
          </Route>
        </Route>

        {/* AUTH_DISABLED: redirect to dashboard directly */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  )
}

export default App
