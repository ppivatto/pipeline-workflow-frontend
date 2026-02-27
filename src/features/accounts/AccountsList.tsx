import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, Loader2, FileDown, Eye, X, Calendar, Target, Briefcase, CheckCircle2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/client';
import { useLanguage } from '../../context/LanguageContext';
import { useDebounce } from '../../hooks/useDebounce';
import { exportToExcel } from '../../utils/exportToExcel';

// ─── helpers ─────────────────────────────────────────────────────────────────
const CLOSED_STATUSES = ['CERRADO', 'TERMINADO', 'CANCELADO', 'RECHAZADO'];
const STEP_LABEL: Record<string, string> = {
  ALTA: 'Alta', NEGOCIACION: 'Negociación', EMISION: 'Emisión', TERMINADO: 'Terminado',
};
const STEP_COLOR: Record<string, string> = {
  ALTA: '#3b82f6', NEGOCIACION: '#f59e0b', EMISION: '#10b981', TERMINADO: '#8b5cf6',
};
const STATUS_COLOR: Record<string, { bg: string; color: string }> = {
  ACTIVO: { bg: 'rgba(16,185,129,0.15)', color: '#10b981' },
  TERMINADO: { bg: 'rgba(139,92,246,0.15)', color: '#8b5cf6' },
  CANCELADO: { bg: 'rgba(239,68,68,0.15)', color: '#ef4444' },
  RECHAZADO: { bg: 'rgba(239,68,68,0.15)', color: '#ef4444' },
};
const fmt = (n: number) => `$${n.toLocaleString('es-MX')}`;
const fmtDate = (s: string) => s ? new Date(s).toLocaleDateString('es-MX') : '—';

