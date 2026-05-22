const mongoose = require('mongoose');

const yieldListingSchema = new mongoose.Schema({
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  crop: { type: String, required: true },
  quantity: { type: Number, required: true },
  unit: { type: String, default: 'kg' },
  pricePerUnit: { type: Number, required: true },
  totalPrice: Number,
  images: [String],
  description: String,
  location: {
    state: String,
    district: String,
    address: String,
  },
  contact: {
    phone: String,
    whatsapp: String,
    email: String,
  },
  quality: { type: String, enum: ['A', 'B', 'C', 'Organic'] },
  availableFrom: Date,
  availableTo: Date,
  isBulkOnly: { type: Boolean, default: true },
  status: { type: String, enum: ['active', 'sold', 'expired'], default: 'active' },
  views: { type: Number, default: 0 },
  smartSellAnalysis: {
    currentPrice: Number,
    predictedPrice: Number,
    bestSellingDate: Date,
    recommendation: String,
    expectedProfit: Number,
  },
}, { timestamps: true });

module.exports = mongoose.model('YieldListing', yieldListingSchema);
