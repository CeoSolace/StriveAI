const Memory = require('../models/Memory');

async function cleanupStaleConversations() {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  try {
    const result = await Memory.deleteMany({ lastActive: { $lt: oneHourAgo } });
    console.log(`🗑️ striveAI: Cleaned ${result.deletedCount} stale conversations.`);
  } catch (err) {
    console.error('Cleanup error:', err);
  }
}

function startCleanupCron() {
  cleanupStaleConversations();
  setInterval(cleanupStaleConversations, 60 * 60 * 1000);
}

module.exports = { startCleanupCron };
