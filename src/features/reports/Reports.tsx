import { BarChart3, FileText, TrendingUp, PieChart } from 'lucide-react';

export default function Reports() {
  const reportCards = [
    { title: 'Reporte de Cuentas', desc: 'Listado general de cuentas con filtros avanzados', icon: <FileText size={24} />, color: '#3b82f6' },
    { title: 'Reporte de Producción', desc: 'Primas cotizadas vs emitidas por período', icon: <TrendingUp size={24} />, color: '#10b981' },
    { title: 'Reporte por Ramo', desc: 'Distribución de casos por ramo y subramo', icon: <PieChart size={24} />, color: '#f59e0b' },
    { title: 'Reporte de Agentes', desc: 'Rendimiento y producción por agente', icon: <BarChart3 size={24} />, color: '#8b5cf6' },
  ];

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
            <div style={{ marginTop: '1rem', padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', border: '1px dashed var(--border)' }}>
              Proximamente
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
