import { useQuery } from '@tanstack/react-query';
import api from '../api/client';
import { Loader2, X, Calendar, Target, DollarSign, Activity, User, FileText, MapPin, Shield } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { fmtMoney as fmt } from '../utils/moneyFormat';

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
const fmtDate = (s: any) => s ? new Date(String(s)).toLocaleDateString('es-MX') : '—';

interface InfoRowProps {
  label: string;
  value: string | undefined | null;
  icon?: React.ReactNode;
}
function InfoRow({ label, value, icon }: InfoRowProps) {
  if (!value) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.35rem 0' }}>
      {icon && <span style={{ color: 'var(--text-muted)', flexShrink: 0 }}>{icon}</span>}
      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', minWidth: 110, flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: '0.82rem', color: 'var(--text-main)', fontWeight: 500 }}>{value}</span>
    </div>
  );
}

export default function FichaCaso({ caseId, onClose }: { caseId: string; onClose: () => void }) {
  const { t } = useLanguage();
  const { data: caso, isLoading, error } = useQuery({
    queryKey: ['case-ficha', caseId],
    queryFn: async () => {
      const res = await api.get(`/cases/${caseId}`);
      return res.data;
    }
  });

  const stepColor = caso ? STEP_COLOR[caso.workflowStep] || '#6b7280' : '#6b7280';
  const sc = caso ? STATUS_COLOR[caso.status] || { bg: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)' } : { bg: '', color: '' };

  return (
    <>
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
            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{t('ficha_loading')}</span>
          </div>
        ) : error || !caso ? (
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-muted)' }}>{t('ficha_error_case')}</span>
          </div>
        ) : (
          <>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  {t('ficha_caso')}
                </p>
                <h2 style={{ margin: '0.25rem 0 0', fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  {caso.refnum}
                </h2>
                <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {caso.account?.name || caso.name || '—'}
                </p>
              </div>
              <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '0.25rem' }}>
                <X size={20} />
              </button>
            </div>

            {/* Tags: Ramo + Subramo + Etapa */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {caso.ramo && (
                <span style={{ padding: '3px 10px', borderRadius: 999, fontSize: '0.75rem', fontWeight: 600, background: 'rgba(59,130,246,0.12)', color: '#3b82f6' }}>
                  {caso.ramo}
                </span>
              )}
              {caso.subramo && (
                <span style={{ padding: '3px 10px', borderRadius: 999, fontSize: '0.75rem', fontWeight: 600, background: 'rgba(245,158,11,0.12)', color: '#f59e0b' }}>
                  {caso.subramo}
                </span>
              )}
              <span style={{ padding: '3px 10px', borderRadius: 999, fontSize: '0.75rem', fontWeight: 600, background: `${stepColor}22`, color: stepColor }}>
                {STEP_LABEL[caso.workflowStep] || caso.workflowStep}
              </span>
              <span style={{ padding: '3px 10px', borderRadius: 999, fontSize: '0.75rem', fontWeight: 700, background: sc.bg, color: sc.color }}>
                {caso.status}
              </span>
            </div>

            {/* KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              {[
                { label: t('target_premium'), value: fmt(caso.primaObjetivo), icon: <Target size={16} />, color: '#10b981' },
                { label: t('quoted_premium'), value: fmt(caso.primaCotizada), icon: <DollarSign size={16} />, color: '#f59e0b' },
                { label: t('start_date'), value: fmtDate(caso.fechaInicioVigencia), icon: <Calendar size={16} />, color: '#3b82f6' },
                { label: t('stage'), value: caso.etapa || '—', icon: <Activity size={16} />, color: '#8b5cf6' },
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

            {/* Datos del caso */}
            <div>
              <p style={{ margin: '0 0 0.5rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {t('ficha_case_data')}
              </p>
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 8, padding: '0.75rem 1rem' }}>
                <InfoRow label="Clave Agente" value={caso.claveAgente} icon={<User size={14} />} />
                <InfoRow label="Nombre Agente" value={caso.nombreAgente} icon={<User size={14} />} />
                <InfoRow label="Giro Negocio" value={caso.giroNegocio} icon={<MapPin size={14} />} />
                <InfoRow label="Tipo Experiencia" value={caso.tipoExperiencia} icon={<FileText size={14} />} />
                <InfoRow label="Nearshoring" value={caso.nearshoring} icon={<Shield size={14} />} />
                <InfoRow label="Cuidado Integral" value={caso.cuidadoIntegral} icon={<Shield size={14} />} />
                <InfoRow label="Plan" value={caso.plan} icon={<FileText size={14} />} />
                <InfoRow label="Planmed" value={caso.cuentaConPlanmed} icon={<Shield size={14} />} />
                <InfoRow label="Tipo Planmed" value={caso.tipoPlanMed} icon={<FileText size={14} />} />
                <InfoRow label="Promotor" value={caso.promotor} icon={<User size={14} />} />
                <InfoRow label="Territorio" value={caso.territorio} icon={<MapPin size={14} />} />
                <InfoRow label="Oficina" value={caso.oficina} icon={<MapPin size={14} />} />
                <InfoRow label="Resp. Suscripción" value={caso.responsableSuscripcion} icon={<User size={14} />} />
              </div>
            </div>

            {/* Observaciones */}
            {caso.observaciones && (
              <div>
                <p style={{ margin: '0 0 0.5rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {t('observations')}
                </p>
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 8, padding: '0.75rem 1rem' }}>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: 1.5 }}>{caso.observaciones}</p>
                </div>
              </div>
            )}

            {/* Negociación  */}
            {caso.negotiationData && (
              <div>
                <p style={{ margin: '0 0 0.5rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {t('negotiation')}
                </p>
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 8, padding: '0.75rem 1rem' }}>
                  <InfoRow label="Estatus" value={caso.negotiationData.estatus} icon={<Activity size={14} />} />
                  <InfoRow label="Población" value={caso.negotiationData.poblacionAsegurada?.toString()} icon={<User size={14} />} />
                  <InfoRow label="Se quedó" value={caso.negotiationData.seQuedo ? 'Sí' : caso.negotiationData.seQuedo === false ? 'No' : undefined} icon={<Shield size={14} />} />
                  <InfoRow label="Motivo" value={caso.negotiationData.motivoNoGanado} icon={<FileText size={14} />} />
                  <InfoRow label="Aseg. Ganadora" value={caso.negotiationData.aseguradoraGanadora} icon={<Shield size={14} />} />
                  {caso.negotiationData.observaciones && (
                    <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border)' }}>
                      <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>Observaciones:</p>
                      <p style={{ margin: '0.2rem 0 0', fontSize: '0.82rem', color: 'var(--text-main)', lineHeight: 1.4 }}>{caso.negotiationData.observaciones}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Emisión */}
            {caso.emissionData && (
              <div>
                <p style={{ margin: '0 0 0.5rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {t('emission')}
                </p>
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 8, padding: '0.75rem 1rem' }}>
                  <InfoRow label="Póliza" value={caso.emissionData.poliza} icon={<FileText size={14} />} />
                  <InfoRow label="Fecha Emisión" value={fmtDate(caso.emissionData.fechaEmision)} icon={<Calendar size={14} />} />
                  <InfoRow label="# Pólizas" value={caso.emissionData.numPolizas?.toString()} icon={<FileText size={14} />} />
                  <InfoRow label="Pob. Emitida" value={caso.emissionData.poblacionEmitida?.toString()} icon={<User size={14} />} />
                  {caso.emissionData.observaciones && (
                    <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border)' }}>
                      <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>Observaciones:</p>
                      <p style={{ margin: '0.2rem 0 0', fontSize: '0.82rem', color: 'var(--text-main)', lineHeight: 1.4 }}>{caso.emissionData.observaciones}</p>
                    </div>
                  )}
                </div>
              </div>
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
