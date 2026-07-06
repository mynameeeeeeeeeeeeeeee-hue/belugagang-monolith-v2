import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const mockStats = {
  totalBots: 4,
  onlineBots: 4,
  totalCommands: 37,
  totalModLogs: 12,
  totalEvents: 3,
  totalWarns: 5,
};

const mockBots = [
  { id: 'zeepin', name: 'Zeepin', status: 'online', commands: 14, uptime: 86400, guilds: 1 },
  { id: 'events', name: 'BeluGANG Events', status: 'online', commands: 8, uptime: 86400, guilds: 1 },
  { id: 'honeypot', name: 'Honeypot', status: 'online', commands: 3, uptime: 86400, guilds: 1 },
  { id: 'carlbot', name: 'CarlBot', status: 'online', commands: 12, uptime: 86400, guilds: 1 },
];

const s = {
  page: { animation: 'fadeIn 0.3s ease' },
  header: {
    marginBottom: '28px',
  },
  title: {
    fontSize: '26px',
    fontWeight: 800,
    color: 'var(--text-primary)',
    marginBottom: '4px',
  },
  subtitle: {
    fontSize: '14px',
    color: 'var(--text-muted)',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: '16px',
    marginBottom: '28px',
  },
  statCard: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    padding: '20px',
    transition: 'transform 0.2s',
    cursor: 'default',
  },
  statIcon: {
    fontSize: '24px',
    marginBottom: '8px',
  },
  statValue: {
    fontSize: '32px',
    fontWeight: 800,
    color: 'var(--text-primary)',
    lineHeight: 1,
    marginBottom: '4px',
  },
  statLabel: {
    fontSize: '12px',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  section: {
    marginBottom: '28px',
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: 700,
    color: 'var(--text-primary)',
    marginBottom: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  botsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: '14px',
  },
  botCard: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    padding: '18px',
    transition: 'all 0.2s',
    cursor: 'default',
  },
  botHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '12px',
  },
  botName: {
    fontWeight: 700,
    fontSize: '14px',
    color: 'var(--text-primary)',
  },
  statusDot: (online) => ({
    width: '10px', height: '10px',
    borderRadius: '50%',
    background: online ? 'var(--success)' : 'var(--danger)',
    boxShadow: online ? '0 0 6px var(--success)' : 'none',
  }),
  botStat: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '12px',
    color: 'var(--text-muted)',
    marginBottom: '6px',
  },
  botStatValue: {
    color: 'var(--text-secondary)',
    fontWeight: 600,
  },
  badge: (color) => ({
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: 600,
    background: color === 'green' ? 'rgba(87,242,135,0.15)' : 'rgba(237,66,69,0.15)',
    color: color === 'green' ? 'var(--success)' : 'var(--danger)',
    border: `1px solid ${color === 'green' ? 'rgba(87,242,135,0.3)' : 'rgba(237,66,69,0.3)'}`,
  }),
};

function formatUptime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 24) return `${Math.floor(h / 24)}j ${h % 24}h`;
  return `${h}h ${m}m`;
}

export default function Dashboard({ token }) {
  const [stats, setStats] = useState(mockStats);
  const [bots, setBots] = useState(mockBots);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, botsRes] = await Promise.all([
          fetch(`${API_URL}/api/stats`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/api/bots`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        if (statsRes.ok) setStats(await statsRes.json());
        if (botsRes.ok) setBots(await botsRes.json());
      } catch {
        // Utiliser les données mock si le backend n'est pas disponible
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  const statCards = [
    { icon: '🤖', value: stats.onlineBots + '/' + stats.totalBots, label: 'Bots en ligne' },
    { icon: '⚡', value: stats.totalCommands, label: 'Commandes' },
    { icon: '🛡️', value: stats.totalModLogs, label: 'Actions mod.' },
    { icon: '🎉', value: stats.totalEvents, label: 'Événements' },
    { icon: '⚠️', value: stats.totalWarns, label: 'Avertissements' },
    { icon: '🍯', value: 'H24', label: 'Injection Honeypot' },
  ];

  return (
    <div style={s.page}>
      <div style={s.header}>
        <h1 style={s.title}>Tableau de bord</h1>
        <p style={s.subtitle}>Bienvenue sur le Dashboard BeluGANG — {new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      <div style={s.statsGrid}>
        {statCards.map((card, i) => (
          <div
            key={i}
            style={s.statCard}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={s.statIcon}>{card.icon}</div>
            <div style={s.statValue}>{card.value}</div>
            <div style={s.statLabel}>{card.label}</div>
          </div>
        ))}
      </div>

      <div style={s.section}>
        <div style={s.sectionTitle}>
          🤖 État des bots
        </div>
        <div style={s.botsGrid}>
          {bots.map(bot => (
            <div
              key={bot.id}
              style={s.botCard}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              <div style={s.botHeader}>
                <span style={s.botName}>{bot.name}</span>
                <div style={s.statusDot(bot.status === 'online')} />
              </div>
              <div style={s.botStat}>
                <span>Statut</span>
                <span style={s.badge(bot.status === 'online' ? 'green' : 'red')}>
                  {bot.status === 'online' ? '● En ligne' : '● Hors ligne'}
                </span>
              </div>
              <div style={s.botStat}>
                <span>Commandes</span>
                <span style={s.botStatValue}>{bot.commands}</span>
              </div>
              <div style={s.botStat}>
                <span>Uptime</span>
                <span style={s.botStatValue}>{formatUptime(bot.uptime)}</span>
              </div>
              <div style={s.botStat}>
                <span>Serveurs</span>
                <span style={s.botStatValue}>{bot.guilds}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={s.section}>
        <div style={s.sectionTitle}>
          📋 Résumé des fonctionnalités
        </div>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Bot', 'Rôle', 'Commandes principales', 'Spécialité'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { bot: '🤖 Zeepin', role: 'Modération', cmds: '/kick /ban /mute /clear', spec: 'Remake Zeppelin FR' },
                { bot: '📅 Events', role: 'Événements', cmds: '/event-create /giveaway /vote', spec: 'Gestion événements' },
                { bot: '🍯 Honeypot', role: 'Surveillance', cmds: '/honeypot-inject /honeypot-status', spec: 'Injection H24 code' },
                { bot: '🛡️ CarlBot', role: 'Auto-mod', cmds: '/warn /reactionrole /automod', spec: 'Rôles réactifs' },
              ].map((row, i) => (
                <tr key={i} style={{ borderBottom: i < 3 ? '1px solid var(--border)' : 'none' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 600, fontSize: '14px' }}>{row.bot}</td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--text-secondary)' }}>{row.role}</td>
                  <td style={{ padding: '12px 16px', fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{row.cmds}</td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--accent)' }}>{row.spec}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
