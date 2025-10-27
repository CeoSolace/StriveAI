// utils/ai.js
const { searchWeb } = require('./scraper');
const { solveMath } = require('./math');
const Knowledge = require('../models/Knowledge');

async function generateResponse(input, userId) {
  const lower = input.toLowerCase().trim();

  // 1. MATH
  const mathResult = solveMath(input);
  if (mathResult) return mathResult;

  // 2. CONVERSATION
  if (/^(hi|hello|hey|good (morning|afternoon|evening))/i.test(lower)) {
    return `Hello! I'm **striveAI**, your British-trained mathematics and reasoning assistant. Ask me anything — I solve equations, explain concepts, and search the web live.`;
  }
  if (/how are you/i.test(lower)) {
    return `I'm operating at full capacity — ready to solve, explain, and converse. How can I assist you today?`;
  }
  if (/thank/i.test(lower)) {
    return `You're very welcome! Keep asking — I'm here to help.`;
  }

  // 3. SENSITIVE TOPICS
  if (lower.includes('n-word') || lower.includes('n word')) {
    return `**Yes, you will be banned.**  
The n-word is classified as hate speech on **all major platforms** (Discord, Twitch, X, YouTube, Reddit, etc.).  
Even in jokes or private contexts, it violates ToS.  
**Do not use it.**`;
  }

  // 4. KNOWLEDGE CACHE
  const cached = await Knowledge.findOne({ query: lower });
  if (cached) return `**From ${cached.source}**: ${cached.answer}`;

  // 5. LIVE WEB SEARCH
  const web = await searchWeb(input);
  if (web) {
    await Knowledge.create({ query: lower, answer: web.answer, source: web.source });
    return `**Live from ${web.source}**: ${web.answer}`;
  }

  // 6. FINAL FALLBACK
  return `I couldn't find a definitive answer for “${input}”.  
But I can:  
• Solve any equation (e.g., “solve 3x + 5 = 20”)  
• Explain any UK curriculum topic  
• Search live on trusted sites  
Try rephrasing or ask: “What is integration?”`;
}

module.exports = { generateResponse };
