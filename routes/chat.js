// routes/chat.js
const express = require('express');
const router = express.Router();
const { generateResponse } = require('../utils/trainer');
const { verifyToken } = require('../utils/auth');
const fs = require('fs');
const path = require('path');

const MEMORY_FILE = path.join(__dirname, '../../data/memory.json');

function loadAll() {
  if (!fs.existsSync(MEMORY_FILE)) return {};
  return JSON.parse(fs.readFileSync(MEMORY_FILE, 'utf8'));
}
function saveAll(data) {
  fs.writeFileSync(MEMORY_FILE, JSON.stringify(data, null, 2));
}

router.post('/', verifyToken, async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'message required' });

  const userId = req.user.id;
  const all = loadAll();
  const history = all[userId] || [];

  // add user message
  history.push({ role: 'user', content: message });

  // generate AI reply
  const reply = await generateResponse(message);

  // add AI message
  history.push({ role: 'ai', content: reply });

  // keep only last 50 messages
  if (history.length > 50) history.splice(0, history.length - 50);

  all[userId] = history;
  saveAll(all);

  res.json({ reply });
});

module.exports = router;
