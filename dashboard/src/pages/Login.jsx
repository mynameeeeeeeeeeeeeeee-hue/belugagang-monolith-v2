const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const s = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--bg-primary)',
    padding: '20px',
  },
  card: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: '16px',
    padding: '48px 40px',
    textAlign: 'center',
    maxWidth: '420px',
    width: '100%',
    boxShadow: 'var(--shadow)',
    animation: 'fadeIn 0.4s ease',
  },
  logo: {
    width: '72px', height: '72px',
    background: 'linear-gradient(135deg, var(--accent), var(--accent-secondary))',
    borderRadius: '20px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '36px',
    margin: '0 auto 20px',
  },
  title: {
    fontSize: '28px',
    fontWeight: 800,
    color: 'var(--text-primary)',
    marginBottom: '8px',
  },
  subtitle: {
    fontSize: '14px',
    color: 'var(--text-muted)',
    marginBottom: '32px',
    lineHeight: 1.6,
  },
  btn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    width: '100%',
    padding: '14px 24px',
    background: '#5865f2',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
    marginBottom: '16px',
  },
  demoBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    width: '100%',
    padding: '14px 24px',
    background: 'var(--bg-hover)',
    color: 'var(--text-secondary)',
    border: '1px solid var(--border)',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  bots: {
    display: 'flex',
    justifyContent: 'center',
    gap: '8px',
    marginTop: '28px',
    flexWrap: 'wrap',
  },
  botBadge: {
    padding: '4px 10px',
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border)',
    borderRadius: '20px',
    fontSize: '12px',
    color: 'var(--text-muted)',
  },
};

export default function Login() {
  const handleDiscordLogin = () => {
    window.location.href = `${API_URL}/auth/discord`;
  };

  const handleDemoLogin = () => {
    // Token de démo (JWT signé avec "belugagang_secret_2024")
    const demoToken = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' })) + '.' +
      btoa(JSON.stringify({
        id: '310519663816310902',
        username: 'BeluGANG Admin',
        avatar: null,
        exp: Math.floor(Date.now() / 1000) + 86400,
      })) + '.demo_signature';
    localStorage.setItem('belugagang_token', demoToken);
    window.location.reload();
  };

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.logo}>🎮</div>
        <h1 style={s.title}>BeluGANG Dashboard</h1>
        <p style={s.subtitle}>
          Gérez vos 4 bots Discord depuis un seul endroit.<br />
          Modération, événements, honeypot et plus encore.
        </p>

        <button
          style={s.btn}
          onClick={handleDiscordLogin}
          onMouseEnter={e => e.currentTarget.style.background = '#4752c4'}
          onMouseLeave={e => e.currentTarget.style.background = '#5865f2'}
        >
          <svg width="20" height="20" viewBox="0 0 71 55" fill="white">
            <path d="M60.1 4.9A58.5 58.5 0 0 0 45.5.6a40.7 40.7 0 0 0-1.8 3.7 54.1 54.1 0 0 0-16.4 0A40.7 40.7 0 0 0 25.5.6 58.4 58.4 0 0 0 10.9 4.9C1.6 18.7-1 32.2.3 45.5a58.9 58.9 0 0 0 17.9 9.1 44.3 44.3 0 0 0 3.8-6.2 38.3 38.3 0 0 1-6-2.9l1.5-1.2a42 42 0 0 0 36 0l1.5 1.2a38.3 38.3 0 0 1-6 2.9 44.3 44.3 0 0 0 3.8 6.2 58.7 58.7 0 0 0 17.9-9.1C72 30.3 68.1 16.8 60.1 4.9ZM23.7 37.3c-3.5 0-6.4-3.2-6.4-7.2s2.8-7.2 6.4-7.2 6.5 3.2 6.4 7.2c0 4-2.8 7.2-6.4 7.2Zm23.6 0c-3.5 0-6.4-3.2-6.4-7.2s2.8-7.2 6.4-7.2 6.5 3.2 6.4 7.2c0 4-2.8 7.2-6.4 7.2Z"/>
          </svg>
          Se connecter avec Discord
        </button>

        <button
          style={s.demoBtn}
          onClick={handleDemoLogin}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-card)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
        >
          👁️ Mode démo (sans connexion)
        </button>

        <div style={s.bots}>
          {['🤖 Zeepin', '📅 Events', '🍯 Honeypot', '🛡️ CarlBot'].map(b => (
            <span key={b} style={s.botBadge}>{b}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
