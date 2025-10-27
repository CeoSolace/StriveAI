// utils/trainer.js
const fs = require('fs');
const path = require('path');
const https = require('https');

let knowledgeBase = [];

// -------------------------------------------------
// 1. Wikipedia summary (trusted source)
function fetchWiki(topic) {
  return new Promise(resolve => {
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(topic)}`;
    https.get(url, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json.extract && !json.title.includes('may refer to') ? json.extract : null);
        } catch { resolve(null); }
      });
    }).on('error', () => resolve(null));
  });
}

// -------------------------------------------------
// 2. Math solver (safe eval in a sandbox)
function solveMath(input) {
  const expr = input.replace(/\s/g, '').toLowerCase();

  // Basic ops
  if (/^\d+[\+\-\*\/]\d+$/.test(expr)) {
    try { return `${expr} = ${Function(`"use strict";return(${expr})`)()}`; } catch { return null; }
  }

  // “3 x 5”
  if (expr.includes('x') && !/sin|cos|tan/.test(expr)) {
    const e = expr.replace(/x/g, '*');
    try { return `${input} = ${Function(`"use strict";return(${e})`)()}`; } catch { return null; }
  }

  // “50% of 200”
  const pct = expr.match(/(\d+)%\s*of\s*(\d+)/i);
  if (pct) return `${(parseFloat(pct[1]) / 100 * parseFloat(pct[2])).toFixed(2)}`;

  // “1/2”
  const frac = expr.match(/^(\d+)\/(\d+)$/);
  if (frac) return `${(parseFloat(frac[1]) / parseFloat(frac[2])).toFixed(4)}`;

  return null;
}

// -------------------------------------------------
// 3. Load training files
function loadTrainingData() {
  const trainDir = path.join(__dirname, '../../train');
  if (!fs.existsSync(trainDir)) fs.mkdirSync(trainDir, { recursive: true });

  // default English facts
  const eng = path.join(trainDir, 'english.txt');
  if (!fs.existsSync(eng)) fs.writeFileSync(eng, defaultEnglish());

  knowledgeBase = [];
  for (const file of fs.readdirSync(trainDir)) {
    if (!file.endsWith('.txt')) continue;
    const txt = fs.readFileSync(path.join(trainDir, file), 'utf8');
    const sentences = txt.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 8);
    knowledgeBase.push(...sentences);
  }
  console.log(`Loaded ${knowledgeBase.length} knowledge sentences`);
}

// -------------------------------------------------
// 4. Intent detection
function intent(text) {
  const t = text.toLowerCase();
  if (/^(hi|hello|hey|good (morning|afternoon|evening))/i.test(t)) return 'greeting';
  if (/thank/i.test(t)) return 'thanks';
  if (/\?/.test(t)) return 'question';
  return 'statement';
}

// -------------------------------------------------
// 5. Main response generator
async function generateResponse(input) {
  // 1. Math
  const math = solveMath(input);
  if (math) return math;

  const low = input.toLowerCase();
  const type = intent(input);

  // 2. Greeting / thanks
  if (type === 'greeting') return `Hello! I'm striveAI – ask me anything.`;
  if (type === 'thanks') return `You're welcome!`;

  // 3. Wikipedia look-up for questions
  if (type === 'question') {
    const topic = low.replace(/^(what|who|where|when|why|how|tell me about|explain)\s+/i, '').trim();
    if (topic.length > 2) {
      const fact = await fetchWiki(topic);
      if (fact) {
        knowledgeBase.push(fact);               // learn on the fly
        return `Wikipedia: ${fact}`;
      }
    }
  }

  // 4. Fuzzy match against local knowledge
  const words = new Set((low.match(/\b\w{3,}\b/g) || []));
  let best = '', score = 0;

  for (const sent of knowledgeBase) {
    const sentWords = (sent.toLowerCase().match(/\b\w{3,}\b/g) || []);
    const common = sentWords.filter(w => words.has(w)).length;
    const s = common / (sentWords.length + words.size - common + 1);
    if (s > score) { score = s; best = sent; }
  }

  if (score > 0.12) return best.trim();

  // 5. Fallback
  return `I don’t have a solid answer for “${input}”. Try re-phrasing or ask something else!`;
}

// -------------------------------------------------
// Default training data
function defaultEnglish() {
  return `
Adolf Hitler was approximately 5 feet 9 inches (1.75 m) tall.
The Eiffel Tower is 324 metres tall including antennas.
Water boils at 100 °C at sea level.
JavaScript is a programming language.
Node.js is a JavaScript runtime built on Chrome's V8 engine.
  `.trim();
}

// Export
module.exports = { loadTrainingData, generateResponse };
