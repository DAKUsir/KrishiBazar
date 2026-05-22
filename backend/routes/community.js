const express = require('express');
const { getPosts, createPost, generateAIPost, createAutomatedAIPost, likePost, addComment } = require('../controllers/communityController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.get('/', protect, getPosts);
router.post('/posts', protect, upload.array('images', 5), createPost);
router.post('/create-ai-post', protect, generateAIPost);
router.post('/create-automated-post', protect, createAutomatedAIPost);
router.post('/posts/:id/like', protect, likePost);
router.post('/posts/:id/comment', protect, addComment);

module.exports = router;
