import { motion } from 'framer-motion'
import { Heart, MapPin, Star, ShoppingCart, Eye } from 'lucide-react'

const produce = [
  { name: 'Fresh Tomatoes', farmer: 'Ravi Kumar', location: 'Karnataka', price: 28, unit: 'kg', emoji: '🍅', rating: 4.8, reviews: 124, badge: 'Organic', badgeClass: 'text-green-700 bg-green-50 border-green-200' },
  { name: 'Premium Basmati Rice', farmer: 'Harpreet Singh', location: 'Punjab', price: 85, unit: 'kg', emoji: '🍚', rating: 4.9, reviews: 312, badge: 'Best Seller', badgeClass: 'text-amber-700 bg-amber-50 border-amber-200' },
  { name: 'Yellow Mustard', farmer: 'Geeta Devi', location: 'Rajasthan', price: 54, unit: 'kg', emoji: '🌼', rating: 4.7, reviews: 87, badge: 'Fresh', badgeClass: 'text-lime-700 bg-lime-50 border-lime-200' },
  { name: 'Red Onions', farmer: 'Suresh Patil', location: 'Maharashtra', price: 18, unit: 'kg', emoji: '🧅', rating: 4.6, reviews: 205, badge: 'Bulk Deal', badgeClass: 'text-purple-700 bg-purple-50 border-purple-200' },
  { name: 'Sweet Corn', farmer: 'Anjali Verma', location: 'Madhya Pradesh', price: 22, unit: 'kg', emoji: '🌽', rating: 4.8, reviews: 156, badge: 'Organic', badgeClass: 'text-green-700 bg-green-50 border-green-200' },
  { name: 'Raw Turmeric', farmer: 'Mohammed Ali', location: 'Tamil Nadu', price: 95, unit: 'kg', emoji: '🫚', rating: 4.9, reviews: 93, badge: 'Premium', badgeClass: 'text-orange-700 bg-orange-50 border-orange-200' },
]

export default function MarketplaceSection() {
  return (
    <section id="marketplace" className="py-28 px-6 md:px-12 bg-gray-50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6"
        >
          <div>
            <div className="inline-flex items-center gap-2 bg-purple-50 border border-purple-100 rounded-full px-4 py-1.5 text-purple-700 text-sm font-semibold mb-5">
              <ShoppingCart className="w-3.5 h-3.5" />
              Direct from Farmers
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 font-display">
              Farmer{' '}
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Marketplace
              </span>
            </h2>
            <p className="text-gray-500 mt-3 max-w-lg">
              Buy directly from verified farmers. No middlemen. Fresher produce, better prices.
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 border border-green-300 text-green-700 px-6 py-3 rounded-xl hover:bg-green-50 transition-all font-semibold self-start md:self-auto"
          >
            Browse All Produce →
          </motion.button>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {produce.map((item, i) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              whileHover={{ y: -6 }}
              className="group bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 shadow-sm"
            >
              <div className="relative h-44 bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center overflow-hidden">
                <motion.span
                  className="text-8xl"
                  whileHover={{ scale: 1.15, rotate: 5 }}
                  transition={{ duration: 0.3 }}
                >
                  {item.emoji}
                </motion.span>
                <div className={`absolute top-3 left-3 px-2.5 py-1 rounded-lg text-xs font-bold border ${item.badgeClass}`}>
                  {item.badge}
                </div>
                <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button className="w-8 h-8 bg-white/80 backdrop-blur-sm rounded-lg flex items-center justify-center hover:bg-red-50 transition-colors shadow-sm">
                    <Heart className="w-4 h-4 text-gray-500 hover:text-red-500" />
                  </button>
                  <button className="w-8 h-8 bg-white/80 backdrop-blur-sm rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors shadow-sm">
                    <Eye className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              </div>

              <div className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-gray-900 font-bold font-display">{item.name}</h3>
                  <div className="text-right flex-shrink-0 ml-2">
                    <span className="text-green-600 font-bold text-lg">₹{item.price}</span>
                    <span className="text-gray-400 text-xs">/{item.unit}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-gray-400 text-xs mb-3">
                  <MapPin className="w-3 h-3" />
                  {item.farmer} · {item.location}
                </div>
                <div className="flex items-center gap-1 mb-4">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span className="text-amber-600 text-sm font-medium">{item.rating}</span>
                  <span className="text-gray-400 text-xs">({item.reviews} reviews)</span>
                </div>
                <button className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold py-2.5 rounded-xl opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 shadow-md">
                  <ShoppingCart className="w-4 h-4" />
                  Add to Cart
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
