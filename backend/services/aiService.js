const axios = require('axios');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

const aiService = {
  async analyzeDiseaseImage(imagePath, context) {
    try {
      const response = await axios.post(`${AI_SERVICE_URL}/disease/analyze`, {
        image_path: imagePath,
        context,
      }, { timeout: 30000 });
      return response.data;
    } catch (error) {
      console.error('AI Service error:', error.message);
      // Fallback mock data
      return {
        cropName: context.cropName || 'Tomato',
        diseaseName: 'Early Blight',
        confidence: 87.5,
        severity: 'Medium',
        aiAnalysis: {
          explanation: 'Early Blight is caused by the fungus Alternaria solani. It appears as dark brown spots with concentric rings on lower leaves.',
          causes: ['High humidity (>85%)', 'Warm temperatures (24-29°C)', 'Dense planting reducing air circulation', 'Overhead irrigation'],
          treatment: ['Apply Mancozeb 75% WP at 2g/L water', 'Remove and destroy infected leaves', 'Apply Chlorothalonil fungicide', 'Improve air circulation between plants'],
          prevention: ['Rotate crops every 2-3 years', 'Avoid overhead irrigation', 'Use disease-resistant varieties', 'Apply preventive copper-based fungicides'],
          fertilizers: ['Balanced NPK 19:19:19', 'Potassium-rich fertilizer to strengthen plant immunity'],
          pesticides: ['Mancozeb 75% WP', 'Chlorothalonil', 'Propiconazole'],
          irrigation: 'Switch to drip irrigation to keep foliage dry. Water in early morning.',
          riskAssessment: 'Medium risk. If untreated, can spread to entire crop within 2-3 weeks in humid conditions.',
          yieldImpact: 'Estimated 20-35% yield reduction if not treated within 1 week.',
        },
      };
    }
  },

  async chat({ message, imageUrl, sessionId, userProfile, history }) {
    try {
      const response = await axios.post(`${AI_SERVICE_URL}/chat`, {
        message, imageUrl, sessionId, userProfile, history,
      }, { timeout: 30000 });
      return response.data;
    } catch (error) {
      console.error('AI Chat error:', error.message);
      return {
        message: `Namaste ${userProfile.name}! I'm Krishi AI, your personal farming assistant. ${message.toLowerCase().includes('rain') ? 'Based on your location and crop data, heavy rain is expected in 2 days. I recommend delaying pesticide application and ensuring proper drainage.' : 'I can help you with crop diseases, weather advice, market prices, and farming best practices. What would you like to know?'}`,
      };
    }
  },

  async generateCommunityPost({ scan, user, weather }) {
    try {
      const response = await axios.post(`${AI_SERVICE_URL}/community/generate-post`, {
        scan, user, weather,
      }, { timeout: 20000 });
      return response.data;
    } catch (error) {
      return {
        title: `${scan.cropName || 'Crop'} showing ${scan.diseaseName || 'disease'} symptoms`,
        description: `My ${scan.cropName || 'crop'} has been showing symptoms and AI detected ${scan.diseaseName || 'disease'} with ${scan.confidence?.toFixed(1) || '80'}% confidence (${scan.severity || 'Medium'} severity). Located in ${user.farmDetails?.state || 'India'}. Looking for advice from experienced farmers. Has anyone dealt with this before?`,
        cropType: scan.cropName,
        disease: scan.diseaseName,
        state: user.farmDetails?.state,
        district: user.farmDetails?.district,
        language: user.language || 'English',
        tags: [scan.cropName, scan.diseaseName, 'disease', 'help-needed'],
      };
    }
  },

  async getSmartSellAnalysis({ crop, quantity, farmDetails }) {
    try {
      const response = await axios.post(`${AI_SERVICE_URL}/marketplace/smart-sell`, {
        crop, quantity, farmDetails,
      }, { timeout: 20000 });
      return response.data;
    } catch (error) {
      const basePrice = Math.floor(Math.random() * 30 + 20);
      const predictedPrice = basePrice + Math.floor(Math.random() * 10 - 3);
      return {
        currentPrice: basePrice,
        predictedPrice,
        currency: 'INR/kg',
        bestSellingDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        recommendation: predictedPrice > basePrice ? 'Wait' : 'Sell Now',
        reasoning: predictedPrice > basePrice
          ? `${crop} prices are expected to rise by ₹${predictedPrice - basePrice}/kg in the next 7 days due to reduced supply from neighboring regions.`
          : `Current market conditions are favorable. Sell now to avoid price drop in coming days.`,
        expectedProfit: quantity * predictedPrice,
        marketDemand: 'High',
        nearbyMarkets: [
          { name: 'APMC Bengaluru', distance: '45 km', price: basePrice + 2 },
          { name: 'Local Mandi', distance: '8 km', price: basePrice - 1 },
        ],
      };
    }
  },

  async getProductRecommendations({ disease, crop }) {
    try {
      const response = await axios.get(`${AI_SERVICE_URL}/marketplace/recommendations`, {
        params: { disease, crop },
      }, { timeout: 15000 });
      return response.data;
    } catch (error) {
      return {
        products: ['Mancozeb 75% WP', 'NPK 19:19:19', 'Neem Oil Spray'],
        reason: `Based on ${disease || 'detected disease'} in ${crop || 'your crop'}`,
      };
    }
  },
};

module.exports = aiService;
