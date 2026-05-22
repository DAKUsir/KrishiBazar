const axios = require('axios');

const OPENWEATHER_API = 'https://api.openweathermap.org/data/2.5';

// Mock data for when API key is not set
const getMockWeather = (state = 'Karnataka') => ({
  location: { state, city: 'Bengaluru', country: 'IN' },
  current: {
    temperature: 28,
    feelsLike: 31,
    humidity: 72,
    windSpeed: 12,
    windDirection: 'SW',
    rainfall: 0,
    uvIndex: 6,
    visibility: 10,
    cloudCover: 45,
    condition: 'Partly Cloudy',
    icon: '02d',
    updatedAt: new Date().toISOString(),
  },
  agriculture: {
    diseaseRisk: 'Medium',
    diseaseRiskReason: 'High humidity increases fungal disease risk',
    irrigationRecommendation: 'Irrigate in morning hours to allow foliage to dry',
    sprayRecommendation: 'Suitable for spraying - low wind speed, no rain expected today',
    frostRisk: 'None',
  },
  season: {
    current: 'Summer',
    monsoonStatus: 'Pre-Monsoon',
    expectedMonsoon: 'June 1st week',
  },
  forecast: {
    hourly: Array.from({ length: 24 }, (_, i) => ({
      time: new Date(Date.now() + i * 3600000).toISOString(),
      temp: 28 + Math.sin(i * 0.5) * 4,
      humidity: 70 + Math.random() * 10,
      rainfall: i > 18 ? 2 : 0,
      condition: i > 18 ? 'Light Rain' : 'Partly Cloudy',
    })),
    daily: Array.from({ length: 7 }, (_, i) => ({
      date: new Date(Date.now() + i * 86400000).toISOString(),
      high: 30 + Math.random() * 3,
      low: 22 + Math.random() * 3,
      humidity: 65 + Math.random() * 20,
      rainfall: i === 2 || i === 5 ? Math.random() * 15 : 0,
      condition: i === 2 ? 'Rainy' : i === 5 ? 'Heavy Rain' : 'Partly Cloudy',
    })),
  },
});

const weatherService = {
  async getWeather({ state, district, lat, lon }) {
    if (!process.env.OPENWEATHER_API_KEY || process.env.OPENWEATHER_API_KEY === 'your_openweather_api_key_here') {
      return getMockWeather(state);
    }

    try {
      const params = lat && lon
        ? { lat, lon, appid: process.env.OPENWEATHER_API_KEY, units: 'metric' }
        : { q: `${district || ''},${state || 'Karnataka'},IN`, appid: process.env.OPENWEATHER_API_KEY, units: 'metric' };

      const [current, forecast] = await Promise.all([
        axios.get(`${OPENWEATHER_API}/weather`, { params }),
        axios.get(`${OPENWEATHER_API}/forecast`, { params }),
      ]);

      return {
        location: { city: current.data.name, country: current.data.sys.country },
        current: {
          temperature: current.data.main.temp,
          feelsLike: current.data.main.feels_like,
          humidity: current.data.main.humidity,
          windSpeed: current.data.wind.speed * 3.6,
          rainfall: current.data.rain?.['1h'] || 0,
          uvIndex: 5,
          condition: current.data.weather[0].main,
          icon: current.data.weather[0].icon,
          updatedAt: new Date().toISOString(),
        },
        agriculture: {
          diseaseRisk: current.data.main.humidity > 80 ? 'High' : current.data.main.humidity > 60 ? 'Medium' : 'Low',
          irrigationRecommendation: current.data.rain?.['1h'] > 5 ? 'No irrigation needed - sufficient rainfall' : 'Irrigate crops as needed',
          sprayRecommendation: current.data.wind.speed > 5 ? 'Avoid spraying - high wind speed' : 'Suitable for spraying',
        },
      };
    } catch (error) {
      console.error('Weather API error:', error.message);
      return getMockWeather(state);
    }
  },

  async getForecast({ lat, lon }) {
    return getMockWeather().forecast;
  },
};

module.exports = weatherService;
