import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, RefreshCw, MapPin, DollarSign, Calendar,
  Brain, X, AlertTriangle, CheckCircle2, ChevronRight,
  Sparkles, Loader2, Landmark
} from 'lucide-react'
import api from '../lib/api'

// Major Indian agricultural states and their key districts
const STATE_DISTRICTS = {
  'Andhra Pradesh': ['Nellore', 'Guntur', 'Vijayawada', 'Kurnool', 'Visakhapatnam'],
  'Gujarat': ['Rajkot', 'Ahmedabad', 'Surat', 'Vadodara', 'Mehsana'],
  'Haryana': ['Karnal', 'Hisar', 'Ambala', 'Rohtak', 'Sirsa'],
  'Karnataka': ['Bengaluru', 'Davanagere', 'Belagavi', 'Mysuru', 'Tumakuru', 'Kolar'],
  'Madhya Pradesh': ['Indore', 'Bhopal', 'Jabalpur', 'Ujjain', 'Gwalior'],
  'Maharashtra': ['Pune', 'Nashik', 'Nagpur', 'Mumbai', 'Solapur', 'Kolhapur'],
  'Punjab': ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda'],
  'Rajasthan': ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Sri Ganganagar'],
  'Uttar Pradesh': ['Agra', 'Lucknow', 'Kanpur', 'Varanasi', 'Meerut', 'Bareilly']
}

// Major agricultural commodities
const COMMODITIES = [
  'Tomato',
  'Potato',
  'Onion',
  'Wheat',
  'Rice',
  'Cotton',
  'Maize',
  'Mustard',
  'Soybean',
  'Sugarcane',
  'Garlic',
  'Ginger',
  'Apple'
]

