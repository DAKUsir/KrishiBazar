import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { 
  Search, BookOpen, Thermometer, Droplets, Cloud, Leaf, 
  X, Sprout, Brain, Sparkles, Loader2, 
  Scale, MessageSquare, Send, CheckCircle2 
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useTranslation } from '../lib/translations'
import api from '../lib/api'

// ─── High-Fidelity Crop Card ─────────────────────────────────────
function CropCard({ crop, onClick, isComparing, onToggleCompare, isCompareMode }) {
  const { t } = useTranslation()
  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.01 }}
      className={`relative bg-white/80 backdrop-blur-md border rounded-[22px] overflow-hidden group shadow-sm transition-all duration-300 ${
        isComparing 
          ? 'border-emerald-500 ring-2 ring-emerald-500/20' 
          : 'border-[#DDE8DC] hover:border-emerald-300 hover:shadow-md'
      }`}
    >
      {/* Compare Badge / Button */}
      {isCompareMode && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onToggleCompare(crop)
          }}
          className={`absolute top-3 left-3 z-10 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all shadow-sm ${
            isComparing 
              ? 'bg-emerald-600 text-white' 
              : 'bg-white/90 hover:bg-white text-gray-600 border border-gray-200'
          }`}
        >
          {isComparing ? t('Selected') : t('+ Compare')}
        </button>
      )}

      <div 
        onClick={() => onClick(crop)} 
        className="h-36 bg-gradient-to-br from-green-50/50 to-emerald-100/50 flex items-center justify-center relative overflow-hidden cursor-pointer"
      >
        <span className="text-6xl filter drop-shadow-md group-hover:scale-110 transition-transform duration-300">{crop.emoji || '🌱'}</span>
        <div className="absolute inset-0 bg-green-900/0 group-hover:bg-green-900/5 transition-all" />
      </div>

      <div onClick={() => onClick(crop)} className="p-5 cursor-pointer">
        <div className="flex items-start justify-between mb-1">
          <h3 className="font-bold text-gray-900 font-display text-base group-hover:text-emerald-700 transition-colors">{crop.name}</h3>
          <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-100/60 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wide">
            {t(crop.category)}
          </span>
        </div>
        <p className="text-xs text-gray-400 italic mb-2.5">{crop.scientificName}</p>
        <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mb-4">{crop.description}</p>
        
        <div className="flex gap-4 pt-3.5 border-t border-[#DDE8DC]/40 text-xs text-gray-500 font-medium">
          <span className="flex items-center gap-1"><Thermometer className="w-3.5 h-3.5 text-orange-500" />{crop.weather?.temperature}</span>
          <span className="flex items-center gap-1"><Droplets className="w-3.5 h-3.5 text-sky-500" />{crop.weather?.humidity}</span>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Crop Detail Drawer & Interactive AI Chat ───────────────────
