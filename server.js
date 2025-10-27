const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const ipBanMiddleware = require('./middleware/ipBan');
const { loadTrainingData } = require('./utils/trainer');
const { startCleanupCron } = require('./utils/cleanup');

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use(ipBanMiddleware); // ← IP ban check on every request

// Database
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/striveai');

// Routes
app.use('/auth', require('./routes/auth'));
app.use('/api', require('./routes/api'));
app.use('/', require('./routes/chat'));

// Startup
loadTrainingData();
startCleanupCron();

app.listen(PORT, () => {
  console.log(`✅ striveAI running on port ${PORT}`);
});
