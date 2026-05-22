const mongoose = require('mongoose');

const chatHistorySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sessionId: { type: String, required: true },
  messages: [{
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: String,
    imageUrl: String,
    audioUrl: String,
    timestamp: { type: Date, default: Date.now },
  }],
  context: {
    crops: [String],
    farmDetails: Object,
    recentDisease: String,
    weather: Object,
  },
}, { timestamps: true });

module.exports = mongoose.model('ChatHistory', chatHistorySchema);
