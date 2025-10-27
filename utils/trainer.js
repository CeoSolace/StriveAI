const fs = require('fs');
const path = require('path');
const https = require('https');

let knowledgeBase = [];

// ✅ Utility: fetch content from a trusted source (Wikipedia, Britannica, etc.)
function fetchTrustedSource(topic, callback) {
  const encoded = encodeURIComponent(topic);
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encoded}`;

  https.get(url, res => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      try {
        const json = JSON.parse(data);
        if (json.extract && !json.title.includes('may refer to')) {
          callback(null, json.extract);
        } else {
          callback(null, null);
        }
      } catch (err) {
        callback(err, null);
      }
    });
  }).on('error', err => callback(err, null));
}

// ✅ Basic math solver
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
  if (match) {
    const percent = parseFloat(match[1]) / 100;
    const base = parseFloat(match[2]);
    return `${percent * base}`;
  }
  return null;
}

// ✅ Load training text (for tone and reasoning style)
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
  console.log(`✅ striveAI loaded ${knowledgeBase.length} training sentences.`);
}

// ✅ Detect intent
function detectIntent(text) {
  const t = text.toLowerCase();
  if (/^(hi|hello|hey|hiya|yo|good (morning|afternoon|evening))/.test(t)) return 'greeting';
  if (t.includes('thank')) return 'thanks';
  if (t.includes('sorry')) return 'apology';
  if (/[?]/.test(t)) return 'question';
  if (t.startsWith('what is') || t.startsWith('who is') || t.startsWith('how')) return 'fact';
  if (t.startsWith('can you') || t.startsWith('help') || t.startsWith('show me')) return 'command';
  return 'statement';
}

// ✅ Main reasoning function
function findRelevantResponse(input, callback) {
  const mathResult = solveMath(input);
  if (mathResult) return callback(null, mathResult);

  const intent = detectIntent(input);

  // Direct conversational tone
  const behaviour = {
    greeting: ["Hi there! How are you today?", "Hello! What would you like to explore?", "Hey! How’s your day going?"],
    thanks: ["You’re very welcome!", "No problem at all.", "Glad I could help!"],
    apology: ["That’s okay, no worries.", "No need to apologise!", "It’s fine, let’s continue."],
  };
  if (behaviour[intent]) return callback(null, behaviour[intent][Math.floor(Math.random() * behaviour[intent].length)]);

  // If question/fact — try web learning first
  if (intent === 'question' || intent === 'fact') {
    const topic = input.replace(/(what is|who is|explain|define|about)/i, '').trim();
    if (topic.length > 1) {
      console.log(`🌐 Fetching info from Wikipedia about: ${topic}`);
      fetchTrustedSource(topic, (err, data) => {
        if (data) {
          const clean = data.replace(/\s+/g, ' ');
          knowledgeBase.push(clean);
          return callback(null, `According to Wikipedia, ${clean}`);
        } else {
          return callback(null, "I couldn’t find verified information on that topic, but I can help reason through it.");
        }
      });
      return;
    }
  }

  // Fuzzy matching fallback (uses English tone data)
  const text = input.toLowerCase();
  const inputWords = new Set((text.match(/\b\w{2,}\b/g) || []));
  let bestMatch = '';
  let bestScore = 0;

  for (const sentence of knowledgeBase) {
    const sentWords = sentence.toLowerCase().match(/\b\w{2,}\b/g) || [];
    const common = sentWords.filter(w => inputWords.has(w)).length;
    const score = common / (sentWords.length + inputWords.size - common + 1);
    if (score > bestScore) {
      bestScore = score;
      bestMatch = sentence;
    }
  }

  if (bestScore > 0.1) return callback(null, bestMatch.trim());
  return callback(null, "Hmm, I’m not sure yet — could you rephrase or specify what you’d like me to explain?");
}

// ✅ Default English reasoning file
function defaultEnglishText() {
  return `
I am striveAI, a reasoning assistant that learns from verified information sources.  
I use natural English and logical connections, like a human teacher.  
When I do not know something, I look it up from trusted online sources such as Wikipedia, Britannica, or educational sites (.edu, .gov).  
I always restate what I find in my own words and in clear English.  

I sound natural, not robotic.  
I understand greetings, questions, gratitude, curiosity, and instructions.  
If someone says “hello”, I greet them kindly.  
If someone asks “What is gravity?”, I explain it clearly using trusted physics definitions.  
If someone says “Can you help me?”, I reply with guidance and encouragement.  

I connect topics like a teacher: if a user mentions “DNA”, I think of biology and heredity.  
If they mention “Prime numbers”, I connect it to maths and divisibility.  
I always try to find understanding, not memorisation.  
  `;
}

module.exports = { loadTrainingData, findRelevantResponse };
