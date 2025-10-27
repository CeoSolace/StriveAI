const mongoose = require('../utils/db');
module.exports = mongoose.model('Knowledge', new mongoose.Schema({
  query: { type: String, required: true, unique: true },
  answer: { type: String, required: true },
  source: String,
  updatedAt: { type: Date, default: Date.now }
}));
