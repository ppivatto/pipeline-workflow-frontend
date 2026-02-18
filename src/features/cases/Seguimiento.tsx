import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/client';
import { ArrowLeft, Loader2, Plus } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface Case {
  id: string;
  refnum: string;
  account: { name: string };
  ramo: string;
  workflowStep: string;
  tipo: string;
  subtipo: string;
  status: string; // 'ABIERTO', 'EN_PROCESO', 'CERRADO', etc.
  updatedAt: string;
}

const ITEMS_PER_PAGE_OPTIONS = [10, 20, 50];

export default function Seguimiento() {
  const { accountId } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [accountName, setAccountName] = useState('');
  const [searchTerm, setSearchTerm] = useState(''); // New search term state

  useEffect(() => {
    // ... (fetch logic same as before)
    const fetchCases = async () => {
      try {
        api.get(`/accounts/${accountId}`).then(res => setAccountName(res.data.name)).catch(() => setAccountName('Cuenta Desconocida'));
        const res = await api.get(`/cases?accountId=${accountId}`);
        let data = res.data;
        data = data.filter((c: Case) => !['CERRADO', 'TERMINADO', 'CANCELADO'].includes(c.status));
        data.sort((a: Case, b: Case) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        setCases(data);
      } catch (error) {
        console.error("Error fetching cases", error);
        setCases([]);
      } finally {
        setLoading(false);
      }
    };
    if (accountId) fetchCases();
  }, [accountId]);

  const handleRowClick = (c: Case) => {
    switch (c.workflowStep) {
      case 'ALTA':
        navigate(`/accounts/new?id=${accountId}&caseId=${c.id}`);
        break;
      case 'NEGOCIACION':
        navigate(`/negotiation/${c.id}`);
        break;
      case 'EMISION':
        navigate(`/emission/${c.id}`);
        break;
      default:
        console.warn("Unknown step", c.workflowStep);
    }
  };

  // Pagination Logic
  const filteredCases = cases.filter(c =>
    c.refnum.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.ramo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCases = filteredCases.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredCases.length / itemsPerPage);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Loader2 size={32} className="animate-spin" style={{ color: 'var(--primary)' }} />
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.875rem', fontWeight: 700, color: 'var(--text-main)' }}>
            {t('header_tracking')}
          </h1>
          <p style={{ margin: '0.5rem 0 0', color: 'var(--text-muted)' }}>
            {t('active_cases_for')} <strong style={{ color: 'var(--text-main)' }}>{accountName}</strong>
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={() => navigate(`/accounts/new?id=${accountId}`)} className="btn btn-primary">
            <Plus size={16} /> {t('new_case')}
          </button>
          <button onClick={() => navigate('/accounts')} className="btn btn-secondary">
            <ArrowLeft size={16} /> {t('return_accounts')}
          </button>
        </div>
      </div>

      <div className="card glass" style={{ marginBottom: '1.5rem', padding: '1rem', display: 'flex', alignItems: 'center' }}>
        <input
          type="text"
          placeholder={t('search_placeholder')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input"
          style={{ marginBottom: 0 }}
        />
      </div>

      <div className="card glass" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)', background: 'var(--header-bg)' }}>
              <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>{t('col_number')}</th>
              <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>{t('col_account')}</th>
              <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>{t('col_line')}</th>
              <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>{t('col_step')}</th>
              <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>{t('col_type')}</th>
              <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>{t('col_subtype')}</th>
              <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>{t('col_status')}</th>
            </tr>
          </thead>
          <tbody>
            {currentCases.length > 0 ? (
              currentCases.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => handleRowClick(c)}
                  style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-main)', cursor: 'pointer', transition: 'background 0.2s' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '1rem', fontWeight: 500 }}>{c.refnum}</td>
                  <td style={{ padding: '1rem' }}>{c.account?.name || accountName}</td>
                  <td style={{ padding: '1rem' }}><span className="badge">{c.ramo}</span></td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{
                      padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600,
                      background: c.workflowStep === 'ALTA' ? 'rgba(59, 130, 246, 0.15)' : c.workflowStep === 'NEGOCIACION' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                      color: c.workflowStep === 'ALTA' ? '#3b82f6' : c.workflowStep === 'NEGOCIACION' ? '#f59e0b' : '#10b981'
                    }}>
                      {c.workflowStep === 'ALTA' ? t('header_new_account') :
                        c.workflowStep === 'NEGOCIACION' ? t('header_negotiation') :
                          c.workflowStep === 'EMISION' ? t('header_emission') : c.workflowStep}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{c.tipo}</td>
                  <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{c.subtipo}</td>
                  <td style={{ padding: '1rem', fontWeight: 500 }}>{c.status}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} style={{ padding: '4rem', textAlign: 'center' }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: '1rem', margin: 0 }}>{t('no_cases')}</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Footer / Pagination */}
        <div style={{ padding: '1rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <select
            className="input"
            style={{ width: 'auto', margin: 0, padding: '0.25rem 0.5rem' }}
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(Number(e.target.value))}
          >
            {ITEMS_PER_PAGE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginRight: '1rem' }}>
              {t('page')} {currentPage} {t('of')} {totalPages || 1}
            </span>
            <button
              className="btn btn-secondary"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
              style={{ padding: '0.25rem 0.5rem' }}
            >
              {t('back')}
            </button>
            <button
              className="btn btn-secondary"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(prev => prev + 1)}
              style={{ padding: '0.25rem 0.5rem' }}
            >
              {t('next')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
