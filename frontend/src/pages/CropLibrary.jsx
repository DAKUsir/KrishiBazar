import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { Search, BookOpen, Thermometer, Droplets, Cloud, Leaf, ChevronRight, X, Sprout, Brain, Sparkles, Loader2 } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import api from '../lib/api'

function CropCard({ crop, onClick }) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      onClick={() => onClick(crop)}
      className="dashboard-card cursor-pointer overflow-hidden group"
    >
      <div className="h-36 bg-gradient-to-br from-green-100 to-emerald-200 flex items-center justify-center relative overflow-hidden">
        <span className="text-6xl">{crop.emoji || '🌱'}</span>
        <div className="absolute inset-0 bg-green-900/0 group-hover:bg-green-900/10 transition-all" />
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between mb-1">
          <h3 className="font-bold text-gray-900 font-display">{crop.name}</h3>
          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">{crop.category}</span>
        </div>
        <p className="text-xs text-gray-500 italic mb-2">{crop.scientificName}</p>
        <p className="text-sm text-gray-600 line-clamp-2">{crop.description}</p>
        <div className="flex gap-3 mt-3 text-xs text-gray-500">
          <span className="flex items-center gap-1"><Thermometer className="w-3 h-3" />{crop.weather?.temperature}</span>
          <span className="flex items-center gap-1"><Droplets className="w-3 h-3" />{crop.weather?.humidity}</span>
        </div>
      </div>
    </motion.div>
  )
}

