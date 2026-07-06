import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const mockStatus = {
  active: true,
  lastInjection: new Date(Date.now() - 3600000).toISOString(),
  nextInjection: new Date(Date.now() + 82800000).toISOString(),
  totalInjections: 42,
  bots: ['Zeepin', 'BeluGANG Events', 'Honeypot', 'CarlBot'],
};

const s = {
  page: { animation: 'fadeIn 0.3s ease' },
  header: { marginBottom: '28px' },
  title: { fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' },
  subtitle: { fontSize: '14px', color: 'var(--text-muted)' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' },
  card: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: '14px',
    padding: '22px',
  },
  cardTitle: { fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' },
  statusRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', padding: '10px 0', borderBottom: '1px solid var(--border)' },
  statusLabel: { fontSize: '13px', color: 'var(--text-muted)' },
  statusValue: { fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' },
  activeBadge: {
    padding: '4px 12px',
    background: 'rgba(87,242,135,0.15)',
    border: '1px solid rgba(87,242,135,0.3)',
    borderRadius: '20px',
    fontSize: '12px', fontWeight: 700,
    color: 'var(--success)',
  },
  injectBtn: {
    width: '100%',
    padding: '14px',
    background: 'linear-gradient(135deg, var(--warning), #ff8c00)',
    color: '#000',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px', fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.2s',
    marginTop: '16px',
  },
  botsList: { display: 'flex', flexDirection: 'column', gap: '10px' },
  botRow: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '12px 16px',
    background: 'var(--bg-secondary)',
    borderRadius: '10px',
    border: '1px solid var(--border)',
  },
  botName: { fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' },
  botSize: { fontSize: '12px', color: 'var(--text-muted)' },
  injectedBadge: {
    padding: '3px 8px',
    background: 'rgba(87,242,135,0.15)',
    border: '1px solid rgba(87,242,135,0.3)',
    borderRadius: '20px',
    fontSize: '11px', fontWeight: 600,
    color: 'var(--success)',
  },
  timeline: { display: 'flex', flexDirection: 'column', gap: '10px' },
  timelineItem: {
    display: 'flex', gap: '12px', alignItems: 'flex-start',
    padding: '12px 16px',
    background: 'var(--bg-secondary)',
    borderRadius: '10px',
  },
  timelineDot: (color) => ({
    width: '10px', height: '10px',
    borderRadius: '50%',
    background: color,
    marginTop: '4px',
    flexShrink: 0,
  }),
  timelineContent: { flex: 1 },
  timelineTitle: { fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px' },
  timelineTime: { fontSize: '11px', color: 'var(--text-muted)' },
  successMsg: {
    padding: '14px',
    background: 'rgba(87,242,135,0.15)',
    border: '1px solid rgba(87,242,135,0.3)',
    borderRadius: '10px',
    color: 'var(--success)',
    fontSize: '14px', fontWeight: 600,
    textAlign: 'center',
    marginTop: '12px',
  },
};

const botSizes = {
  'Zeepin': '13.7 KB',
  'BeluGANG Events': '12.1 KB',
  'Honeypot': '8.5 KB',
  'CarlBot': '18.1 KB',
};

export default function Honeypot({ token }) {
  const [status, setStatus] = useState(mockStatus);
  const [injecting, setInjecting] = useState(false);
  const [injected, setInjected] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/api/honeypot/status`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(data => data && setStatus(data))
      .catch(() => {});
  }, [token]);

  const forceInject = async () => {
    setInjecting(true);
    try {
      await fetch(`${API_URL}/api/honeypot/inject`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {}
    setTimeout(() => {
      setInjecting(false);
      setInjected(true);
      setStatus(s => ({ ...s, lastInjection: new Date().toISOString(), totalInjections: s.totalInjections + 1 }));
      setTimeout(() => setInjected(false), 5000);
    }, 2000);
  };

  const formatDate = (iso) => new Date(iso).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  const injectionHistory = [
    { title: 'Injection automatique', time: formatDate(status.lastInjection), color: 'var(--success)', status: 'Succès' },
    { title: 'Injection automatique', time: formatDate(new Date(new Date(status.lastInjection).getTime() - 86400000).toISOString()), color: 'var(--success)', status: 'Succès' },
    { title: 'Injection forcée', time: formatDate(new Date(new Date(status.lastInjection).getTime() - 172800000).toISOString()), color: 'var(--warning)', status: 'Forcée' },
  ];

  return (
    <div style={s.page}>
      <div style={s.header}>
        <h1 style={s.title}>🍯 Honeypot</h1>
        <p style={s.subtitle}>Injection H24 du code source des 4 bots dans le salon #honeypot</p>
      </div>

      <div style={s.grid}>
        <div style={s.card}>
          <div style={s.cardTitle}>📊 Statut du système</div>
          {[
            { label: 'Statut', value: <span style={s.activeBadge}>● Actif</span> },
            { label: 'Dernière injection', value: formatDate(status.lastInjection) },
            { label: 'Prochaine injection', value: formatDate(status.nextInjection) },
            { label: 'Total injections', value: status.totalInjections },
            { label: 'Cycle', value: 'Toutes les 24h' },
            { label: 'Bots surveillés', value: status.bots?.length || 4 },
          ].map((row, i, arr) => (
            <div key={row.label} style={{ ...s.statusRow, borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <span style={s.statusLabel}>{row.label}</span>
              <span style={s.statusValue}>{row.value}</span>
            </div>
          ))}

          <button
            style={{ ...s.injectBtn, opacity: injecting ? 0.7 : 1 }}
            onClick={forceInject}
            disabled={injecting}
            onMouseEnter={e => !injecting && (e.currentTarget.style.transform = 'translateY(-1px)')}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            {injecting ? '🔄 Injection en cours...' : '⚡ Forcer l\'injection maintenant'}
          </button>

          {injected && (
            <div style={s.successMsg}>
              ✅ Injection forcée dans #honeypot !
            </div>
          )}
        </div>

        <div style={s.card}>
          <div style={s.cardTitle}>🤖 Bots injectés</div>
          <div style={s.botsList}>
            {(status.bots || ['Zeepin', 'BeluGANG Events', 'Honeypot', 'CarlBot']).map(bot => (
              <div key={bot} style={s.botRow}>
                <div>
                  <div style={s.botName}>{bot}</div>
                  <div style={s.botSize}>{botSizes[bot] || '~10 KB'} de code source</div>
                </div>
                <span style={s.injectedBadge}>✅ Injecté</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={s.card}>
        <div style={s.cardTitle}>📋 Historique des injections</div>
        <div style={s.timeline}>
          {injectionHistory.map((item, i) => (
            <div key={i} style={s.timelineItem}>
              <div style={s.timelineDot(item.color)} />
              <div style={s.timelineContent}>
                <div style={s.timelineTitle}>{item.title} — <span style={{ color: item.color }}>{item.status}</span></div>
                <div style={s.timelineTime}>{item.time} — 4 bots injectés dans #honeypot</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
