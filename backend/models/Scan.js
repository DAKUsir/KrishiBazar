const mongoose = require('mongoose');

const scanSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  imageUrl: { type: String, required: true },
  cropName: String,
  diseaseName: String,
  confidence: Number,
  severity: { type: String, enum: ['None', 'Healthy', 'Low', 'Medium', 'High', 'Critical'] },
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
  model: { type: String, default: 'linkanjarad/mobilenet_v2_1.0_224-plant-disease-identification' },
  status: { type: String, enum: ['processing', 'completed', 'failed'], default: 'processing' },
}, { timestamps: true });

module.exports = mongoose.model('Scan', scanSchema);
