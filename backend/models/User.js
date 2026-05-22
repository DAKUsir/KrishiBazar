const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  googleId: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  avatar: String,
  phone: String,
  isOnboarded: { type: Boolean, default: false },
  language: { type: String, default: 'English', enum: ['English', 'Hindi', 'Kannada', 'Tamil', 'Telugu'] },
  crops: [{ type: String }],
  farmDetails: {
    state: String,
    district: String,
    farmArea: Number,
    farmAreaUnit: { type: String, default: 'acres' },
    soilType: { type: String, enum: ['Sandy', 'Clay', 'Loam', 'Silt', 'Peaty', 'Chalky', 'Mixed'] },
    irrigationSource: { type: String, default: 'Rainfed' },
    experienceLevel: { type: String, default: '3-5 years' },
    farmingMethod: { type: String, default: 'Conventional' },
  },
  diseaseHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Scan' }],
  notifications: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Notification' }],
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
