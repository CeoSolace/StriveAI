const fs = require('fs');
const path = require('path');
const https = require('https');

let knowledgeBase = [];

// Fetch info from Wikipedia
function fetchTrustedSource(topic) {
  return new Promise((resolve) => {
    const encoded = encodeURIComponent(topic);
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encoded}`;

    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.extract && !json.title.includes('may refer to')) resolve(json.extract);
          else resolve(null);
        } catch {
          resolve(null);
        }
      });
    }).on('error', () => resolve(null));
  });
}

// Solve simple math
function solveMath(input) {
  let expr = input.replace(/\s+/g, '').toLowerCase();
  if (/^\d+[\+\-\*\/]\d+$/.test(expr)) {
    try { return `${expr} = ${eval(expr)}`; } catch { return null; }
  }
  if (expr.includes('x') && !expr.includes('sin') && !expr.includes('cos')) {
    expr = expr.replace('x', '*');
    try { return `${input} = ${eval(expr)}`; } catch { return null; }
  }
  const match = expr.match(/(\d+)%\s*of\s*(\d+)/i);
  if (match) return `${parseFloat(match[1])/100 * parseFloat(match[2])}`;
  return null;
}

// Load English training data
function loadTrainingData() {
  const trainDir = path.join(__dirname, '../../train');
  if (!fs.existsSync(trainDir)) fs.mkdirSync(trainDir, { recursive: true });

  const englishPath = path.join(trainDir, 'english.txt');
  if (!fs.existsSync(englishPath)) fs.writeFileSync(englishPath, defaultEnglishText());

  knowledgeBase = [];
  const files = fs.readdirSync(trainDir);
  for (const file of files) {
    if (!file.endsWith('.txt')) continue;
    const content = fs.readFileSync(path.join(trainDir, file), 'utf8');
    const sentences = content.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 5);
    knowledgeBase.push(...sentences);
  }
  console.log(`✅ striveAI loaded ${knowledgeBase.length} knowledge sentences.`);
}

// Detect intent
function detectIntent(text) {
  const t = text.toLowerCase();
  if (/^(hi|hello|hey|hiya|yo|good (morning|afternoon|evening))/.test(t)) return 'greeting';
  if (t.includes('thank')) return 'thanks';
  if (t.includes('sorry')) return 'apology';
  if (/[?]/.test(t)) return 'question';
  return 'statement';
}

// Main AI response
async function findRelevantResponse(input) {
  const mathResult = solveMath(input);
  if (mathResult) return mathResult;

  const intent = detectIntent(input);
  const lower = input.toLowerCase();

  const quickReplies = {
    greeting: ['Hello there!', 'Hi! How are you?', 'Hey! Nice to see you.'],
    thanks: ['You’re welcome!', 'Glad I could help.'],
    apology: ['No worries.', 'It’s all good!'],
  };

  if (quickReplies[intent]) {
    const arr = quickReplies[intent];
    return arr[Math.floor(Math.random() * arr.length)];
  }

  if (intent === 'question') {
    const topic = lower.replace(/(what is|who is|explain|define|about|tell me about)/i, '').trim();
    if (topic.length > 1) {
      const info = await fetchTrustedSource(topic);
      if (info) {
        knowledgeBase.push(info);
        return `According to Wikipedia, ${info}`;
      }
    }
  }

  // Fuzzy text fallback
  const inputWords = new Set((lower.match(/\b\w{2,}\b/g) || []));
  let bestMatch = '';
  let bestScore = 0;
  for (const sentence of knowledgeBase) {
    const sentWords = sentence.toLowerCase().match(/\b\w{2,}\b/g) || [];
    const common = sentWords.filter((w) => inputWords.has(w)).length;
    const score = common / (sentWords.length + inputWords.size - common + 1);
    if (score > bestScore) {
      bestScore = score;
      bestMatch = sentence;
    }
  }
  return bestScore > 0.1
    ? bestMatch.trim()
    : "I’m not entirely sure yet — could you clarify what you’d like me to explain?";
}

function defaultEnglishText() {
  return `
I am striveAI, a reasoning assistant that explains concepts clearly in fluent English.
I use logic, verified sources, and a helpful tone to respond to any message.
When I don’t know something, I gather information from Wikipedia and summarise it in my own words.
I can discuss maths, science, history, and general knowledge topics, learning as I go.
  `;
}

module.exports = { loadTrainingData, findRelevantResponse };
