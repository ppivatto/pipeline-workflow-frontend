import { useState } from 'react';
import api from '../../api/client';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { Moon, Sun } from 'lucide-react';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', { name, email, password });
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/dashboard');
    } catch (error) {
      alert(t('error_registration'));
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
        <h2 style={{ marginBottom: '1.5rem', textAlign: 'center', color: 'var(--text-main)' }}>{t('create_account')}</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-main)' }}>{t('name')}</label>
            <input
              className="input"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-main)' }}>{t('email')}</label>
            <input
              type="email"
              className="input"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-main)' }}>{t('password')}</label>
            <input
              type="password"
              className="input"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }} disabled={loading}>
            {loading ? t('registering') : t('register')}
          </button>
        </form>
        <p style={{ marginTop: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          {t('have_account')} <Link to="/login" style={{ color: 'var(--primary)' }}>{t('login')}</Link>
        </p>
      </div>
    </div>
  );
}
