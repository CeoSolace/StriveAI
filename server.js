const express = require('express');
const cors = require('cors');
const path = require('path');
const { loadTrainingData } = require('./utils/trainer');

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Routes
app.use('/api/chat', require('./routes/chat'));     // ← Must export router
app.use('/', require('./routes/index'));            // ← Must export router

// Load AI training data
loadTrainingData();

// Start server
app.listen(PORT, () => {
  console.log(`striveAI running on port ${PORT}`);
});
