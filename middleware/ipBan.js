const IpBan = require('../models/IpBan');

function getIp(req) {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
         req.connection.remoteAddress ||
         req.socket.remoteAddress ||
         '0.0.0.0';
}

async function ipBanMiddleware(req, res, next) {
  const ip = getIp(req);
  const banned = await IpBan.findOne({ ip });
  if (banned) {
    return res.status(403).json({ error: 'IP permanently banned for policy violation.' });
  }
  req.clientIp = ip;
  next();
}

module.exports = ipBanMiddleware;
