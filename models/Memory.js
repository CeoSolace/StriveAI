const mongoose = require('mongoose');

const memorySchema = new mongoose.Schema({
  userId: { type: String, required: true },
  messages: [{ role: String, content: String }],
  lastActive: { type: Date, default: Date.now, index: true }
});

module.exports = mongoose.model('Memory', memorySchema);
