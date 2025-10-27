// routes/api.js
const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { verifyToken } = require('../utils/auth');

const MEMORY_FILE = path.join(__dirname, '../../data/memory.json');
if (!fs.existsSync(MEMORY_FILE)) {
  fs.writeFileSync(MEMORY_FILE, JSON.stringify({}));
}

// load memory for a user
function getMemory(userId) {
  const data = JSON.parse(fs.readFileSync(MEMORY_FILE, 'utf8'));
  return data[userId] || [];
}

// save memory for a user
function saveMemory(userId, messages) {
  const data = JSON.parse(fs.readFileSync(MEMORY_FILE, 'utf8'));
  data[userId] = messages;
  fs.writeFileSync(MEMORY_FILE, JSON.stringify(data, null, 2));
}

// GET /api/memory → return chat history
router.get('/memory', verifyToken, (req, res) => {
  const msgs = getMemory(req.user.id);
  res.json({ messages: msgs });
});

// (optional) clear history
router.delete('/memory', verifyToken, (req, res) => {
  saveMemory(req.user.id, []);
  res.json({ success: true });
});

module.exports = router;
