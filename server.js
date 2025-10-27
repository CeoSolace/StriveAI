// server.js
require('./utils/db');
const express = require('express');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch { res.status(401).json({ error: 'Invalid token' }); }
};

app.use('/auth', require('./routes/auth'));
app.use('/api', auth, require('./routes/api'));
app.use('/api/chat', auth, require('./routes/chat'));
app.use('/', require('./routes/index'));

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`striveAI running on port ${PORT}`));
