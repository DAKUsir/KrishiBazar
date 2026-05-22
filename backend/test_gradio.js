const axios = require('axios');

async function testGradio() {
  try {
    console.log('Sending request to Gradio space...');
    const response = await axios.post('https://dakusir-yieldpredictor.hf.space/api/predict', {
      data: [
        "Wheat",     // crop
        "Loamy",     // soil
        "Kharif",    // season
        "None",      // disease
        "Irrigated",  // irrigation
        600,         // rainfall (mm)
        28,          // temperature (°C)
        60,          // fertilizer (kg/acre)
        5,           // area (acres)
        22           // msp (₹/kg)
      ]
    }, { timeout: 10000 });

    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('Error connecting to Gradio Space:', error.message);
    if (error.response) {
      console.error('Response details:', error.response.status, JSON.stringify(error.response.data));
    }
  }
}

testGradio();
