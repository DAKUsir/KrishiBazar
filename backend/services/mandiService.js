const axios = require('axios');

const RESOURCE_ID = process.env.DATA_GOV_RESOURCE_ID || '9ef84268-d588-465a-a308-a864a43d0070';
const BASE_URL = `https://api.data.gov.in/resource/${RESOURCE_ID}`;

// Simple memory caching
const cache = new Map();
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

// Realistic Mock Mandi Data for Fallback
const mockMandiRecords = [
  { commodity: 'Tomato', market: 'APMC Bengaluru', district: 'Bengaluru', state: 'Karnataka', min_price: '2000', max_price: '3500', modal_price: '2800', arrival_date: '2026-05-22' },
  { commodity: 'Tomato', market: 'APMC Pune', district: 'Pune', state: 'Maharashtra', min_price: '1800', max_price: '3200', modal_price: '2500', arrival_date: '2026-05-22' },
  { commodity: 'Wheat', market: 'APMC Khanna', district: 'Ludhiana', state: 'Punjab', min_price: '2125', max_price: '2275', modal_price: '2200', arrival_date: '2026-05-22' },
  { commodity: 'Wheat', market: 'APMC Bengaluru', district: 'Bengaluru', state: 'Karnataka', min_price: '2300', max_price: '2600', modal_price: '2450', arrival_date: '2026-05-22' },
  { commodity: 'Rice', market: 'APMC Nellore', district: 'Nellore', state: 'Andhra Pradesh', min_price: '2800', max_price: '3800', modal_price: '3400', arrival_date: '2026-05-22' },
  { commodity: 'Rice', market: 'APMC Bengaluru', district: 'Bengaluru', state: 'Karnataka', min_price: '3000', max_price: '4200', modal_price: '3700', arrival_date: '2026-05-22' },
  { commodity: 'Potato', market: 'APMC Agra', district: 'Agra', state: 'Uttar Pradesh', min_price: '1200', max_price: '1800', modal_price: '1500', arrival_date: '2026-05-22' },
  { commodity: 'Potato', market: 'APMC Bengaluru', district: 'Bengaluru', state: 'Karnataka', min_price: '1600', max_price: '2200', modal_price: '1900', arrival_date: '2026-05-22' },
  { commodity: 'Onion', market: 'APMC Lasalgaon', district: 'Nashik', state: 'Maharashtra', min_price: '1000', max_price: '1700', modal_price: '1400', arrival_date: '2026-05-22' },
  { commodity: 'Onion', market: 'APMC Bengaluru', district: 'Bengaluru', state: 'Karnataka', min_price: '1300', max_price: '2000', modal_price: '1700', arrival_date: '2026-05-22' },
  { commodity: 'Cotton', market: 'APMC Rajkot', district: 'Rajkot', state: 'Gujarat', min_price: '6500', max_price: '7800', modal_price: '7200', arrival_date: '2026-05-22' },
  { commodity: 'Maize', market: 'APMC Davanagere', district: 'Davanagere', state: 'Karnataka', min_price: '1900', max_price: '2300', modal_price: '2100', arrival_date: '2026-05-22' }
];

const getMockData = (filters = {}) => {
  let filtered = [...mockMandiRecords];
  
  if (filters.commodity) {
    const q = filters.commodity.toLowerCase();
    filtered = filtered.filter(r => r.commodity.toLowerCase().includes(q));
  }
  if (filters.state) {
    const q = filters.state.toLowerCase();
    filtered = filtered.filter(r => r.state.toLowerCase().includes(q));
  }
  if (filters.district) {
    const q = filters.district.toLowerCase();
    filtered = filtered.filter(r => r.district.toLowerCase().includes(q));
  }
  if (filters.market) {
    const q = filters.market.toLowerCase();
    filtered = filtered.filter(r => r.market.toLowerCase().includes(q));
  }
  
  return filtered.slice(0, filters.limit || 20);
};

const mandiService = {
  async getMandiPrices({ commodity, state, district, market, limit }) {
    const cacheKey = JSON.stringify({ commodity, state, district, market, limit });
    
    // Check Cache
    if (cache.has(cacheKey)) {
      const cached = cache.get(cacheKey);
      if (Date.now() - cached.timestamp < CACHE_DURATION) {
        console.log('Serving Mandi Prices from cache');
        return cached.data;
      }
      cache.delete(cacheKey); // Cache expired
    }

    const apiKey = process.env.DATA_GOV_API_KEY;
    const isMock = !apiKey || apiKey === 'YOUR_API_KEY' || apiKey === 'your_api_key_here';

    if (isMock) {
      console.log('Serving mock mandi prices due to missing/default API key');
      const mockRecords = getMockData({ commodity, state, district, market, limit });
      const normalized = this.normalizeRecords(mockRecords);
      cache.set(cacheKey, { timestamp: Date.now(), data: normalized });
      return normalized;
    }

    try {
      const params = {
        'api-key': apiKey,
        format: 'json',
        limit: limit || 20,
      };

      // Add filters only if values are provided
      if (commodity) params['filters[commodity]'] = commodity;
      if (state) params['filters[state.keyword]'] = state;
      if (district) params['filters[district]'] = district;
      if (market) params['filters[market]'] = market;

      console.log('Fetching Mandi prices from Data.gov.in API with filters:', params);
      const response = await axios.get(BASE_URL, { params, timeout: 15000 });

      if (response.data && response.data.records) {
        const normalized = this.normalizeRecords(response.data.records);
        // Cache successful response
        cache.set(cacheKey, { timestamp: Date.now(), data: normalized });
        return normalized;
      } else {
        throw new Error('Invalid response structure from Data.gov.in API');
      }
    } catch (error) {
      console.error('Data.gov.in API error:', error.message);
      // Fallback to mock data on error so application doesn't crash
      console.log('Falling back to mock mandi data due to API error');
      const mockRecords = getMockData({ commodity, state, district, market, limit });
      const normalized = this.normalizeRecords(mockRecords);
      return normalized;
    }
  },

  normalizeRecords(records) {
    return records.map(r => ({
      commodity: r.commodity || 'Unknown',
      market: r.market || 'Unknown',
      district: r.district || 'Unknown',
      state: r.state || 'Unknown',
      minPrice: Number(r.min_price) || 0,
      maxPrice: Number(r.max_price) || 0,
      modalPrice: Number(r.modal_price) || 0,
      arrivalDate: r.arrival_date || new Date().toISOString().split('T')[0]
    }));
  }
};

module.exports = mandiService;
