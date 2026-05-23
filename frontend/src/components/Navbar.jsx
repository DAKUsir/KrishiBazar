import { Bell, Search, Menu } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useLocation } from 'react-router-dom'

const pageTitles = {
  '/dashboard': { title: 'Smart Dashboard', subtitle: 'AI-powered crop monitoring' },
  '/crops': { title: 'Crop Library', subtitle: 'Complete crop encyclopedia' },
  '/community': { title: 'Community', subtitle: 'Connect with farmers' },
  '/marketplace': { title: 'Marketplace', subtitle: 'Buy, sell & trade' },
  '/assistant': { title: 'Krishi AI Assistant', subtitle: 'Your personal farming AI' },
  '/onboarding': { title: 'Setup Your Farm', subtitle: 'Tell us about your farm' },
}

export default function Navbar({ onMenuClick }) {
  const { user } = useAuth()
  const location = useLocation()
  const page = pageTitles[location.pathname] || { title: 'Krishi Bazar', subtitle: '' }

  return (
    <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between shadow-sm select-none">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 -ml-2 rounded-xl hover:bg-gray-100 text-gray-600 transition-colors"
          title="Open Menu"
        >
          <Menu className="w-5.5 h-5.5" />
        </button>
        <div>
          <h2 className="text-lg md:text-xl font-bold text-gray-900 font-display leading-tight">{page.title}</h2>
          <p className="text-xs md:text-sm text-gray-500 leading-tight">{page.subtitle}</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search crops, diseases..."
            className="pl-10 pr-4 py-2 rounded-xl bg-gray-50 border border-gray-200 text-sm
                       focus:outline-none focus:border-green-400 focus:bg-white transition-all w-64"
          />
        </div>

        {/* Notifications */}
        <button className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors">
          <Bell className="w-5 h-5 text-gray-600" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-green-500 rounded-full" />
        </button>

        {/* User avatar */}
        <div className="flex items-center gap-3">
          <img
            src={user?.avatar || `https://api.dicebear.com/8.x/avataaars/svg?seed=${user?.name}`}
            alt={user?.name}
            className="w-9 h-9 rounded-full border-2 border-green-200 object-cover"
          />
          <div className="hidden md:block">
            <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
            <p className="text-xs text-gray-500">{user?.language || 'English'}</p>
          </div>
        </div>
      </div>
    </header>
  )
}