// ─── Ficha modal ──────────────────────────────────────────────────────────────
function FichaModal({ accountId, onClose }: { accountId: string; onClose: () => void }) {
  const { data: account, isLoading, error } = useQuery({
    queryKey: ['account', accountId],
    queryFn: async () => {
      const res = await api.get(`/accounts/${accountId}`);
      return res.data;
    }
  });

  // These calculations depend on 'account', so they should be conditional or use optional chaining
  const cases: any[] = account?.cases || [];
  const openCases = cases.filter(c => !CLOSED_STATUSES.includes(c.status));
  const closedCases = cases.filter(c => CLOSED_STATUSES.includes(c.status));

  const byStep = ['ALTA', 'NEGOCIACION', 'EMISION', 'TERMINADO'].map(step => ({
    step,
    count: cases.filter(c => c.workflowStep === step).length,
  }));

  const recentCases = [...cases]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 4);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.55)',
          backdropFilter: 'blur(3px)',
          zIndex: 1000,
          animation: 'fadeIn 0.2s ease',
        }}
      />

      {/* Slide-over panel */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0,
        width: 'min(560px, 95vw)',
        background: 'var(--bg-sidebar)',
        borderLeft: '1px solid var(--border)',
        zIndex: 1001,
        overflowY: 'auto',
        padding: '2rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        animation: 'slideIn 0.25s ease',
      }}>
        {isLoading ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '1rem' }}>
            <Loader2 size={42} className="animate-spin" style={{ color: 'var(--primary)', opacity: 0.6 }} />
            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Cargando ficha...</span>
          </div>
        ) : error || !account ? (
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-muted)' }}>No se pudo cargar la información de la cuenta.</span>
          </div>
        ) : (
          <>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Ficha de Cuenta
                </p>
                <h2 style={{ margin: '0.25rem 0 0', fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  {account.name}
                </h2>
                <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {account.identifier} · {account.industry || '—'}
                </p>
              </div>
              <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '0.25rem' }}>
                <X size={20} />
              </button>
            </div>

            {/* Meta tags (ramo / subramo) */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {account.ramo && (
                <span style={{ padding: '3px 10px', borderRadius: 999, fontSize: '0.75rem', fontWeight: 600, background: 'rgba(59,130,246,0.12)', color: '#3b82f6' }}>
                  {account.ramo}
                </span>
              )}
              {account.subramo && (
                <span style={{ padding: '3px 10px', borderRadius: 999, fontSize: '0.75rem', fontWeight: 600, background: 'rgba(245,158,11,0.12)', color: '#f59e0b' }}>
                  {account.subramo}
                </span>
              )}
            </div>

            {/* KPI cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              {[
                { label: 'Prima Objetivo', value: account.primaObjetivo ? fmt(account.primaObjetivo) : '—', icon: <Target size={16} />, color: '#10b981' },
                { label: 'Inicio Vigencia', value: fmtDate(account.fechaInicioVigencia), icon: <Calendar size={16} />, color: '#3b82f6' },
                { label: 'Casos Activos', value: String(openCases.length), icon: <Briefcase size={16} />, color: '#f59e0b' },
                { label: 'Casos Cerrados', value: String(closedCases.length), icon: <CheckCircle2 size={16} />, color: '#8b5cf6' },
              ].map(kpi => (
                <div key={kpi.label} className="card glass" style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500 }}>{kpi.label}</span>
                    <span style={{ color: kpi.color }}>{kpi.icon}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>{kpi.value}</p>
                </div>
              ))}
            </div>

            {/* Distribución por etapa */}
            {cases.length > 0 && (
              <div>
                <p style={{ margin: '0 0 0.75rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Distribución por Etapa
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {byStep.filter(s => s.count > 0).map(s => (
                    <div key={s.step} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ fontSize: '0.8rem', width: 100, color: 'var(--text-muted)', flexShrink: 0 }}>{STEP_LABEL[s.step]}</span>
                      <div style={{ flex: 1, height: 6, background: 'var(--border)', borderRadius: 999, overflow: 'hidden' }}>
                        <div style={{
                          height: '100%',
                          width: `${Math.round((s.count / cases.length) * 100)}%`,
                          background: STEP_COLOR[s.step],
                          borderRadius: 999,
                          transition: 'width 0.4s ease',
                        }} />
                      </div>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', width: 20, textAlign: 'right' }}>{s.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Últimos casos */}
            {recentCases.length > 0 && (
              <div>
                <p style={{ margin: '0 0 0.75rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Últimos Casos
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {recentCases.map((c: any) => {
                    const sc = STATUS_COLOR[c.status] || { bg: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)' };
                    return (
                      <div key={c.id} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '0.6rem 0.875rem',
                        borderRadius: 8,
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid var(--border)',
                      }}>
                        <div>
                          <p style={{ margin: 0, fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)' }}>{c.refnum}</p>
                          <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            {STEP_LABEL[c.workflowStep] || c.workflowStep} · {fmtDate(c.updatedAt)}
                          </p>
                        </div>
                        <span style={{ padding: '2px 10px', borderRadius: 999, fontSize: '0.72rem', fontWeight: 700, background: sc.bg, color: sc.color }}>
                          {c.status}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {cases.length === 0 && (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', margin: 'auto' }}>
                Esta cuenta aún no tiene casos registrados.
              </p>
            )}
          </>
        )}
      </div>

      <style>{`
        @keyframes fadeIn  { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideIn { from { transform: translateX(100%) } to { transform: translateX(0) } }
      `}</style>
    </>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function AccountsList() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [fichaAccountId, setFichaAccountId] = useState<string | null>(null);

  const { data: accounts = [], isLoading } = useQuery({
    queryKey: ['accounts', debouncedSearchTerm],
    queryFn: async () => {
      const endpoint = debouncedSearchTerm ? `/accounts/search?q=${debouncedSearchTerm}` : '/accounts';
      const res = await api.get(endpoint);
      return res.data;
    }
  });

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div>
      {/* Ficha slide-over */}
      {fichaAccountId && <FichaModal accountId={fichaAccountId} onClose={() => setFichaAccountId(null)} />}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ margin: 0, fontSize: '1.875rem', fontWeight: 700, color: 'var(--text-main)' }}>
          {t('header_accounts')}
        </h1>
      </div>

      <div className="card glass" style={{ marginBottom: '2rem', padding: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ flex: '0 1 500px', position: 'relative' }}>
          <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder={t('search_placeholder')}
            className="input"
            style={{ marginBottom: 0, paddingLeft: '3rem' }}
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link to="/accounts/new" className="btn btn-primary" style={{ whiteSpace: 'nowrap', textDecoration: 'none' }}>
            <Plus size={20} /> {t('create_account')}
          </Link>
          <button
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap', fontSize: '0.85rem' }}
            onClick={() => exportToExcel(
              (accounts as any[]).map((a) => ({
                Nombre: a.name,
                Identificador: a.identifier || '',
                'Casos abiertos': a._count?.cases ?? 0,
              })),
              'cuentas'
            )}
          >
            <FileDown size={16} /> Exportar Excel
          </button>
        </div>
      </div>

      <div className="card glass" style={{ padding: 0, overflow: 'hidden', minHeight: '200px' }}>
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
            <Loader2 size={32} className="animate-spin" style={{ color: 'var(--primary)' }} />
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)', background: 'var(--header-bg)' }}>
                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Nombre/Razón social</th>
                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>{t('identifier')}</th>
                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', width: 80, textAlign: 'center' }}>Ficha</th>
              </tr>
            </thead>
            <tbody>
              {(accounts as any[]).map((account: any) => {
                const openCases = account._count?.cases ?? 0;
                return (
                  <tr
                    key={account.id}
                    style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-main)', transition: 'all 0.2s' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <td
                      style={{ padding: '1rem', fontWeight: 500, cursor: 'pointer' }}
                      onClick={() => navigate(`/seguimiento/${account.id}`)}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        {account.name}
                        {openCases > 0 && (
                          <span style={{
                            fontSize: '0.7rem', fontWeight: 700,
                            background: 'var(--primary)', color: '#fff',
                            borderRadius: '999px', padding: '1px 8px', lineHeight: '1.6', whiteSpace: 'nowrap',
                          }}>
                            {openCases} caso{openCases !== 1 ? 's' : ''}
                          </span>
                        )}
                      </span>
                    </td>
                    <td
                      style={{ padding: '1rem', color: 'var(--text-muted)', cursor: 'pointer' }}
                      onClick={() => navigate(`/seguimiento/${account.id}`)}
                    >
                      {account.identifier}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                      <button
                        title="Ver ficha de cuenta"
                        className="btn btn-secondary"
                        style={{ padding: '0.35rem 0.6rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem' }}
                        onClick={(e) => { e.stopPropagation(); setFichaAccountId(account.id); }}
                      >
                        <Eye size={14} /> Ficha
                      </button>
                    </td>
                  </tr>
                );
              })}
              {accounts.length === 0 && (
                <tr>
                  <td colSpan={3} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    {t('no_accounts')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
