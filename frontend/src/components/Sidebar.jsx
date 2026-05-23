import { NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import {
  LayoutDashboard, BookOpen, Users, ShoppingBag,
  Bot, LogOut, ChevronRight, TrendingUp, Brain, X, Save, Edit2, Loader2, Sparkles
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useTranslation } from '../lib/translations'
import { INDIAN_STATES, SOIL_TYPES, CROP_LIST } from '../lib/utils'
import api from '../lib/api'

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

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout, updateUser } = useAuth()
  const navigate = useNavigate()
  const { t } = useTranslation()

  // Profile modal states
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const [profileForm, setProfileForm] = useState({
    name: '',
    language: 'English',
    crops: [],
    farmDetails: {
      state: '',
      district: '',
      farmArea: '',
      soilType: 'Loam',
      irrigationSource: 'Rainfed',
      farmingMethod: 'Conventional',
      experienceLevel: '3-5 years'
    }
  })

  const openProfile = () => {
    setProfileForm({
      name: user?.name || '',
      language: user?.language || 'English',
      crops: user?.crops || [],
      farmDetails: {
        state: user?.farmDetails?.state || '',
        district: user?.farmDetails?.district || '',
        farmArea: user?.farmDetails?.farmArea || '',
        soilType: user?.farmDetails?.soilType || 'Loam',
        irrigationSource: user?.farmDetails?.irrigationSource || 'Rainfed',
        farmingMethod: user?.farmDetails?.farmingMethod || 'Conventional',
        experienceLevel: user?.farmDetails?.experienceLevel || '3-5 years'
      }
    })
    setIsProfileOpen(true)
    setSaveError(null)
    setSaveSuccess(false)
  }

  const toggleProfileCrop = (crop) => {
    setProfileForm(f => ({
      ...f,
      crops: f.crops.includes(crop) ? f.crops.filter(c => c !== crop) : [...f.crops, crop]
    }))
  }

  const handleProfileSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setSaveError(null)
    setSaveSuccess(false)
    try {
      const { data } = await api.put('/auth/profile', profileForm)
      if (data.success) {
        updateUser(data.user)
        setSaveSuccess(true)
        setTimeout(() => {
          setIsProfileOpen(false)
          setSaveSuccess(false)
        }, 1500)
      } else {
        throw new Error('Failed to update profile')
      }
    } catch (err) {
      setSaveError(err.response?.data?.message || err.message || 'Error updating profile')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      {/* Mobile Sidebar Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed md:relative inset-y-0 left-0 w-72 bg-[#1A3D2B] flex flex-col shadow-2xl z-50 select-none border-r border-[#2E6B47]/20 transition-transform duration-300 md:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={grainStyle}
      >
        {/* Logo */}
        <div className="p-6 border-b border-[#2E6B47]/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10">
              <WheatLogo />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg font-display tracking-tight leading-none">Krishi Bazar</h1>
              <p className="text-[#6B8070] text-[10px] font-bold tracking-wider uppercase mt-1">{t('Smart Agriculture')}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="md:hidden p-1.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white transition-colors"
            title="Close Menu"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* User info - click to edit profile */}
        <div className="p-4 border-b border-[#2E6B47]/20">
          <button
            onClick={openProfile}
            title="Edit Farm Profile"
            className="w-full text-left flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 relative overflow-hidden hover:bg-white/10 active:scale-[0.98] transition-all group"
            style={grainStyle}
          >
            <img
              src={user?.avatar || `https://api.dicebear.com/8.x/avataaars/svg?seed=${user?.name}`}
              alt={user?.name}
              className="w-10 h-10 rounded-full border-2 border-[#4CAF72]/50 object-cover relative z-10 group-hover:border-[#3DB268] transition-colors"
            />
            <div className="flex-1 min-w-0 relative z-10">
              <p className="text-white font-semibold text-sm truncate group-hover:text-emerald-300 transition-colors flex items-center gap-1">
                {user?.name}
                <Edit2 className="w-3 h-3 opacity-0 group-hover:opacity-100 text-emerald-300 transition-opacity" />
              </p>
              <p className="text-emerald-100/60 text-xs truncate">
                {user?.farmDetails?.state || 'India'} · {user?.crops?.length || 0} crops
              </p>
            </div>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 space-y-0.5 overflow-y-auto custom-scrollbar">
          <p className="text-[#6B8070] text-[10px] font-bold tracking-wider uppercase px-6 mb-3">{t('Navigation')}</p>
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
                    <div className="text-white font-semibold text-xs leading-none tracking-tight">{t(item.label)}</div>
                    <div className="text-[10px] text-emerald-200/50 mt-1">{t(item.description)}</div>
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
                <span>{user.farmDetails.farmArea} {t('Acres')} · {user.farmDetails.soilType} {t('Soil')}</span>
              </span>
            )}
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl text-red-300/80 bg-red-950/20 border border-red-900/10
                       hover:bg-red-950/40 hover:text-red-200 transition-all duration-200 font-semibold text-xs"
          >
            <LogOut className="w-4 h-4" />
            <span>{t('Sign Out')}</span>
          </button>
        </div>
      </aside>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {isProfileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={() => setIsProfileOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#F7F9F5] rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl border border-gray-100 flex flex-col"
            >
              {/* Modal Banner Header */}
              <div className="bg-gradient-to-br from-emerald-600 via-green-600 to-teal-500 p-6 text-white flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center border border-white/20">
                    <Brain className="w-5 h-5 text-white animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl font-display">Edit Your Farm Profile</h3>
                    <p className="text-xs text-emerald-50 mt-0.5">Parameters are used by Krishi AI to optimize yields & diagnose crops.</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsProfileOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                >
                  <X className="w-4.5 h-4.5 text-white" />
                </button>
              </div>

              {/* Modal Form Content */}
              <form onSubmit={handleProfileSave} className="flex-1 flex flex-col overflow-hidden">
                <div className="p-6 md:p-8 space-y-6 overflow-y-auto custom-scrollbar flex-1">
                  
                  {saveSuccess && (
                    <div className="bg-green-50 border border-green-200 text-green-700 text-sm font-semibold rounded-xl p-4 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-green-600" />
                      Changes saved successfully! Syncing agricultural profile...
                    </div>
                  )}

                  {saveError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 text-sm font-semibold rounded-xl p-4">
                      ⚠️ {saveError}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                    {/* Left Column: Personal Context (2 spans) */}
                    <div className="md:col-span-2 space-y-4">
                      <div className="border-b border-gray-100 pb-2">
                        <span className="text-[10px] font-bold text-[#6B8070] uppercase tracking-wider">Farmer Profile</span>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Farmer Name</label>
                        <input
                          type="text"
                          required
                          value={profileForm.name}
                          onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                          className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-green-500 bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Language</label>
                        <select
                          value={profileForm.language}
                          onChange={(e) => setProfileForm({ ...profileForm, language: e.target.value })}
                          className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-green-500 bg-white"
                        >
                          <option value="English">🇬🇧 English</option>
                          <option value="Hindi">🇮🇳 Hindi</option>
                          <option value="Kannada">🌺 Kannada</option>
                          <option value="Tamil">🌹 Tamil</option>
                          <option value="Telugu">🌸 Telugu</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Farming Method</label>
                        <select
                          value={profileForm.farmDetails.farmingMethod}
                          onChange={(e) => setProfileForm({
                            ...profileForm,
                            farmDetails: { ...profileForm.farmDetails, farmingMethod: e.target.value }
                          })}
                          className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-green-500 bg-white"
                        >
                          <option value="Conventional">Conventional</option>
                          <option value="Semi-Organic">Semi-Organic</option>
                          <option value="Fully Organic">Fully Organic</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Farming Experience</label>
                        <select
                          value={profileForm.farmDetails.experienceLevel}
                          onChange={(e) => setProfileForm({
                            ...profileForm,
                            farmDetails: { ...profileForm.farmDetails, experienceLevel: e.target.value }
                          })}
                          className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-green-500 bg-white"
                        >
                          <option value="1-2 years">1-2 years</option>
                          <option value="3-5 years">3-5 years</option>
                          <option value="5-10 years">5-10 years</option>
                          <option value="10+ years">10+ years</option>
                        </select>
                      </div>
                    </div>

                    {/* Right Column: Farm Attributes (3 spans) */}
                    <div className="md:col-span-3 space-y-4">
                      <div className="border-b border-gray-100 pb-2">
                        <span className="text-[10px] font-bold text-[#6B8070] uppercase tracking-wider">Land Details & Crop Library</span>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">State</label>
                          <select
                            value={profileForm.farmDetails.state}
                            onChange={(e) => setProfileForm({
                              ...profileForm,
                              farmDetails: { ...profileForm.farmDetails, state: e.target.value }
                            })}
                            className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-green-500 bg-white"
                          >
                            <option value="">Select state</option>
                            {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">District</label>
                          <input
                            type="text"
                            placeholder="e.g. Ludhiana"
                            value={profileForm.farmDetails.district}
                            onChange={(e) => setProfileForm({
                              ...profileForm,
                              farmDetails: { ...profileForm.farmDetails, district: e.target.value }
                            })}
                            className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-green-500 bg-white"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div className="col-span-1">
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Area (Acres)</label>
                          <input
                            type="number"
                            required
                            min="1"
                            value={profileForm.farmDetails.farmArea}
                            onChange={(e) => setProfileForm({
                              ...profileForm,
                              farmDetails: { ...profileForm.farmDetails, farmArea: Number(e.target.value) }
                            })}
                            className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-green-500 bg-white"
                          />
                        </div>
                        <div className="col-span-1">
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Soil Type</label>
                          <select
                            value={profileForm.farmDetails.soilType}
                            onChange={(e) => setProfileForm({
                              ...profileForm,
                              farmDetails: { ...profileForm.farmDetails, soilType: e.target.value }
                            })}
                            className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-green-500 bg-white"
                          >
                            {SOIL_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                        <div className="col-span-1">
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Irrigation Source</label>
                          <select
                            value={profileForm.farmDetails.irrigationSource}
                            onChange={(e) => setProfileForm({
                              ...profileForm,
                              farmDetails: { ...profileForm.farmDetails, irrigationSource: e.target.value }
                            })}
                            className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-green-500 bg-white"
                          >
                            <option value="Rainfed">Rainfed</option>
                            <option value="Drip Irrigation">Drip Irrigation</option>
                            <option value="Sprinkler">Sprinkler</option>
                            <option value="Tubewell">Tubewell</option>
                            <option value="Canal">Canal</option>
                          </select>
                        </div>
                      </div>

                      {/* Crops selection list */}
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">My Cultivated Crops ({profileForm.crops.length})</label>
                        <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto p-2 bg-gray-50 border border-gray-200 rounded-xl custom-scrollbar">
                          {CROP_LIST.map((crop) => {
                            const isSelected = profileForm.crops.includes(crop)
                            return (
                              <button
                                key={crop}
                                type="button"
                                onClick={() => toggleProfileCrop(crop)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border
                                  ${isSelected
                                    ? 'bg-green-600 text-white border-green-600 shadow-sm'
                                    : 'bg-white text-gray-600 border-gray-200 hover:border-green-300'}`}
                              >
                                {isSelected ? `✓ ${crop}` : crop}
                              </button>
                            )
                          })}
                        </div>
                      </div>

                    </div>
                  </div>
                </div>

                {/* Modal Footer Controls */}
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-end gap-3 select-none">
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => setIsProfileOpen(false)}
                    className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold py-2 px-5 rounded-xl text-sm transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving || saveSuccess}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-5 rounded-xl text-sm transition-all flex items-center gap-1.5 shadow-md active:scale-95 disabled:opacity-50"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
