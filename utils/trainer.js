const fs = require('fs');
const path = require('path');

let knowledgeBase = [];

// Math solver functions
function solveMath(input) {
  // Clean input
  let expr = input.replace(/\s+/g, '').toLowerCase();

  // Handle simple arithmetic
  if (/^\d+[\+\-\*\/]\d+$/.test(expr)) {
    try {
      const result = eval(expr); // Safe for simple expressions only
      return `${expr} = ${result}`;
    } catch (e) {
      return "Could not compute that expression.";
    }
  }

  // Handle multiplication like "234 x 6"
  if (expr.includes('x') && !expr.includes('sin') && !expr.includes('cos')) {
    expr = expr.replace('x', '*');
    try {
      const result = eval(expr);
      return `${input} = ${result}`;
    } catch (e) {
      return "Invalid multiplication format.";
    }
  }

  // Handle percentages
  if (expr.includes('%')) {
    const match = expr.match(/(\d+)%\s*of\s*(\d+)/i);
    if (match) {
      const percent = parseFloat(match[1]) / 100;
      const base = parseFloat(match[2]);
      return `${percent * base}`;
    }
  }

  // Handle fractions
  if (expr.includes('/')) {
    const parts = expr.split('/');
    if (parts.length === 2) {
      try {
        const numerator = parseFloat(parts[0]);
        const denominator = parseFloat(parts[1]);
        return `${numerator / denominator}`;
      } catch (e) {}
    }
  }

  return null; // Not a math problem we can solve
}

function loadTrainingData() {
  const trainDir = path.join(__dirname, '../../train');
  if (!fs.existsSync(trainDir)) {
    fs.mkdirSync(trainDir, { recursive: true });
    fs.writeFileSync(path.join(trainDir, 'maths_uk.txt'),
      'I am striveAI, a mathematics assistant trained exclusively on the British curriculum.\n' +
      'I use UK terminology, notation, and methods.\n' +
      'I explain concepts clearly, step by step, and always in English.\n' +
      'I can solve arithmetic, algebra, geometry, and more.\n' +
      'For example: 2+2=4, 3x5=15, 1/2 + 1/4 = 3/4.\n' +
      'I also understand GCSE and A-Level topics.\n'
    );
  }

  knowledgeBase = [];
  const files = fs.readdirSync(trainDir);
  for (const file of files) {
    if (!file.endsWith('.txt')) continue;
    const content = fs.readFileSync(path.join(trainDir, file), 'utf8');
    const sentences = content.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 10);
    knowledgeBase.push(...sentences);
  }
  console.log(`✅ striveAI loaded ${knowledgeBase.length} training sentences.`);
}

function findRelevantResponse(input) {
  // First, try to solve as math
  const mathResult = solveMath(input);
  if (mathResult) return mathResult;

  // Then fall back to semantic matching
  const inputWords = new Set((input.toLowerCase().match(/\b\w{3,}\b/g) || []));
  let bestMatch = '';
  let bestScore = 0;

  for (const sentence of knowledgeBase) {
    const sentWords = sentence.toLowerCase().match(/\b\w{3,}\b/g) || [];
    const common = sentWords.filter(w => inputWords.has(w)).length;
    const score = common / (sentWords.length + inputWords.size - common + 1);
    if (score > bestScore) {
      bestScore = score;
      bestMatch = sentence;
    }
  }

  return bestScore > 0.1 ? bestMatch.trim() : "I don't have enough context to answer that.";
}

module.exports = { loadTrainingData, findRelevantResponse };
