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

// Routes
app.use('/api/chat', require('./routes/chat'));   // <-- router
app.use('/', require('./routes/index'));          // <-- router

// Load knowledge
loadTrainingData();

// Start
app.listen(PORT, () => {
  console.log(`striveAI listening on ${PORT}`);
});
