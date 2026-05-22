import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Brain, Sprout, CloudRain, Thermometer, Info,
  Sliders, ArrowRight, Landmark, Loader2, RefreshCw
} from 'lucide-react'
import api from '../lib/api'
import { useAuth } from '../contexts/AuthContext'

export default function YieldPredictor() {
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  
  const getInitialCrop = () => {
    const paramCrop = searchParams.get('crop')
    if (!paramCrop) return 'Wheat'
    const c = paramCrop.toLowerCase()
    if (c.includes('wheat')) return 'Wheat'
    if (c.includes('rice') || c.includes('paddy')) return 'Rice'
    if (c.includes('maize') || c.includes('corn')) return 'Maize'
    if (c.includes('potato')) return 'Potato'
    if (c.includes('tomato')) return 'Tomato'
    return 'Wheat'
  }
  
  // Input states
  const [crop, setCrop] = useState(getInitialCrop)
  const [soil, setSoil] = useState(user?.farmDetails?.soilType || 'Loamy')
  const [season, setSeason] = useState('Rabi')
  const [disease, setDisease] = useState('None')
  const [irrigation, setIrrigation] = useState('Irrigated')
  const [rainfall, setRainfall] = useState(600)
  const [temperature, setTemperature] = useState(28)
  const [fertilizer, setFertilizer] = useState(60)
  const [area, setArea] = useState(user?.farmDetails?.farmArea || 5)
  const [msp, setMsp] = useState(22)

  // API Call states
  const [loading, setLoading] = useState(false)
  const [weatherLoading, setWeatherLoading] = useState(false)
  const [prediction, setPrediction] = useState(null)
  const [error, setError] = useState(null)

  // Fetch weather forecast to prefill temperature and rainfall
  const fetchWeatherPrefill = async () => {
    setWeatherLoading(true)
    try {
      const { data } = await api.get('/weather', {
        params: { state: user?.farmDetails?.state || 'Karnataka' }
      })
      if (data.success && data.weather) {
        const curTemp = Math.round(data.weather.current?.temperature || 28)
        setTemperature(curTemp)

        // Generate dynamic seasonal rainfall pre-fill based on weather risk
        const risk = data.weather.agriculture?.diseaseRisk || 'Low'
        if (risk === 'High') {
          setRainfall(850) // High humidity/rain
        } else if (risk === 'Medium') {
          setRainfall(600)
        } else {
          setRainfall(400) // Dry/Low rain
        }
      }
    } catch (err) {
      console.warn('Failed to pre-fill weather parameters:', err.message)
    } finally {
      setWeatherLoading(false)
    }
  }

  useEffect(() => {
    fetchWeatherPrefill()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setPrediction(null)

    try {
      const { data } = await api.post('/crops/predict-yield', {
        crop,
        soil,
        season,
        disease,
        irrigation,
        rainfall: Number(rainfall),
        temperature: Number(temperature),
        fertilizer: Number(fertilizer),
        area: Number(area),
        msp: Number(msp)
      })

      if (data.success) {
        setPrediction(data.prediction)
      } else {
        throw new Error('Prediction API failed')
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error executing AI yield prediction model')
    } finally {
      setLoading(false)
    }
  }

  // Pre-fill MSP based on crop selection to match typical MSP values
  useEffect(() => {
    const mspDefaults = {
      'Wheat': 22,
      'Rice': 24,
      'Maize': 20,
      'Potato': 15,
      'Tomato': 18
    }
    if (mspDefaults[crop]) {
      setMsp(mspDefaults[crop])
    }
  }, [crop])

  return (
    <div className="p-6 space-y-6">
      {/* Header banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-600 via-indigo-600 to-indigo-700 rounded-2xl p-6 text-white flex items-center justify-between shadow-lg shadow-purple-100"
      >
        <div>
          <div className="flex items-center gap-2 bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full w-fit mb-3">
            <Brain className="w-3.5 h-3.5 animate-pulse" /> Gradio v4 ML Integration
          </div>
          <h2 className="text-2xl font-bold font-display">AI Crop Yield & Profit Predictor</h2>
          <p className="text-purple-50 mt-1">
            Predict yield productivity and financial returns using local weather forecast averages and Gradio AI.
          </p>
        </div>
        <div className="hidden md:block text-6xl opacity-35">🌾</div>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Input Parameters Panel */}
        <div className="lg:col-span-2 space-y-6">
          <div className="dashboard-card p-6 bg-white border border-gray-100 shadow-sm rounded-2xl">
            <div className="flex items-center justify-between mb-5 border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-purple-600" />
                <h3 className="font-bold text-gray-900 font-display">Yield Inputs</h3>
              </div>
              <button
                type="button"
                onClick={fetchWeatherPrefill}
                disabled={weatherLoading}
                className="text-xs text-purple-600 hover:text-purple-800 font-bold flex items-center gap-1.5 transition-colors"
                title="Sync with Live Weather Forecast"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${weatherLoading ? 'animate-spin' : ''}`} />
                Sync Weather Forecast
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                {/* Crop */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Crop Type</label>
                  <select
                    value={crop}
                    onChange={(e) => setCrop(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-purple-500 bg-gray-50/50 font-semibold text-gray-800"
                  >
                    <option value="Wheat">🌾 Wheat</option>
                    <option value="Rice">🍚 Rice / Paddy</option>
                    <option value="Maize">🌽 Maize</option>
                    <option value="Potato">🥔 Potato</option>
                    <option value="Tomato">🍅 Tomato</option>
                  </select>
                </div>

                {/* Soil */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Soil Type</label>
                  <select
                    value={soil}
                    onChange={(e) => setSoil(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-purple-500 bg-gray-50/50 font-semibold text-gray-800"
                  >
                    <option value="Loamy">Loamy Soil</option>
                    <option value="Clayey">Clayey Soil</option>
                    <option value="Sandy">Sandy Soil</option>
                    <option value="Black">Black Fertile Soil</option>
                    <option value="Red">Red Soil</option>
                  </select>
                </div>

                {/* Season */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Season</label>
                  <select
                    value={season}
                    onChange={(e) => setSeason(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-purple-500 bg-gray-50/50 font-semibold text-gray-800"
                  >
                    <option value="Rabi">Rabi (Winter Sowing)</option>
                    <option value="Kharif">Kharif (Monsoon Sowing)</option>
                    <option value="Summer">Zaid (Summer Crop)</option>
                  </select>
                </div>

                {/* Disease */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Disease Severity</label>
                  <select
                    value={disease}
                    onChange={(e) => setDisease(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-purple-500 bg-gray-50/50 font-semibold text-gray-800"
                  >
                    <option value="None">None (Healthy Crop)</option>
                    <option value="Low">Low Severity</option>
                    <option value="Medium">Medium Severity</option>
                    <option value="High">High Severity (Widespread)</option>
                  </select>
                </div>

                {/* Irrigation */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Irrigation Method</label>
                  <select
                    value={irrigation}
                    onChange={(e) => setIrrigation(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-purple-500 bg-gray-50/50 font-semibold text-gray-800"
                  >
                    <option value="Irrigated">Drip / Canal Irrigated</option>
                    <option value="Rainfed">Rainfed (Dryland Sowing)</option>
                  </select>
                </div>

                {/* Farm Area */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Farm Area: {area} Acres</label>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    step="1"
                    value={area}
                    onChange={(e) => setArea(Number(e.target.value))}
                    className="w-full accent-purple-600 h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer mt-3"
                  />
                  <div className="flex justify-between text-[10px] text-gray-400 font-bold mt-1.5">
                    <span>1 Acre</span>
                    <span>20 Acres</span>
                  </div>
                </div>
              </div>

              {/* Advanced Sliders */}
              <div className="bg-purple-50/20 border border-purple-100/40 rounded-2xl p-4 space-y-4">
                <h4 className="text-xs font-bold text-purple-700 uppercase tracking-wider flex items-center gap-1.5">
                  <CloudRain className="w-3.5 h-3.5" /> Weather & Resource Sliders
                </h4>

                <div className="grid sm:grid-cols-2 gap-4">
                  {/* Rainfall */}
                  <div>
                    <div className="flex justify-between text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                      <span>Rainfall</span>
                      <span className="text-purple-600">{rainfall} mm</span>
                    </div>
                    <input
                      type="range"
                      min="100"
                      max="1200"
                      step="25"
                      value={rainfall}
                      onChange={(e) => setRainfall(Number(e.target.value))}
                      className="w-full accent-purple-600 h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer mt-1"
                    />
                  </div>

                  {/* Temperature */}
                  <div>
                    <div className="flex justify-between text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                      <span>Temperature</span>
                      <span className="text-purple-600">{temperature} °C</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="45"
                      step="1"
                      value={temperature}
                      onChange={(e) => setTemperature(Number(e.target.value))}
                      className="w-full accent-purple-600 h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer mt-1"
                    />
                  </div>

                  {/* Fertilizer */}
                  <div>
                    <div className="flex justify-between text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                      <span>Fertilizer Dosage</span>
                      <span className="text-purple-600">{fertilizer} kg/Acre</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="200"
                      step="5"
                      value={fertilizer}
                      onChange={(e) => setFertilizer(Number(e.target.value))}
                      className="w-full accent-purple-600 h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer mt-1"
                    />
                  </div>

                  {/* MSP */}
                  <div>
                    <div className="flex justify-between text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                      <span>Expected MSP</span>
                      <span className="text-purple-600">₹{msp} / kg</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="80"
                      step="1"
                      value={msp}
                      onChange={(e) => setMsp(Number(e.target.value))}
                      className="w-full accent-purple-600 h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 text-sm shadow-lg shadow-purple-200 transition-all active:scale-[0.98] disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Executing AI Prediction...
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4" />
                    Predict Yield & Returns
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Prediction Results Panel */}
        <div className="space-y-6">
          <div className="dashboard-card p-6 bg-white border border-gray-100 shadow-sm rounded-2xl h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-3">
                <Sprout className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-gray-900 font-display">AI Analysis</h3>
              </div>

              {/* Success Output */}
              {prediction && !loading && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-4"
                >
                  <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 text-xs font-semibold text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {prediction}
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-start gap-3">
                    <Info className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <p className="text-[11px] text-green-800 leading-relaxed font-medium">
                      Yield forecasts utilize regression coefficients trained on regional Indian soil conditions and multi-season APMC prices.
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Error Output */}
              {error && !loading && (
                <div className="bg-red-50 border border-red-100 rounded-2xl p-5 text-center space-y-2">
                  <span className="text-2xl block">⚠️</span>
                  <h4 className="font-bold text-red-900 text-sm">Prediction Failed</h4>
                  <p className="text-xs text-red-700">{error}</p>
                </div>
              )}

              {/* Idle State */}
              {!prediction && !error && !loading && (
                <div className="text-center py-12 space-y-4">
                  <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto text-purple-600 text-2xl border border-purple-100 animate-pulse">
                    🤖
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800 text-sm">Waiting for Parameters</h4>
                    <p className="text-xs text-gray-500 max-w-[200px] mx-auto mt-1 leading-relaxed">
                      Sync weather parameters, customize sliders, and run model prediction.
                    </p>
                  </div>
                </div>
              )}

              {/* Loading State Overlay */}
              {loading && (
                <div className="text-center py-16 space-y-4">
                  <Loader2 className="w-10 h-10 text-purple-600 animate-spin mx-auto" />
                  <div>
                    <h4 className="font-bold text-purple-900 text-sm">Krishi AI Running</h4>
                    <p className="text-xs text-purple-600 max-w-[200px] mx-auto mt-1 leading-relaxed font-semibold">
                      Running linear regression models via Gradio Spaces...
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="border-t border-gray-100 pt-4 mt-6">
              <a
                href="/crops"
                className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 hover:underline w-fit transition-colors"
              >
                Browse Crop Library <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
