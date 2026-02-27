import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Building, LogOut, ChevronLeft, ChevronRight, Moon, Sun, Globe, User, XCircle, BarChart3, Activity, Inbox } from 'lucide-react';
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
          {!collapsed && <h2 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 700, color: 'var(--text-main)' }}>AXA</h2>}
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', padding: '0 1rem', flex: 1 }}>
          <MenuItem to="/accounts" icon={<LayoutDashboard size={20} />} label={t('menu_cuentas')} collapsed={collapsed} active={isActive('/accounts')} />
          <MenuItem to="/renovaciones" icon={<Building size={20} />} label={t('menu_renovaciones')} collapsed={collapsed} active={isActive('/renovaciones')} />
          <MenuItem to="/bandeja" icon={<Inbox size={20} />} label="Seguimiento" collapsed={collapsed} active={isActive('/bandeja')} />
          <MenuItem to="/cancelados" icon={<XCircle size={20} />} label="Cancelados" collapsed={collapsed} active={isActive('/cancelados')} />

          {!collapsed && <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: '1.5rem 0 0.25rem', paddingLeft: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Análisis</p>}
          {collapsed && <div style={{ margin: '0.75rem 0', borderTop: '1px solid var(--border)' }} />}

          <MenuItem to="/dashboard" icon={<Activity size={20} />} label="Dashboard" collapsed={collapsed} active={isActive('/dashboard')} />
          <MenuItem to="/reportes" icon={<BarChart3 size={20} />} label="Reportes" collapsed={collapsed} active={isActive('/reportes')} />
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
            justifyContent: 'center'
          }}>
            {collapsed && (
              <button onClick={handleLogout} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <LogOut size={16} />
              </button>
            )}
            {!collapsed && (
              <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', justifyContent: 'center' }}>
                <LogOut size={14} /> Cerrar sesión
              </button>
            )}
          </div>
        </div>
      </aside>
      <main style={{ flex: 1, background: 'var(--bg-main)', overflowY: 'auto', position: 'relative', height: '100vh' }}>
        <header style={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          padding: '0.75rem 2rem',
          borderBottom: '1px solid var(--border)',
          background: 'var(--bg-main)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.4rem 1rem',
            borderRadius: '8px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid var(--border)'
          }}>
            <div style={{ textAlign: 'right' }}>
              <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary)' }}>BIENVENIDO / Luis Hierro</p>
              <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-muted)' }}>MXE01510711A - Funcionario Comercial</p>
            </div>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}>
              <User size={16} />
            </div>
          </div>
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
      className={`menu-item ${active ? 'active' : ''}`}
      style={{
        justifyContent: collapsed ? 'center' : 'flex-start'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</div>
      {!collapsed && <span>{label}</span>}
    </Link>
  );
}
