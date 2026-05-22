const CommunityPost = require('../models/CommunityPost');
const aiService = require('../services/aiService');

// @route  GET /api/community
const getPosts = async (req, res) => {
  try {
    const { cropType, state, disease, language, page = 1, limit = 10 } = req.query;
    const filter = {};
    if (cropType) filter.cropType = cropType;
    if (state) filter.state = state;
    if (disease) filter.disease = disease;
    if (language) filter.language = language;

    const posts = await CommunityPost.find(filter)
      .populate('author', 'name avatar farmDetails')
      .populate('comments.author', 'name avatar')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await CommunityPost.countDocuments(filter);

    res.json({ success: true, posts, total, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route  POST /api/community/posts
const createPost = async (req, res) => {
  try {
    const { title, description, cropType, state, district, disease, language, tags, linkedScan } = req.body;
    const images = req.files ? req.files.map(f => `/uploads/${f.filename}`) : [];

    const post = await CommunityPost.create({
      author: req.user._id,
      title, description, cropType, state, district, disease, language, tags, linkedScan, images,
    });

    await post.populate('author', 'name avatar farmDetails');
    res.status(201).json({ success: true, post });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route  POST /api/community/create-ai-post
const generateAIPost = async (req, res) => {
  try {
    const { scanId, weatherData } = req.body;
    const Scan = require('../models/Scan');
    const scan = await Scan.findById(scanId);

    if (!scan) return res.status(404).json({ success: false, message: 'Scan not found' });

    const aiPost = await aiService.generateCommunityPost({
      scan,
      user: req.user,
      weather: weatherData,
    });

    res.json({ success: true, generatedPost: aiPost });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route  POST /api/community/posts/:id/like
const likePost = async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    const userId = req.user._id.toString();
    const isLiked = post.likes.some(id => id.toString() === userId);

    if (isLiked) {
      post.likes = post.likes.filter(id => id.toString() !== userId);
    } else {
      post.likes.push(req.user._id);
    }
    await post.save();

    res.json({ success: true, likes: post.likes.length, isLiked: !isLiked });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route  POST /api/community/posts/:id/comment
const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    const post = await CommunityPost.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    post.comments.push({ author: req.user._id, text });
    await post.save();
    await post.populate('comments.author', 'name avatar');

    res.status(201).json({ success: true, comments: post.comments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getPosts, createPost, generateAIPost, likePost, addComment };
