import { NavLink, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, BookOpen, Users, ShoppingBag,
  Bot, LogOut, ChevronRight, TrendingUp, Brain
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

// High-fidelity fractal noise grain texture
const grainStyle = {
  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.035'/%3E%3C/svg%3E")`
}

const WheatLogo = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5.5 h-5.5 text-[#4CAF72]">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v20M12 4c-1.5 1.5-3.5 2.5-3.5 4.5s2 3 3.5 4.5M12 4c1.5 1.5 3.5 2.5 3.5 4.5s-2 3-3.5 4.5M12 9c-1.5 1.5-3.5 2.5-3.5 4.5s2 3 3.5 4.5M12 9c1.5 1.5 3.5 2.5 3.5 4.5s-2 3-3.5 4.5M12 14c-1.5 1.5-3.5 2.5-3.5 4.5s2 3 3.5 4.5M12 14c1.5 1.5 3.5 2.5 3.5 4.5s-2 3-3.5 4.5" />
  </svg>
)

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', description: 'Crop monitoring' },
  { to: '/crops', icon: BookOpen, label: 'Crop Library', description: 'Encyclopedia' },
  { to: '/yield-predictor', icon: Brain, label: 'Yield Predictor', description: 'AI harvest forecast' },
  { to: '/mandi', icon: TrendingUp, label: 'Mandi Prices', description: 'Real-time rates' },
  { to: '/community', icon: Users, label: 'Community', description: 'Farmer network' },
  { to: '/marketplace', icon: ShoppingBag, label: 'Marketplace', description: 'Buy & Sell' },
  { to: '/assistant', icon: Bot, label: 'Krishi AI', description: 'AI assistant' },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <motion.aside
      initial={{ x: -280 }}
      animate={{ x: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="w-72 bg-[#1A3D2B] flex flex-col shadow-2xl relative z-10 select-none border-r border-[#2E6B47]/20"
      style={grainStyle}
    >
      {/* Logo */}
      <div className="p-6 border-b border-[#2E6B47]/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10">
            <WheatLogo />
          </div>
          <div>
            <h1 className="text-white font-bold text-lg font-display tracking-tight leading-none">Krishi Bazar</h1>
            <p className="text-[#6B8070] text-[10px] font-bold tracking-wider uppercase mt-1">Smart Agriculture</p>
          </div>
        </div>
      </div>

      {/* User info */}
      <div className="p-4 border-b border-[#2E6B47]/20">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 relative overflow-hidden" style={grainStyle}>
          <img
            src={user?.avatar || `https://api.dicebear.com/8.x/avataaars/svg?seed=${user?.name}`}
            alt={user?.name}
            className="w-10 h-10 rounded-full border-2 border-[#4CAF72]/50 object-cover relative z-10"
          />
          <div className="flex-1 min-w-0 relative z-10">
            <p className="text-white font-semibold text-sm truncate">{user?.name}</p>
            <p className="text-emerald-100/60 text-xs truncate">
              {user?.farmDetails?.state || 'India'} · {user?.crops?.length || 0} crops
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 space-y-0.5 overflow-y-auto custom-scrollbar">
        <p className="text-[#6B8070] text-[10px] font-bold tracking-wider uppercase px-6 mb-3">Navigation</p>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'active' : ''} group`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors
                  ${isActive ? 'bg-[#3DB268]/20 text-[#3DB268]' : 'bg-white/5 text-emerald-100/70 group-hover:bg-white/10 group-hover:text-white'}`}>
                  <item.icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="text-white font-semibold text-xs leading-none tracking-tight">{item.label}</div>
                  <div className="text-[10px] text-emerald-200/50 mt-1">{item.description}</div>
                </div>
                {isActive && <ChevronRight className="w-4 h-4 text-[#3DB268]" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom actions */}
      <div className="p-4 border-t border-[#2E6B47]/20 space-y-2 relative overflow-hidden" style={grainStyle}>
        <div className="text-[11px] text-[#6B8070] text-center font-medium">
          {user?.farmDetails?.farmArea && (
            <span className="flex items-center justify-center gap-1.5 bg-white/5 py-1 px-3.5 rounded-lg border border-white/5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4CAF72] animate-pulse" />
              <span>{user.farmDetails.farmArea} Acres · {user.farmDetails.soilType} Soil</span>
            </span>
          )}
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl text-red-300/80 bg-red-950/20 border border-red-900/10
                     hover:bg-red-950/40 hover:text-red-200 transition-all duration-200 font-semibold text-xs"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </motion.aside>
  )
}
