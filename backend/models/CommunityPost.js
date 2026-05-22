const mongoose = require('mongoose');

const communityPostSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  images: [String],
  cropType: String,
  state: String,
  district: String,
  disease: String,
  language: { type: String, default: 'English' },
  tags: [String],
  isAIGenerated: { type: Boolean, default: false },
  linkedScan: { type: mongoose.Schema.Types.ObjectId, ref: 'Scan' },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [{
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    text: String,
    isExpert: { type: Boolean, default: false },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    createdAt: { type: Date, default: Date.now },
  }],
  views: { type: Number, default: 0 },
  isTrending: { type: Boolean, default: false },
}, { timestamps: true });

communityPostSchema.index({ cropType: 1, state: 1, disease: 1, language: 1 });

module.exports = mongoose.model('CommunityPost', communityPostSchema);
