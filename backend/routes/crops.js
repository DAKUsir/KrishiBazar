const express = require('express');
const { getCrops, getCrop, getCategories, predictYield } = require('../controllers/cropController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', getCrops);
router.get('/categories', getCategories);
router.post('/predict-yield', protect, predictYield);
router.get('/:id', getCrop);

module.exports = router;
