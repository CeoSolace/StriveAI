const mongoose = require('mongoose');

const ipBanSchema = new mongoose.Schema({
  ip: { type: String, required: true, unique: true },
  reason: { type: String, default: 'Hateful content attempt' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('IpBan', ipBanSchema);
