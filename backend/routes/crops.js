const express = require('express');
const { getCrops, getCrop, getCategories } = require('../controllers/cropController');

const router = express.Router();

router.get('/', getCrops);
router.get('/categories', getCategories);
router.get('/:id', getCrop);

module.exports = router;
