// utils/scraper.js
const axios = require('axios');
const cheerio = require('cheerio');

const SOURCES = [
  { name: 'Wikipedia', url: (q) => `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(q)}`, parse: (data) => data.extract },
  { name: 'BBC', url: (q) => `https://www.bbc.co.uk/search?q=${encodeURIComponent(q)}`, parse: (html) => extractFirstParagraph(html) },
  { name: 'Britannica', url: (q) => `https://www.britannica.com/search?query=${encodeURIComponent(q)}`, parse: (html) => extractFirstParagraph(html) },
  { name: 'Khan Academy', url: (q) => `https://www.khanacademy.org/search?page_search=true&query=${encodeURIComponent(q)}`, parse: (html) => extractFirstParagraph(html) },
  { name: 'MathWorld', url: (q) => `https://mathworld.wolfram.com/search/?q=${encodeURIComponent(q)}`, parse: (html) => extractFirstParagraph(html) },
];

function extractFirstParagraph(html) {
  const $ = cheerio.load(html);
  const p = $('p').first().text().trim();
  return p && p.length > 50 ? p : null;
}

async function searchWeb(query) {
  for (const src of SOURCES) {
    try {
      const res = src.name === 'Wikipedia' 
        ? await axios.get(src.url(query), { timeout: 5000 })
        : await axios.get(src.url(query), { timeout: 5000 });
      
      const answer = src.parse(res.data);
      if (answer) return { answer, source: src.name };
    } catch (err) {
      continue;
    }
  }
  return null;
}

module.exports = { searchWeb };