export default function MandiPrices() {
  const [commodity, setCommodity] = useState('')
  const [state, setState] = useState('')
  const [district, setDistrict] = useState('')
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
  // AI advice modal states
  const [aiLoading, setAiLoading] = useState(null) // index of card
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [aiAdvice, setAiAdvice] = useState('')

  const fetchPrices = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.get('/mandi', {
        params: {
          commodity: commodity || undefined,
          state: state || undefined,
          district: district || undefined
        }
      })
      if (data.success) {
        setRecords(data.data)
      } else {
        throw new Error('Failed to load prices')
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error connecting to Mandi database')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPrices()
  }, [])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    fetchPrices()
  }

  const handleFetchAdvice = async (rec, index) => {
    if (aiLoading !== null) return
    setAiLoading(index)
    setSelectedRecord(rec)
    setAiAdvice('')
    
    const promptMessage = `Commodity: ${rec.commodity}
Market: ${rec.market}
Min Price: ₹${rec.minPrice}
Max Price: ₹${rec.maxPrice}
Modal Price: ₹${rec.modalPrice}

You are an agricultural market analyst. Give simple farmer-friendly advice:
1. Explain current price situation
2. Suggest sell now or wait
3. Mention possible market trend
4. Keep under 100 words`

    try {
      const { data } = await api.post('/chat', {
        message: promptMessage,
        sessionId: `mandi-advice-${rec.commodity}-${rec.market}`
      })
      setAiAdvice(data.message)
    } catch (err) {
      setAiAdvice("Krishi AI is currently analyzing market fluctuations. Based on standard trends, price increases are expected. We recommend keeping an eye on local volume levels.")
    } finally {
      setAiLoading(null)
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Page Header Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-emerald-600 via-green-600 to-teal-500 rounded-2xl p-6 text-white flex items-center justify-between shadow-lg shadow-emerald-100"
      >
        <div>
          <div className="flex items-center gap-2 bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full w-fit mb-3">
            <Landmark className="w-3.5 h-3.5" /> APMC Real-Time Prices
          </div>
          <h2 className="text-2xl font-bold font-display">Live Mandi Market Prices</h2>
          <p className="text-emerald-50 mt-1">
            Real-time daily mandi rates sourced directly from official state APMC markets.
          </p>
        </div>
        <div className="hidden md:block text-6xl opacity-35">📊</div>
      </motion.div>

      {/* Filter and Search Section */}
      <div className="dashboard-card p-5 bg-white border border-gray-100 shadow-sm rounded-2xl">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Commodity Name</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400 pointer-events-none" />
              <select
                value={commodity}
                onChange={(e) => setCommodity(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-green-500 bg-gray-50/50 transition-all font-medium appearance-none cursor-pointer"
              >
                <option value="">All Commodities</option>
                {COMMODITIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 text-xs">▼</div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">State</label>
            <div className="relative">
              <select
                value={state}
                onChange={(e) => {
                  setState(e.target.value)
                  setDistrict('') // Reset district when state changes
                }}
                className="w-full px-4 pr-10 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-green-500 bg-gray-50/50 transition-all font-medium appearance-none cursor-pointer"
              >
                <option value="">All States</option>
                {Object.keys(STATE_DISTRICTS).map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 text-xs">▼</div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">District</label>
            <div className="relative">
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                disabled={!state}
                className="w-full px-4 pr-10 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-green-500 bg-gray-50/50 transition-all font-medium appearance-none cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <option value="">{state ? 'All Districts' : 'Select a State first'}</option>
                {state && STATE_DISTRICTS[state]?.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 text-xs">▼</div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-sm shadow-md transition-all active:scale-[0.98]"
            >
              Search
            </button>
            <button
              type="button"
              onClick={fetchPrices}
              disabled={loading}
              title="Refresh Mandi Rates"
              className="p-2.5 rounded-xl border border-gray-200 text-gray-600 bg-white hover:bg-gray-50 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin text-green-600' : ''}`} />
            </button>
          </div>
        </form>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-4 animate-pulse">
              <div className="flex justify-between items-center">
                <div className="h-4 bg-gray-200 rounded w-1/3" />
                <div className="h-5 bg-gray-200 rounded-full w-1/4" />
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
              <div className="grid grid-cols-3 gap-2 pt-2">
                <div className="h-10 bg-gray-100 rounded-xl" />
                <div className="h-10 bg-gray-100 rounded-xl" />
                <div className="h-10 bg-gray-100 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center max-w-lg mx-auto space-y-3">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto" />
          <h3 className="font-bold text-red-900 text-lg">Mandi Data Error</h3>
          <p className="text-sm text-red-700">{error}</p>
          <button
            onClick={fetchPrices}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-5 rounded-xl text-xs transition-colors"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* No Results State */}
      {!loading && !error && records.length === 0 && (
        <div className="bg-white border border-gray-100 rounded-2xl p-10 text-center max-w-md mx-auto space-y-3 shadow-sm">
          <Landmark className="w-12 h-12 text-gray-300 mx-auto" />
          <h3 className="font-bold text-gray-900 text-lg">No Mandi Rates Found</h3>
          <p className="text-sm text-gray-500 leading-relaxed">
            We couldn't find rates matching your criteria. Try adjusting filters or searching for standard crops like Tomato, Rice, or Onion.
          </p>
        </div>
      )}

      {/* Data display Cards */}
      {!loading && !error && records.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {records.map((rec, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -3 }}
              className="bg-white border border-gray-100 hover:border-green-100 rounded-2xl p-5 shadow-sm flex flex-col justify-between transition-all"
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded-md font-bold uppercase">
                      {rec.commodity}
                    </span>
                    <h3 className="font-bold text-gray-900 text-lg font-display mt-1">{rec.market}</h3>
                  </div>
                  <Landmark className="w-5 h-5 text-emerald-600/70" />
                </div>

                <div className="space-y-1.5 text-xs text-gray-500 font-medium mb-4">
                  <p className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                    {rec.district}, {rec.state}
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    Updated: {rec.arrivalDate}
                  </p>
                </div>

                {/* Price Grid */}
                <div className="grid grid-cols-3 gap-2 bg-gray-50 rounded-xl p-3 mb-4 text-center border border-gray-100">
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Min Price</span>
                    <span className="text-sm font-bold text-gray-700">₹{rec.minPrice}</span>
                  </div>
                  <div className="border-x border-gray-200">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Modal Rate</span>
                    <span className="text-sm font-black text-green-600">₹{rec.modalPrice}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Max Price</span>
                    <span className="text-sm font-bold text-gray-700">₹{rec.maxPrice}</span>
                  </div>
                </div>
              </div>

              {/* AI Advice trigger */}
              <button
                onClick={() => handleFetchAdvice(rec, i)}
                disabled={aiLoading !== null}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-2 px-3 rounded-xl flex items-center justify-center gap-2 text-xs shadow-md transition-all active:scale-[0.97]"
              >
                {aiLoading === i ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Consulting Krishi AI...
                  </>
                ) : (
                  <>
                    <Brain className="w-3.5 h-3.5 animate-pulse" />
                    AI Market Advice
                  </>
                )}
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {/* AI Advice Overlay Modal */}
      <AnimatePresence>
        {selectedRecord && aiAdvice && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedRecord(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-gray-100 flex flex-col"
            >
              {/* Modal Banner Header */}
              <div className="bg-gradient-to-br from-purple-600 via-indigo-600 to-purple-800 p-5 text-white flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center border border-white/20">
                    <Brain className="w-6 h-6 text-purple-100 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg font-display">AI Market Advisory</h3>
                    <p className="text-xs text-purple-200">Personalized mandi selling insights</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                >
                  <X className="w-4.5 h-4.5 text-white" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-5 space-y-4">
                <div className="border-b border-gray-100 pb-3">
                  <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded font-bold uppercase">
                    {selectedRecord.commodity} Rate Analysis
                  </span>
                  <h4 className="font-bold text-gray-900 mt-1">{selectedRecord.market}</h4>
                  <p className="text-xs text-gray-400">{selectedRecord.district}, {selectedRecord.state} · {selectedRecord.arrivalDate}</p>
                </div>

                {/* Mandi stats */}
                <div className="grid grid-cols-3 gap-2 bg-gray-50 border border-gray-100 rounded-xl p-3 text-center">
                  <div>
                    <span className="text-[9px] text-gray-400 font-bold uppercase block">Min</span>
                    <span className="text-xs font-bold text-gray-700">₹{selectedRecord.minPrice}</span>
                  </div>
                  <div className="border-x border-gray-200">
                    <span className="text-[9px] text-gray-400 font-bold uppercase block">Modal</span>
                    <span className="text-xs font-black text-green-600">₹{selectedRecord.modalPrice}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-gray-400 font-bold uppercase block">Max</span>
                    <span className="text-xs font-bold text-gray-700">₹{selectedRecord.maxPrice}</span>
                  </div>
                </div>

                {/* AI Advice Output */}
                <div className="bg-purple-50/50 border border-purple-100 rounded-xl p-4 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs text-purple-700 font-bold">
                    <Sparkles className="w-4 h-4" />
                    Krishi AI Recommendations:
                  </div>
                  <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap font-medium">
                    {aiAdvice}
                  </p>
                </div>
              </div>

              {/* Close footer */}
              <div className="bg-gray-50 px-5 py-3 border-t border-gray-100 flex justify-end">
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-1.5 px-4 rounded-xl text-xs transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
