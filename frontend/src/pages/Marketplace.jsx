import { useState } from 'react'
import { motion } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ShoppingBag, Plus, Search, Star, Phone, MessageSquare,
  Mail, TrendingUp, TrendingDown, Package, Leaf, ArrowUpRight,
  Filter, MapPin, Calendar, BarChart2, X, ChevronRight
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import api from '../lib/api'
import { formatCurrency, INDIAN_STATES, CROP_LIST } from '../lib/utils'

const PRODUCT_CATEGORIES = ['All', 'Fertilizer', 'Seed', 'Pesticide', 'Tool', 'Other']

function ProductCard({ product }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="dashboard-card p-4 cursor-pointer group"
    >
      <div className="h-36 bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl flex items-center justify-center mb-3 relative overflow-hidden">
        <Package className="w-12 h-12 text-green-400" />
        {product.isFeatured && (
          <span className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded-full">Featured</span>
        )}
        {!product.inStock && (
          <div className="absolute inset-0 bg-gray-100/80 flex items-center justify-center">
            <span className="text-gray-500 font-semibold text-sm">Out of Stock</span>
          </div>
        )}
      </div>
      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">{product.category}</span>
      <h3 className="font-bold text-gray-900 mt-2 mb-1 line-clamp-1">{product.name}</h3>
      {product.brand && <p className="text-xs text-gray-400 mb-2">{product.brand}</p>}
      <div className="flex items-center gap-1 mb-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className={`w-3.5 h-3.5 ${i < Math.floor(product.rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
        ))}
        <span className="text-xs text-gray-400 ml-1">({product.reviewCount || 0})</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-lg font-bold text-green-700">{formatCurrency(product.price)}</span>
        {product.unit && <span className="text-xs text-gray-400">per {product.unit}</span>}
      </div>
      <button className="w-full mt-3 bg-green-600 text-white text-sm font-semibold py-2 rounded-xl hover:bg-green-700 transition-colors opacity-0 group-hover:opacity-100">
        Add to Cart
      </button>
    </motion.div>
  )
}

function YieldListingCard({ listing }) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="dashboard-card p-5"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-bold text-gray-900 text-lg">{listing.crop}</h3>
          <div className="flex items-center gap-2 text-sm text-gray-500 mt-0.5">
            <MapPin className="w-4 h-4" />
            <span>{listing.location?.district}, {listing.location?.state}</span>
          </div>
        </div>
        <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1.5 rounded-full">
          {listing.quality} Grade
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-gray-50 rounded-xl p-3 text-center">
          <p className="text-lg font-bold text-gray-900">{listing.quantity}</p>
          <p className="text-xs text-gray-500">{listing.unit}</p>
        </div>
        <div className="bg-green-50 rounded-xl p-3 text-center">
          <p className="text-lg font-bold text-green-700">{formatCurrency(listing.pricePerUnit)}</p>
          <p className="text-xs text-green-600">per {listing.unit}</p>
        </div>
        <div className="bg-blue-50 rounded-xl p-3 text-center">
          <p className="text-lg font-bold text-blue-700">{formatCurrency(listing.totalPrice || listing.quantity * listing.pricePerUnit)}</p>
          <p className="text-xs text-blue-600">Total</p>
        </div>
      </div>

      {listing.description && (
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{listing.description}</p>
      )}

      <div className="flex gap-2">
        {listing.contact?.phone && (
          <a href={`tel:${listing.contact.phone}`} className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-green-700 transition-colors">
            <Phone className="w-4 h-4" /> Call
          </a>
        )}
        {listing.contact?.whatsapp && (
          <a href={`https://wa.me/${listing.contact.whatsapp}`} target="_blank" rel="noreferrer"
            className="flex-1 flex items-center justify-center gap-2 bg-emerald-500 text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-emerald-600 transition-colors">
            <MessageSquare className="w-4 h-4" /> WhatsApp
          </a>
        )}
        {listing.contact?.email && (
          <a href={`mailto:${listing.contact.email}`} className="flex items-center justify-center gap-2 bg-blue-600 text-white text-sm font-semibold py-2.5 px-4 rounded-xl hover:bg-blue-700 transition-colors">
            <Mail className="w-4 h-4" />
          </a>
        )}
      </div>
    </motion.div>
  )
}

