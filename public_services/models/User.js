import mongoose from 'mongoose';

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
  },
  diseaseHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Scan' }]
}, { timestamps: true });

// Check if model already compiled, otherwise compile
const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;
