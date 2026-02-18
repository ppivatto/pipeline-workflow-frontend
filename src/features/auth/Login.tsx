import { useState } from 'react';
import api from '../../api/client';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { Moon, Sun } from 'lucide-react';
import { Logo } from '../../components/Logo';

export default function Login() {
  const [email, setEmail] = useState('pablopivatto@gmail.com');
  const [password, setPassword] = useState('123456');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.access_token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/dashboard');
    } catch (err) {
      alert('Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', width: '100vw', background: 'var(--bg-main)', position: 'relative' }}>
      <button
        onClick={toggleTheme}
        className="btn"
        style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'var(--bg-card)', border: '1px solid var(--border)' }}
      >
        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      <div className="card glass" style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem', gap: '1rem' }}>
          <Logo size={48} />
          <h2 style={{ margin: 0, textAlign: 'center', color: 'var(--text-main)', fontSize: '1.75rem', fontWeight: 800 }}>Be Aware</h2>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
          <div>
            <label>{t('email')}</label>
            <input
              type="email"
              className="input"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label>{t('password')}</label>
            <input
              type="password"
              className="input"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }} disabled={loading}>
            {loading ? t('entering') : t('login')}
          </button>
        </form>
        <p style={{ marginTop: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          {t('no_account')} <Link to="/register" style={{ color: 'var(--primary)' }}>{t('register')}</Link>
        </p>
      </div>
    </div>
  );
}
