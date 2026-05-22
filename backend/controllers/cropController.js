const crops = require('../data/crops');

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

module.exports = { getCrops, getCrop, getCategories };
