// routes/chat.js
const express = require('express');
const router = express.Router();
const { findRelevantResponse } = require('../utils/trainer'); // Adjust path if needed

// POST /api/chat - Handle chat message
router.post('/', async (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Message required' });
  }
  try {
    const reply = await findRelevantResponse(message);
    res.json({ reply });
  } catch (err) {
    console.error('AI error:', err);
    res.status(500).json({ error: 'Failed to generate response' });
  }
});

module.exports = router;
