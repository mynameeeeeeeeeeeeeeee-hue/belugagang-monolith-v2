// ============================================================
// BeluGANG Monolith — 4 Discord Bots in 1
// Zeepin | BeluGANG Events | Honeypot | CarlBot
// ============================================================
const { fork } = require('child_process');
const path = require('path');

const bots = [
  {
    name: 'Zeepin',
    path: './bots/zeepin/index.js',
    env: {
      ZEEPIN_TOKEN: process.env.ZEEPIN_TOKEN,
      ZEEPIN_CLIENT_ID: process.env.ZEEPIN_CLIENT_ID,
    },
  },
  {
    name: 'BeluGANG Events',
    path: './bots/belugagang-events/index.js',
    env: {
      EVENTS_TOKEN: process.env.EVENTS_TOKEN,
      EVENTS_CLIENT_ID: process.env.EVENTS_CLIENT_ID,
    },
  },
  {
    name: 'Honeypot',
    path: './bots/honeypot/index.js',
    env: {
      HONEYPOT_TOKEN: process.env.HONEYPOT_TOKEN,
      HONEYPOT_CLIENT_ID: process.env.HONEYPOT_CLIENT_ID,
    },
  },
  {
    name: 'CarlBot',
    path: './bots/carlbot/index.js',
    env: {
      CARLBOT_TOKEN: process.env.CARLBOT_TOKEN,
      CARLBOT_CLIENT_ID: process.env.CARLBOT_CLIENT_ID,
    },
  },
];

console.log('🚀 Démarrage du Monolithe BeluGANG Events...');
console.log(`📅 ${new Date().toLocaleString('fr-FR')}`);
console.log('─'.repeat(60));

function launchBot(bot) {
  const env = { ...process.env, ...bot.env };

  // Vérifier que le token est présent
  const tokenKey = Object.keys(bot.env).find(k => k.includes('TOKEN'));
  if (!env[tokenKey]) {
    console.warn(`[Monolith] ⚠️  Token manquant pour ${bot.name} (${tokenKey}). Bot ignoré.`);
    return null;
  }

  console.log(`[Monolith] 🤖 Lancement de ${bot.name}...`);

  const p = fork(path.join(__dirname, bot.path), {
    env,
    silent: false,
  });

  p.on('error', (err) => {
    console.error(`[Monolith] ❌ Erreur bot ${bot.name}:`, err.message);
  });

  p.on('exit', (code, signal) => {
    if (signal === 'SIGTERM' || signal === 'SIGINT') {
      console.log(`[Monolith] 🛑 Bot ${bot.name} arrêté proprement.`);
      return;
    }
    console.log(`[Monolith] ⚠️  Bot ${bot.name} arrêté (code: ${code}). Redémarrage dans 5s...`);
    setTimeout(() => launchBot(bot), 5000);
  });

  return p;
}

// Lancer tous les bots
const processes = bots.map(bot => launchBot(bot)).filter(Boolean);

console.log(`[Monolith] ✅ ${processes.length}/${bots.length} bots lancés.`);
console.log('─'.repeat(60));

// Arrêt propre
process.on('SIGTERM', () => {
  console.log('[Monolith] 🛑 Arrêt du monolithe...');
  processes.forEach(p => p && p.kill('SIGTERM'));
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('[Monolith] 🛑 Interruption...');
  processes.forEach(p => p && p.kill('SIGTERM'));
  process.exit(0);
});