function CropDetail({ crop, onClose }) {
  if (!crop) return null
  const navigate = useNavigate()
  const { user } = useAuth()
  const stages = crop.stages || []
  
  const [aiLoading, setAiLoading] = useState(false)
  const [aiPlan, setAiPlan] = useState('')
  const [aiError, setAiError] = useState('')

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

  const isPredictable = ['wheat', 'rice', 'paddy', 'maize', 'corn', 'potato', 'tomato'].some(name => 
    crop.name.toLowerCase().includes(name)
  )

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-end"
      onClick={onClose}
    >
      <motion.div
        initial={{ x: 500 }}
        animate={{ x: 0 }}
        exit={{ x: 500 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-xl h-screen bg-white shadow-2xl overflow-y-auto custom-scrollbar"
      >
        {/* Header */}
        <div className="h-48 bg-gradient-to-br from-green-500 to-emerald-400 relative flex items-end p-6">
          <div className="absolute top-4 right-4">
            <button onClick={onClose} className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
          <span className="absolute top-8 right-12 text-7xl">{crop.emoji || '🌱'}</span>
          <div className="relative z-10 text-white flex flex-col items-start gap-1">
            <h2 className="text-3xl font-bold font-display"> {crop.name}</h2>
            <p className="text-green-100 italic text-sm">{crop.scientificName}</p>
            <div className="flex gap-2 items-center mt-2 flex-wrap">
              <span className="bg-white/20 text-white text-xs px-3 py-1 rounded-full">{crop.category}</span>
              {isPredictable && (
                <button
                  onClick={() => navigate(`/yield-predictor?crop=${crop.name}`)}
                  className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm transition-all active:scale-[0.98]"
                >
                  <Brain className="w-3.5 h-3.5" /> Predict Yield
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Description */}
          <p className="text-gray-600 leading-relaxed">{crop.description}</p>

          {/* AI Advisor Panel */}
          <section className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl p-5 relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-emerald-800 font-bold">
                <Sparkles className="w-5 h-5 text-emerald-600 animate-pulse" />
                <span>Krishi AI Cultivation Plan</span>
              </div>
              {!aiPlan && !aiLoading && (
                <button
                  onClick={fetchAIPlan}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-sm transition-all active:scale-[0.98]"
                >
                  Generate Plan
                </button>
              )}
            </div>

            {aiLoading && (
              <div className="flex flex-col items-center justify-center py-4 gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                <span className="text-xs text-emerald-700 font-medium">Analyzing farm details & weather models...</span>
              </div>
            )}

            {aiPlan && (
              <div className="space-y-3">
                <p className="text-xs text-emerald-950 font-medium leading-relaxed whitespace-pre-line bg-white/70 border border-emerald-100/50 p-4 rounded-xl shadow-sm">
                  {aiPlan}
                </p>
                <div className="flex justify-between items-center text-[10px] text-emerald-600/70 select-none">
                  <span>Based on {user?.farmDetails?.soilType || 'Loam'} soil · {user?.farmDetails?.farmingMethod || 'Organic'} method</span>
                  <button onClick={fetchAIPlan} className="hover:underline font-bold text-emerald-700">Regenerate</button>
                </div>
              </div>
            )}

            {aiError && (
              <p className="text-xs text-red-500 mt-2">{aiError}</p>
            )}

            {!aiPlan && !aiLoading && (
              <p className="text-xs text-gray-500 leading-relaxed">
                Generate a dynamic, customized step-by-step advisory plan using your state, soil type, irrigation source, and crop characteristics.
              </p>
            )}
          </section>

          {/* Growing Info */}
          <section>
            <h3 className="font-bold text-gray-900 font-display mb-3 flex items-center gap-2">
              <Sprout className="w-5 h-5 text-green-600" /> Growing Information
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Season', value: crop.growing?.season },
                { label: 'Harvest', value: crop.growing?.harvestPeriod },
                { label: 'Soil', value: crop.growing?.soilType },
                { label: 'Ideal pH', value: crop.growing?.idealPH },
              ].map(item => (
                <div key={item.label} className="bg-green-50 rounded-xl p-3">
                  <p className="text-xs text-green-600 font-medium">{item.label}</p>
                  <p className="text-sm font-semibold text-gray-900 mt-0.5">{item.value || 'N/A'}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Weather */}
          <section>
            <h3 className="font-bold text-gray-900 font-display mb-3 flex items-center gap-2">
              <Cloud className="w-5 h-5 text-sky-500" /> Weather Requirements
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: Thermometer, label: 'Temperature', value: crop.weather?.temperature, color: 'bg-orange-50 text-orange-600' },
                { icon: Droplets, label: 'Humidity', value: crop.weather?.humidity, color: 'bg-blue-50 text-blue-600' },
                { icon: Cloud, label: 'Rainfall', value: crop.weather?.rainfall, color: 'bg-sky-50 text-sky-600' },
              ].map(item => (
                <div key={item.label} className={`rounded-xl p-3 ${item.color.split(' ')[0]}`}>
                  <item.icon className={`w-4 h-4 ${item.color.split(' ')[1]} mb-1`} />
                  <p className="text-xs text-gray-500">{item.label}</p>
                  <p className="text-sm font-semibold text-gray-800 mt-0.5">{item.value || 'N/A'}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Growth Stages */}
          {stages.length > 0 && (
            <section>
              <h3 className="font-bold text-gray-900 font-display mb-3">Growth Stages</h3>
              <div className="space-y-3">
                {stages.map((stage, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                        {i + 1}
                      </div>
                      {i < stages.length - 1 && <div className="w-0.5 h-6 bg-green-200 mt-1" />}
                    </div>
                    <div className="pb-2">
                      <p className="font-semibold text-gray-900 text-sm">{stage.name}</p>
                      <p className="text-xs text-green-600">{stage.duration}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{stage.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Diseases */}
          {crop.diseases?.length > 0 && (
            <section>
              <h3 className="font-bold text-gray-900 font-display mb-3">Common Diseases</h3>
              <div className="space-y-3">
                {crop.diseases.map((d, i) => (
                  <div key={i} className="bg-red-50 border border-red-100 rounded-xl p-4">
                    <p className="font-semibold text-red-900">{d.name}</p>
                    <p className="text-sm text-red-700 mt-1"><strong>Symptoms:</strong> {d.symptoms}</p>
                    <p className="text-sm text-red-600 mt-1"><strong>Prevention:</strong> {d.prevention}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Nutrients */}
          {crop.nutrients && (
            <section>
              <h3 className="font-bold text-gray-900 font-display mb-3">Nutrient Requirements</h3>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { name: 'N', full: 'Nitrogen', value: crop.nutrients.nitrogen, color: 'bg-green-100 text-green-700' },
                  { name: 'P', full: 'Phosphorus', value: crop.nutrients.phosphorus, color: 'bg-orange-100 text-orange-700' },
                  { name: 'K', full: 'Potassium', value: crop.nutrients.potassium, color: 'bg-purple-100 text-purple-700' },
                ].map(n => (
                  <div key={n.name} className={`rounded-xl p-3 text-center ${n.color}`}>
                    <div className="text-2xl font-bold">{n.name}</div>
                    <div className="text-xs font-medium">{n.full}</div>
                    <div className="text-xs mt-1 opacity-80">{n.value}</div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Market */}
          {crop.market && (
            <section className="bg-green-50 border border-green-200 rounded-2xl p-4">
              <h3 className="font-bold text-gray-900 font-display mb-3">Market Information</h3>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="text-xs text-gray-500">Demand</p>
                  <p className="font-bold text-green-700">{crop.market.demand}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Price Range</p>
                  <p className="font-bold text-green-700">{crop.market.priceRange}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Best Season</p>
                  <p className="font-bold text-green-700">{crop.market.bestSeason}</p>
                </div>
              </div>
            </section>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function CropLibrary() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [selectedCrop, setSelectedCrop] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['crops', search, category],
    queryFn: () => api.get('/crops', { params: { search, category } }).then(r => r.data),
  })

  const categories = ['Grain', 'Vegetable', 'Fiber', 'Cash Crop', 'Fruit', 'Spice']

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search crops by name or scientific name..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-green-500 bg-white shadow-sm"
            />
          </div>
        </div>

        {/* Category filters */}
        <div className="flex gap-2 mt-4 flex-wrap">
          <button
            onClick={() => setCategory('')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${!category ? 'bg-green-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-green-300'}`}
          >
            All Crops
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat === category ? '' : cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${category === cat ? 'bg-green-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-green-300'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Crop grid */}
      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="skeleton h-72 rounded-2xl" />
          ))}
        </div>
      ) : (
        <>
          <p className="text-gray-500 text-sm mb-4">{data?.total || 0} crops found</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {data?.crops?.map((crop, i) => (
              <motion.div
                key={crop.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <CropCard crop={crop} onClick={setSelectedCrop} />
              </motion.div>
            ))}
          </div>
        </>
      )}

      {selectedCrop && <CropDetail crop={selectedCrop} onClose={() => setSelectedCrop(null)} />}
    </div>
  )
}
