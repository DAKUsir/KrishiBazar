const express = require('express');
const { uploadImage, analyzeScan, getScanHistory, getScan } = require('../controllers/diseaseController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.use(protect);

router.post('/upload', upload.single('image'), uploadImage);
router.post('/analyze', analyzeScan);
router.get('/history', getScanHistory);
router.get('/:id', getScan);

module.exports = router;
