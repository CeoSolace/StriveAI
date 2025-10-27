// routes/chat.js
const express = require('express');
const router = express.Router();
const { generateResponse } = require('../utils/ai');
const Memory = require('../models/Memory');

router.post('/', async (req, res) => {
  const { message } = req.body;
  const userId = req.user.id;
  if (!message) return res.status(400).json({ error: 'Required' });

  let mem = await Memory.findOne({ userId }) || await Memory.create({ userId, messages: [] });
  mem.messages.push({ role: 'user', content: message });
  const reply = await generateResponse(message, userId);
  mem.messages.push({ role: 'ai', content: reply });
  if (mem.messages.length > 100) mem.messages = mem.messages.slice(-100);
  await mem.save();

  res.json({ reply });
});

module.exports = router;
