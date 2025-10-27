// server.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const { loadTrainingData } = require('./utils/trainer');

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ---- ROUTES ----
app.use('/auth', require('./routes/auth'));           // /auth/login, /auth/signup
app.use('/api', require('./routes/api'));             // /api/memory (protected)
app.use('/api/chat', require('./routes/chat'));       // protected chat
app.use('/', require('./routes/index'));              // serve index.html

// Load AI knowledge
loadTrainingData();

app.listen(PORT, () => {
  console.log(`striveAI running on port ${PORT}`);
});
