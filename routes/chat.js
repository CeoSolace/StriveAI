const express = require('express');
const router = express.Router();
const { findRelevantResponse } = require('../utils/trainer');

// POST /api/chat
router.post('/', async (req, res) => {
  const userMessage = req.body.message;

  if (!userMessage || userMessage.trim() === '') {
    return res.status(400).json({ error: 'Message cannot be empty.' });
  }

  try {
    // Get AI response (async)
    const reply = await findRelevantResponse(userMessage);
    res.json({ reply });
  } catch (err) {
    console.error('💥 /api/chat error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Optional: GET for testing
router.get('/', (req, res) => {
  res.send('striveAI chat endpoint is working!');
});

module.exports = router;
