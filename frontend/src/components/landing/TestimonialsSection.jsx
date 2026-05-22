import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Quote, Star, ChevronLeft, ChevronRight } from 'lucide-react'

const testimonials = [
  { name: 'Ravi Kumar', state: 'Karnataka', crop: 'Tomato Farmer', text: 'Krishi Bazar detected early blight in my tomato crop 2 weeks before I noticed it. I saved 80% of my harvest. This AI is a blessing for every farmer.', rating: 5, initials: 'RK', color: 'from-green-500 to-emerald-600' },
  { name: 'Priya Devi', state: 'Punjab', crop: 'Wheat Farmer', text: 'The live mandi rates feature helped me sell my wheat at ₹2,250/qtl instead of ₹1,900. I made ₹60,000 more this season because I knew the right price!', rating: 5, initials: 'PD', color: 'from-amber-500 to-orange-600' },
  { name: 'Mohammed Iqbal', state: 'Andhra Pradesh', crop: 'Rice Farmer', text: 'I sold my rice directly to buyers using the marketplace. No middleman, no commission. The platform is simple, even in Telugu. My family income doubled.', rating: 5, initials: 'MI', color: 'from-cyan-500 to-blue-600' },
  { name: 'Sunita Sharma', state: 'Rajasthan', crop: 'Mustard Farmer', text: 'The AI assistant gives advice in Hindi. It told me exactly when to harvest based on my local weather. No need for expensive agriculture consultants anymore.', rating: 5, initials: 'SS', color: 'from-purple-500 to-violet-600' },
  { name: 'Arjun Naidu', state: 'Telangana', crop: 'Cotton Farmer', text: 'Cotton disease detection saved my 5-acre field. The app sent me an alert even before I went to check. The treatment plan was in Telugu and very clear.', rating: 5, initials: 'AN', color: 'from-lime-500 to-green-600' },
]

export default function TestimonialsSection() {
  const [current, setCurrent] = useState(0)
  const intervalRef = useRef(null)

  const startAuto = () => { intervalRef.current = setInterval(() => setCurrent(c => (c + 1) % testimonials.length), 4500) }
  useEffect(() => { startAuto(); return () => clearInterval(intervalRef.current) }, [])
  const goTo = (i) => { clearInterval(intervalRef.current); setCurrent(i); startAuto() }

  return (
    <section className="py-28 px-6 md:px-12 bg-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(34,197,94,0.04)_0%,transparent_70%)] pointer-events-none" />

      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 font-display mb-4">
            Loved by{' '}
            <span className="bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">
              50,000+ farmers
            </span>
          </h2>
          <p className="text-gray-500 text-lg">Real stories from real farmers across India.</p>
        </motion.div>

        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, y: 30, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.97 }}
              transition={{ duration: 0.5 }}
              className="bg-gray-50 border border-gray-100 rounded-3xl p-8 md:p-12 relative overflow-hidden shadow-sm"
            >
              <div className="absolute top-8 right-8 opacity-5">
                <Quote className="w-20 h-20 text-gray-900" />
              </div>
              <div className="flex items-center gap-1 mb-6">
                {Array.from({ length: testimonials[current].rating }).map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-gray-700 text-xl md:text-2xl leading-relaxed font-light mb-8 max-w-3xl">
                "{testimonials[current].text}"
              </p>
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${testimonials[current].color} flex items-center justify-center text-white font-bold text-lg shadow-md`}>
                  {testimonials[current].initials}
                </div>
                <div>
                  <p className="text-gray-900 font-bold font-display">{testimonials[current].name}</p>
                  <p className="text-gray-500 text-sm">{testimonials[current].crop} · {testimonials[current].state}</p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center justify-between mt-8">
            <button onClick={() => goTo((current - 1 + testimonials.length) % testimonials.length)}
              className="w-10 h-10 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button key={i} onClick={() => goTo(i)}
                  className={`transition-all duration-300 rounded-full ${i === current ? 'w-8 h-2 bg-green-500' : 'w-2 h-2 bg-gray-300 hover:bg-gray-400'}`}
                />
              ))}
            </div>
            <button onClick={() => goTo((current + 1) % testimonials.length)}
              className="w-10 h-10 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-2 md:grid-cols-5 gap-3">
          {testimonials.map((t, i) => (
            <button key={t.name} onClick={() => goTo(i)}
              className={`p-3 rounded-xl border transition-all duration-300 text-left ${i === current ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-100 hover:bg-gray-100'}`}>
              <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-white text-xs font-bold mb-2`}>{t.initials}</div>
              <p className="text-gray-700 text-xs font-medium">{t.name}</p>
              <p className="text-gray-400 text-xs">{t.state}</p>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
