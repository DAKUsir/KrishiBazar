import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { Users, ShoppingBag, BarChart2, Scan } from 'lucide-react'

const stats = [
  { icon: Users, value: 50000, suffix: '+', label: 'Farmers Connected', color: 'text-green-400', glow: 'rgba(34,197,94,0.2)' },
  { icon: ShoppingBag, value: 2400000, suffix: '+', label: 'Crops Sold', color: 'text-amber-400', glow: 'rgba(245,158,11,0.2)' },
  { icon: BarChart2, value: 500, suffix: '+', label: 'Mandi Markets', color: 'text-cyan-400', glow: 'rgba(6,182,212,0.2)' },
  { icon: Scan, value: 1200000, suffix: '+', label: 'Diseases Detected', color: 'text-purple-400', glow: 'rgba(168,85,247,0.2)' },
]

function CountUp({ target, suffix, duration = 2 }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })

  useEffect(() => {
    if (!inView) return
    const start = performance.now()
    const tick = (now) => {
      const elapsed = (now - start) / (duration * 1000)
      const progress = Math.min(elapsed, 1)
      // ease out
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(eased * target))
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [inView, target, duration])

  const formatted = count >= 1000000
    ? `${(count / 1000000).toFixed(1)}M`
    : count >= 1000
    ? `${(count / 1000).toFixed(0)}K`
    : count.toString()

  return <span ref={ref}>{formatted}{suffix}</span>
}

export default function StatsSection() {
  return (
    <section className="py-24 px-6 md:px-12 relative overflow-hidden bg-white border-y border-gray-100">
      <div className="absolute inset-0 bg-gradient-to-r from-green-50/60 via-transparent to-green-50/60 pointer-events-none" />
      
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 font-display mb-4">
            Trusted by{' '}
            <span className="bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">
              India's farmers
            </span>
          </h2>
          <p className="text-gray-500 text-lg">Numbers that speak for themselves.</p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              whileHover={{ scale: 1.05 }}
              className="relative text-center p-6 md:p-8 rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden group"
            >
              {/* Glow bg on hover */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none"
                style={{ background: `radial-gradient(circle at 50% 50%, ${stat.glow} 0%, transparent 70%)` }}
              />

              <div className={`w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}
                style={{ boxShadow: `0 0 20px ${stat.glow}` }}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>

              <div className={`text-3xl md:text-5xl font-bold font-display mb-2 text-gray-900`}>
                <CountUp target={stat.value} suffix={stat.suffix} />
              </div>
              <div className="text-gray-600 text-sm font-medium">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
