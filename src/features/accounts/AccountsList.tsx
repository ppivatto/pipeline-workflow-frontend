import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, ArrowRight } from 'lucide-react';
import api from '../../api/client';
import { useLanguage } from '../../context/LanguageContext';

export default function AccountsList() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const { } = useLanguage();
  // ... rest of component using t or just remove it if unused


  useEffect(() => {
    // Initial load
    fetchAccounts();
  }, []);

  const fetchAccounts = async (query = '') => {
    try {
      const endpoint = query ? `/accounts/search?q=${query}` : '/accounts';
      const res = await api.get(endpoint);
      setAccounts(res.data);
    } catch (error) {
      console.error('Error fetching accounts', error);
      setAccounts([]);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    fetchAccounts(term);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ margin: 0, fontSize: '1.875rem', fontWeight: 700, color: 'var(--text-main)' }}>
          Bandeja de <span style={{ color: 'var(--primary)' }}>Cuentas</span>
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* Logo AXA placeholder as requested in layout description, though maybe not strictly needed if we have own logo */}
        </div>
      </div>

      <div className="card glass" style={{ marginBottom: '2rem', padding: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ flex: '0 1 500px', position: 'relative' }}>
          <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Buscar por Razón Social o Identificador..."
            className="input"
            style={{ marginBottom: 0, paddingLeft: '3rem' }}
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        <Link to="/accounts/new" className="btn btn-primary" style={{ whiteSpace: 'nowrap', textDecoration: 'none' }}>
          <Plus size={20} /> Alta de Cuenta
        </Link>
      </div>

      <div className="card glass" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)', background: 'var(--header-bg)' }}>
              <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Razón Social</th>
              <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Identificador</th>
              <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Industria</th>
              <th style={{ padding: '1rem', textAlign: 'right', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((account: any) => (
              <tr
                key={account.id}
                className="hover:bg-white/5 transition-colors"
                style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-main)', cursor: 'pointer', transition: 'all 0.2s' }}
                onClick={() => navigate(`/seguimiento/${account.id}`)}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <td style={{ padding: '1rem', fontWeight: 500 }}>{account.name}</td>
                <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{account.identifier}</td>
                <td style={{ padding: '1rem' }}>
                  <span className="badge">{account.industry || 'N/A'}</span>
                </td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>
                  <button
                    className="btn btn-primary"
                    style={{ padding: '0.4rem', fontSize: '0.75rem', marginRight: '0.5rem' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/accounts/new?id=${account.id}`);
                    }}
                  >
                    <Plus size={14} /> Nueva Oportunidad
                  </button>
                  <button className="btn btn-secondary" style={{ padding: '0.4rem', fontSize: '0.75rem' }}>
                    Detalle <ArrowRight size={14} />
                  </button>
                </td>
              </tr>
            ))}
            {accounts.length === 0 && (
              <tr>
                <td colSpan={4} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No se encontraron cuentas
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
