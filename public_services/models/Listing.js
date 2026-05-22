import mongoose from 'mongoose';

const listingSchema = new mongoose.Schema({
  crop: {
    type: String,
    required: true,
    enum: ['Tomato', 'Potato', 'Rice', 'Cotton', 'Onion', 'Brinjal', 'Chilli']
  },
  quantity: {
    type: Number,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  location: {
    village: { type: String, required: true },
    district: { type: String, required: true },
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true }
    }
  },
  farmer: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    isVerified: { type: Boolean, default: false } // Check based on FarmShield app scans > 5
  },
  image: {
    type: String,
    default: ''
  },
  harvestDate: {
    type: Date,
    required: true
  },
  shelfLife: {
    type: Number, // Expected shelf life in days
    required: true
  },
  notes: {
    type: String,
    default: ''
  },
  reports: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'sold', 'expired'],
    default: 'active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Listing', listingSchema);
