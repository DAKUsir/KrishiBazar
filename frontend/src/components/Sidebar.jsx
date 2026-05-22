import { NavLink, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, BookOpen, Users, ShoppingBag,
  Bot, LogOut, Leaf, ChevronRight, TrendingUp, Brain
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

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
      className="w-72 hero-bg flex flex-col shadow-2xl relative z-10"
    >
      {/* Logo */}
      <div className="p-6 border-b border-green-700/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-400/20 rounded-xl flex items-center justify-center border border-green-400/30">
            <Leaf className="w-6 h-6 text-green-400" />
          </div>
          <div>
            <h1 className="text-white font-bold text-xl font-display">Krishi Bazar</h1>
            <p className="text-green-400/70 text-xs">Smart Agriculture Platform</p>
          </div>
        </div>
      </div>

      {/* User info */}
      <div className="p-4 border-b border-green-700/30">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-green-700/20 border border-green-600/20">
          <img
            src={user?.avatar || `https://api.dicebear.com/8.x/avataaars/svg?seed=${user?.name}`}
            alt={user?.name}
            className="w-10 h-10 rounded-full border-2 border-green-400/50 object-cover"
          />
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-sm truncate">{user?.name}</p>
            <p className="text-green-400/70 text-xs truncate">
              {user?.farmDetails?.state || 'India'} · {user?.crops?.length || 0} crops
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
        <p className="text-green-400/50 text-xs font-semibold uppercase tracking-wider px-3 mb-3">Navigation</p>
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
                  ${isActive ? 'bg-green-500/30' : 'bg-green-800/40 group-hover:bg-green-700/40'}`}>
                  <item.icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-sm">{item.label}</div>
                  <div className="text-xs opacity-60">{item.description}</div>
                </div>
                {isActive && <ChevronRight className="w-4 h-4 text-green-400" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom actions */}
      <div className="p-4 border-t border-green-700/30 space-y-2">
        <div className="text-xs text-green-400/50 text-center">
          {user?.farmDetails?.farmArea && (
            <span>🌾 {user.farmDetails.farmArea} acres · {user.farmDetails.soilType} soil</span>
          )}
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400/70
                     hover:bg-red-900/20 hover:text-red-400 transition-all duration-200 font-medium"
        >
          <LogOut className="w-5 h-5" />
          <span>Sign Out</span>
        </button>
      </div>
    </motion.aside>
  )
}
