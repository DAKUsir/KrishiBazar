const express = require('express');
const { getProducts, addProduct, getListings, createYieldListing, smartSellAnalysis, getAIRecommendations } = require('../controllers/marketplaceController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.get('/products', protect, getProducts);
router.post('/add-product', protect, upload.array('images', 5), addProduct);
router.get('/listings', protect, getListings);
router.post('/sell-yield', protect, upload.array('images', 5), createYieldListing);
router.post('/smart-sell', protect, smartSellAnalysis);
router.get('/recommendations', protect, getAIRecommendations);

module.exports = router;
