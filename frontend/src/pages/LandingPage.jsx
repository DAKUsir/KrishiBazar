import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Leaf, Zap, ShoppingBag, Users, Bot, ArrowRight, CheckCircle2, Star } from 'lucide-react'

const features = [
  { icon: Zap, title: 'AI Disease Detection', desc: 'Upload crop photos for instant AI-powered disease diagnosis with treatment plans', color: 'from-yellow-400 to-orange-500' },
  { icon: Bot, title: 'Krishi AI Assistant', desc: 'Personalized farming advice based on your crops, location, and farm details', color: 'from-blue-400 to-cyan-500' },
  { icon: ShoppingBag, title: 'Smart Marketplace', desc: 'Buy inputs and sell your yield with AI-powered price predictions', color: 'from-purple-400 to-pink-500' },
  { icon: Users, title: 'Farmer Community', desc: 'Connect with expert farmers, share experiences, and get community help', color: 'from-green-400 to-teal-500' },
]

const stats = [
  { value: '50,000+', label: 'Active Farmers' },
  { value: '95%', label: 'Disease Accuracy' },
  { value: '200+', label: 'Crop Varieties' },
  { value: '18', label: 'Indian Languages' },
]

const testimonials = [
  { name: 'Ravi Kumar', state: 'Karnataka', crop: 'Tomato', text: 'Krishi Bazar detected early blight in my tomato crop 2 weeks before I noticed. Saved 80% of my harvest!', rating: 5 },
  { name: 'Priya Devi', state: 'Punjab', crop: 'Wheat', text: 'The AI assistant told me exactly when to irrigate based on my local weather. My yield increased by 30%.', rating: 5 },
  { name: 'Mohammed Iqbal', state: 'Andhra Pradesh', crop: 'Rice', text: 'I sold my rice at the best price using Smart Sell. Made ₹40,000 more than last season.', rating: 5 },
]

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="hero-bg min-h-screen flex flex-col">
        {/* Navigation */}
        <nav className="relative z-10 flex items-center justify-between px-6 md:px-12 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-400/20 rounded-xl flex items-center justify-center border border-green-400/30">
              <Leaf className="w-6 h-6 text-green-400" />
            </div>
            <span className="text-white font-bold text-xl font-display">Krishi Bazar</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/auth')}
              className="text-green-300 hover:text-white transition-colors font-medium text-sm"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/auth')}
              className="bg-green-500 hover:bg-green-400 text-white font-semibold px-5 py-2.5 rounded-xl transition-all hover:scale-105 text-sm"
            >
              Get Started Free
            </button>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 flex-1 flex items-center justify-center px-6 md:px-12 pb-24">
          <div className="max-w-5xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-400/30 rounded-full px-4 py-2 text-green-300 text-sm font-medium mb-6">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                AI-Powered Agriculture Platform for India
              </div>

              <h1 className="text-5xl md:text-7xl font-bold text-white font-display leading-tight mb-6">
                Smart Farming
                <span className="block text-transparent bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text">
                  Starts Here
                </span>
              </h1>

              <p className="text-xl text-green-100/70 max-w-2xl mx-auto mb-10 leading-relaxed">
                Detect crop diseases instantly, get personalized AI advice, sell at the best price, and connect with India's farming community — all in one platform.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/auth')}
                  className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-400 text-white font-bold px-8 py-4 rounded-2xl shadow-xl shadow-green-900/40 text-lg"
                >
                  Start For Free
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-2 bg-white/10 border border-white/20 text-white font-semibold px-8 py-4 rounded-2xl backdrop-blur-sm text-lg hover:bg-white/20 transition-all"
                >
                  Watch Demo
                </motion.button>
              </div>

              {/* Trust indicators */}
              <div className="flex items-center justify-center gap-6 mt-10 text-green-300/60 text-sm">
                {['No credit card required', 'Free forever plan', 'Indian languages supported'].map((item) => (
                  <div key={item} className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 80L1440 80L1440 20C1200 80 960 0 720 20C480 40 240 80 0 20L0 80Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 px-6 md:px-12 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-bold font-display text-green-600 mb-2">{stat.value}</div>
                <div className="text-gray-500 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 md:px-12 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold font-display text-gray-900 mb-4">Everything a farmer needs</h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">From disease detection to market intelligence — Krishi Bazar is your complete farming companion.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -8 }}
                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl border border-gray-100 transition-all duration-300"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-lg`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 font-display mb-2">{feature.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6 md:px-12 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold font-display text-gray-900 mb-4">Trusted by farmers across India</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="bg-green-50 rounded-2xl p-6 border border-green-100"
              >
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 text-sm leading-relaxed">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-200 rounded-full flex items-center justify-center text-green-700 font-bold text-lg">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{t.name}</p>
                    <p className="text-gray-500 text-xs">{t.crop} farmer · {t.state}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 md:px-12 bg-gradient-to-br from-green-900 to-green-700">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold font-display text-white mb-4">Start your smart farming journey</h2>
          <p className="text-green-200 text-lg mb-8">Join 50,000+ Indian farmers using AI to grow better crops</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/auth')}
            className="bg-white text-green-800 font-bold px-10 py-4 rounded-2xl text-lg shadow-xl hover:shadow-2xl transition-all"
          >
            Get Started Free →
          </motion.button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-green-950 text-green-300/60 py-8 px-12 text-center text-sm">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Leaf className="w-4 h-4 text-green-400" />
          <span className="text-white font-semibold">Krishi Bazar</span>
        </div>
        <p>© {new Date().getFullYear()} Krishi Bazar. Empowering Indian farmers with AI.</p>
      </footer>
    </div>
  )
}
