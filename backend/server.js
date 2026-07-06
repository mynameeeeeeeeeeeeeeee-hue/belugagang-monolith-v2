// ============================================================
// BeluGANG Dashboard — Backend API
// Express + Discord OAuth2 + Routes bots
// ============================================================
require('dotenv').config({ path: '../.env' });
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const jwt = require('jsonwebtoken');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'belugagang_secret_2024';

// ── Middleware ────────────────────────────────────────────────
app.use(cors({
  origin: process.env.VITE_API_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(session({
  secret: JWT_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 86400000 },
}));

// ── Stockage en mémoire (à remplacer par DB en prod) ─────────
const botsStatus = {
  zeepin: { name: 'Zeepin', status: 'online', guilds: 0, users: 0, uptime: Date.now(), commands: 14 },
  events: { name: 'BeluGANG Events', status: 'online', guilds: 0, users: 0, uptime: Date.now(), commands: 8 },
  honeypot: { name: 'Honeypot', status: 'online', guilds: 0, users: 0, uptime: Date.now(), commands: 3 },
  carlbot: { name: 'CarlBot', status: 'online', guilds: 0, users: 0, uptime: Date.now(), commands: 12 },
};

const modLogs = [];
const warns = {};
const events = [];

// ── Middleware Auth ───────────────────────────────────────────
function requireAuth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1] || req.session?.token;
  if (!token) return res.status(401).json({ error: 'Non authentifié' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Token invalide' });
  }
}

// ── Routes Discord OAuth2 ─────────────────────────────────────
app.get('/auth/discord', (req, res) => {
  const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID || '1523413598024761374';
  const REDIRECT_URI = encodeURIComponent(process.env.DISCORD_REDIRECT_URI || `http://localhost:${PORT}/auth/callback`);
  const scope = encodeURIComponent('identify guilds');
  res.redirect(`https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=${scope}`);
});

app.get('/auth/callback', async (req, res) => {
  const { code } = req.query;
  if (!code) return res.redirect('/?error=no_code');

  try {
    const tokenRes = await axios.post('https://discord.com/api/oauth2/token', new URLSearchParams({
      client_id: process.env.DISCORD_CLIENT_ID || '1523413598024761374',
      client_secret: process.env.DISCORD_CLIENT_SECRET || '',
      grant_type: 'authorization_code',
      code,
      redirect_uri: process.env.DISCORD_REDIRECT_URI || `http://localhost:${PORT}/auth/callback`,
    }), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });

    const { access_token } = tokenRes.data;

    const userRes = await axios.get('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const user = userRes.data;
    const jwtToken = jwt.sign({
      id: user.id,
      username: user.username,
      discriminator: user.discriminator,
      avatar: user.avatar,
      access_token,
    }, JWT_SECRET, { expiresIn: '24h' });

    req.session.token = jwtToken;
    const frontendUrl = process.env.VITE_API_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/dashboard?token=${jwtToken}`);
  } catch (err) {
    console.error('[Auth] Erreur OAuth:', err.message);
    res.redirect('/?error=auth_failed');
  }
});

app.get('/auth/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

app.post('/auth/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

// ── Routes API Bots ───────────────────────────────────────────
app.get('/api/bots', requireAuth, (req, res) => {
  const bots = Object.entries(botsStatus).map(([id, bot]) => ({
    id,
    ...bot,
    uptime: Math.floor((Date.now() - bot.uptime) / 1000),
  }));
  res.json(bots);
});

app.get('/api/bots/:id', requireAuth, (req, res) => {
  const bot = botsStatus[req.params.id];
  if (!bot) return res.status(404).json({ error: 'Bot introuvable' });
  res.json({ id: req.params.id, ...bot, uptime: Math.floor((Date.now() - bot.uptime) / 1000) });
});

app.post('/api/bots/:id/restart', requireAuth, (req, res) => {
  const bot = botsStatus[req.params.id];
  if (!bot) return res.status(404).json({ error: 'Bot introuvable' });
  bot.uptime = Date.now();
  bot.status = 'restarting';
  setTimeout(() => { bot.status = 'online'; }, 3000);
  res.json({ success: true, message: `${bot.name} redémarré` });
});

// ── Routes API Modération ─────────────────────────────────────
app.get('/api/modlogs', requireAuth, (req, res) => {
  res.json(modLogs.slice(-50).reverse());
});

app.post('/api/modlogs', requireAuth, (req, res) => {
  const log = { ...req.body, id: Date.now(), timestamp: new Date().toISOString() };
  modLogs.push(log);
  res.json(log);
});

app.get('/api/warns/:userId', requireAuth, (req, res) => {
  res.json(warns[req.params.userId] || []);
});

app.post('/api/warns', requireAuth, (req, res) => {
  const { userId, reason, modId } = req.body;
  if (!warns[userId]) warns[userId] = [];
  const warn = { reason, modId, timestamp: new Date().toISOString(), id: Date.now() };
  warns[userId].push(warn);
  res.json(warn);
});

app.delete('/api/warns/:userId', requireAuth, (req, res) => {
  warns[req.params.userId] = [];
  res.json({ success: true });
});

// ── Routes API Events ─────────────────────────────────────────
app.get('/api/events', requireAuth, (req, res) => {
  res.json(events);
});

app.post('/api/events', requireAuth, (req, res) => {
  const event = { ...req.body, id: Date.now().toString(36).toUpperCase(), createdAt: new Date().toISOString(), participants: 0 };
  events.push(event);
  res.json(event);
});

app.delete('/api/events/:id', requireAuth, (req, res) => {
  const idx = events.findIndex(e => e.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Événement introuvable' });
  events.splice(idx, 1);
  res.json({ success: true });
});

// ── Routes API Honeypot ───────────────────────────────────────
app.get('/api/honeypot/status', requireAuth, (req, res) => {
  res.json({
    active: true,
    lastInjection: new Date(Date.now() - 3600000).toISOString(),
    nextInjection: new Date(Date.now() + 82800000).toISOString(),
    totalInjections: 42,
    bots: ['Zeepin', 'BeluGANG Events', 'Honeypot', 'CarlBot'],
  });
});

app.post('/api/honeypot/inject', requireAuth, (req, res) => {
  res.json({ success: true, message: 'Injection forcée déclenchée dans #honeypot' });
});

// ── Stats globales ────────────────────────────────────────────
app.get('/api/stats', requireAuth, (req, res) => {
  res.json({
    totalBots: 4,
    onlineBots: Object.values(botsStatus).filter(b => b.status === 'online').length,
    totalCommands: Object.values(botsStatus).reduce((acc, b) => acc + b.commands, 0),
    totalModLogs: modLogs.length,
    totalEvents: events.length,
    totalWarns: Object.values(warns).reduce((acc, w) => acc + w.length, 0),
  });
});

// ── Health check ──────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`[Backend] ✅ Serveur démarré sur http://localhost:${PORT}`);
  console.log(`[Backend] 🔐 Auth Discord: GET /auth/discord`);
  console.log(`[Backend] 📊 API Bots: GET /api/bots`);
});
