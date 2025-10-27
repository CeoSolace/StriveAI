const express = require('express');
const User = require('../models/User');
const Memory = require('../models/Memory');
const { findRelevantResponse } = require('../utils/trainer');
const { shouldBanForInput, banIp } = require('../utils/inputGuard');
const router = express.Router();

// Get conversation history
router.get('/memory', async (req, res) => {
  const userId = req.headers.authorization?.split(' ')[1];
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  const mem = await Memory.findOne({ userId });
  res.json({ messages: mem?.messages || [] });
});

// Chat endpoint
router.post('/chat', async (req, res) => {
  const userId = req.headers.authorization?.split(' ')[1];
  const { message } = req.body;
  const ip = req.clientIp;

  if (!userId || !message) {
    return res.status(400).json({ error: 'Missing token or message' });
  }

  // Validate user exists
  const user = await User.findById(userId);
  if (!user) return res.status(401).json({ error: 'Invalid token' });

  // 🚫 CHECK FOR BANNABLE INPUT
  if (shouldBanForInput(message)) {
    await banIp(ip);
    return res.status(403).json({ error: 'Content violation. IP banned.' });
  }

  // Save user message
  let mem = await Memory.findOne({ userId });
  if (!mem) {
    mem = new Memory({ userId, messages: [] });
  }
  mem.messages.push({ role: 'user', content: message });
  mem.lastActive = new Date();
  await mem.save();

  // Generate AI response
  const aiReply = findRelevantResponse(message);
  mem.messages.push({ role: 'ai', content: aiReply });
  await mem.save();

  res.json({ reply: aiReply });
});

module.exports = router;
