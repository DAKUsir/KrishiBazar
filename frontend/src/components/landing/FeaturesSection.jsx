import { motion } from 'framer-motion'
import { ShoppingCart, TrendingUp, Scan, Cloud, Sprout, BarChart3, ArrowRight, Zap } from 'lucide-react'

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (d = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.6, delay: d, ease: 'easeOut' } }),
}

/* ── Bento cards ─────────────────────────────────────────────────── */

function SellProduceCard() {
  return (
    <motion.div
      variants={fadeUp} custom={0}
      whileHover={{ y: -4 }}
      className="col-span-2 row-span-2 relative rounded-3xl overflow-hidden bg-gradient-to-br from-green-600 to-emerald-500 p-8 flex flex-col justify-between shadow-xl shadow-green-200 group"
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-white" />
        <div className="absolute -bottom-8 -left-8 w-48 h-48 rounded-full bg-white" />
      </div>

      <div className="relative z-10">
        <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
          <ShoppingCart className="w-7 h-7 text-white" />
        </div>
        <h3 className="text-2xl md:text-3xl font-bold text-white font-display mb-3 leading-tight">
          Sell Produce<br />Directly Online
        </h3>
        <p className="text-white/75 text-base leading-relaxed max-w-xs">
          List your harvest to thousands of verified buyers across India. No middlemen, no commission — just fair prices.
        </p>
      </div>

      {/* Mini stats */}
      <div className="relative z-10 grid grid-cols-2 gap-3 mt-6">
        {[['₹0', 'Commission'], ['2–24h', 'Payout speed']].map(([val, lbl]) => (
          <div key={lbl} className="bg-white/15 backdrop-blur-sm rounded-2xl p-4">
            <div className="text-white font-bold text-xl font-display">{val}</div>
            <div className="text-white/60 text-xs mt-0.5">{lbl}</div>
          </div>
        ))}
      </div>

      <motion.div
        whileHover={{ x: 4 }}
        className="relative z-10 mt-5 inline-flex items-center gap-2 text-white/80 text-sm font-semibold"
      >
        Start listing today <ArrowRight className="w-4 h-4" />
      </motion.div>
    </motion.div>
  )
}

function AIDetectionCard() {
  return (
    <motion.div
      variants={fadeUp} custom={0.1}
      whileHover={{ y: -4 }}
      className="col-span-1 row-span-1 relative rounded-3xl overflow-hidden bg-white border border-gray-100 p-6 flex flex-col justify-between shadow-sm hover:shadow-lg transition-shadow duration-300 group"
    >
      <div>
        <div className="w-12 h-12 bg-cyan-50 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
          <Scan className="w-6 h-6 text-cyan-600" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 font-display mb-1.5">AI Disease Detection</h3>
        <p className="text-gray-500 text-sm leading-relaxed">
          50+ diseases identified in seconds with 95%+ accuracy.
        </p>
      </div>
      {/* Animated accuracy bar */}
      <div className="mt-4">
        <div className="flex justify-between text-xs text-gray-400 mb-1.5">
          <span>Accuracy rate</span>
          <span className="text-cyan-600 font-semibold">95.3%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: '95.3%' }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, delay: 0.3, ease: 'easeOut' }}
            className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500"
          />
        </div>
      </div>
    </motion.div>
  )
}

