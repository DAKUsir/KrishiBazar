const MarketplaceProduct = require('../models/MarketplaceProduct');
const YieldListing = require('../models/YieldListing');
const aiService = require('../services/aiService');

// @route  GET /api/market/products
const getProducts = async (req, res) => {
  try {
    const { category, search, page = 1, limit = 12 } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (search) filter.name = { $regex: search, $options: 'i' };

    const products = await MarketplaceProduct.find(filter)
      .sort({ isFeatured: -1, rating: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await MarketplaceProduct.countDocuments(filter);
    res.json({ success: true, products, total, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route  POST /api/market/add-product
const addProduct = async (req, res) => {
  try {
    const { name, description, category, price, unit, brand, tags } = req.body;
    const images = req.files ? req.files.map(f => `/uploads/${f.filename}`) : [];

    const product = await MarketplaceProduct.create({
      name, description, category, price, unit, brand, tags, images,
    });

    res.status(201).json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route  GET /api/market/listings
const getListings = async (req, res) => {
  try {
    const { crop, state, page = 1, limit = 10 } = req.query;
    const filter = { status: 'active' };
    if (crop) filter.crop = { $regex: crop, $options: 'i' };
    if (state) filter['location.state'] = state;

    const listings = await YieldListing.find(filter)
      .populate('seller', 'name avatar farmDetails')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await YieldListing.countDocuments(filter);
    res.json({ success: true, listings, total, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route  POST /api/market/sell-yield
const createYieldListing = async (req, res) => {
  try {
    const { crop, quantity, unit, pricePerUnit, description, location, contact, quality, availableFrom, availableTo } = req.body;
    const images = req.files ? req.files.map(f => `/uploads/${f.filename}`) : [];

    const listing = await YieldListing.create({
      seller: req.user._id,
      crop, quantity, unit, pricePerUnit,
      totalPrice: quantity * pricePerUnit,
      description, location, contact, quality,
      availableFrom, availableTo, images,
    });

    res.status(201).json({ success: true, listing });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route  POST /api/smart-sell
const smartSellAnalysis = async (req, res) => {
  try {
    const { crop, quantity, currentLocation } = req.body;

    const analysis = await aiService.getSmartSellAnalysis({
      crop, quantity, currentLocation,
      userId: req.user._id,
      crops: req.user.crops,
      farmDetails: req.user.farmDetails,
    });

    res.json({ success: true, analysis });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route  GET /api/market/recommendations
const getAIRecommendations = async (req, res) => {
  try {
    const { disease, crop } = req.query;
    const recommendations = await aiService.getProductRecommendations({ disease, crop });
    res.json({ success: true, recommendations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getProducts, addProduct, getListings, createYieldListing, smartSellAnalysis, getAIRecommendations };