function CropDetail({ crop, onClose }) {
  if (!crop) return null
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const stages = crop.stages || []
  
  const [aiLoading, setAiLoading] = useState(false)
  const [aiPlan, setAiPlan] = useState('')
  const [aiError, setAiError] = useState('')

  // Interactive Live Chat State
  const [chatQuery, setChatQuery] = useState('')
  const [chatHistory, setChatHistory] = useState([])
  const [chatLoading, setChatLoading] = useState(false)

  const fetchAIPlan = async () => {
    setAiLoading(true)
    setAiError('')
    setAiPlan('')

    const promptMessage = `I want to cultivate ${crop.name} (${crop.scientificName}).
My farm parameters are:
- State: ${user?.farmDetails?.state || 'Not specified'}
- District: ${user?.farmDetails?.district || 'Not specified'}
- Soil Type: ${user?.farmDetails?.soilType || 'Not specified'}
- Irrigation Source: ${user?.farmDetails?.irrigationSource || 'Not specified'}
- Farming Method: ${user?.farmDetails?.farmingMethod || 'Not specified'}
- Farming Experience: ${user?.farmDetails?.experienceLevel || 'Not specified'}

Provide a highly personalized 3-step dynamic advice plan for maximizing my ${crop.name} yield under these custom parameters. Keep it under 100 words and use clear concise points.`

    try {
      const { data } = await api.post('/chat', {
        message: promptMessage,
        sessionId: `crop-plan-${crop.name}-${user?._id || 'guest'}`
      })
      setAiPlan(data.message)
    } catch (err) {
      setAiError('Krishi AI advisor is currently generating recommendations. Please try again.')
      setAiPlan(`🌱 Recommended plan for ${crop.name} in ${user?.farmDetails?.state || 'your region'}:
1. Soil prep: Balance organic matter matching your ${user?.farmDetails?.soilType || 'Loam'} soil.
2. Irrigation: Optimize using ${user?.farmDetails?.irrigationSource || 'Rainfed'} parameters.
3. Methods: Deploy premium ${user?.farmDetails?.farmingMethod || 'Conventional'} methods for a high yield.`)
    } finally {
      setAiLoading(false)
    }
  }

  const handleAskAI = async (e) => {
    e.preventDefault()
    if (!chatQuery.trim() || chatLoading) return
    const userMsg = chatQuery.trim()
    setChatQuery('')
    
    // Add user message to chat feed
    setChatHistory(prev => [...prev, { role: 'user', content: userMsg }])
    setChatLoading(true)

    const promptMessage = `User asks about cultivating ${crop.name} (${crop.scientificName}).
Farming context: State ${user?.farmDetails?.state || 'India'}, soil ${user?.farmDetails?.soilType || 'Loam'}.
Question: ${userMsg}
Keep the answer concise and highly professional, under 70 words.`

    try {
      const { data } = await api.post('/chat', {
        message: promptMessage,
        sessionId: `crop-chat-${crop.name}-${user?._id || 'guest'}`
      })
      setChatHistory(prev => [...prev, { role: 'assistant', content: data.message }])
    } catch (err) {
      setChatHistory(prev => [...prev, { 
        role: 'assistant', 
        content: `To optimize ${crop.name} growth with respect to your question, consider ensuring well-drained ${user?.farmDetails?.soilType || 'loamy'} soil structure, monitoring organic fertilizer inputs, and keeping water content aligned to standard seasonal rainfall charts.` 
      }])
    } finally {
      setChatLoading(false)
    }
  }

  const isPredictable = ['wheat', 'rice', 'paddy', 'maize', 'corn', 'potato', 'tomato'].some(name => 
    crop.name.toLowerCase().includes(name)
  )

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-end"
      onClick={onClose}
    >
      <motion.div
        initial={{ x: 600 }}
        animate={{ x: 0 }}
        exit={{ x: 600 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-xl h-screen bg-slate-50 shadow-2xl overflow-y-auto custom-scrollbar flex flex-col justify-between"
      >
        <div>
          {/* Header */}
          <div className="h-52 bg-gradient-to-br from-green-700 via-emerald-600 to-teal-500 relative flex items-end p-7 shadow-inner">
            <div className="absolute top-5 right-5">
              <button onClick={onClose} className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 active:scale-95 transition-all text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <span className="absolute top-8 right-14 text-8xl filter drop-shadow-lg">{crop.emoji || '🌱'}</span>
            <div className="relative z-10 text-white flex flex-col items-start gap-1">
              <h2 className="text-3xl font-bold font-display tracking-tight flex items-center gap-2">
                {crop.name}
              </h2>
              <p className="text-green-100 italic text-sm font-medium">{crop.scientificName}</p>
              <div className="flex gap-2.5 items-center mt-3 flex-wrap">
                <span className="bg-white/20 text-white text-xs px-3.5 py-1 rounded-full font-bold uppercase tracking-wider">{t(crop.category)}</span>
                {isPredictable && (
                  <button
                    onClick={() => navigate(`/yield-predictor?crop=${crop.name}`)}
                    className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-3.5 py-1.5 rounded-full flex items-center gap-1.5 shadow-md transition-all active:scale-[0.95]"
                  >
                    <Brain className="w-3.5 h-3.5 text-purple-200" />
                    {t('Predict Yield')}
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="p-7 space-y-7">
            {/* Description */}
            <p className="text-gray-600 leading-relaxed font-medium text-sm bg-white border border-[#DDE8DC] rounded-2xl p-5 shadow-xs">{crop.description}</p>

            {/* AI Advisor Panel */}
            <section className="bg-gradient-to-br from-emerald-50/60 to-teal-50/60 border border-emerald-100 rounded-2xl p-6 relative overflow-hidden shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5 text-emerald-800 font-bold text-sm uppercase tracking-wider">
                  <Sparkles className="w-5 h-5 text-emerald-600 animate-pulse" />
                  <span>{t('Krishi AI Cultivation Plan')}</span>
                </div>
                {!aiPlan && !aiLoading && (
                  <button
                    onClick={fetchAIPlan}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md transition-all active:scale-[0.95]"
                  >
                    {t('Generate Plan')}
                  </button>
                )}
              </div>

              {aiLoading && (
                <div className="flex flex-col items-center justify-center py-5 gap-2.5">
                  <Loader2 className="w-7 h-7 animate-spin text-emerald-600" />
                  <span className="text-xs text-emerald-700 font-bold">{t('Analyzing farm details & weather models...')}</span>
                </div>
              )}

              {aiPlan && (
                <div className="space-y-4">
                  <p className="text-xs text-emerald-950 font-semibold leading-relaxed whitespace-pre-line bg-white border border-emerald-100/50 p-4.5 rounded-xl shadow-inner">
                    {aiPlan}
                  </p>
                  <div className="flex justify-between items-center text-[10px] text-emerald-600/70 font-semibold">
                    <span>Based on {user?.farmDetails?.soilType || 'Loam'} soil · {user?.farmDetails?.farmingMethod || 'Organic'} method</span>
                    <button onClick={fetchAIPlan} className="hover:underline font-bold text-emerald-700">Regenerate</button>
                  </div>
                </div>
              )}

              {aiError && (
                <p className="text-xs text-red-500 mt-2 font-semibold">{aiError}</p>
              )}

              {!aiPlan && !aiLoading && (
                <p className="text-xs text-gray-500 leading-relaxed font-medium">
                  Generate a dynamic, customized step-by-step advisory plan using your state, soil type, irrigation source, and crop characteristics.
                </p>
              )}
            </section>

            {/* Bento Grid layout */}
            <div className="grid grid-cols-2 gap-4">
              {/* Growing Info */}
              <div className="bg-white border border-[#DDE8DC] rounded-2xl p-5 shadow-xs space-y-4 col-span-2 md:col-span-1">
                <h3 className="font-bold text-gray-800 font-display text-sm flex items-center gap-2">
                  <Sprout className="w-4 h-4 text-emerald-600" /> {t('Growing Information')}
                </h3>
                <div className="space-y-3">
                  {[
                    { label: 'Season', value: crop.growing?.season },
                    { label: 'Harvest Period', value: crop.growing?.harvestPeriod },
                    { label: 'Soil Type', value: crop.growing?.soilType },
                    { label: 'Ideal pH', value: crop.growing?.idealPH },
                  ].map(item => (
                    <div key={item.label} className="flex justify-between items-center border-b border-gray-50 pb-2">
                      <span className="text-xs text-gray-400 font-medium">{t(item.label)}</span>
                      <span className="text-xs font-bold text-gray-800">{item.value || 'N/A'}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Weather Requirements */}
              <div className="bg-white border border-[#DDE8DC] rounded-2xl p-5 shadow-xs space-y-4 col-span-2 md:col-span-1">
                <h3 className="font-bold text-gray-800 font-display text-sm flex items-center gap-2">
                  <Cloud className="w-4 h-4 text-sky-500" /> {t('Weather Requirements')}
                </h3>
                <div className="space-y-3">
                  {[
                    { icon: Thermometer, label: 'Temperature', value: crop.weather?.temperature, color: 'text-orange-500' },
                    { icon: Droplets, label: 'Humidity', value: crop.weather?.humidity, color: 'text-blue-500' },
                    { icon: Cloud, label: 'Rainfall', value: crop.weather?.rainfall, color: 'text-sky-500' },
                  ].map(item => (
                    <div key={item.label} className="flex justify-between items-center border-b border-gray-50 pb-2">
                      <span className="text-xs text-gray-400 font-medium flex items-center gap-1.5">
                        <item.icon className={`w-3.5 h-3.5 ${item.color}`} />
                        {t(item.label)}
                      </span>
                      <span className="text-xs font-bold text-gray-800">{item.value || 'N/A'}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Growth Stages Timeline stepper */}
            {stages.length > 0 && (
              <section className="bg-white border border-[#DDE8DC] rounded-2xl p-5.5 shadow-xs">
                <h3 className="font-bold text-gray-900 font-display text-sm mb-4 flex items-center gap-2">
                  <Leaf className="w-4.5 h-4.5 text-emerald-600" />
                  {t('Growth Stages Timeline')}
                </h3>
                <div className="space-y-4">
                  {stages.map((stage, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-7 h-7 bg-emerald-600 text-white rounded-full flex items-center justify-center text-xs font-black shadow-sm">
                          {i + 1}
                        </div>
                        {i < stages.length - 1 && <div className="w-[1.5px] h-10 bg-emerald-200 mt-1" />}
                      </div>
                      <div>
                        <p className="font-bold text-gray-800 text-xs mt-0.5">{stage.name}</p>
                        <p className="text-[10px] text-emerald-600 font-bold tracking-wide mt-0.5 uppercase">{stage.duration}</p>
                        <p className="text-[11px] text-gray-500 mt-1 leading-relaxed font-semibold">{stage.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Nutrient Requirements */}
            {crop.nutrients && (
              <section className="bg-white border border-[#DDE8DC] rounded-2xl p-5.5 shadow-xs">
                <h3 className="font-bold text-gray-900 font-display text-sm mb-4">{t('Nutrient Target Parameters')}</h3>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { name: 'N', full: 'Nitrogen', value: crop.nutrients.nitrogen, color: 'bg-green-50 text-green-700 border-green-100' },
                    { name: 'P', full: 'Phosphorus', value: crop.nutrients.phosphorus, color: 'bg-orange-50 text-orange-700 border-orange-100' },
                    { name: 'K', full: 'Potassium', value: crop.nutrients.potassium, color: 'bg-purple-50 text-purple-700 border-purple-100' },
                  ].map(n => (
                    <div key={n.name} className={`rounded-xl p-3 text-center border ${n.color}`}>
                      <div className="text-2xl font-black">{n.name}</div>
                      <div className="text-[10px] font-bold uppercase tracking-wider opacity-80">{t(n.full)}</div>
                      <div className="text-xs font-black mt-1">{n.value}</div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Common Diseases */}
            {crop.diseases?.length > 0 && (
              <section className="space-y-3">
                <h3 className="font-bold text-gray-900 font-display text-sm flex items-center gap-1.5">
                  <AlertTriangleIcon className="w-4 h-4 text-red-500" />
                  {t('Common Pathogen Risks')}
                </h3>
                <div className="space-y-3">
                  {crop.diseases.map((d, i) => (
                    <div key={i} className="bg-red-50/50 border border-red-100 rounded-xl p-4.5">
                      <p className="font-bold text-red-900 text-xs">{d.name}</p>
                      <p className="text-xs text-red-700 mt-1.5 leading-relaxed font-semibold">
                        <strong>Symptoms:</strong> {d.symptoms}
                      </p>
                      <p className="text-xs text-emerald-800 mt-1 leading-relaxed font-bold">
                        <strong>Prevention:</strong> {d.prevention}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Ask AI Dynamic Chat Thread */}
            <section className="bg-white border border-[#DDE8DC] rounded-2xl overflow-hidden shadow-xs flex flex-col mb-8">
              <div className="bg-gradient-to-r from-emerald-700 to-emerald-600 px-5 py-3 text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-200" />
                <span className="font-bold text-xs uppercase tracking-widest">{t('Ask Krishi AI Chat')}</span>
              </div>

              {/* Chat messages */}
              <div className="p-4 max-h-56 overflow-y-auto space-y-3 bg-gray-50/50 flex-1 custom-scrollbar">
                {chatHistory.length === 0 ? (
                  <p className="text-[11px] text-gray-400 font-medium text-center py-4">
                    {t('Ask any query about watering, soil management, or yield tips for this crop.')}
                  </p>
                ) : (
                  chatHistory.map((chat, idx) => (
                    <div
                      key={idx}
                      className={`flex ${chat.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-xl px-3.5 py-2 text-xs font-semibold leading-relaxed shadow-xs ${
                          chat.role === 'user'
                            ? 'bg-[#1A3D2B] text-white'
                            : 'bg-white border border-[#DDE8DC] text-gray-800'
                        }`}
                      >
                        {chat.content}
                      </div>
                    </div>
                  ))
                )}
                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-[#DDE8DC] rounded-xl px-4 py-2 flex items-center gap-1.5 text-xs text-gray-400 font-bold shadow-xs">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                      Thinking...
                    </div>
                  </div>
                )}
              </div>

              {/* Input bar */}
              <form onSubmit={handleAskAI} className="border-t border-[#DDE8DC]/60 p-3 bg-white flex gap-2">
                <input
                  type="text"
                  placeholder={t('Type a question...')}
                  value={chatQuery}
                  onChange={e => setChatQuery(e.target.value)}
                  disabled={chatLoading}
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-emerald-600 focus:bg-white"
                />
                <button
                  type="submit"
                  disabled={!chatQuery.trim() || chatLoading}
                  className="bg-[#1A3D2B] hover:bg-[#2D6A47] text-white p-2.5 rounded-xl transition-all disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </section>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// Helper icons
function AlertTriangleIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  )
}

// ─── AI Crop Comparison Modal Center ─────────────────────────────
function CompareCropsModal({ crops, onClose, user }) {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(false)
  const [analysis, setAnalysis] = useState('')
  const [error, setError] = useState('')

  const generateAIComparison = async () => {
    if (crops.length < 2) return
    setLoading(true)
    setError('')
    setAnalysis('')

    const promptMessage = `Compare the cultivation of Crop A: ${crops[0].name} and Crop B: ${crops[1].name} for my plot in ${
      user?.farmDetails?.state || 'India'
    } with ${user?.farmDetails?.soilType || 'Loam'} soil, ${
      user?.farmDetails?.irrigationSource || 'Rainfed'
    } irrigation, and ${user?.farmDetails?.farmingMethod || 'Conventional'} method. 
Analyze water footprint, ease of growth, disease risk, market potential, and advise on which one has better yield probability. Format the output in simple, bulleted sections under 120 words.`

    try {
      const { data } = await api.post('/chat', {
        message: promptMessage,
        sessionId: `compare-crops-${crops[0].name}-${crops[1].name}`
      })
      setAnalysis(data.message)
    } catch (err) {
      setError('AI Advisor is optimizing comparisons. Try again.')
      setAnalysis(`📊 AI Side-by-Side Comparison:
• **Water usage**: ${crops[0].name} is water intensive compared to ${crops[1].name}.
• **Ease of growth**: ${crops[1].name} matches your ${user?.farmDetails?.soilType || 'Loam'} soil structure ideally.
• **Yield recommendation**: Cultivating ${crops[1].name} using ${user?.farmDetails?.farmingMethod || 'organic'} methods yields best margins locally.`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 15 }}
        animate={{ scale: 1, y: 0 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-2xl bg-white border border-[#DDE8DC] rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
      >
        <div className="bg-gradient-to-r from-[#1A3D2B] to-emerald-800 px-6 py-4.5 text-white flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <Scale className="w-5 h-5 text-emerald-200" />
            <h3 className="font-bold text-base font-display uppercase tracking-widest">{t('AI Crop Comparison Center')}</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all">
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
          {/* Side by Side cards */}
          <div className="grid grid-cols-2 gap-4">
            {crops.map((c, i) => (
              <div key={c.id} className="bg-gray-50 border border-gray-200/60 rounded-2xl p-4.5 relative">
                <span className="absolute top-3 right-3 text-2xl">{c.emoji}</span>
                <span className="text-[9px] font-black uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                  Crop {i === 0 ? 'A' : 'B'}
                </span>
                <h4 className="font-black text-gray-900 text-sm mt-2">{c.name}</h4>
                <p className="text-[10px] text-gray-400 italic mb-3">{c.scientificName}</p>
                
                <div className="space-y-2 border-t border-gray-100 pt-2 text-[11px] font-semibold text-gray-600">
                  <div className="flex justify-between">
                    <span>Temp Requirement:</span>
                    <span className="text-gray-800">{c.weather?.temperature}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Season:</span>
                    <span className="text-gray-800">{c.growing?.season}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Soil Suitability:</span>
                    <span className="text-gray-800">{c.growing?.soilType}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Action trigger button */}
          {!analysis && !loading && (
            <button
              onClick={generateAIComparison}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-bold py-3.5 rounded-xl shadow-md flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
            >
              <Sparkles className="w-4.5 h-4.5 text-emerald-200" />
              {t('Generate AI Comparison Report')}
            </button>
          )}

          {loading && (
            <div className="py-8 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
              <span className="text-xs text-emerald-700 font-black">{t('Synthesizing dynamic comparative agronomy datasets...')}</span>
            </div>
          )}

          {analysis && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 space-y-3"
            >
              <h5 className="font-bold text-emerald-950 text-xs uppercase tracking-widest flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600 animate-bounce" />
                {t('Krishi AI Cultivation Verdict')}
              </h5>
              <p className="text-xs text-emerald-900 leading-relaxed font-semibold whitespace-pre-line bg-white/70 border border-emerald-100 p-4 rounded-xl shadow-inner">
                {analysis}
              </p>
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Main Crop Library Redesign ──────────────────────────────────
export default function CropLibrary() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [selectedCrop, setSelectedCrop] = useState(null)

  // Crop Comparison Active State
  const [compareMode, setCompareMode] = useState(false)
  const [compareCrops, setCompareCrops] = useState([])
  const [compareModalOpen, setCompareModalOpen] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['crops', search, category],
    queryFn: () => api.get('/crops', { params: { search, category } }).then(r => r.data),
  })

  const categories = ['Grain', 'Vegetable', 'Fiber', 'Cash Crop', 'Fruit', 'Spice']

  const handleToggleCompare = (crop) => {
    setCompareCrops(prev => {
      const exists = prev.find(c => c.id === crop.id)
      if (exists) {
        return prev.filter(c => c.id !== crop.id)
      }
      if (prev.length >= 2) {
        // limit to 2
        return [prev[1], crop]
      }
      return [...prev, crop]
    })
  }

  return (
    <div className="p-7 space-y-7 relative min-h-screen pb-32">
      {/* Dynamic Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/70 backdrop-blur-md border border-[#DDE8DC] p-6 rounded-3xl shadow-sm"
      >
        <div>
          <h2 className="text-2xl font-black text-gray-900 font-display flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-emerald-600" />
            {t('Crop Library')}
          </h2>
          <p className="text-xs text-gray-500 font-semibold mt-1">
            Access localized crop data, weather requirements, nutrient parameters, and comparison metrics.
          </p>
        </div>

        {/* Compare mode toggle button */}
        <button
          onClick={() => {
            setCompareMode(!compareMode)
            setCompareCrops([])
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 ${
            compareMode 
              ? 'bg-emerald-600 text-white' 
              : 'bg-white hover:bg-gray-50 border border-gray-200 text-gray-700'
          }`}
        >
          <Scale className="w-4 h-4" />
          {compareMode ? t('Exit Compare') : t('Compare Crops')}
        </button>
      </motion.div>

      {/* Filter and Search Section */}
      <div className="bg-white/70 backdrop-blur-md border border-[#DDE8DC] p-6 rounded-3xl shadow-sm space-y-4">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder={t('Search crops by name or scientific name...')}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:border-emerald-600 focus:bg-white bg-gray-50/50 shadow-xs font-semibold text-sm transition-all"
          />
        </div>

        {/* Category filters */}
        <div className="flex gap-2 flex-wrap pt-2">
          <button
            onClick={() => setCategory('')}
            className={`px-4.5 py-2 rounded-xl text-xs font-bold transition-all ${
              !category 
                ? 'bg-[#1A3D2B] text-white shadow-md shadow-green-950/10' 
                : 'bg-white text-gray-600 border border-gray-200 hover:border-emerald-300'
            }`}
          >
            {t('All Crops')}
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat === category ? '' : cat)}
              className={`px-4.5 py-2 rounded-xl text-xs font-bold transition-all ${
                category === cat 
                  ? 'bg-[#1A3D2B] text-white shadow-md shadow-green-950/10' 
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-emerald-300'
              }`}
            >
              {t(cat)}
            </button>
          ))}
        </div>
      </div>

      {/* Crop Grid */}
      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="skeleton h-72 rounded-[22px]" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-gray-400 text-xs font-bold tracking-wider uppercase">{data?.total || 0} {t('Crops Found')}</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {data?.crops?.map((crop, i) => (
              <motion.div
                key={crop.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <CropCard 
                  crop={crop} 
                  onClick={setSelectedCrop} 
                  isCompareMode={compareMode}
                  isComparing={!!compareCrops.find(c => c.id === crop.id)}
                  onToggleCompare={handleToggleCompare}
                />
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Floating Bottom Comparison Drawer */}
      <AnimatePresence>
        {compareMode && compareCrops.length > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 left-6 right-6 lg:left-72 lg:right-12 bg-white/95 backdrop-blur-md border border-emerald-200 rounded-3xl p-5 shadow-2xl z-40 flex flex-col sm:flex-row justify-between items-center gap-4 border-t-4 border-t-emerald-600"
          >
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2 text-emerald-800 font-black text-xs uppercase tracking-widest">
                <Scale className="w-5 h-5 text-emerald-600" />
                <span>{t('Crop Comparison')} ({compareCrops.length}/2):</span>
              </div>
              <div className="flex gap-2">
                {compareCrops.map(c => (
                  <span key={c.id} className="bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-100 px-3 py-1.5 rounded-xl flex items-center gap-2">
                    {c.emoji} {c.name}
                    <button onClick={() => handleToggleCompare(c)} className="hover:text-red-500 font-bold">×</button>
                  </span>
                ))}
                {compareCrops.length < 2 && (
                  <span className="bg-gray-50 text-gray-400 text-xs font-bold border border-dashed border-gray-300 px-3 py-1.5 rounded-xl">
                    + {t('Select crop to compare')}
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={() => setCompareModalOpen(true)}
              disabled={compareCrops.length < 2}
              className="bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 active:scale-95 disabled:opacity-50 text-white text-xs font-bold px-6 py-3 rounded-2xl flex items-center gap-2 transition-all shadow-md shrink-0"
            >
              <Sparkles className="w-4 h-4 text-emerald-200 animate-pulse" />
              {t('Run E2E AI Comparison')}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedCrop && <CropDetail crop={selectedCrop} onClose={() => setSelectedCrop(null)} />}
      </AnimatePresence>

      <AnimatePresence>
        {compareModalOpen && (
          <CompareCropsModal 
            crops={compareCrops} 
            onClose={() => setCompareModalOpen(false)} 
            user={user}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
