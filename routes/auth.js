// routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { signToken, loadUsers, saveUsers } = require('../utils/auth');

// ---------- SIGNUP ----------
router.post('/signup', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password || password.length < 6) {
    return res.status(400).json({ error: 'Username + 6-char password required' });
  }

  const users = loadUsers();
  if (users.find(u => u.username === username)) {
    return res.status(400).json({ error: 'Username taken' });
  }

  const hash = await bcrypt.hash(password, 10);
  const newUser = {
    id: Date.now().toString(),
    username,
    password: hash
  };
  users.push(newUser);
  saveUsers(users);

  const token = signToken({ id: newUser.id, username: newUser.username });
  res.json({ token });
});

// ---------- LOGIN ----------
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username & password required' });
  }

  const users = loadUsers();
  const user = users.find(u => u.username === username);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ error: 'Invalid credentials' });

  const token = signToken({ id: user.id, username: user.username });
  res.json({ token });
});

module.exports = router;   // <-- THIS IS A ROUTER
