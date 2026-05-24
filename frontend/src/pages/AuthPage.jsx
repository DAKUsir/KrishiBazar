import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Leaf, Shield, Zap, AlertTriangle, ChevronDown, Info, Copy, CheckCheck } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import api from '../lib/api'

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'

// The JS origins you need to add in Google Console
const OAUTH_ORIGINS = ['http://localhost:5173', 'http://localhost:5000']
const OAUTH_REDIRECT = 'http://localhost:5000/api/auth/google/callback'

export default function AuthPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { user, loginWithToken } = useAuth()
  const [showOAuthHelp, setShowOAuthHelp] = useState(params.get('error') === 'oauth_failed')

  // Auto-redirect if user is already logged in (e.g., mobile bypass)
  useEffect(() => {
    if (user) {
      navigate(user.isOnboarded ? '/dashboard' : '/onboarding', { replace: true })
    }
  }, [user, navigate])
  const [demoLoading, setDemoLoading] = useState(false)
  const [copied, setCopied] = useState('')

  const oauthError = params.get('error')

  const handleGoogleLogin = () => {
    window.location.href = `${API_BASE}/api/auth/google`
  }

  const handleDemoLogin = async () => {
    setDemoLoading(true)
    try {
      const { data } = await api.post('/auth/demo', {
        name: 'Demo Farmer',
        email: 'demo@krishibazar.app',
      })
      localStorage.setItem('krishi_token', data.token)
      navigate(data.user.isOnboarded ? '/dashboard' : '/onboarding')
    } catch (err) {
      console.error('Demo login failed:', err)
    } finally {
      setDemoLoading(false)
    }
  }

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(''), 2000)
  }

  return (
    <div className="min-h-screen hero-bg flex items-center justify-center p-6">
      {/* Floating crop emojis */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {['🌾', '🍅', '🌽', '🥕', '🌱', '🍃'].map((emoji, i) => (
          <motion.div
            key={i}
            className="absolute text-4xl opacity-10"
            style={{ left: `${10 + i * 15}%`, top: `${20 + (i % 3) * 25}%` }}
            animate={{ y: [-10, 10, -10], rotate: [-5, 5, -5] }}
            transition={{ duration: 3 + i * 0.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            {emoji}
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 w-full max-w-md space-y-4"
      >
        {/* Main card */}
        <div className="glass-card-dark rounded-3xl p-8 shadow-2xl">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-green-400/30">
              <Leaf className="w-9 h-9 text-green-400" />
            </div>
            <h1 className="text-3xl font-bold font-display text-white">Welcome to</h1>
            <h2 className="text-3xl font-bold font-display gradient-text">Krishi Bazar</h2>
            <p className="text-green-300/60 mt-2">AI-powered smart agriculture platform</p>
          </div>

          {/* Google error notice */}
          {oauthError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-orange-500/20 border border-orange-400/30 rounded-xl p-3 mb-5 flex items-start gap-2"
            >
              <AlertTriangle className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-orange-200">
                <p className="font-semibold mb-0.5">Google OAuth not configured yet.</p>
                <p>Add the origins below in Google Console, or use Demo Login to explore the app now.</p>
              </div>
            </motion.div>
          )}

          {/* Google Sign In */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 bg-white text-gray-700 font-semibold py-4 px-6 rounded-2xl hover:bg-gray-50 transition-all shadow-lg mb-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </motion.button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-green-700/40" />
            <span className="text-green-400/50 text-xs">or</span>
            <div className="flex-1 h-px bg-green-700/40" />
          </div>

          {/* Demo login button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleDemoLogin}
            disabled={demoLoading}
            className="w-full flex items-center justify-center gap-2 bg-green-500/20 border border-green-400/40 text-green-300 font-semibold py-4 px-6 rounded-2xl hover:bg-green-500/30 hover:text-white transition-all"
          >
            {demoLoading ? (
              <div className="w-5 h-5 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <span className="text-xl">🌾</span>
            )}
            {demoLoading ? 'Logging in...' : 'Continue as Demo Farmer'}
          </motion.button>

          <p className="text-center text-green-400/40 text-xs mt-4">
            Demo login lets you explore all features without Google OAuth
          </p>

          {/* Features */}
          <div className="space-y-3 mt-6 pt-6 border-t border-green-700/30">
            {[
              { icon: Zap, text: 'AI crop disease detection in seconds' },
              { icon: Shield, text: 'Secure & private — your data is yours' },
              { icon: Leaf, text: 'Personalized for your crops & region' },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-3 text-green-300/70 text-sm">
                <div className="w-7 h-7 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-4 h-4 text-green-400" />
                </div>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* OAuth Setup Guide — collapsible */}
        <div className="glass-card-dark rounded-2xl overflow-hidden border border-green-700/30">
          <button
            onClick={() => setShowOAuthHelp(s => !s)}
            className="w-full flex items-center justify-between px-5 py-4 text-left"
          >
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-semibold text-blue-300">Set up Google OAuth (required for Google login)</span>
            </div>
            <ChevronDown className={`w-4 h-4 text-green-400/60 transition-transform ${showOAuthHelp ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {showOAuthHelp && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: 'auto' }}
                exit={{ height: 0 }}
                className="overflow-hidden"
              >
                <div className="px-5 pb-5 space-y-4 text-xs text-green-200/80">
                  <p>Go to <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noreferrer" className="text-blue-400 underline">Google Cloud Console → Credentials</a>, open your OAuth 2.0 Client, and add:</p>

                  <div>
                    <p className="font-semibold text-green-300 mb-2">✅ Authorized JavaScript Origins</p>
                    {OAUTH_ORIGINS.map(origin => (
                      <div key={origin} className="flex items-center justify-between bg-black/30 rounded-lg px-3 py-2 mb-1">
                        <code className="text-green-400 font-mono">{origin}</code>
                        <button onClick={() => copyToClipboard(origin, origin)} className="text-gray-400 hover:text-white ml-3 flex-shrink-0">
                          {copied === origin ? <CheckCheck className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    ))}
                  </div>

                  <div>
                    <p className="font-semibold text-green-300 mb-2">✅ Authorized Redirect URIs</p>
                    <div className="flex items-center justify-between bg-black/30 rounded-lg px-3 py-2">
                      <code className="text-green-400 font-mono break-all">{OAUTH_REDIRECT}</code>
                      <button onClick={() => copyToClipboard(OAUTH_REDIRECT, 'redirect')} className="text-gray-400 hover:text-white ml-3 flex-shrink-0">
                        {copied === 'redirect' ? <CheckCheck className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <p className="text-green-400/50">After saving, Google login will work. Until then, use Demo Login above.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}
