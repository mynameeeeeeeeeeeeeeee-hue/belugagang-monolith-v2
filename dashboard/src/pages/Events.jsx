import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const mockEvents = [
  { id: 'ABC123', nom: 'Tournoi BeluGANG', description: 'Tournoi mensuel BeluGANG — Tous les membres sont invités !', date: '15/07/2026 20:00', lieu: 'Vocal #tournoi', participants: 12, createur: 'Admin#0001' },
  { id: 'DEF456', nom: 'Soirée Watch Party', description: 'On regarde ensemble le nouveau film Marvel', date: '20/07/2026 21:00', lieu: 'Discord Stage', participants: 8, createur: 'Mod#0002' },
];

const s = {
  page: { animation: 'fadeIn 0.3s ease' },
  header: { marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  title: { fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' },
  subtitle: { fontSize: '14px', color: 'var(--text-muted)' },
  createBtn: {
    padding: '10px 18px',
    background: 'var(--accent)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px', marginBottom: '24px' },
  card: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: '14px',
    padding: '20px',
    transition: 'all 0.2s',
  },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' },
  eventName: { fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' },
  eventId: { fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'monospace', background: 'var(--bg-secondary)', padding: '2px 6px', borderRadius: '4px' },
  eventDesc: { fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '14px', lineHeight: 1.5 },
  eventMeta: { display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px' },
  metaRow: { display: 'flex', gap: '8px', fontSize: '12px', color: 'var(--text-muted)' },
  metaLabel: { color: 'var(--text-secondary)', fontWeight: 600 },
  participantsBadge: {
    display: 'inline-flex', alignItems: 'center', gap: '4px',
    padding: '4px 10px',
    background: 'rgba(255,107,53,0.15)',
    border: '1px solid rgba(255,107,53,0.3)',
    borderRadius: '20px',
    fontSize: '12px', fontWeight: 600,
    color: 'var(--accent)',
  },
  deleteBtn: {
    padding: '6px 12px',
    background: 'rgba(237,66,69,0.15)',
    color: 'var(--danger)',
    border: '1px solid rgba(237,66,69,0.3)',
    borderRadius: '6px',
    fontSize: '12px', fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  modal: {
    position: 'fixed', inset: 0,
    background: 'rgba(0,0,0,0.7)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000,
    padding: '20px',
  },
  modalCard: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: '16px',
    padding: '28px',
    width: '100%',
    maxWidth: '480px',
    animation: 'fadeIn 0.2s ease',
  },
  modalTitle: { fontSize: '18px', fontWeight: 700, marginBottom: '20px', color: 'var(--text-primary)' },
  formGroup: { marginBottom: '14px' },
  label: { display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' },
  input: {
    width: '100%', padding: '10px 12px',
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    color: 'var(--text-primary)',
    fontSize: '13px', outline: 'none',
    transition: 'border-color 0.15s',
  },
  modalActions: { display: 'flex', gap: '10px', marginTop: '20px' },
  cancelBtn: {
    flex: 1, padding: '10px',
    background: 'var(--bg-hover)',
    color: 'var(--text-secondary)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    fontSize: '13px', fontWeight: 600,
    cursor: 'pointer',
  },
  submitBtn: {
    flex: 1, padding: '10px',
    background: 'var(--accent)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '13px', fontWeight: 600,
    cursor: 'pointer',
  },
};

export default function Events({ token }) {
  const [events, setEvents] = useState(mockEvents);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ nom: '', description: '', date: '', lieu: '' });

  useEffect(() => {
    fetch(`${API_URL}/api/events`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(data => data && data.length > 0 && setEvents(data))
      .catch(() => {});
  }, [token]);

  const createEvent = async (e) => {
    e.preventDefault();
    const newEvent = { ...form, id: Date.now().toString(36).toUpperCase(), participants: 0, createur: 'Admin' };
    setEvents(ev => [newEvent, ...ev]);
    setShowModal(false);
    setForm({ nom: '', description: '', date: '', lieu: '' });

    try {
      await fetch(`${API_URL}/api/events`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
    } catch {}
  };

  const deleteEvent = (id) => {
    setEvents(ev => ev.filter(e => e.id !== id));
    fetch(`${API_URL}/api/events/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }).catch(() => {});
  };

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div>
          <h1 style={s.title}>Événements</h1>
          <p style={s.subtitle}>{events.length} événement(s) actif(s)</p>
        </div>
        <button
          style={s.createBtn}
          onClick={() => setShowModal(true)}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-hover)'}
          onMouseLeave={e => e.currentTarget.style.background = 'var(--accent)'}
        >
          + Créer un événement
        </button>
      </div>

      {events.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>📭</div>
          <div>Aucun événement pour le moment</div>
        </div>
      ) : (
        <div style={s.grid}>
          {events.map(event => (
            <div
              key={event.id}
              style={s.card}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              <div style={s.cardHeader}>
                <div style={s.eventName}>{event.nom}</div>
                <span style={s.eventId}>{event.id}</span>
              </div>
              <div style={s.eventDesc}>{event.description}</div>
              <div style={s.eventMeta}>
                <div style={s.metaRow}><span style={s.metaLabel}>📅 Date :</span> {event.date}</div>
                <div style={s.metaRow}><span style={s.metaLabel}>📍 Lieu :</span> {event.lieu || 'Non spécifié'}</div>
                <div style={s.metaRow}><span style={s.metaLabel}>👤 Créé par :</span> {event.createur}</div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={s.participantsBadge}>👥 {event.participants} participant(s)</span>
                <button
                  style={s.deleteBtn}
                  onClick={() => deleteEvent(event.id)}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(237,66,69,0.3)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(237,66,69,0.15)'}
                >
                  🗑️ Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div style={s.modal} onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div style={s.modalCard}>
            <div style={s.modalTitle}>🎉 Créer un événement</div>
            <form onSubmit={createEvent}>
              {[
                { key: 'nom', label: 'Nom de l\'événement', placeholder: 'Tournoi BeluGANG' },
                { key: 'description', label: 'Description', placeholder: 'Description de l\'événement...' },
                { key: 'date', label: 'Date (DD/MM/YYYY HH:MM)', placeholder: '15/07/2026 20:00' },
                { key: 'lieu', label: 'Lieu', placeholder: 'Vocal #général ou lien' },
              ].map(field => (
                <div key={field.key} style={s.formGroup}>
                  <label style={s.label}>{field.label}</label>
                  <input
                    style={s.input}
                    value={form[field.key]}
                    onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                    placeholder={field.placeholder}
                    required={field.key !== 'lieu'}
                    onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                    onBlur={e => e.target.style.borderColor = 'var(--border)'}
                  />
                </div>
              ))}
              <div style={s.modalActions}>
                <button type="button" style={s.cancelBtn} onClick={() => setShowModal(false)}>Annuler</button>
                <button type="submit" style={s.submitBtn}>✅ Créer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
