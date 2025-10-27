// routes/chat.js
const express = require('express');
const router = express.Router();
const { generateResponse } = require('../utils/trainer');

router.post('/', async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'message required' });

  try {
    const reply = await generateResponse(message.trim());
    res.json({ reply });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'AI error' });
  }
});

module.exports = router;   // <-- THIS IS A FUNCTION (router)
