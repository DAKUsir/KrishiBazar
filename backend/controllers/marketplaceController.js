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

const Scan = require('../models/Scan');

// @route  GET /api/market/recommendations
const getAIRecommendations = async (req, res) => {
  try {
    let { disease, crop } = req.query;
    
    // If not provided, dynamically resolve from the user's latest crop disease scan!
    let lastScan = null;
    if (!crop || !disease) {
      lastScan = await Scan.findOne({ user: req.user._id, status: 'completed' }).sort({ createdAt: -1 });
      if (lastScan) {
        crop = lastScan.cropName;
        disease = lastScan.diseaseName;
      }
    }

    // Standard mock list based on crop/disease
    const defaultMocks = {
      'Tomato': [
        {
          _id: 'rec_pest_1',
          name: 'Mancozeb 75% WP Fungicide',
          category: 'Pesticide',
          price: 320,
          unit: '500g Pack',
          brand: 'Krishi Care',
          rating: 4.8,
          reviewCount: 94,
          inStock: true,
          description: 'Highly effective fungicide recommended for Late Blight and Early Blight control in Tomatoes.'
        },
        {
          _id: 'rec_fert_1',
          name: 'NPK 19:19:19 Soluble Fertilizer',
          category: 'Fertilizer',
          price: 240,
          unit: '1kg Bag',
          brand: 'AgriBoost',
          rating: 4.6,
          reviewCount: 112,
          inStock: true,
          description: 'Balanced crop nutrient rich in potassium to build systemic disease immunity.'
        },
        {
          _id: 'rec_seed_1',
          name: 'F1 Hybrid Disease-Resistant Tomato Seeds',
          category: 'Seed',
          price: 180,
          unit: 'Packet',
          brand: 'GrowSeed',
          rating: 4.9,
          reviewCount: 45,
          inStock: true,
          description: 'F1 hybrid tomato seeds pre-treated to resist Leaf Blight and Fusarium Wilt.'
        }
      ],
      'Wheat': [
        {
          _id: 'rec_pest_2',
          name: 'Propiconazole 25% EC Fungicide',
          category: 'Pesticide',
          price: 450,
          unit: '250ml Bottle',
          brand: 'CropShield',
          rating: 4.7,
          reviewCount: 68,
          inStock: true,
          description: 'Systemic triazole fungicide recommended for Yellow Rust, Leaf Rust, and Powdery Mildew in Wheat.'
        },
        {
          _id: 'rec_fert_2',
          name: 'Urea Fertilizer (Granular)',
          category: 'Fertilizer',
          price: 260,
          unit: '45kg Bag',
          brand: 'IFFCO',
          rating: 4.5,
          reviewCount: 380,
          inStock: true,
          description: 'Highly soluble nitrogenous fertilizer supplying 46% nitrogen for rapid grain filling.'
        }
      ],
      'Rice': [
        {
          _id: 'rec_pest_3',
          name: 'Tricyclazole 75% WP Blast Controller',
          category: 'Pesticide',
          price: 490,
          unit: '500g Pack',
          brand: 'BlastOff',
          rating: 4.8,
          reviewCount: 78,
          inStock: true,
          description: 'Specific systemic specialty fungicide for control of Leaf Blast and Neck Blast in Paddy fields.'
        },
        {
          _id: 'rec_seed_3',
          name: 'Swarna Sub-1 Water-Logging Paddy Seeds',
          category: 'Seed',
          price: 650,
          unit: '10kg Bag',
          brand: 'National Seeds Corporation',
          rating: 4.9,
          reviewCount: 134,
          inStock: true,
          description: 'Climate-resilient paddy seed variety with high resistance to submergence and stem rot.'
        }
      ],
      'Maize': [
        {
          _id: 'rec_pest_4',
          name: 'Chlorantraniliprole 18.5% SC (Coragen)',
          category: 'Pesticide',
          price: 850,
          unit: '150ml Pack',
          brand: 'AgriScience',
          rating: 4.9,
          reviewCount: 52,
          inStock: true,
          description: 'Exceptional systemic control for Fall Armyworm and stem borers in maize fields.'
        }
      ]
    };

    // Query actual products matching crop or tags
    const query = {};
    if (crop) {
      query.$or = [
        { name: new RegExp(crop, 'i') },
        { description: new RegExp(crop, 'i') },
        { tags: { $in: [crop.toLowerCase()] } },
        { aiRecommendedFor: { $in: [crop] } }
      ];
    }
    if (disease) {
      if (!query.$or) query.$or = [];
      query.$or.push(
        { name: new RegExp(disease, 'i') },
        { description: new RegExp(disease, 'i') },
        { tags: { $in: [disease.toLowerCase()] } },
        { aiRecommendedFor: { $in: [disease] } }
      );
    }

    let products = [];
    if (query.$or) {
      products = await MarketplaceProduct.find(query).limit(4);
    }

    // Merge mock recommendations matching the crop if database products are scarce
    const resolvedCrop = crop || 'Tomato';
    const mocksForCrop = defaultMocks[resolvedCrop] || defaultMocks['Tomato'];
    
    // Combine products and mocks to ensure robust results
    const combinedProducts = [...products];
    mocksForCrop.forEach(mockItem => {
      if (!combinedProducts.some(p => p.name.toLowerCase() === mockItem.name.toLowerCase())) {
        combinedProducts.push(mockItem);
      }
    });

    res.json({
      success: true,
      crop: resolvedCrop,
      disease: disease || 'Unknown Disease',
      scanId: lastScan ? lastScan._id : null,
      recommendations: combinedProducts.slice(0, 4),
      reason: lastScan 
        ? `We found a recent **${lastScan.diseaseName}** scan on your **${lastScan.cropName}** crop. Here is the recommended treatment package from Krishi AI.`
        : `Recommended treatment pack for standard **${resolvedCrop}** agricultural defense.`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getProducts, addProduct, getListings, createYieldListing, smartSellAnalysis, getAIRecommendations };
