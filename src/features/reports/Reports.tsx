import { useState } from 'react';
import { BarChart3, FileText, TrendingUp, PieChart, Loader2, Search, FileDown, Eye } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/client';
import { exportToExcel } from '../../utils/exportToExcel';
import FichaCaso from '../../components/FichaCaso';
import { useLanguage } from '../../context/LanguageContext';

import { fmtMoney } from '../../utils/moneyFormat';

const fmtDate = (s: any) => s ? new Date(String(s)).toLocaleDateString('es-MX') : '—';

const STEP_STYLE: Record<string, { bg: string; color: string }> = {
  ALTA: { bg: 'rgba(59,130,246,0.15)', color: '#3b82f6' },
  NEGOCIACION: { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b' },
  EMISION: { bg: 'rgba(16,185,129,0.15)', color: '#10b981' },
  TERMINADO: { bg: 'rgba(139,92,246,0.15)', color: '#8b5cf6' },
};
const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  ACTIVO: { bg: 'rgba(16,185,129,0.15)', color: '#10b981' },
  TERMINADO: { bg: 'rgba(139,92,246,0.15)', color: '#8b5cf6' },
  CANCELADO: { bg: 'rgba(239,68,68,0.15)', color: '#ef4444' },
  RECHAZADO: { bg: 'rgba(239,68,68,0.15)', color: '#ef4444' },
};

