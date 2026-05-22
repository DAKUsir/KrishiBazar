const mongoose = require('mongoose');

const scanSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  imageUrl: { type: String, required: true },
  cropName: String,
  diseaseName: String,
  confidence: Number,
  severity: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'] },
  aiAnalysis: {
    explanation: String,
    causes: [String],
    treatment: [String],
    prevention: [String],
    fertilizers: [String],
    pesticides: [String],
    irrigation: String,
    riskAssessment: String,
    yieldImpact: String,
  },
  weatherAtTime: {
    temperature: Number,
    humidity: Number,
    rainfall: Number,
  },
  status: { type: String, enum: ['processing', 'completed', 'failed'], default: 'processing' },
}, { timestamps: true });

module.exports = mongoose.model('Scan', scanSchema);
