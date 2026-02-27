import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/client';
import { Loader2, InboxIcon, FileDown } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { exportToExcel } from '../../utils/exportToExcel';

interface Case {
  id: string;
  refnum: string;
  account?: { id: string; name: string };
  ramo: string;
  subramo?: string;
  workflowStep: string;
  tipo: string;
  subtipo: string;
  status: string;
  updatedAt: string;
}

const ITEMS_PER_PAGE_OPTIONS = [10, 20, 50];

const STEP_STYLE: Record<string, { bg: string; color: string }> = {
  ALTA: { bg: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' },
  NEGOCIACION: { bg: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' },
  EMISION: { bg: 'rgba(16, 185, 129, 0.15)', color: '#10b981' },
};

export default function BandejaSeguimiento() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const { data: cases = [], isLoading } = useQuery<Case[]>({
    queryKey: ['bandeja-seguimiento'],
    queryFn: async () => {
      const res = await api.get('/cases?status=ACTIVO');
      return res.data;
    },
    select: (data) =>
      data
        .filter((c) => !['CERRADO', 'TERMINADO', 'CANCELADO', 'RECHAZADO'].includes(c.status))
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
  });

  const handleRowClick = (c: Case) => {
    const accountId = c.account?.id;
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
        if (accountId) navigate(`/seguimiento/${accountId}`);
    }
  };

  const term = searchTerm.toLowerCase();
  const filtered = (cases as Case[]).filter(
    (c) =>
      c.refnum.toLowerCase().includes(term) ||
      (c.account?.name || '').toLowerCase().includes(term) ||
      (c.ramo || '').toLowerCase().includes(term) ||
      (c.status || '').toLowerCase().includes(term),
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (isLoading) {
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
            Bandeja de Seguimiento
          </h1>
          <p style={{ margin: '0.5rem 0 0', color: 'var(--text-muted)' }}>
            Todos los casos activos en el sistema
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{
            background: 'var(--primary)',
            color: '#fff',
            borderRadius: '999px',
            padding: '0.35rem 1rem',
            fontWeight: 700,
            fontSize: '0.9rem'
          }}>
            {filtered.length} caso{filtered.length !== 1 ? 's' : ''}
          </span>
          <button
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}
            onClick={() => exportToExcel(
              filtered.map((c) => ({
                Folio: c.refnum,
                Cuenta: c.account?.name || '',
                Ramo: c.ramo || '',
                Etapa: c.workflowStep,
                Estado: c.status,
                'Última modificación': c.updatedAt ? new Date(c.updatedAt).toLocaleDateString('es-MX') : '',
              })),
              'bandeja-seguimiento'
            )}
          >
            <FileDown size={16} /> Exportar Excel
          </button>
        </div>
      </div>

      {/* Search bar */}
      <div className="card glass" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
        <input
          type="text"
          placeholder="Buscar por folio, cuenta, ramo o estado…"
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          className="input"
          style={{ marginBottom: 0 }}
        />
      </div>

      <div className="card glass" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)', background: 'var(--header-bg)' }}>
              {['Folio', 'Cuenta', 'Ramo', 'Etapa', 'Tipo', 'Subtipo', 'Estado', 'Última modif.'].map((h) => (
                <th key={h} style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.length > 0 ? (
              paginated.map((c) => {
                const stepStyle = STEP_STYLE[c.workflowStep] ?? { bg: 'rgba(255,255,255,0.08)', color: 'var(--text-muted)' };
                return (
                  <tr
                    key={c.id}
                    onClick={() => handleRowClick(c)}
                    style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-main)', cursor: 'pointer', transition: 'background 0.2s' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '1rem', fontWeight: 600 }}>{c.refnum}</td>
                    <td style={{ padding: '1rem' }}>{c.account?.name || '—'}</td>
                    <td style={{ padding: '1rem' }}><span className="badge">{c.ramo || '—'}</span></td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ padding: '2px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600, background: stepStyle.bg, color: stepStyle.color }}>
                        {c.workflowStep === 'ALTA' ? t('header_new_account') :
                          c.workflowStep === 'NEGOCIACION' ? t('header_negotiation') :
                            c.workflowStep === 'EMISION' ? t('header_emission') : c.workflowStep}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{c.tipo || '—'}</td>
                    <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{c.subtipo || '—'}</td>
                    <td style={{ padding: '1rem' }}>{c.status}</td>
                    <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      {c.updatedAt ? new Date(c.updatedAt).toLocaleDateString('es-MX') : '—'}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={8} style={{ padding: '4rem', textAlign: 'center' }}>
                  <InboxIcon size={32} style={{ margin: '0 auto 0.75rem', display: 'block', opacity: 0.3 }} />
                  <p style={{ color: 'var(--text-muted)', margin: 0 }}>No hay casos activos</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div style={{ padding: '1rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <select
            className="input"
            style={{ width: 'auto', margin: 0, padding: '0.25rem 0.5rem' }}
            value={itemsPerPage}
            onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
          >
            {ITEMS_PER_PAGE_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
          </select>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginRight: '1rem' }}>
              {t('page')} {currentPage} {t('of')} {totalPages}
            </span>
            <button className="btn btn-secondary" disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)} style={{ padding: '0.25rem 0.5rem' }}>{t('back')}</button>
            <button className="btn btn-secondary" disabled={currentPage >= totalPages} onClick={() => setCurrentPage((p) => p + 1)} style={{ padding: '0.25rem 0.5rem' }}>{t('next')}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
