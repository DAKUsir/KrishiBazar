import { motion } from 'framer-motion'
import { Smartphone, Bell, ArrowRight } from 'lucide-react'

const notifications = [
  { icon: '🌧️', title: 'Rain Alert', body: 'Heavy rain expected in 24 hrs', time: 'now', cls: 'border-blue-200 bg-blue-50' },
  { icon: '🍅', title: 'Price Alert', body: 'Tomato ↑ ₹2,840/qtl in Azadpur', time: '2m', cls: 'border-green-200 bg-green-50' },
  { icon: '⚠️', title: 'Disease Alert', body: 'Leaf blight risk is HIGH today', time: '5m', cls: 'border-amber-200 bg-amber-50' },
]

export default function AppSection() {
  return (
    <section className="py-28 px-6 md:px-12 bg-gray-50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Text */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 bg-green-50 border border-green-100 rounded-full px-4 py-1.5 text-green-700 text-sm font-semibold mb-6">
              <Smartphone className="w-3.5 h-3.5" />
              Available on iOS & Android
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 font-display mb-6 leading-tight">
              Farm smarter, right{' '}
              <span className="bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">
                from your phone
              </span>
            </h2>
            <p className="text-gray-500 text-lg mb-8 leading-relaxed">
              Get instant alerts for weather, price changes, and disease risks. Manage your farm from anywhere — even offline in Hindi, Telugu, or Marathi.
            </p>
            <div className="space-y-4 mb-10">
              {[['📱', 'Works offline in remote areas'], ['🔔', 'Smart push notifications for your crops'], ['🌐', 'Supports 18 Indian regional languages'], ['⚡', 'Lightning-fast AI disease scan']].map(([icon, label]) => (
                <div key={label} className="flex items-center gap-3">
                  <span className="text-xl">{icon}</span>
                  <span className="text-gray-700 font-medium">{label}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
                className="flex items-center gap-3 bg-gray-900 text-white font-bold px-6 py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all">
                <span className="text-2xl">🍎</span>
                <div className="text-left">
                  <div className="text-xs text-gray-400 font-normal">Download on the</div>
                  <div className="text-sm font-bold">App Store</div>
                </div>
                <ArrowRight className="w-4 h-4 ml-1 text-gray-400" />
              </motion.button>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
                className="flex items-center gap-3 bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-3.5 rounded-xl shadow-lg transition-all">
                <span className="text-2xl">🤖</span>
                <div className="text-left">
                  <div className="text-xs text-green-200 font-normal">Get it on</div>
                  <div className="text-sm font-bold">Google Play</div>
                </div>
                <ArrowRight className="w-4 h-4 ml-1" />
              </motion.button>
            </div>
          </motion.div>

          {/* Phone mockup */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex justify-center relative"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              className="relative w-64 h-[520px] bg-gradient-to-b from-zinc-800 to-zinc-900 rounded-[3rem] border-4 border-zinc-700 shadow-2xl shadow-gray-300 overflow-hidden"
            >
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-20 h-5 bg-zinc-900 rounded-full z-10" />
              <div className="absolute inset-0 bg-white p-4 pt-12">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-gray-400 text-xs">Good morning,</p>
                    <p className="text-gray-900 font-bold text-sm">Ravi Kumar 🌾</p>
                  </div>
                  <div className="w-8 h-8 bg-green-50 rounded-xl flex items-center justify-center border border-green-100">
                    <Bell className="w-4 h-4 text-green-600" />
                  </div>
                </div>
                <div className="bg-green-50 border border-green-100 rounded-2xl p-3 mb-4">
                  <p className="text-green-700 text-xs font-semibold mb-1">Today's Revenue</p>
                  <p className="text-gray-900 text-xl font-bold">₹12,840</p>
                  <p className="text-green-600/70 text-xs">↑ 18% from yesterday</p>
                </div>
                <p className="text-gray-400 text-xs mb-2 font-semibold uppercase tracking-wider">Alerts</p>
                <div className="space-y-2">
                  {notifications.map((n, i) => (
                    <motion.div key={n.title}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.5 + i * 0.2 }}
                      className={`flex items-start gap-2 p-2.5 rounded-xl border ${n.cls}`}>
                      <span className="text-base flex-shrink-0">{n.icon}</span>
                      <div className="min-w-0">
                        <p className="text-gray-800 text-xs font-semibold">{n.title}</p>
                        <p className="text-gray-500 text-xs leading-tight">{n.body}</p>
                      </div>
                      <span className="text-gray-400 text-xs flex-shrink-0">{n.time}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, 8, 0], rotate: [0, 2, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              className="absolute -left-8 top-20 bg-white border border-amber-100 rounded-2xl p-4 shadow-lg"
            >
              <div className="text-2xl mb-1">📈</div>
              <p className="text-gray-800 text-xs font-bold">Price surged</p>
              <p className="text-amber-600 text-sm font-bold">+₹240/qtl</p>
            </motion.div>

            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              className="absolute -right-6 bottom-24 bg-white border border-green-100 rounded-2xl p-4 shadow-lg"
            >
              <div className="text-2xl mb-1">✅</div>
              <p className="text-gray-800 text-xs font-bold">Order confirmed</p>
              <p className="text-green-600 text-xs">200 kg Tomato</p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
