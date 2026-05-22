import { createContext, useContext, useState, useEffect } from 'react'
import api from '../lib/api'

const AuthContext = createContext(null)

// ─── AUTH DISABLED ────────────────────────────────────────────────────────────
// Set to true to restore full Google OAuth login flow
const AUTH_ENABLED = false

// Demo user shown while auth is disabled
const DEMO_USER = {
  _id: 'demo_user_001',
  name: 'Demo Farmer',
  email: 'demo@krishibazar.app',
  avatar: 'https://api.dicebear.com/8.x/avataaars/svg?seed=DemoFarmer',
  language: 'English',
  isOnboarded: true,
  crops: ['Tomato', 'Rice', 'Wheat', 'Onion'],
  farmDetails: {
    state: 'Karnataka',
    district: 'Bengaluru Rural',
    farmArea: 5,
    soilType: 'Loam',
    irrigationSource: 'Drip Irrigation',
    experienceLevel: '5-10 years',
    farmingMethod: 'Semi-Organic',
  },
}
// ─────────────────────────────────────────────────────────────────────────────

export function AuthProvider({ children }) {
  const [user, setUser] = useState(AUTH_ENABLED ? null : DEMO_USER)
  const [loading, setLoading] = useState(AUTH_ENABLED) // false immediately when disabled

  useEffect(() => {
    if (!AUTH_ENABLED) {
      // AUTH_DISABLED: auto-login as demo — try real demo endpoint first, fall back to local DEMO_USER
      const token = localStorage.getItem('krishi_token')
      if (token) {
        fetchUser().finally(() => setLoading(false))
      } else {
        autoLoginDemo()
      }
      return
    }

    // ── Original token-based boot (re-enable with AUTH_ENABLED = true) ──
    const token = localStorage.getItem('krishi_token')
    if (token) {
      fetchUser()
    } else {
      setLoading(false)
    }
  }, [])

  const autoLoginDemo = async () => {
    try {
      const { data } = await api.post('/auth/demo', {
        name: 'Demo Farmer',
        email: 'demo@krishibazar.app',
      })
      localStorage.setItem('krishi_token', data.token)
      setUser(data.user || DEMO_USER)
    } catch {
      // Backend not available — use local demo user object
      setUser(DEMO_USER)
    } finally {
      setLoading(false)
    }
  }

  const fetchUser = async () => {
    try {
      const { data } = await api.get('/auth/me')
      setUser(data.user)
    } catch {
      localStorage.removeItem('krishi_token')
      if (!AUTH_ENABLED) {
        setUser(DEMO_USER)
      } else {
        setUser(null)
      }
    } finally {
      setLoading(false)
    }
  }

  const loginWithToken = (token) => {
    localStorage.setItem('krishi_token', token)
    fetchUser()
  }

  const logout = () => {
    localStorage.removeItem('krishi_token')
    if (!AUTH_ENABLED) {
      // AUTH_DISABLED: re-set demo user instead of redirecting to login
      setUser(DEMO_USER)
    } else {
      setUser(null)
      window.location.href = '/'
    }
  }

  const updateUser = (updatedUser) => {
    setUser(updatedUser)
  }

  return (
    <AuthContext.Provider value={{ user, loading, loginWithToken, logout, updateUser, refetch: fetchUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
