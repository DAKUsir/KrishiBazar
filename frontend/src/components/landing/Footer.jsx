import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Leaf, Twitter, Instagram, Youtube, Facebook, ArrowRight, Mail, Phone, MapPin } from 'lucide-react'

const links = {
  Platform: ['Sell Produce', 'Mandi Rates', 'AI Detection', 'Marketplace', 'Community'],
  Resources: ['Crop Library', 'Disease Guide', 'Mandi Calendar', 'Farming Blog', 'API Docs'],
  Company: ['About Us', 'Careers', 'Press Kit', 'Partners', 'Contact'],
  Support: ['Help Center', 'Farmer Stories', 'Report Issue', 'Privacy Policy', 'Terms of Service'],
}

const socials = [
  { Icon: Twitter, href: '#', label: 'Twitter' },
  { Icon: Instagram, href: '#', label: 'Instagram' },
  { Icon: Youtube, href: '#', label: 'YouTube' },
  { Icon: Facebook, href: '#', label: 'Facebook' },
]

export default function Footer() {
  const navigate = useNavigate()

  return (
    <footer className="bg-white border-t border-gray-100">
      {/* CTA Banner */}
      <div className="py-20 px-6 md:px-12 relative overflow-hidden bg-gradient-to-br from-green-600 to-emerald-500">
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full bg-white/10 pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white font-display mb-4">
              Start your smart farming journey today
            </h2>
            <p className="text-white/75 text-lg mb-8">
              Join 50,000+ Indian farmers already using AI to grow better, sell smarter.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/auth')}
                className="flex items-center justify-center gap-2 bg-white text-green-700 font-bold px-8 py-4 rounded-2xl shadow-xl text-lg hover:shadow-2xl transition-all"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="flex items-center justify-center gap-2 bg-white/15 border border-white/30 text-white font-semibold px-8 py-4 rounded-2xl text-lg hover:bg-white/25 transition-all backdrop-blur-sm"
              >
                <Mail className="w-5 h-5" />
                Contact Sales
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main footer */}
      <div className="py-16 px-6 md:px-12 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-10 mb-16">
            <div className="col-span-2 md:col-span-3 lg:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center border border-green-100">
                  <Leaf className="w-5 h-5 text-green-600" />
                </div>
                <span className="text-gray-900 font-bold text-xl font-display">Krishi Bazar</span>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed mb-6">
                India's leading AI-powered agriculture platform. Empowering farmers with technology since 2024.
              </p>
              <div className="space-y-2 text-sm text-gray-500">
                <div className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-green-600" /><span>support@krishibazar.in</span></div>
                <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-green-600" /><span>1800-KRISHI (toll-free)</span></div>
                <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-green-600" /><span>Bengaluru, Karnataka, India</span></div>
              </div>
            </div>

            {Object.entries(links).map(([category, items]) => (
              <div key={category}>
                <h4 className="text-gray-900 font-semibold text-sm mb-4 font-display">{category}</h4>
                <ul className="space-y-2.5">
                  {items.map(item => (
                    <li key={item}>
                      <a href="#" className="text-gray-500 hover:text-green-600 transition-colors text-sm relative group">
                        {item}
                        <span className="absolute bottom-0 left-0 w-0 h-px bg-green-500 group-hover:w-full transition-all duration-300" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="pt-8 border-t border-gray-200 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} Krishi Bazar. All rights reserved. Made with ❤️ for Indian Farmers.
            </p>
            <div className="flex items-center gap-3">
              {socials.map(({ Icon, href, label }) => (
                <motion.a key={label} href={href} whileHover={{ scale: 1.15, y: -2 }} aria-label={label}
                  className="w-9 h-9 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-gray-400 hover:text-green-600 hover:border-green-200 hover:bg-green-50 transition-colors shadow-sm">
                  <Icon className="w-4 h-4" />
                </motion.a>
              ))}
            </div>
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-1.5 shadow-sm">
              <span className="text-lg">🇮🇳</span>
              <span className="text-gray-500 text-xs font-medium">हिंदी / English</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
