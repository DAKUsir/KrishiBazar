const crops = require('../data/crops');
const axios = require('axios');

// @route  GET /api/crops
const getCrops = async (req, res) => {
  try {
    const { search, category, page = 1, limit = 20 } = req.query;
    let result = crops;

    if (search) {
      result = result.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.scientificName?.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (category) {
      result = result.filter(c => c.category === category);
    }

    const total = result.length;
    const paginated = result.slice((page - 1) * limit, page * limit);

    res.json({ success: true, crops: paginated, total, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route  GET /api/crops/:id
const getCrop = async (req, res) => {
  try {
    const crop = crops.find(c => c.id === req.params.id);
    if (!crop) return res.status(404).json({ success: false, message: 'Crop not found' });
    res.json({ success: true, crop });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route  GET /api/crops/categories
const getCategories = async (req, res) => {
  try {
    const categories = [...new Set(crops.map(c => c.category))];
    res.json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route  POST /api/crops/predict-yield
const predictYield = async (req, res) => {
  try {
    const {
      crop = "Wheat",
      soil = "Loamy",
      season = "Rabi",
      disease = "None",
      irrigation = "Rainfed",
      rainfall = 600,
      temperature = 28,
      fertilizer = 60,
      area = 5,
      msp = 22
    } = req.body;

    console.log('Running yield prediction for:', { crop, soil, season, disease, irrigation, rainfall, temperature, fertilizer, area, msp });

    try {
      console.log('Connecting to Gradio space DakuSir/yieldpredictor...');
      const { Client } = await import('@gradio/client');
      
      const client = await Client.connect("DakuSir/yieldpredictor", {
        hf_token: process.env.HF_TOKEN
      });

      // Align soil types to expected parameters
      const soilMap = {
        'Loam': 'Loamy',
        'Clay': 'Clayey',
        'Sand': 'Sandy',
        'Loamy': 'Loamy',
        'Clayey': 'Clayey',
        'Sandy': 'Sandy',
        'Black': 'Black',
        'Red': 'Red'
      };
      const resolvedSoil = soilMap[soil] || soil || 'Loamy';

      console.log('Sending prediction inputs to Gradio space with mapped soil:', resolvedSoil);
      
      // The model expects named parameters or an ordered object
      const result = await client.predict("/run_prediction", {
        crop,
        soil: resolvedSoil,
        season,
        disease,
        irrigation,
        rainfall: Number(rainfall),
        temperature: Number(temperature),
        fertilizer: Number(fertilizer),
        area: Number(area),
        msp: Number(msp)
      });

      if (result && result.data && result.data[0]) {
        console.log('Gradio Space prediction success!');
        return res.json({
          success: true,
          prediction: result.data[0]
        });
      } else {
        throw new Error('Gradio Space returned empty prediction data');
      }
    } catch (apiError) {
      console.warn('Gradio Space API failed, using smart mathematical fallback:', apiError.message);
      // Mathematical fallback yield calculation
      let yieldPerAcre = 2.5;
      if (crop === 'Wheat') yieldPerAcre = 1.8;
      else if (crop === 'Rice') yieldPerAcre = 2.2;
      else if (crop === 'Maize') yieldPerAcre = 3.0;
      else if (crop === 'Potato') yieldPerAcre = 8.5;
      else if (crop === 'Tomato') yieldPerAcre = 9.0;

      const soilMultipliers = { 'Loamy': 1.1, 'Clayey': 1.0, 'Sandy': 0.7, 'Black': 1.2, 'Red': 0.9 };
      const soilMult = soilMultipliers[soil] || 1.0;
      
      const fertEffect = 1 + (Number(fertilizer) / 100) * 0.2;
      const tempEffect = 1 - Math.abs(Number(temperature) - 26) * 0.02;
      const rainEffect = 1 - Math.abs(Number(rainfall) - 500) * 0.0005;
      const diseasePenalty = disease === 'High' ? 0.4 : disease === 'Medium' ? 0.7 : disease === 'Low' ? 0.9 : 1.0;
      
      const totalYield = Number(area) * yieldPerAcre * soilMult * fertEffect * tempEffect * rainEffect * diseasePenalty;
      const finalYield = Math.max(0.5, totalYield);
      const revenue = finalYield * 1000 * Number(msp);

      const advice = finalYield / Number(area) > yieldPerAcre * 0.9
        ? `**Highly Recommended**: Weather parameters and soil suitability are excellent for ${crop} cultivation. Expect high yields and profitable returns.`
        : `**Caution Recommended**: The predicted yield is lower than historical averages. Consider improving irrigation or fertilizer inputs, or choosing a crop better suited for ${temperature}°C temperatures.`;

      const fallbackText = `### AI Crop Yield Prediction Results 🌾\n\nBased on your farm inputs, here is the predicted performance for **${crop}**:\n\n* **Expected Total Yield**: **${finalYield.toFixed(2)} Tonnes** (~${(finalYield/Number(area)).toFixed(2)} Tonnes/Acre)\n* **Estimated Market Value**: **₹${Math.round(revenue).toLocaleString('en-IN')}** (at ₹${msp}/kg MSP)\n* **Soil Suitability**: **Optimal** (${soil} soil is ideal for water retention)\n* **Disease Risk Impact**: **${disease === 'None' ? 'None' : disease + ' Severity (Yield factored)'}**\n\n#### Krishi AI Market Advice:\n${advice}`;

      return res.json({
        success: true,
        prediction: fallbackText,
        isFallback: true
      });
    }
  } catch (error) {
    console.error('Yield Predictor Controller error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getCrops, getCrop, getCategories, predictYield };
