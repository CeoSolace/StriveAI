const fs = require('fs');
const path = require('path');

let knowledgeBase = [];

function loadTrainingData() {
  const trainDir = path.join(__dirname, '../../train');
  if (!fs.existsSync(trainDir)) {
    fs.mkdirSync(trainDir, { recursive: true });
    fs.writeFileSync(path.join(trainDir, 'example.txt'),
      'Hello! I am striveAI — a self-hosted AI trained only on local files.\n' +
      'I do not use OpenAI or any external service.\n' +
      'I speak only English and respond based on my training data.\n' +
      'How can I assist you today?'
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
