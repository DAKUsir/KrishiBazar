const mandiService = require('../services/mandiService');

// @route  GET /api/mandi
// @desc   Get normalized live mandi prices from Data.gov.in (with caching)
// @access Protected
const getMandiPrices = async (req, res) => {
  try {
    const { commodity, state, district, market, limit } = req.query;

    // Validate limit if provided
    let limitVal = 20;
    if (limit) {
      const parsed = parseInt(limit, 10);
      if (!isNaN(parsed) && parsed > 0) {
        limitVal = parsed;
      }
    }

    const data = await mandiService.getMandiPrices({
      commodity: commodity?.trim(),
      state: state?.trim(),
      district: district?.trim(),
      market: market?.trim(),
      limit: limitVal
    });

    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Mandi Controller error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve mandi prices. Please try again later.'
    });
  }
};

module.exports = {
  getMandiPrices
};
