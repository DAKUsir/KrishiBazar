const mongoose = require('mongoose');

const marketplaceProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  category: { type: String, enum: ['Fertilizer', 'Seed', 'Pesticide', 'Tool', 'Other'], required: true },
  price: { type: Number, required: true },
  unit: String,
  images: [String],
  brand: String,
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  inStock: { type: Boolean, default: true },
  tags: [String],
  aiRecommendedFor: [String], // crops or diseases this is good for
  isFeatured: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('MarketplaceProduct', marketplaceProductSchema);
