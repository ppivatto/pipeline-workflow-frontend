import { useState, useEffect } from 'react';
import api from '../../api/client';
import { Loader2, XCircle, FileDown } from 'lucide-react';
import { exportToExcel } from '../../utils/exportToExcel';

interface CancelledCase {
  id: string;
  refnum: string;
  ramo: string;
  status: string;
  workflowStep: string;
  lastModified: string;
  account?: { name: string; identifier: string };
}

export default function CancelledCases() {
  const [cases, setCases] = useState<CancelledCase[]>([]);
  const [loading, setLoading] = useState(true);

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ margin: 0, color: 'var(--text-main)' }}>
          <span style={{ color: 'var(--primary)' }}>Casos Cancelados / Rechazados</span>
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
          <FileDown size={16} /> Exportar Excel
        </button>
      </div>

      <div className="card glass">
        <table className="table" style={{ width: '100%' }}>
          <thead>
            <tr>
              <th>Folio</th>
              <th>Cuenta</th>
              <th>Ramo</th>
              <th>Etapa</th>
              <th>Estado</th>
              <th>Última modificación</th>
            </tr>
          </thead>
          <tbody>
            {cases.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  <XCircle size={24} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
                  <p>No hay casos cancelados o rechazados</p>
                </td>
              </tr>
            ) : (
              cases.map(c => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 600 }}>{c.refnum}</td>
                  <td>{c.account?.name || '—'}</td>
                  <td>{c.ramo || '—'}</td>
                  <td>{c.workflowStep}</td>
                  <td>
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
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    {c.lastModified ? new Date(c.lastModified).toLocaleDateString('es-MX') : '—'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
