const Groq = require('groq-sdk');
const User = require('../models/User');
const mandiService = require('../services/mandiService');

const groqClient = process.env.GROQ_API_KEY
  ? new Groq({ apiKey: process.env.GROQ_API_KEY })
  : null;

// @route  POST /api/ai/farm-audit
const runFarmAudit = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const activeCrops = user.crops || ['Wheat'];

    // 1. Fetch live APMC mandi prices for their main crop
    let localPrices = [];
    try {
      if (activeCrops.length > 0) {
        localPrices = await mandiService.getMandiPrices({
          commodity: activeCrops[0],
          state: user.farmDetails?.state || undefined,
          limit: 5
        });
      }
    } catch (err) {
      console.error('Error fetching Mandi prices for audit:', err.message);
    }

    // 2. Mock current district weather forecasts to add context (temp, humidity, rain forecast)
    const weatherForecast = {
      temp: 28,
      humidity: 72,
      rainForecast: 60, // % chance next week
      alerts: 'Heavy monsoon rains expected in the coming 7 days'
    };

    // 3. Compile everything for the LLM
    const farmerLanguage = user.language || 'English';

    const prompt = `You are Krishi AI, the ultimate agritech farm copilot advisor for Indian farmers.
You are running a 1-Click Smart Farm Audit for this farmer:
- Farmer Name: ${user.name}
- State: ${user.farmDetails?.state || 'Unknown'}
- District: ${user.farmDetails?.district || 'Unknown'}
- Farm Area: ${user.farmDetails?.farmArea || 2} acres
- Soil Type: ${user.farmDetails?.soilType || 'Loam'}
- Irrigation Source: ${user.farmDetails?.irrigationSource || 'Rainfed'}
- Farming Experience: ${user.farmDetails?.experienceLevel || '3-5 years'}
- Farming Method: ${user.farmDetails?.farmingMethod || 'Conventional'}
- Active Crops Growing: ${activeCrops.join(', ')}

Live Context Gathered:
- Live Weather: ${weatherForecast.temp}°C, Humidity ${weatherForecast.humidity}%, Rain Forecast: ${weatherForecast.rainForecast}% chance next week. Alert: ${weatherForecast.alerts}
- Live APMC Mandi Rates for ${activeCrops[0] || 'crops'}: ${JSON.stringify(localPrices.slice(0, 3))}

Analyze all this data and respond with a highly personalized, smart agricultural auto-optimizer action plan.
Translate the summary text, titles, descriptions, and action card details ONLY into this language: ${farmerLanguage}.

Respond ONLY with valid JSON using this exact structure:
{
  "healthScore": 82,
  "summary": "3-sentence agricultural audit summary specifically in ${farmerLanguage}.",
  "actionItems": [
    {
      "id": "item1",
      "type": "MANDI_ARBITRAGE",
      "title": "Mandi Arbitrage Title in ${farmerLanguage}",
      "description": "Advice to sell crops in nearby target market APMC to maximize profits. Include exact rates comparisons. Fully in ${farmerLanguage}.",
      "payload": {
        "commodity": "${activeCrops[0] || 'Wheat'}",
        "market": "APMC Bengaluru",
        "price": 2600,
        "description": "Premium fresh organic ${activeCrops[0] || 'Wheat'} crop ready for pickup."
      }
    },
    {
      "id": "item2",
      "type": "WEATHER_WARNING",
      "title": "Weather Alert Title in ${farmerLanguage}",
      "description": "Warning of high rainfall next week with a checklist of smart preventative tasks to complete. Fully in ${farmerLanguage}.",
      "payload": {
        "tasks": ["Turn OFF active tubewell systems", "Clear boundary trenches to prevent waterlogging", "Harvest crop early if matured"]
      }
    },
    {
      "id": "item3",
      "type": "SOIL_PRESCRIPTION",
      "title": "Fertilizer Prescription in ${farmerLanguage}",
      "description": "Specific N-P-K mineral advice suited exactly to their ${user.farmDetails?.soilType || 'Loam'} soil and active crops. Fully in ${farmerLanguage}.",
      "payload": {
        "nutrients": { "N": "115 kg/ha", "P": "55 kg/ha", "K": "45 kg/ha" }
      }
    }
  ]
}
Make the advice practical, specific, and culturally localized. Make sure all text content in the JSON is fully translated to ${farmerLanguage}.`;

    if (!groqClient) {
      return res.status(500).json({ success: false, message: 'GROQ_API_KEY not configured' });
    }

    const response = await groqClient.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 1500,
    });

    const content = response.choices[0].message.content;
    const start = content.indexOf('{');
    const end = content.lastIndexOf('}') + 1;
    const jsonResult = JSON.parse(content.slice(start, end));

    res.json({ success: true, audit: jsonResult });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { runFarmAudit };
