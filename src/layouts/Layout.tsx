import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Building, CheckSquare, Settings, LogOut, ChevronLeft, ChevronRight, Moon, Sun, Globe, User } from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { Logo } from '../components/Logo';

export default function Layout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const [collapsed, setCollapsed] = useState(() => window.innerWidth < 768);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', transition: 'all 0.3s' }}>
      <aside
        style={{
          width: collapsed ? '80px' : '260px',
          minWidth: collapsed ? '80px' : '260px',
          height: '100vh',
          background: 'var(--bg-sidebar)',
          borderRight: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          transition: 'width 0.3s ease, min-width 0.3s ease',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          zIndex: 20
        }}
      >
        <div style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Logo size={32} />
          {!collapsed && <h2 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 700, color: 'var(--text-main)' }}>Be Aware</h2>}
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', padding: '0 1rem', flex: 1 }}>
          <MenuItem to="/accounts" icon={<LayoutDashboard size={20} />} label="Cuentas" collapsed={collapsed} active={isActive('/accounts')} />
          {/* <MenuItem to="/accounts/new" icon={<Users size={20} />} label={t('menu_alta')} collapsed={collapsed} active={isActive('/accounts/new')} />Removed as per request, button inside Cuentas now */}
          <MenuItem to="/renovaciones" icon={<Building size={20} />} label={t('menu_renovaciones')} collapsed={collapsed} active={isActive('/renovaciones')} />
          {/* Placeholders for visuals */}
          <MenuItem to="#" icon={<CheckSquare size={20} />} label="Tareas" collapsed={collapsed} active={false} />

          <div style={{ marginTop: '2rem' }}>
            {!collapsed && <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', paddingLeft: '0.5rem' }}>ADMIN</p>}
            <MenuItem to="#" icon={<Settings size={20} />} label="Equipo" collapsed={collapsed} active={false} />
          </div>
        </nav>

        <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{
            display: 'flex',
            gap: '0.5rem',
            flexDirection: collapsed ? 'column' : 'row',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            padding: '0 0.5rem'
          }}>
            <button onClick={toggleTheme} className="btn btn-secondary" style={{ padding: '0.4rem', width: collapsed ? '40px' : 'auto' }}>
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button onClick={() => setLanguage(language === 'es' ? 'en' : language === 'en' ? 'pt' : 'es')} className="btn btn-secondary" style={{ padding: '0.4rem', width: collapsed ? '40px' : 'auto' }}>
              <Globe size={16} /> {!collapsed && <span style={{ fontSize: '10px', marginLeft: '4px' }}>{language.toUpperCase()}</span>}
            </button>
            <button onClick={() => setCollapsed(!collapsed)} className="btn btn-secondary" style={{ padding: '0.4rem', width: collapsed ? '40px' : 'auto' }}>
              {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.5rem',
            borderRadius: '8px',
            background: 'rgba(255,255,255,0.05)',
            borderTop: '1px solid var(--border)',
            justifyContent: collapsed ? 'center' : 'flex-start'
          }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}>
              <User size={16} />
            </div>
            {!collapsed && (
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>Luis Hierro</p>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>Manager</p>
              </div>
            )}
            {!collapsed && (
              <button onClick={handleLogout} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <LogOut size={16} />
              </button>
            )}
          </div>
        </div>
      </aside>
      <main style={{ flex: 1, background: 'var(--bg-main)', overflowY: 'auto', position: 'relative', height: '100vh' }}>
        <header style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1rem 2rem',
          borderBottom: '1px solid var(--border)',
          background: 'var(--bg-main)' /* Blend with main bg */
        }}>
          {/* Header content handles by pages mostly, but could put breadcrumbs here */}
          <div />
        </header>
        <div style={{ padding: '2rem' }}>
          {children}
        </div>
      </main>
    </div>
  );
}

function MenuItem({ to, icon, label, collapsed, active }: any) {
  return (
    <Link
      to={to}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.75rem 1rem',
        borderRadius: '8px',
        textDecoration: 'none',
        color: active ? 'white' : 'var(--text-muted)',
        background: active ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
        justifyContent: collapsed ? 'center' : 'flex-start',
        borderLeft: active ? '3px solid #3b82f6' : '3px solid transparent',
        transition: 'all 0.2s'
      }}
    >
      <div style={{ color: active ? '#3b82f6' : 'inherit' }}>{icon}</div>
      {!collapsed && <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{label}</span>}
    </Link>
  );
}
