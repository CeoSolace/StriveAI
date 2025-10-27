const express = require('express');
const User = require('../models/User');
const router = express.Router();

router.post('/signup', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password || password.length < 6) {
    return res.status(400).json({ error: 'Username and password (6+ chars) required' });
  }
  try {
    const user = await User.create({ username, password });
    res.json({ token: user._id });
  } catch (e) {
    res.status(400).json({ error: e.code === 11000 ? 'Username taken' : 'Signup failed' });
  }
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }
  const user = await User.findOne({ username: username.toLowerCase() });
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  res.json({ token: user._id });
});

module.exports = router;