export default function Reports() {
  const [tab, setTab] = useState<'summary' | 'raw'>('summary');
  const [searchTerm, setSearchTerm] = useState('');
  const [fichaCaseId, setFichaCaseId] = useState<string | null>(null);
  const { t } = useLanguage();

  const { data: reportData, isLoading: loadingSummary } = useQuery({
    queryKey: ['reports-data'],
    queryFn: async () => {
      const res = await api.get('/reports/data');
      return res.data;
    },
    staleTime: 60_000,
  });

  const { data: rawCases = [], isLoading: loadingRaw } = useQuery<any[]>({
    queryKey: ['reports-raw'],
    queryFn: async () => {
      const res = await api.get('/reports/raw');
      return res.data;
    },
    staleTime: 30_000,
    enabled: tab === 'raw',
  });

  const fmt = (n: number) => fmtMoney(n);

  const reportCards = [
    { title: t('reports_accounts'), desc: t('reports_accounts_desc'), icon: <FileText size={24} />, color: '#3b82f6', value: reportData?.totalAccounts ?? '—' },
    { title: t('reports_production'), desc: t('reports_production_desc'), icon: <TrendingUp size={24} />, color: '#10b981', value: reportData?.totalPrimaObjetivo ? fmt(reportData.totalPrimaObjetivo) : '—' },
    { title: t('reports_ramo'), desc: t('reports_ramo_desc'), icon: <PieChart size={24} />, color: '#f59e0b', value: `${reportData?.activeCases ?? '—'} activos | ${reportData?.closedCases ?? '—'} cerrados` },
    { title: t('reports_agents'), desc: t('reports_agents_desc'), icon: <BarChart3 size={24} />, color: '#8b5cf6', value: '1 Agente Activo' },
  ];

  const term = searchTerm.toLowerCase();
  const filtered = rawCases.filter((c: any) =>
    (c.refnum || '').toLowerCase().includes(term) ||
    (c.account?.name || '').toLowerCase().includes(term) ||
    (c.ramo || '').toLowerCase().includes(term) ||
    (c.status || '').toLowerCase().includes(term) ||
    (c.workflowStep || '').toLowerCase().includes(term)
  );

  return (
    <div>
      {fichaCaseId && <FichaCaso caseId={fichaCaseId} onClose={() => setFichaCaseId(null)} />}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ margin: 0, color: 'var(--text-main)' }}>
          <span style={{ color: 'var(--primary)' }}>{t('header_reports')}</span>
        </h1>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {[
          { key: 'summary', label: t('reports_summary') },
          { key: 'raw', label: t('reports_raw') },
        ].map(tb => (
          <button
            key={tb.key}
            onClick={() => setTab(tb.key as any)}
            className={tab === tb.key ? 'btn btn-primary' : 'btn btn-secondary'}
            style={{ fontSize: '0.85rem', padding: '0.5rem 1.25rem' }}
          >
            {tb.label}
          </button>
        ))}
      </div>

      {/* Summary Tab */}
      {tab === 'summary' && (
        loadingSummary ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
            <Loader2 size={32} className="animate-spin" style={{ color: 'var(--primary)' }} />
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {reportCards.map((r, i) => (
              <div key={i} className="card glass" style={{ padding: '1.5rem', cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: `${r.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: r.color }}>
                    {r.icon}
                  </div>
                  <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-main)' }}>{r.title}</h3>
                </div>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>{r.desc}</p>
                <div style={{ marginTop: '1rem', padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', textAlign: 'center', fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)', border: '1px dashed var(--border)' }}>
                  {r.value}
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Raw / Consulta de Folios Tab */}
      {tab === 'raw' && (
        <div className="card glass" style={{ padding: 0, overflow: 'hidden' }}>
          {/* Search + Export */}
          <div style={{ padding: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
              <input
                type="text"
                placeholder={t('search_hint_3')}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="input"
                style={{ marginBottom: 0, paddingLeft: '3rem' }}
              />
            </div>
            <button
              className="btn btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', whiteSpace: 'nowrap' }}
              onClick={() => exportToExcel(
                filtered.map((c: any) => ({
                  Folio: c.refnum,
                  Cuenta: c.account?.name || '',
                  Ramo: c.ramo || '',
                  Etapa: c.workflowStep,
                  Estado: c.status,
                  'Prima Objetivo': c.account?.primaObjetivo || '',
                  'Prima Cotizada': (c.data as any)?.primaCotizada || '',
                  'Inicio Vigencia': (c.data as any)?.fechaInicioVigencia || '',
                  'Última modificación': c.lastModified ? fmtDate(c.lastModified) : '',
                })),
                'reporte-folios'
              )}
            >
              <FileDown size={16} /> {t('export_excel')}
            </button>
          </div>

          {/* Table */}
          <div style={{ overflowX: 'auto' }}>
            {loadingRaw ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                <Loader2 size={32} className="animate-spin" style={{ color: 'var(--primary)' }} />
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
                <thead>
                  <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)', background: 'var(--header-bg)' }}>
                    {['Folio', t('account'), t('ramo'), t('stage'), t('status'), t('col_target_premium'), t('col_quoted_premium'), t('col_last_modified'), t('ficha')].map(h => (
                      <th key={h} style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)', fontSize: '0.72rem', textTransform: 'uppercase', ...(h === t('ficha') ? { width: 80, textAlign: 'center' as const } : {}) }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length > 0 ? (
                    filtered.map((c: any) => {
                      const ss = STEP_STYLE[c.workflowStep] || { bg: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)' };
                      const stc = STATUS_STYLE[c.status] || { bg: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)' };
                      return (
                        <tr key={c.id} style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-main)' }}>
                          <td style={{ padding: '0.75rem 1rem', fontWeight: 600, fontSize: '0.85rem' }}>{c.refnum}</td>
                          <td style={{ padding: '0.75rem 1rem', fontSize: '0.85rem' }}>{c.account?.name || '—'}</td>
                          <td style={{ padding: '0.75rem 1rem' }}>
                            <span className="badge">{c.ramo || '—'}</span>
                          </td>
                          <td style={{ padding: '0.75rem 1rem' }}>
                            <span style={{ padding: '2px 10px', borderRadius: 12, fontSize: '0.72rem', fontWeight: 600, background: ss.bg, color: ss.color }}>
                              {c.workflowStep}
                            </span>
                          </td>
                          <td style={{ padding: '0.75rem 1rem' }}>
                            <span style={{ padding: '2px 10px', borderRadius: 12, fontSize: '0.72rem', fontWeight: 600, background: stc.bg, color: stc.color }}>
                              {c.status}
                            </span>
                          </td>
                          <td style={{ padding: '0.75rem 1rem', fontSize: '0.85rem' }}>{fmtMoney(c.account?.primaObjetivo)}</td>
                          <td style={{ padding: '0.75rem 1rem', fontSize: '0.85rem' }}>{fmtMoney((c.data as any)?.primaCotizada)}</td>
                          <td style={{ padding: '0.75rem 1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{fmtDate(c.lastModified)}</td>
                          <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                            <button
                              title={t('ficha_view_case')}
                              className="btn btn-secondary"
                              style={{ padding: '0.35rem 0.6rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem' }}
                              onClick={() => setFichaCaseId(c.id)}
                            >
                              <Eye size={14} /> {t('ficha')}
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={9} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        {t('reports_no_results')}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>

          {/* Count */}
          <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
            {filtered.length} {filtered.length !== 1 ? t('reports_records') : t('reports_record')}
          </div>
        </div>
      )}
    </div>
  );
}
