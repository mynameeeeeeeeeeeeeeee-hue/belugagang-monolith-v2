import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Bots from './pages/Bots';
import Moderation from './pages/Moderation';
import Events from './pages/Events';
import Honeypot from './pages/Honeypot';
import Sidebar from './components/Sidebar';

const styles = {
  appLayout: {
    display: 'flex',
    minHeight: '100vh',
    background: 'var(--bg-primary)',
  },
  mainContent: {
    flex: 1,
    marginLeft: '240px',
    padding: '24px',
    overflowY: 'auto',
  },
};

function App() {
  const [token, setToken] = useState(localStorage.getItem('belugagang_token'));
  const [user, setUser] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('token');
    if (urlToken) {
      localStorage.setItem('belugagang_token', urlToken);
      setToken(urlToken);
      window.history.replaceState({}, '', '/dashboard');
    }
  }, []);

  useEffect(() => {
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser(payload);
      } catch {
        setToken(null);
        localStorage.removeItem('belugagang_token');
      }
    }
  }, [token]);

  const logout = () => {
    localStorage.removeItem('belugagang_token');
    setToken(null);
    setUser(null);
  };

  if (!token) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="*" element={<Login />} />
        </Routes>
      </BrowserRouter>
    );
  }

  return (
    <BrowserRouter>
      <div style={styles.appLayout}>
        <Sidebar user={user} onLogout={logout} />
        <main style={styles.mainContent}>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard token={token} />} />
            <Route path="/bots" element={<Bots token={token} />} />
            <Route path="/moderation" element={<Moderation token={token} />} />
            <Route path="/events" element={<Events token={token} />} />
            <Route path="/honeypot" element={<Honeypot token={token} />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
