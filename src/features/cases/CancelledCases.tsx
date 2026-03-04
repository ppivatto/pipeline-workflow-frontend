import { useState, useEffect } from 'react';
import api from '../../api/client';
import { Loader2, XCircle, FileDown, Eye } from 'lucide-react';
import { exportToExcel } from '../../utils/exportToExcel';
import FichaCaso from '../../components/FichaCaso';
import { useLanguage } from '../../context/LanguageContext';

interface CancelledCase {
  id: string;
  refnum: string;
  ramo: string;
  status: string;
  workflowStep: string;
  lastModified: string;
  account?: { id: string; name: string; identifier: string };
}

export default function CancelledCases() {
  const [cases, setCases] = useState<CancelledCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [fichaCaseId, setFichaCaseId] = useState<string | null>(null);
  const { t } = useLanguage();

  useEffect(() => {
    api.get('/cases/cancelled')
      .then(res => setCases(res.data || []))
      .catch(() => setCases([]))
      .finally(() => setLoading(false));
  }, []);



  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Loader2 size={32} className="animate-spin" style={{ color: 'var(--primary)' }} />
      </div>
    );
  }

  return (
    <div>
      {fichaCaseId && <FichaCaso caseId={fichaCaseId} onClose={() => setFichaCaseId(null)} />}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ margin: 0, color: 'var(--text-main)' }}>
          <span style={{ color: 'var(--primary)' }}>{t('header_cancelled')}</span>
        </h1>
        <button
          className="btn btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}
          onClick={() => exportToExcel(
            cases.map((c) => ({
              Folio: c.refnum,
              Cuenta: c.account?.name || '',
              Ramo: c.ramo || '',
              Etapa: c.workflowStep,
              Estado: c.status,
              'Última modificación': c.lastModified ? new Date(c.lastModified).toLocaleDateString('es-MX') : '',
            })),
            'cancelados'
          )}
        >
          <FileDown size={16} /> {t('export_excel')}
        </button>
      </div>

      <div className="card glass">
        <div style={{ overflowX: 'auto', minHeight: '200px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '1rem' }}>Folio</th>
                <th style={{ padding: '1rem' }}>{t('account')}</th>
                <th style={{ padding: '1rem' }}>{t('ramo')}</th>
                <th style={{ padding: '1rem' }}>{t('stage')}</th>
                <th style={{ padding: '1rem' }}>{t('status')}</th>
                <th style={{ padding: '1rem' }}>{t('col_last_modified')}</th>
                <th style={{ padding: '1rem' }}>{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {cases.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    <XCircle size={24} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
                    <p>{t('cancelled_empty')}</p>
                  </td>
                </tr>
              ) : (
                cases.map(c => (
                  <tr key={c.id} style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-main)' }}>
                    <td style={{ padding: '1rem', fontWeight: 600 }}>{c.refnum}</td>
                    <td style={{ padding: '1rem' }}>{c.account?.name || '—'}</td>
                    <td style={{ padding: '1rem' }}>{c.ramo || '—'}</td>
                    <td style={{ padding: '1rem' }}>{c.workflowStep}</td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        background: c.status === 'RECHAZADO' ? 'rgba(239,68,68,0.15)' : 'rgba(156,163,175,0.15)',
                        color: c.status === 'RECHAZADO' ? '#ef4444' : '#9ca3af'
                      }}>
                        {c.status}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      {c.lastModified ? new Date(c.lastModified).toLocaleDateString('es-MX') : '—'}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <button
                        onClick={() => setFichaCaseId(c.id)}
                        className="btn btn-secondary"
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                      >
                        <Eye size={14} /> {t('ficha')}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
