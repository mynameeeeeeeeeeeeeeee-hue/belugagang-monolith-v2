import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const mockLogs = [
  { id: 1, action: 'Ban', target: 'User#1234', moderator: 'Admin#0001', reason: 'Spam répété', timestamp: new Date(Date.now() - 3600000).toISOString() },
  { id: 2, action: 'Warn', target: 'User#5678', moderator: 'Mod#0002', reason: 'Langage inapproprié', timestamp: new Date(Date.now() - 7200000).toISOString() },
  { id: 3, action: 'Mute', target: 'User#9012', moderator: 'Admin#0001', reason: 'Flood', timestamp: new Date(Date.now() - 10800000).toISOString() },
  { id: 4, action: 'Kick', target: 'User#3456', moderator: 'Mod#0003', reason: 'Pub non autorisée', timestamp: new Date(Date.now() - 14400000).toISOString() },
];

const actionColors = {
  Ban: 'var(--danger)',
  Kick: '#ff8c00',
  Mute: 'var(--warning)',
  Warn: '#ffa500',
  Unban: 'var(--success)',
  Clear: 'var(--accent-secondary)',
};

const s = {
  page: { animation: 'fadeIn 0.3s ease' },
  header: { marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  title: { fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' },
  subtitle: { fontSize: '14px', color: 'var(--text-muted)' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px' },
  card: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: '14px',
    overflow: 'hidden',
  },
  cardHeader: {
    padding: '16px 20px',
    borderBottom: '1px solid var(--border)',
    fontWeight: 700,
    fontSize: '14px',
    color: 'var(--text-primary)',
    display: 'flex', alignItems: 'center', gap: '8px',
  },
  logRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 20px',
    borderBottom: '1px solid var(--border)',
    transition: 'background 0.15s',
    cursor: 'default',
  },
  actionBadge: (action) => ({
    padding: '3px 8px',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: 700,
    background: (actionColors[action] || 'var(--accent)') + '22',
    color: actionColors[action] || 'var(--accent)',
    border: `1px solid ${(actionColors[action] || 'var(--accent)') + '44'}`,
    minWidth: '52px',
    textAlign: 'center',
  }),
  logInfo: { flex: 1 },
  logTarget: { fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' },
  logReason: { fontSize: '12px', color: 'var(--text-muted)' },
  logTime: { fontSize: '11px', color: 'var(--text-muted)' },
  warnForm: { padding: '20px' },
  formGroup: { marginBottom: '14px' },
  label: { display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' },
  input: {
    width: '100%',
    padding: '10px 12px',
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    color: 'var(--text-primary)',
    fontSize: '13px',
    outline: 'none',
    transition: 'border-color 0.15s',
  },
  submitBtn: {
    width: '100%',
    padding: '10px',
    background: 'var(--accent)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
};

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return 'Il y a moins d\'1h';
  if (h < 24) return `Il y a ${h}h`;
  return `Il y a ${Math.floor(h / 24)}j`;
}

export default function Moderation({ token }) {
  const [logs, setLogs] = useState(mockLogs);
  const [warnForm, setWarnForm] = useState({ userId: '', reason: '', modId: 'Admin' });
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetch(`${API_URL}/api/modlogs`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(data => data && data.length > 0 && setLogs(data))
      .catch(() => {});
  }, [token]);

  const submitWarn = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/api/warns`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(warnForm),
      });
      if (res.ok) {
        setSuccess('Avertissement enregistré !');
        setWarnForm({ userId: '', reason: '', modId: 'Admin' });
        setTimeout(() => setSuccess(''), 3000);
        // Ajouter au log local
        setLogs(l => [{ id: Date.now(), action: 'Warn', target: warnForm.userId, moderator: warnForm.modId, reason: warnForm.reason, timestamp: new Date().toISOString() }, ...l]);
      }
    } catch {
      // Ajouter localement quand même
      setLogs(l => [{ id: Date.now(), action: 'Warn', target: warnForm.userId, moderator: warnForm.modId, reason: warnForm.reason, timestamp: new Date().toISOString() }, ...l]);
      setSuccess('Warn ajouté (mode local)');
      setWarnForm({ userId: '', reason: '', modId: 'Admin' });
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div>
          <h1 style={s.title}>Modération</h1>
          <p style={s.subtitle}>{logs.length} actions enregistrées</p>
        </div>
      </div>

      <div style={s.grid}>
        <div style={s.card}>
          <div style={s.cardHeader}>🛡️ Logs de modération</div>
          {logs.map((log, i) => (
            <div
              key={log.id}
              style={{ ...s.logRow, borderBottom: i < logs.length - 1 ? '1px solid var(--border)' : 'none' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <span style={s.actionBadge(log.action)}>{log.action}</span>
              <div style={s.logInfo}>
                <div style={s.logTarget}>{log.target}</div>
                <div style={s.logReason}>par {log.moderator} — {log.reason}</div>
              </div>
              <div style={s.logTime}>{timeAgo(log.timestamp)}</div>
            </div>
          ))}
          {logs.length === 0 && (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
              Aucun log de modération
            </div>
          )}
        </div>

        <div>
          <div style={s.card}>
            <div style={s.cardHeader}>⚠️ Ajouter un avertissement</div>
            <form style={s.warnForm} onSubmit={submitWarn}>
              {success && (
                <div style={{ padding: '10px', background: 'rgba(87,242,135,0.15)', border: '1px solid rgba(87,242,135,0.3)', borderRadius: '8px', color: 'var(--success)', fontSize: '13px', marginBottom: '14px' }}>
                  ✅ {success}
                </div>
              )}
              <div style={s.formGroup}>
                <label style={s.label}>ID ou nom du membre</label>
                <input
                  style={s.input}
                  value={warnForm.userId}
                  onChange={e => setWarnForm(f => ({ ...f, userId: e.target.value }))}
                  placeholder="User#1234 ou ID Discord"
                  required
                  onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
              </div>
              <div style={s.formGroup}>
                <label style={s.label}>Raison</label>
                <input
                  style={s.input}
                  value={warnForm.reason}
                  onChange={e => setWarnForm(f => ({ ...f, reason: e.target.value }))}
                  placeholder="Raison de l'avertissement"
                  required
                  onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
              </div>
              <div style={s.formGroup}>
                <label style={s.label}>Modérateur</label>
                <input
                  style={s.input}
                  value={warnForm.modId}
                  onChange={e => setWarnForm(f => ({ ...f, modId: e.target.value }))}
                  placeholder="Votre nom"
                  onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
              </div>
              <button
                type="submit"
                style={s.submitBtn}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--accent)'}
              >
                ⚠️ Enregistrer le warn
              </button>
            </form>
          </div>

          <div style={{ ...s.card, marginTop: '16px' }}>
            <div style={s.cardHeader}>📊 Statistiques</div>
            <div style={{ padding: '16px 20px' }}>
              {[
                { label: 'Bans', value: logs.filter(l => l.action === 'Ban').length, color: 'var(--danger)' },
                { label: 'Kicks', value: logs.filter(l => l.action === 'Kick').length, color: '#ff8c00' },
                { label: 'Mutes', value: logs.filter(l => l.action === 'Mute').length, color: 'var(--warning)' },
                { label: 'Warns', value: logs.filter(l => l.action === 'Warn').length, color: '#ffa500' },
              ].map(stat => (
                <div key={stat.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{stat.label}</span>
                  <span style={{ fontSize: '16px', fontWeight: 700, color: stat.color }}>{stat.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
