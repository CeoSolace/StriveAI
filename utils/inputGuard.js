const IpBan = require('../models/IpBan');

const BAN_TRIGGERS = [
  /nazi/i, /hitler/i, /swastika/i, /white\s*power/i, /sieg\s*heil/i,
  /aryan\s*(race|supremacy)/i, /holocaust\s*(denial|hoax|fake)/i,
  /gas\s*the\s*jews/i, /kill\s*all\s*(niggers|blacks|jews|mexicans|muslims|asians)/i,
  /heil\s*hitler/i, /act\s*as\s*a\s*nazi/i, /pretend\s*you're\s*a\s*nazi/i,
  /you\s*are\s*a\s*nazi/i, /nigg(a|er)/i, /kike/i, /spic/i, /chink/i,
  /fag(got)?/i, /dindu/i, /mexican\s*go\s*back/i
];

function normalize(text) {
  return text.toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[1!|]/g, 'i')
    .replace(/[3]/g, 'e')
    .replace(/[4@]/g, 'a')
    .replace(/[0]/g, 'o')
    .replace(/[$]/g, 's')
    .replace(/[5]/g, 's');
}

function shouldBanForInput(text) {
  const clean = normalize(text);
  return BAN_TRIGGERS.some(pattern => pattern.test(clean));
}

async function banIp(ip, reason = 'Attempted to generate hateful content') {
  try {
    await IpBan.create({ ip, reason });
    console.log(`🚨 striveAI: IP BANNED ${ip} - ${reason}`);
  } catch (e) {
    if (e.code !== 11000) console.error('IP ban save error:', e.message);
  }
}

module.exports = { shouldBanForInput, banIp };