function MandiCard() {
  const crops = [
    { name: 'Tomato', price: '₹2,840', up: true },
    { name: 'Wheat', price: '₹2,250', up: true },
    { name: 'Onion', price: '₹1,820', up: false },
  ]
  return (
    <motion.div
      variants={fadeUp} custom={0.15}
      whileHover={{ y: -4 }}
      className="col-span-1 row-span-1 relative rounded-3xl overflow-hidden bg-amber-50 border border-amber-100 p-6 flex flex-col justify-between shadow-sm hover:shadow-lg transition-shadow duration-300 group"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
            <TrendingUp className="w-6 h-6 text-amber-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 font-display">Live Mandi Rates</h3>
        </div>
        <span className="flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 border border-green-100 px-2 py-1 rounded-lg">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
          Live
        </span>
      </div>
      <div className="space-y-2">
        {crops.map(c => (
          <div key={c.name} className="flex items-center justify-between bg-white rounded-xl px-3 py-2 shadow-xs">
            <span className="text-sm text-gray-700 font-medium">{c.name}</span>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-gray-900">{c.price}</span>
              <span className={`text-xs font-bold ${c.up ? 'text-green-500' : 'text-red-400'}`}>
                {c.up ? '↑' : '↓'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

function WeatherCard() {
  return (
    <motion.div
      variants={fadeUp} custom={0.2}
      whileHover={{ y: -4 }}
      className="col-span-1 row-span-1 relative rounded-3xl overflow-hidden bg-gradient-to-br from-sky-500 to-blue-600 p-6 flex flex-col justify-between shadow-lg shadow-sky-200 group"
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
            <Cloud className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-lg font-bold text-white font-display">Weather Insights</h3>
          <p className="text-white/70 text-sm mt-1">14-day forecasts for your field</p>
        </div>
        <div className="text-right">
          <div className="text-4xl font-bold text-white font-display">28°</div>
          <div className="text-white/60 text-xs">Bengaluru</div>
        </div>
      </div>
      <div className="flex gap-2 mt-4">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((d, i) => (
          <div key={d} className="flex-1 text-center bg-white/10 rounded-xl p-1.5">
            <div className="text-white/50 text-xs mb-1">{d}</div>
            <div className="text-sm">{['☀️', '🌤', '🌧', '☀️', '⛅'][i]}</div>
            <div className="text-white text-xs font-semibold mt-0.5">{[28, 26, 22, 30, 27][i]}°</div>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

function CropRecommendCard() {
  return (
    <motion.div
      variants={fadeUp} custom={0.25}
      whileHover={{ y: -4 }}
      className="col-span-1 row-span-1 relative rounded-3xl overflow-hidden bg-white border border-gray-100 p-6 flex flex-col justify-between shadow-sm hover:shadow-lg transition-shadow duration-300 group"
    >
      <div>
        <div className="w-12 h-12 bg-lime-50 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
          <Sprout className="w-6 h-6 text-lime-600" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 font-display mb-1.5">Crop Recommendations</h3>
        <p className="text-gray-500 text-sm leading-relaxed">
          AI-powered suggestions based on your soil, season & location.
        </p>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {['🌾 Wheat', '🍅 Tomato', '🌽 Maize'].map(c => (
          <span key={c} className="text-xs font-semibold bg-lime-50 text-lime-700 border border-lime-100 px-3 py-1 rounded-full">
            {c}
          </span>
        ))}
        <span className="text-xs font-semibold bg-gray-50 text-gray-400 border border-gray-100 px-3 py-1 rounded-full">
          +14 more
        </span>
      </div>
    </motion.div>
  )
}

function AnalyticsCard() {
  const bars = [60, 80, 55, 90, 70, 95, 75]
  return (
    <motion.div
      variants={fadeUp} custom={0.3}
      whileHover={{ y: -4 }}
      className="col-span-4 row-span-1 relative rounded-3xl overflow-hidden bg-gray-950 p-7 flex items-center justify-between gap-8 shadow-xl group"
    >
      {/* Left */}
      <div className="flex-shrink-0">
        <div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
          <BarChart3 className="w-6 h-6 text-purple-400" />
        </div>
        <h3 className="text-xl font-bold text-white font-display mb-1">Farm Analytics</h3>
        <p className="text-gray-400 text-sm max-w-xs">
          Track income, yield, and get AI profit predictions in real time.
        </p>
        <div className="mt-4 flex items-center gap-2">
          <span className="text-2xl font-bold text-white font-display">₹2.4L</span>
          <span className="text-green-400 text-sm font-semibold bg-green-400/10 px-2 py-0.5 rounded-lg">↑ 32% this season</span>
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 flex items-end justify-end gap-2 h-24">
        {bars.map((h, i) => (
          <motion.div
            key={i}
            initial={{ height: 0 }}
            whileInView={{ height: `${h}%` }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.35 + i * 0.07, ease: 'easeOut' }}
            className="flex-1 rounded-t-lg"
            style={{ background: i === 5 ? 'linear-gradient(to top, #a855f7, #7c3aed)' : 'rgba(168,85,247,0.2)' }}
          />
        ))}
      </div>

      {/* Zap badge */}
      <div className="absolute top-5 right-6 flex items-center gap-1.5 bg-purple-500/10 border border-purple-500/20 rounded-full px-3 py-1">
        <Zap className="w-3 h-3 text-purple-400" />
        <span className="text-purple-300 text-xs font-semibold">AI Powered</span>
      </div>
    </motion.div>
  )
}

/* ── Section wrapper ─────────────────────────────────────────────── */

export default function FeaturesSection() {
  return (
    <section id="features" className="py-28 px-6 md:px-12 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 bg-green-50 border border-green-100 rounded-full px-4 py-1.5 text-green-700 text-sm font-semibold mb-5">
            <Sprout className="w-3.5 h-3.5" />
            Built for Modern Farmers
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 font-display mb-4">
            Everything you need to{' '}
            <span className="bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">
              grow smarter
            </span>
          </h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            One platform. Every tool a farmer needs — from seed to sale.
          </p>
        </motion.div>

        {/* Bento grid */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="grid grid-cols-4 grid-rows-[auto_auto_auto] gap-4"
        >
          <SellProduceCard />
          <AIDetectionCard />
          <MandiCard />
          <WeatherCard />
          <CropRecommendCard />
          <AnalyticsCard />
        </motion.div>
      </div>
    </section>
  )
}
