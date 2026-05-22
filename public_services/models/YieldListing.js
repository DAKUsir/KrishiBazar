import mongoose from 'mongoose';

const yieldListingSchema = new mongoose.Schema({
  seller: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: false // Optional in public services for quick OTP phone-only posts
  },
  farmerName: {
    type: String, // Store direct name if seller ref isn't available
    default: ''
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
    district: { type: String, required: true },
    village: { type: String, default: '' },
    address: { type: String, default: '' },
    coordinates: {
      lat: { type: Number, default: 12.9716 },
      lng: { type: Number, default: 77.5946 }
    }
  },
  contact: {
    phone: { type: String, required: true },
    whatsapp: { type: String, default: '' },
    email: { type: String, default: '' }
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
    type: Date
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
  },
  isVerifiedFarmer: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

export default mongoose.model('YieldListing', yieldListingSchema, 'yieldlistings');
