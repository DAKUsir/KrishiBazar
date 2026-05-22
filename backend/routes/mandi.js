const express = require('express');
const { getMandiPrices } = require('../controllers/mandiController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, getMandiPrices);

module.exports = router;
