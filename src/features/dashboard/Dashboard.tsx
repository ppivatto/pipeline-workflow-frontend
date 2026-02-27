import { Activity, Users, FileBarChart, XCircle } from 'lucide-react';

export default function Dashboard() {
  const stats = [
    { label: 'Cuentas Activas', value: '—', icon: <Users size={20} />, color: '#3b82f6' },
    { label: 'Casos en Negociación', value: '—', icon: <Activity size={20} />, color: '#f59e0b' },
    { label: 'Casos Cancelados', value: '—', icon: <XCircle size={20} />, color: '#ef4444' },
    { label: 'Casos Emitidos', value: '—', icon: <FileBarChart size={20} />, color: '#8b5cf6' },
  ];

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

      <div className="card glass" style={{ padding: '2rem', textAlign: 'center' }}>
        <Activity size={48} style={{ color: 'var(--primary)', opacity: 0.3, marginBottom: '1rem' }} />
        <h3 style={{ color: 'var(--text-main)', marginBottom: '0.5rem' }}>Dashboard en construcción</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Los gráficos y KPIs se conectarán automáticamente cuando los datos de producción estén disponibles.
        </p>
      </div>
    </div>
  );
}
