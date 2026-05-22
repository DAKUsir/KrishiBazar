const express = require('express');
const { runFarmAudit } = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/farm-audit', protect, runFarmAudit);

module.exports = router;
