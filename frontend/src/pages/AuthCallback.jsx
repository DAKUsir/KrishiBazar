import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Leaf } from 'lucide-react'

export default function AuthCallback() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { loginWithToken } = useAuth()

  useEffect(() => {
    const token = params.get('token')
    const onboarded = params.get('onboarded')
    const error = params.get('error')

    if (error) {
      navigate('/auth?error=login_failed')
      return
    }

    if (token) {
      loginWithToken(token)
      // Small delay to let user state load
      setTimeout(() => {
        navigate(onboarded === 'false' ? '/onboarding' : '/dashboard')
      }, 500)
    } else {
      navigate('/auth')
    }
  }, [params])

  return (
    <div className="min-h-screen hero-bg flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-green-400/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-green-400/30">
          <Leaf className="w-9 h-9 text-green-400 animate-float" />
        </div>
        <div className="w-10 h-10 border-4 border-green-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-green-300 font-medium">Signing you in...</p>
      </div>
    </div>
  )
}