function SmartSellModal({ onClose }) {
  const [form, setForm] = useState({ crop: '', quantity: '' })
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const analyze = async () => {
    setLoading(true)
    try {
      const { data } = await api.post('/market/smart-sell', form)
      setResult(data.analysis)
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
      >
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-green-600 to-emerald-500 text-white">
          <div className="flex items-center gap-3">
            <BarChart2 className="w-6 h-6" />
            <h3 className="font-bold font-display text-lg">Smart Sell Analysis</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6">
          {!result ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Crop</label>
                <select value={form.crop} onChange={e => setForm(f => ({ ...f, crop: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-green-500 bg-white">
                  <option value="">Select crop</option>
                  {CROP_LIST.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Quantity (kg)</label>
                <input type="number" placeholder="e.g. 500" value={form.quantity}
                  onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-green-500" />
              </div>
              <button onClick={analyze} disabled={!form.crop || !form.quantity || loading}
                className="w-full btn-primary disabled:opacity-50">
                {loading ? 'Analyzing...' : 'Get AI Analysis'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-green-50 rounded-2xl p-4 text-center">
                  <p className="text-xs text-green-600 font-medium mb-1">Current Price</p>
                  <p className="text-2xl font-bold text-green-700">{formatCurrency(result.currentPrice)}</p>
                  <p className="text-xs text-gray-500">{result.currency}</p>
                </div>
                <div className="bg-blue-50 rounded-2xl p-4 text-center">
                  <p className="text-xs text-blue-600 font-medium mb-1">Predicted Price</p>
                  <p className="text-2xl font-bold text-blue-700">{formatCurrency(result.predictedPrice)}</p>
                  <p className={`text-xs font-medium ${result.priceChange7Days > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {result.priceChange7Days > 0 ? '▲' : '▼'} {Math.abs(result.priceChange7Days)}% in 7 days
                  </p>
                </div>
              </div>

              <div className={`rounded-2xl p-4 border ${result.recommendation === 'Sell Now' ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'}`}>
                <p className={`font-bold text-lg mb-1 ${result.recommendation === 'Sell Now' ? 'text-green-700' : 'text-orange-700'}`}>
                  {result.recommendation === 'Sell Now' ? '✅ Sell Now' : '⏳ Wait to Sell'}
                </p>
                <p className="text-sm text-gray-600">{result.reasoning}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500">Expected Profit</p>
                  <p className="font-bold text-gray-900">{formatCurrency(result.expectedProfit)}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500">Market Demand</p>
                  <p className="font-bold text-gray-900">{result.marketDemand}</p>
                </div>
              </div>

              {result.nearbyMarkets && (
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">Nearby Markets</p>
                  {result.nearbyMarkets.map((m, i) => (
                    <div key={i} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{m.name}</p>
                        <p className="text-xs text-gray-500">{m.distance}</p>
                      </div>
                      <p className="font-bold text-green-700">{formatCurrency(m.price)}/kg</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

function SellYieldModal({ onClose }) {
  const [form, setForm] = useState({
    crop: '', quantity: '', unit: 'kg', pricePerUnit: '', description: '',
    location: { state: '', district: '', address: '' },
    contact: { phone: '', whatsapp: '', email: '' },
    quality: 'A'
  })
  const [submitting, setSubmitting] = useState(false)
  const qc = useQueryClient()

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      await api.post('/market/sell-yield', form)
      qc.invalidateQueries(['yield-listings'])
      onClose()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto custom-scrollbar"
      >
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
          <h3 className="font-bold text-gray-900 font-display text-lg">List Your Yield</h3>
          <button onClick={onClose} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Crop *</label>
              <select value={form.crop} onChange={e => setForm(f => ({ ...f, crop: e.target.value }))}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-green-500 text-sm bg-white">
                <option value="">Select</option>
                {CROP_LIST.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Quality</label>
              <select value={form.quality} onChange={e => setForm(f => ({ ...f, quality: e.target.value }))}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-green-500 text-sm bg-white">
                {['A', 'B', 'C', 'Organic'].map(q => <option key={q} value={q}>Grade {q}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Quantity *</label>
              <input type="number" placeholder="500" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-green-500 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Unit</label>
              <select value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-green-500 text-sm bg-white">
                {['kg', 'quintal', 'tonne'].map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Price per {form.unit} (₹) *</label>
            <input type="number" placeholder="25" value={form.pricePerUnit} onChange={e => setForm(f => ({ ...f, pricePerUnit: e.target.value }))}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-green-500 text-sm" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
            <textarea rows={3} placeholder="Describe your yield quality, harvest date, etc..." value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-green-500 text-sm resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">State</label>
              <select value={form.location.state} onChange={e => setForm(f => ({ ...f, location: { ...f.location, state: e.target.value } }))}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-green-500 text-sm bg-white">
                <option value="">Select</option>
                {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">District</label>
              <input placeholder="District" value={form.location.district}
                onChange={e => setForm(f => ({ ...f, location: { ...f.location, district: e.target.value } }))}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-green-500 text-sm" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone *</label>
              <input placeholder="+91 9876543210" value={form.contact.phone}
                onChange={e => setForm(f => ({ ...f, contact: { ...f.contact, phone: e.target.value } }))}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-green-500 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">WhatsApp</label>
              <input placeholder="+91 9876543210" value={form.contact.whatsapp}
                onChange={e => setForm(f => ({ ...f, contact: { ...f.contact, whatsapp: e.target.value } }))}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-green-500 text-sm" />
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 btn-secondary">Cancel</button>
            <button
              onClick={handleSubmit}
              disabled={submitting || !form.crop || !form.quantity || !form.pricePerUnit}
              className="flex-1 btn-primary disabled:opacity-50"
            >
              {submitting ? 'Listing...' : 'List Yield'}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function Marketplace() {
  const [tab, setTab] = useState('buy')
  const [category, setCategory] = useState('')
  const [search, setSearch] = useState('')
  const [showSmartSell, setShowSmartSell] = useState(false)
  const [showSellYield, setShowSellYield] = useState(false)

  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ['products', category, search],
    queryFn: () => api.get('/market/products', { params: { category, search } }).then(r => r.data),
    enabled: tab === 'buy',
  })

  const { data: listingsData, isLoading: listingsLoading } = useQuery({
    queryKey: ['yield-listings'],
    queryFn: () => api.get('/market/listings').then(r => r.data),
    enabled: tab === 'sell',
  })

  return (
    <div className="p-6">
      {/* Tabs */}
      <div className="flex gap-2 mb-6 bg-gray-100 rounded-2xl p-1.5 w-fit">
        <button
          onClick={() => setTab('buy')}
          className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-all ${tab === 'buy' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          🛒 Buy Products
        </button>
        <button
          onClick={() => setTab('sell')}
          className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-all ${tab === 'sell' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          🌾 Sell Yield
        </button>
      </div>

      {tab === 'buy' && (
        <div>
          {/* Search + Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-5">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                placeholder="Search fertilizers, seeds, pesticides..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-green-500 bg-white shadow-sm"
              />
            </div>
          </div>

          <div className="flex gap-2 flex-wrap mb-6">
            {PRODUCT_CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat === 'All' ? '' : cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all
                  ${(cat === 'All' && !category) || category === cat
                    ? 'bg-green-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-green-300'}`}
              >
                {cat}
              </button>
            ))}
          </div>

          {productsLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton h-72 rounded-2xl" />)}
            </div>
          ) : productsData?.products?.length ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {productsData.products.map((product, i) => (
                <motion.div key={product._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No products found. Products will appear here once added.</p>
            </div>
          )}
        </div>
      )}

      {tab === 'sell' && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold text-gray-900 font-display text-xl">Yield Listings</h2>
            <div className="flex gap-3">
              <button onClick={() => setShowSmartSell(true)} className="btn-secondary flex items-center gap-2 text-sm">
                <BarChart2 className="w-4 h-4" /> Smart Sell
              </button>
              <button onClick={() => setShowSellYield(true)} className="btn-primary flex items-center gap-2 text-sm">
                <Plus className="w-4 h-4" /> List Yield
              </button>
            </div>
          </div>

          {listingsLoading ? (
            <div className="space-y-4">
              {[1,2,3].map(i => <div key={i} className="skeleton h-48 rounded-2xl" />)}
            </div>
          ) : listingsData?.listings?.length ? (
            <div className="grid md:grid-cols-2 gap-6">
              {listingsData.listings.map((listing, i) => (
                <motion.div key={listing._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                  <YieldListingCard listing={listing} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <Leaf className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium mb-3">No listings yet. Be the first to sell!</p>
              <button onClick={() => setShowSellYield(true)} className="btn-primary">List Your Yield</button>
            </div>
          )}
        </div>
      )}

      {showSmartSell && <SmartSellModal onClose={() => setShowSmartSell(false)} />}
      {showSellYield && <SellYieldModal onClose={() => setShowSellYield(false)} />}
    </div>
  )
}
