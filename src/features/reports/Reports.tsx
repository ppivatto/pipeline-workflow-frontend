import { BarChart3, FileText, TrendingUp, PieChart, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/client';

export default function Reports() {
  const { data: reportData, isLoading } = useQuery({
    queryKey: ['reports-data'],
    queryFn: async () => {
      const res = await api.get('/reports/data');
      return res.data;
    }
  });

  const fmt = (n: number) => `$${n.toLocaleString('es-MX')}`;

  const reportCards = [
    { title: 'Reporte de Cuentas', desc: 'Resumen global de cuentas registradas', icon: <FileText size={24} />, color: '#3b82f6', value: reportData?.totalAccounts ?? '—' },
    { title: 'Reporte de Producción', desc: 'Producción prospectada total (Prima)', icon: <TrendingUp size={24} />, color: '#10b981', value: reportData?.totalPrimaObjetivo ? fmt(reportData.totalPrimaObjetivo) : '—' },
    { title: 'Reporte por Ramo', desc: 'Casos activos vs emitidos', icon: <PieChart size={24} />, color: '#f59e0b', value: `${reportData?.activeCases ?? '—'} activos | ${reportData?.closedCases ?? '—'} cerrados` },
    { title: 'Reporte de Agentes', desc: 'Rendimiento y producción por agente', icon: <BarChart3 size={24} />, color: '#8b5cf6', value: '1 Agente Activo' },
  ];

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Loader2 size={32} className="animate-spin" style={{ color: 'var(--primary)' }} />
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ margin: '0 0 2rem', color: 'var(--text-main)' }}>
        <span style={{ color: 'var(--primary)' }}>Reportes</span>
      </h1>

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
    </div>
  );
}
