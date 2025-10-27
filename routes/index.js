// routes/index.js
const express = require('express');
const router = express.Router();
const path = require('path');

// Serve the main HTML page (your frontend)
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Optional: Catch-all for client-side routing (if using React, Vue, etc.)
// This ensures refresh on /about, /dashboard, etc. still serves index.html
router.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

module.exports = router; // Must export the router
