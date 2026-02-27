import { Activity, Users, FileBarChart, XCircle, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/client';

export default function Dashboard() {
  const { data: statsData, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const res = await api.get('/dashboard/stats');
      return res.data;
    }
  });

  const stats = [
    { label: 'Cuentas Activas', value: statsData?.activeAccounts ?? '—', icon: <Users size={20} />, color: '#3b82f6' },
    { label: 'Casos en Negociación', value: statsData?.negotiationCases ?? '—', icon: <Activity size={20} />, color: '#f59e0b' },
    { label: 'Casos Cancelados', value: statsData?.cancelledCases ?? '—', icon: <XCircle size={20} />, color: '#ef4444' },
    { label: 'Casos Emitidos', value: statsData?.emittedCases ?? '—', icon: <FileBarChart size={20} />, color: '#8b5cf6' },
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
        <span style={{ color: 'var(--primary)' }}>Dashboard</span>
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {stats.map((s, i) => (
          <div key={i} className="card glass" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>{s.label}</span>
              <div style={{ color: s.color }}>{s.icon}</div>
            </div>
            <p style={{ margin: 0, fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-main)' }}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="card glass" style={{ padding: '2rem' }}>
        <h3 style={{ margin: '0 0 1rem', color: 'var(--text-main)', fontSize: '1.1rem' }}>Distribución por Ramo</h3>
        {statsData?.countsByRamo?.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {statsData.countsByRamo.map((c: any) => {
              const max = Math.max(...statsData.countsByRamo.map((r: any) => r._count.ramo));
              const pct = Math.round((c._count.ramo / max) * 100);
              return (
                <div key={c.ramo || 'Sin Ramo'} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ minWidth: '120px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{c.ramo || 'Sin Ramo'}</span>
                  <div style={{ flex: 1, padding: '2px 0' }}>
                    <div style={{ height: '8px', background: 'var(--bg-main)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: 'var(--primary)', borderRadius: '4px', transition: 'width 0.5s ease-in-out' }} />
                    </div>
                  </div>
                  <span style={{ minWidth: '30px', textAlign: 'right', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)' }}>
                    {c._count.ramo}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', margin: '2rem 0' }}>No hay datos suficientes para mostrar estadísticas de ramos.</p>
        )}
      </div>
    </div>
  );
}
