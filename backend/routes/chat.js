const express = require('express');
const { chat, getChatHistory, getSession } = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.post('/', chat);
router.get('/history', getChatHistory);
router.get('/session/:sessionId', getSession);

module.exports = router;
