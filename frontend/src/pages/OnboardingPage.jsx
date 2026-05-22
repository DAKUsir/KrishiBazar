import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { CheckCircle2, ChevronRight, ChevronLeft, Leaf } from 'lucide-react'
import api from '../lib/api'
import { INDIAN_STATES, SOIL_TYPES, CROP_LIST } from '../lib/utils'

const LANGUAGES = ['English', 'Hindi', 'Kannada', 'Tamil', 'Telugu']
const STEPS = ['Language', 'Crops', 'Farm Details', 'Complete']

function StepIndicator({ currentStep }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {STEPS.map((step, i) => (
        <div key={step} className="flex items-center">
          <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold transition-all
            ${i < currentStep ? 'bg-green-500 text-white' : i === currentStep ? 'bg-green-600 text-white ring-4 ring-green-200' : 'bg-gray-200 text-gray-500'}`}>
            {i < currentStep ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
          </div>
          {i < STEPS.length - 1 && (
            <div className={`w-12 h-1 mx-1 rounded-full transition-all ${i < currentStep ? 'bg-green-500' : 'bg-gray-200'}`} />
          )}
        </div>
      ))}
    </div>
  )
}

export default function OnboardingPage() {
  const navigate = useNavigate()
  const { updateUser } = useAuth()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    language: 'English',
    crops: [],
    farmDetails: { state: '', district: '', farmArea: '', soilType: 'Loam', irrigationSource: 'Rainfed', experienceLevel: '3-5 years', farmingMethod: 'Conventional' }
  })

  const toggleCrop = (crop) => {
    setForm(f => ({
      ...f,
      crops: f.crops.includes(crop) ? f.crops.filter(c => c !== crop) : [...f.crops, crop]
    }))
  }

  const handleComplete = async () => {
    setLoading(true)
    try {
      const { data } = await api.put('/auth/onboarding', form)
      updateUser(data.user)
      navigate('/dashboard')
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Leaf className="w-6 h-6 text-green-600" />
            <span className="text-green-700 font-bold text-lg">Krishi Bazar</span>
          </div>
          <h1 className="text-3xl font-bold font-display text-gray-900">Set up your farm profile</h1>
          <p className="text-gray-500 mt-1">Personalize your experience in a few steps</p>
        </div>

        <StepIndicator currentStep={step} />

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8"
          >
            {/* Step 1: Language */}
            {step === 0 && (
              <div>
                <h2 className="text-2xl font-bold font-display text-gray-900 mb-2">Select your language</h2>
                <p className="text-gray-500 mb-6">AI advice will be provided in your preferred language</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {LANGUAGES.map(lang => (
                    <button
                      key={lang}
                      onClick={() => setForm(f => ({ ...f, language: lang }))}
                      className={`p-4 rounded-2xl border-2 text-left transition-all font-semibold
                        ${form.language === lang
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-gray-200 hover:border-green-300 text-gray-700'}`}
                    >
                      <div className="text-2xl mb-1">
                        {lang === 'English' ? '🇬🇧' : lang === 'Hindi' ? '🇮🇳' : lang === 'Kannada' ? '🌺' : lang === 'Tamil' ? '🌹' : '🌸'}
                      </div>
                      {lang}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Crops */}
            {step === 1 && (
              <div>
                <h2 className="text-2xl font-bold font-display text-gray-900 mb-2">Select your crops</h2>
                <p className="text-gray-500 mb-4">Choose all crops you grow ({form.crops.length} selected)</p>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-80 overflow-y-auto custom-scrollbar pr-2">
                  {CROP_LIST.map(crop => (
                    <button
                      key={crop}
                      onClick={() => toggleCrop(crop)}
                      className={`p-3 rounded-xl border text-sm text-center transition-all
                        ${form.crops.includes(crop)
                          ? 'border-green-500 bg-green-50 text-green-700 font-semibold'
                          : 'border-gray-200 hover:border-green-300 text-gray-600'}`}
                    >
                      {form.crops.includes(crop) && <span>✓ </span>}
                      {crop}
                    </button>
                  ))}
                </div>
                {form.crops.length === 0 && (
                  <p className="text-orange-500 text-sm mt-3">Please select at least one crop</p>
                )}
              </div>
            )}

            {/* Step 3: Farm Details */}
            {step === 2 && (
              <div>
                <h2 className="text-2xl font-bold font-display text-gray-900 mb-2">Farm details</h2>
                <p className="text-gray-500 mb-6">Help us give you location-specific advice</p>
                <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">State</label>
                    <select
                      value={form.farmDetails.state}
                      onChange={e => setForm(f => ({ ...f, farmDetails: { ...f.farmDetails, state: e.target.value } }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-green-500 bg-white"
                    >
                      <option value="">Select state</option>
                      {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">District</label>
                    <input
                      type="text"
                      placeholder="Enter your district"
                      value={form.farmDetails.district}
                      onChange={e => setForm(f => ({ ...f, farmDetails: { ...f.farmDetails, district: e.target.value } }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-green-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Farm area (acres)</label>
                      <input
                        type="number"
                        placeholder="e.g. 5"
                        value={form.farmDetails.farmArea}
                        onChange={e => setForm(f => ({ ...f, farmDetails: { ...f.farmDetails, farmArea: e.target.value } }))}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Soil type</label>
                      <select
                        value={form.farmDetails.soilType}
                        onChange={e => setForm(f => ({ ...f, farmDetails: { ...f.farmDetails, soilType: e.target.value } }))}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-green-500 bg-white"
                      >
                        {SOIL_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Irrigation Source</label>
                      <select
                        value={form.farmDetails.irrigationSource}
                        onChange={e => setForm(f => ({ ...f, farmDetails: { ...f.farmDetails, irrigationSource: e.target.value } }))}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-green-500 bg-white"
                      >
                        <option value="Rainfed">Rainfed</option>
                        <option value="Drip Irrigation">Drip Irrigation</option>
                        <option value="Sprinkler">Sprinkler</option>
                        <option value="Tubewell">Tubewell</option>
                        <option value="Canal">Canal</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Farming Method</label>
                      <select
                        value={form.farmDetails.farmingMethod}
                        onChange={e => setForm(f => ({ ...f, farmDetails: { ...f.farmDetails, farmingMethod: e.target.value } }))}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-green-500 bg-white"
                      >
                        <option value="Conventional">Conventional</option>
                        <option value="Semi-Organic">Semi-Organic</option>
                        <option value="Fully Organic">Fully Organic</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Farming Experience</label>
                    <select
                      value={form.farmDetails.experienceLevel}
                      onChange={e => setForm(f => ({ ...f, farmDetails: { ...f.farmDetails, experienceLevel: e.target.value } }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-green-500 bg-white"
                    >
                      <option value="1-2 years">1-2 years</option>
                      <option value="3-5 years">3-5 years</option>
                      <option value="5-10 years">5-10 years</option>
                      <option value="10+ years">10+ years</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Complete */}
            {step === 3 && (
              <div className="text-center py-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                  className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                  <CheckCircle2 className="w-14 h-14 text-green-500" />
                </motion.div>
                <h2 className="text-2xl font-bold font-display text-gray-900 mb-3">You're all set! 🎉</h2>
                <p className="text-gray-500 mb-6">Your Krishi Bazar profile is ready. Start monitoring your crops with AI.</p>
                <div className="bg-green-50 rounded-2xl p-4 text-left space-y-2 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Language</span>
                    <span className="font-semibold text-gray-900">{form.language}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Crops</span>
                    <span className="font-semibold text-gray-900">{form.crops.slice(0, 3).join(', ')}{form.crops.length > 3 ? ` +${form.crops.length - 3}` : ''}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Location</span>
                    <span className="font-semibold text-gray-900">{form.farmDetails.district && `${form.farmDetails.district}, `}{form.farmDetails.state || 'India'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Method & Irrigation</span>
                    <span className="font-semibold text-gray-900">{form.farmDetails.farmingMethod} · {form.farmDetails.irrigationSource}</span>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation buttons */}
        <div className="flex justify-between mt-6">
          <button
            onClick={() => setStep(s => s - 1)}
            disabled={step === 0}
            className="flex items-center gap-2 px-6 py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-30 transition-all font-semibold"
          >
            <ChevronLeft className="w-5 h-5" />
            Back
          </button>

          {step < 3 ? (
            <button
              onClick={() => setStep(s => s + 1)}
              disabled={step === 1 && form.crops.length === 0}
              className="flex items-center gap-2 btn-primary disabled:opacity-50"
            >
              Continue
              <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleComplete}
              disabled={loading}
              className="flex items-center gap-2 btn-primary"
            >
              {loading ? 'Setting up...' : 'Go to Dashboard'}
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
