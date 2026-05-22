import mongoose from 'mongoose';

const yieldListingSchema = new mongoose.Schema({
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  crop: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  unit: {
    type: String,
    default: 'kg'
  },
  pricePerUnit: {
    type: Number,
    required: true
  },
  totalPrice: {
    type: Number
  },
  images: {
    type: [String],
    default: []
  },
  description: {
    type: String,
    default: ''
  },
  location: {
    state: { type: String, default: 'Karnataka' },
    district: { type: String, default: '' },
    address: { type: String, default: '' },
    // Extends the schema to support Leaflet GPS locations and distance calculations
    coordinates: {
      lat: { type: Number, default: 12.9716 },
      lng: { type: Number, default: 77.5946 }
    }
  },
  contact: {
    phone: { type: String, default: '' },
    whatsapp: { type: String },
    email: { type: String }
  },
  quality: {
    type: String,
    enum: ['A', 'B', 'C', 'Organic'],
    default: 'A'
  },
  availableFrom: {
    type: Date,
    default: Date.now
  },
  availableTo: {
    type: Date,
    default: () => new Date(Date.now() + 15 * 24 * 60 * 60 * 1000) // 15 days later
  },
  isBulkOnly: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['active', 'sold', 'expired'],
    default: 'active'
  },
  views: {
    type: Number,
    default: 0
  },
  reports: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

// Check if model already compiled, otherwise compile
const Listing = mongoose.models.YieldListing || mongoose.model('YieldListing', yieldListingSchema);
export default Listing;
