import { useLocation, useNavigate } from 'react-router-dom';

const navItems = [
  { path: '/dashboard', icon: '📊', label: 'Tableau de bord' },
  { path: '/bots', icon: '🤖', label: 'Bots' },
  { path: '/moderation', icon: '🛡️', label: 'Modération' },
  { path: '/events', icon: '🎉', label: 'Événements' },
  { path: '/honeypot', icon: '🍯', label: 'Honeypot' },
];

const s = {
  sidebar: {
    position: 'fixed',
    left: 0, top: 0, bottom: 0,
    width: '240px',
    background: 'var(--bg-secondary)',
    borderRight: '1px solid var(--border)',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 100,
  },
  logo: {
    padding: '20px 16px',
    borderBottom: '1px solid var(--border)',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  logoIcon: {
    width: '36px', height: '36px',
    background: 'linear-gradient(135deg, var(--accent), var(--accent-secondary))',
    borderRadius: '10px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '18px',
  },
  logoText: {
    fontWeight: 700, fontSize: '15px',
    color: 'var(--text-primary)',
    lineHeight: 1.2,
  },
  logoSub: {
    fontSize: '11px',
    color: 'var(--text-muted)',
  },
  nav: {
    flex: 1,
    padding: '12px 8px',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  navItem: (active) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 12px',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.15s',
    background: active ? 'var(--accent)' : 'transparent',
    color: active ? '#fff' : 'var(--text-secondary)',
    fontWeight: active ? 600 : 400,
    fontSize: '14px',
  }),
  navIcon: {
    fontSize: '16px',
    width: '20px',
    textAlign: 'center',
  },
  footer: {
    padding: '12px 8px',
    borderTop: '1px solid var(--border)',
  },
  userCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 12px',
    borderRadius: '8px',
    background: 'var(--bg-card)',
  },
  avatar: {
    width: '32px', height: '32px',
    borderRadius: '50%',
    background: 'var(--accent-secondary)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '14px', fontWeight: 700,
    color: '#fff',
    overflow: 'hidden',
  },
  userName: {
    flex: 1,
    fontSize: '13px',
    fontWeight: 600,
    color: 'var(--text-primary)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  logoutBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--text-muted)',
    fontSize: '16px',
    padding: '4px',
    borderRadius: '4px',
    transition: 'color 0.15s',
  },
};

export default function Sidebar({ user, onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();

  const avatarUrl = user?.avatar
    ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
    : null;

  return (
    <aside style={s.sidebar}>
      <div style={s.logo}>
        <div style={s.logoIcon}>🎮</div>
        <div>
          <div style={s.logoText}>BeluGANG</div>
          <div style={s.logoSub}>Dashboard v2.0</div>
        </div>
      </div>

      <nav style={s.nav}>
        {navItems.map(item => (
          <div
            key={item.path}
            style={s.navItem(location.pathname === item.path)}
            onClick={() => navigate(item.path)}
            onMouseEnter={e => {
              if (location.pathname !== item.path) {
                e.currentTarget.style.background = 'var(--bg-hover)';
                e.currentTarget.style.color = 'var(--text-primary)';
              }
            }}
            onMouseLeave={e => {
              if (location.pathname !== item.path) {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'var(--text-secondary)';
              }
            }}
          >
            <span style={s.navIcon}>{item.icon}</span>
            {item.label}
          </div>
        ))}
      </nav>

      <div style={s.footer}>
        <div style={s.userCard}>
          <div style={s.avatar}>
            {avatarUrl
              ? <img src={avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : (user?.username?.[0] || '?').toUpperCase()
            }
          </div>
          <div style={s.userName}>{user?.username || 'Utilisateur'}</div>
          <button
            style={s.logoutBtn}
            onClick={onLogout}
            title="Se déconnecter"
            onMouseEnter={e => e.currentTarget.style.color = 'var(--danger)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            ⏏
          </button>
        </div>
      </div>
    </aside>
  );
}
