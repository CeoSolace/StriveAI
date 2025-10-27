const IpBan = require('../models/IpBan');

// Helper to get client IP
function getIp(req) {
  return (
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    '0.0.0.0'
  );
}

// Async middleware to check if IP is banned
async function ipBanMiddleware(req, res, next) {
  try {
    const ip = getIp(req);
    const banned = await IpBan.findOne({ ip });
    if (banned) {
      return res.status(403).json({ error: 'IP permanently banned for policy violation.' });
    }
    req.clientIp = ip; // store IP for later use if needed
    next();
  } catch (err) {
    console.error('💥 IP Ban middleware error:', err);
    next(); // allow request if DB fails
  }
}

module.exports = ipBanMiddleware;
