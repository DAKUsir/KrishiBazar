const weatherService = require('../services/weatherService');

// @route  GET /api/weather
const getWeather = async (req, res) => {
  try {
    const { state, district, lat, lon } = req.query;

    const weather = await weatherService.getWeather({ state, district, lat, lon });

    res.json({ success: true, weather });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route  GET /api/weather/forecast
const getForecast = async (req, res) => {
  try {
    const { lat, lon } = req.query;
    const forecast = await weatherService.getForecast({ lat, lon });
    res.json({ success: true, forecast });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getWeather, getForecast };
