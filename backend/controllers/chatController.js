const ChatHistory = require('../models/ChatHistory');
const aiService = require('../services/aiService');
const { v4: uuidv4 } = require('crypto');

// @route  POST /api/chat
const chat = async (req, res) => {
  try {
    const { message, sessionId, imageUrl } = req.body;
    const sid = sessionId || Math.random().toString(36).substring(2);

    let history = await ChatHistory.findOne({ user: req.user._id, sessionId: sid });
    if (!history) {
      history = await ChatHistory.create({
        user: req.user._id,
        sessionId: sid,
        messages: [],
        context: {
          crops: req.user.crops,
          farmDetails: req.user.farmDetails,
        },
      });
    }

    // Add user message
    history.messages.push({ role: 'user', content: message, imageUrl });
    await history.save();

    // Get AI response
    const aiResponse = await aiService.chat({
      message,
      imageUrl,
      sessionId: sid,
      userProfile: {
        name: req.user.name,
        crops: req.user.crops,
        farmDetails: req.user.farmDetails,
        language: req.user.language,
      },
      history: history.messages.slice(-10), // last 10 messages for context
    });

    // Add AI response
    history.messages.push({ role: 'assistant', content: aiResponse.message });
    await history.save();

    res.json({ success: true, message: aiResponse.message, sessionId: sid });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route  GET /api/chat/history
const getChatHistory = async (req, res) => {
  try {
    const sessions = await ChatHistory.find({ user: req.user._id })
      .sort({ updatedAt: -1 })
      .limit(20)
      .select('sessionId messages updatedAt');
    res.json({ success: true, sessions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route  GET /api/chat/session/:sessionId
const getSession = async (req, res) => {
  try {
    const session = await ChatHistory.findOne({
      user: req.user._id,
      sessionId: req.params.sessionId,
    });
    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });
    res.json({ success: true, session });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { chat, getChatHistory, getSession };
