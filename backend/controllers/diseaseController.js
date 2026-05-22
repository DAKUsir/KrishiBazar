const path = require('path');
const Scan = require('../models/Scan');
const aiService = require('../services/aiService');

// @route  POST /api/disease/upload
const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image uploaded' });
    }

    const imageUrl = `/uploads/${req.file.filename}`;

    // Create initial scan record
    const scan = await Scan.create({
      user: req.user._id,
      imageUrl,
      status: 'processing',
    });

    res.json({ success: true, scanId: scan._id, imageUrl });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route  POST /api/disease/analyze
const analyzeScan = async (req, res) => {
  try {
    const { scanId, cropName } = req.body;

    const scan = await Scan.findById(scanId);
    if (!scan) {
      return res.status(404).json({ success: false, message: 'Scan not found' });
    }

    // Call AI service for disease detection + analysis
    const imagePath = path.join(__dirname, '../', scan.imageUrl);
    const result = await aiService.analyzeDiseaseImage(imagePath, {
      userId: req.user._id,
      cropName,
      farmDetails: req.user.farmDetails,
      language: req.user.language,
    });

    // Update scan with results
    const updatedScan = await Scan.findByIdAndUpdate(
      scanId,
      {
        cropName: result.cropName,
        diseaseName: result.diseaseName,
        confidence: result.confidence,
        severity: result.severity,
        aiAnalysis: result.aiAnalysis,
        status: 'completed',
      },
      { new: true }
    );

    res.json({ success: true, scan: updatedScan });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route  GET /api/disease/history
const getScanHistory = async (req, res) => {
  try {
    const scans = await Scan.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20);
    res.json({ success: true, scans });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route  GET /api/disease/:id
const getScan = async (req, res) => {
  try {
    const scan = await Scan.findById(req.params.id);
    if (!scan) return res.status(404).json({ success: false, message: 'Scan not found' });
    res.json({ success: true, scan });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { uploadImage, analyzeScan, getScanHistory, getScan };
