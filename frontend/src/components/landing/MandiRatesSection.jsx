import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TrendingUp, TrendingDown, Search, MapPin, RefreshCw } from 'lucide-react'

const mandiData = [
  { crop: 'Tomato', emoji: '🍅', price: 2840, prev: 2600, unit: 'qtl', location: 'Azadpur, Delhi', trend: 'up', category: 'Vegetables' },
  { crop: 'Onion', emoji: '🧅', price: 1820, prev: 2100, unit: 'qtl', location: 'Lasalgaon, Nashik', trend: 'down', category: 'Vegetables' },
  { crop: 'Wheat', emoji: '🌾', price: 2250, prev: 2180, unit: 'qtl', location: 'Karnal, Haryana', trend: 'up', category: 'Grains' },
  { crop: 'Rice', emoji: '🍚', price: 3150, prev: 3050, unit: 'qtl', location: 'Cuttack, Odisha', trend: 'up', category: 'Grains' },
  { crop: 'Potato', emoji: '🥔', price: 1240, prev: 1380, unit: 'qtl', location: 'Agra, UP', trend: 'down', category: 'Vegetables' },
  { crop: 'Mustard', emoji: '🌼', price: 5400, prev: 5200, unit: 'qtl', location: 'Alwar, Rajasthan', trend: 'up', category: 'Oilseeds' },
  { crop: 'Soybean', emoji: '🫘', price: 4680, prev: 4720, unit: 'qtl', location: 'Indore, MP', trend: 'down', category: 'Oilseeds' },
  { crop: 'Sugarcane', emoji: '🎋', price: 315, prev: 305, unit: 'ton', location: 'Muzaffarnagar, UP', trend: 'up', category: 'Cash Crops' },
  { crop: 'Cotton', emoji: '☁️', price: 6800, prev: 6600, unit: 'qtl', location: 'Akola, Maharashtra', trend: 'up', category: 'Cash Crops' },
  { crop: 'Maize', emoji: '🌽', price: 1980, prev: 2050, unit: 'qtl', location: 'Davangere, Karnataka', trend: 'down', category: 'Grains' },
]

const CATEGORIES = ['All', 'Vegetables', 'Grains', 'Oilseeds', 'Cash Crops']

export default function MandiRatesSection() {
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')

  const filtered = mandiData.filter(d =>
    (filter === 'All' || d.category === filter) &&
    d.crop.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <section id="mandi-rates" className="py-28 px-6 md:px-12 bg-gray-50 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(245,158,11,0.06)_0%,transparent_60%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-full px-4 py-1.5 text-amber-700 text-sm font-semibold mb-5">
            <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
            Live Market Prices
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 font-display mb-4">
            Real-time{' '}
            <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
              Mandi Rates
            </span>
          </h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            Live wholesale prices from 500+ mandis across India — updated every hour.
          </p>
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-4 mb-8 flex-wrap"
        >
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search crop..."
              className="w-full pl-9 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:border-green-400 transition-colors shadow-sm"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  filter === cat
                    ? 'bg-green-600 text-white shadow-md shadow-green-200'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 text-gray-400 text-xs ml-auto self-center">
            <RefreshCw className="w-3 h-3 animate-spin" style={{ animationDuration: '3s' }} />
            Auto-updating
          </div>
        </motion.div>

        {/* Ticker */}
        <div className="overflow-hidden bg-amber-50 border border-amber-100 rounded-xl mb-6 py-3 px-4">
          <motion.div
            animate={{ x: [0, -1200] }}
            transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
            className="flex gap-8 whitespace-nowrap"
          >
            {[...mandiData, ...mandiData].map((d, i) => (
              <span key={i} className="text-sm font-medium flex items-center gap-2">
                <span>{d.emoji}</span>
                <span className="text-gray-800">{d.crop}</span>
                <span className={d.trend === 'up' ? 'text-green-600 font-bold' : 'text-red-500 font-bold'}>
                  ₹{d.price.toLocaleString()}
                </span>
                {d.trend === 'up'
                  ? <TrendingUp className="w-3.5 h-3.5 text-green-500" />
                  : <TrendingDown className="w-3.5 h-3.5 text-red-400" />
                }
                <span className="text-gray-300 ml-2">|</span>
              </span>
            ))}
          </motion.div>
        </div>

        {/* Cards grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <AnimatePresence mode="popLayout">
            {filtered.map((item, i) => {
              const pct = (((item.price - item.prev) / item.prev) * 100).toFixed(1)
              const isUp = item.trend === 'up'
              return (
                <motion.div
                  key={item.crop}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3, delay: i * 0.04 }}
                  whileHover={{ y: -4 }}
                  className="bg-white border border-gray-100 rounded-2xl p-5 hover:border-green-200 hover:shadow-md transition-all duration-300 group shadow-sm"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{item.emoji}</span>
                      <div>
                        <p className="text-gray-900 font-semibold font-display">{item.crop}</p>
                        <p className="text-gray-400 text-xs flex items-center gap-1">
                          <MapPin className="w-2.5 h-2.5" />
                          {item.location}
                        </p>
                      </div>
                    </div>
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold ${
                      isUp ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-500 border border-red-100'
                    }`}>
                      {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {isUp ? '+' : ''}{pct}%
                    </div>
                  </div>

                  <div>
                    <span className="text-2xl font-bold text-gray-900 font-display">
                      ₹{item.price.toLocaleString()}
                    </span>
                    <span className="text-gray-400 text-xs ml-1">/{item.unit}</span>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    Prev: ₹{item.prev.toLocaleString()} / {item.unit}
                  </div>

                  <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${Math.min(Math.abs(parseFloat(pct)) * 10, 100)}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: i * 0.05 }}
                      className={`h-full rounded-full ${isUp ? 'bg-green-400' : 'bg-red-400'}`}
                    />
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
