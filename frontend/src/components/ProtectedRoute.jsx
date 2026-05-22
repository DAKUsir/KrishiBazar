import { Outlet } from 'react-router-dom'
// import { Navigate, Outlet } from 'react-router-dom'   // AUTH_DISABLED
// import { useAuth } from '../contexts/AuthContext'       // AUTH_DISABLED

// ─── AUTH DISABLED ───────────────────────────────────────────────────────────
// Re-enable by uncommenting the block below and removing the direct <Outlet />
// ─────────────────────────────────────────────────────────────────────────────

export default function ProtectedRoute() {
  // AUTH_DISABLED: always render children as demo user
  return <Outlet />

  // ── Original auth guard (re-enable when auth is implemented) ──
  // const { user, loading } = useAuth()
  //
  // if (loading) {
  //   return (
  //     <div className="min-h-screen bg-green-950 flex items-center justify-center">
  //       <div className="text-center">
  //         <div className="w-16 h-16 border-4 border-green-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
  //         <p className="text-green-300 font-medium">Loading Krishi Bazar...</p>
  //       </div>
  //     </div>
  //   )
  // }
  //
  // if (!user) return <Navigate to="/auth" replace />
  //
  // return <Outlet />
}
