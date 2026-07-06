import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const botIcons = { zeepin: '🤖', events: '📅', honeypot: '🍯', carlbot: '🛡️' };
const botColors = { zeepin: '#5865f2', events: '#ff6b35', honeypot: '#ffd700', carlbot: '#57f287' };

const mockBots = [
  { id: 'zeepin', name: 'Zeepin', status: 'online', commands: 14, uptime: 172800, guilds: 1, description: 'Remake de Zeppelin FR — modération complète avec slash commands' },
  { id: 'events', name: 'BeluGANG Events', status: 'online', commands: 8, uptime: 172800, guilds: 1, description: 'Gestion des événements, giveaways, votes et annonces' },
  { id: 'honeypot', name: 'Honeypot', status: 'online', commands: 3, uptime: 172800, guilds: 1, description: 'Injection H24 du code source des 4 bots dans #honeypot' },
  { id: 'carlbot', name: 'CarlBot (Copie)', status: 'online', commands: 12, uptime: 172800, guilds: 1, description: 'Auto-modération, rôles réactifs, logs de modération' },
];

const s = {
  page: { animation: 'fadeIn 0.3s ease' },
  header: { marginBottom: '28px' },
  title: { fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' },
  subtitle: { fontSize: '14px', color: 'var(--text-muted)' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' },
  card: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: '14px',
    padding: '22px',
    transition: 'all 0.2s',
  },
  cardTop: {
    display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px',
  },
  botIcon: (color) => ({
    width: '48px', height: '48px',
    background: color + '22',
    border: `2px solid ${color}44`,
    borderRadius: '12px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '24px',
  }),
  statusBadge: (online) => ({
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 600,
    background: online ? 'rgba(87,242,135,0.15)' : 'rgba(237,66,69,0.15)',
    color: online ? 'var(--success)' : 'var(--danger)',
    border: `1px solid ${online ? 'rgba(87,242,135,0.3)' : 'rgba(237,66,69,0.3)'}`,
  }),
  botName: { fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' },
  botDesc: { fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '16px' },
  statsRow: {
    display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
    gap: '8px', marginBottom: '16px',
  },
  statBox: {
    background: 'var(--bg-secondary)',
    borderRadius: '8px',
    padding: '10px',
    textAlign: 'center',
  },
  statVal: { fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' },
  statLbl: { fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' },
  actions: { display: 'flex', gap: '8px' },
  btn: (variant) => ({
    flex: 1,
    padding: '8px 14px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 600,
    transition: 'all 0.2s',
    background: variant === 'primary' ? 'var(--accent)' : 'var(--bg-hover)',
    color: variant === 'primary' ? '#fff' : 'var(--text-secondary)',
  }),
};

function formatUptime(s) {
  const h = Math.floor(s / 3600);
  if (h > 24) return `${Math.floor(h / 24)}j`;
  return `${h}h`;
}

export default function Bots({ token }) {
  const [bots, setBots] = useState(mockBots);
  const [restarting, setRestarting] = useState({});

  useEffect(() => {
    fetch(`${API_URL}/api/bots`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(data => data && setBots(data))
      .catch(() => {});
  }, [token]);

  const restart = async (botId) => {
    setRestarting(r => ({ ...r, [botId]: true }));
    try {
      await fetch(`${API_URL}/api/bots/${botId}/restart`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      setTimeout(() => {
        setBots(b => b.map(bot => bot.id === botId ? { ...bot, status: 'online', uptime: 0 } : bot));
        setRestarting(r => ({ ...r, [botId]: false }));
      }, 3000);
    } catch {
      setRestarting(r => ({ ...r, [botId]: false }));
    }
  };

  return (
    <div style={s.page}>
      <div style={s.header}>
        <h1 style={s.title}>Gestion des Bots</h1>
        <p style={s.subtitle}>{bots.filter(b => b.status === 'online').length}/{bots.length} bots en ligne</p>
      </div>

      <div style={s.grid}>
        {bots.map(bot => {
          const color = botColors[bot.id] || 'var(--accent)';
          return (
            <div
              key={bot.id}
              style={s.card}
              onMouseEnter={e => e.currentTarget.style.borderColor = color}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              <div style={s.cardTop}>
                <div style={s.botIcon(color)}>{botIcons[bot.id]}</div>
                <span style={s.statusBadge(bot.status === 'online')}>
                  {restarting[bot.id] ? '🔄 Redémarrage...' : (bot.status === 'online' ? '● En ligne' : '● Hors ligne')}
                </span>
              </div>

              <div style={s.botName}>{bot.name}</div>
              <div style={s.botDesc}>{bot.description || 'Bot Discord BeluGANG'}</div>

              <div style={s.statsRow}>
                <div style={s.statBox}>
                  <div style={s.statVal}>{bot.commands}</div>
                  <div style={s.statLbl}>Cmds</div>
                </div>
                <div style={s.statBox}>
                  <div style={s.statVal}>{formatUptime(bot.uptime)}</div>
                  <div style={s.statLbl}>Uptime</div>
                </div>
                <div style={s.statBox}>
                  <div style={s.statVal}>{bot.guilds || 1}</div>
                  <div style={s.statLbl}>Serveurs</div>
                </div>
              </div>

              <div style={s.actions}>
                <button
                  style={s.btn('secondary')}
                  onClick={() => restart(bot.id)}
                  disabled={restarting[bot.id]}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                >
                  🔄 Redémarrer
                </button>
                <button
                  style={s.btn('primary')}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-hover)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'var(--accent)'}
                >
                  ⚙️ Config
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
