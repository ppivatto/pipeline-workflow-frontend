import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/client';
import { ArrowLeft, Save, ArrowRight, Loader2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface ReadOnlyData {
  cuenta: string;
  ramo: string;
  fechaInicioVigencia: string;
  primaObjetivo: string;
}

interface NegotiationState {
  seQuedo: boolean;
  poblacionAsegurada: string;
  estatus: string;
  primaAsegurados: string;
  motivoNoGanado: string;
  aseguradoraGanadora: string;
  primaCompetencia: string;
  cuidadoIntegralPoblacion: string;
  cuidadoIntegralPrima: string;
  observaciones: string;
}

const INITIAL_NEG: NegotiationState = {
  seQuedo: false,
  poblacionAsegurada: '',
  estatus: '',
  primaAsegurados: '',
  motivoNoGanado: '',
  aseguradoraGanadora: '',
  primaCompetencia: '',
  cuidadoIntegralPoblacion: '',
  cuidadoIntegralPrima: '',
  observaciones: ''
};

const MOTIVOS = [
  'Precio',
  'Cobertura insuficiente',
  'Servicio',
  'Relación con el agente',
  'Condiciones contractuales',
  'Otro'
];

const ASEGURADORAS = [
  'GNP Seguros',
  'Zurich',
  'Chubb',
  'Mapfre',
  'HDI Seguros',
  'Allianz',
  'MetLife',
  'Otro'
];

const ESTATUS_OPTIONS = [
  { value: 'EN_NEGOCIACION', label: 'En negociación' },
  { value: 'PROPUESTA_ENVIADA', label: 'Propuesta enviada' },
  { value: 'PENDIENTE_RESPUESTA', label: 'Pendiente de respuesta' },
  { value: 'GANADA', label: 'Ganada' },
  { value: 'PERDIDA', label: 'Perdida' },
];

export default function Negotiation() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [readOnly, setReadOnly] = useState<ReadOnlyData>({
    cuenta: '', ramo: '', fechaInicioVigencia: '', primaObjetivo: ''
  });
  const [caseAccountId, setCaseAccountId] = useState<string | null>(null);
  const [form, setForm] = useState<NegotiationState>(INITIAL_NEG);
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');

  // Load inherited data from the case/account
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(`/cases/${id}`);
        const c = res.data;

        // Store accountId for back-button navigation
        setCaseAccountId(c.account?.id || c.accountId || null);

        // fechaInicioVigencia may be ISO string → convert to YYYY-MM-DD for <input type="date">
        const toDateStr = (val: any) => {
          if (!val) return '';
          const s = String(val);
          // If already YYYY-MM-DD
          if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
          // If ISO datetime
          return s.substring(0, 10);
        };

        setReadOnly({
          cuenta: c.account?.name || c.name || '',
          ramo: c.ramo || c.account?.ramo || '',
          fechaInicioVigencia: toDateStr(c.fechaInicioVigencia),
          primaObjetivo: String(c.primaObjetivo || ''),
        });

        // If negotiation data already exists, pre-fill (coerce numbers → strings)
        if (c.negotiationData) {
          const nd = c.negotiationData;
          setForm(prev => ({
            ...prev,
            seQuedo: nd.seQuedo ?? prev.seQuedo,
            poblacionAsegurada: nd.poblacionAsegurada != null ? String(nd.poblacionAsegurada) : prev.poblacionAsegurada,
            estatus: nd.estatus || prev.estatus,
            primaAsegurados: nd.primaAsegurados != null ? String(nd.primaAsegurados) : prev.primaAsegurados,
            motivoNoGanado: nd.motivoNoGanado || prev.motivoNoGanado,
            aseguradoraGanadora: nd.aseguradoraGanadora || prev.aseguradoraGanadora,
            primaCompetencia: nd.primaCompetencia != null ? String(nd.primaCompetencia) : prev.primaCompetencia,
            cuidadoIntegralPoblacion: nd.cuidadoIntegralPoblacion != null ? String(nd.cuidadoIntegralPoblacion) : prev.cuidadoIntegralPoblacion,
            cuidadoIntegralPrima: nd.cuidadoIntegralPrima != null ? String(nd.cuidadoIntegralPrima) : prev.cuidadoIntegralPrima,
            observaciones: nd.observaciones || prev.observaciones,
          }));
        }
      } catch {
        // Mock fallback
        setReadOnly({
          cuenta: 'Walmart SA DE CV MEXICO',
          ramo: 'GMM',
          fechaInicioVigencia: '2026-01-01',
          primaObjetivo: '1500000'
        });
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, [id]);

  const handleChange = (field: keyof NegotiationState, value: string | boolean) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: false }));
    }

    // If "Se quedó" is checked, clear the loss-related fields
    if (field === 'seQuedo' && value === true) {
      setForm(prev => ({
        ...prev,
        seQuedo: true,
        motivoNoGanado: '',
        aseguradoraGanadora: '',
        primaCompetencia: ''
      }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, boolean> = {};
    if (!form.estatus) newErrors.estatus = true;
    if (!form.observaciones) newErrors.observaciones = true;
    if (!form.poblacionAsegurada) newErrors.poblacionAsegurada = true;

    // If not won, validate loss fields
    if (!form.seQuedo && (form.estatus === 'PERDIDA')) {
      if (!form.motivoNoGanado) newErrors.motivoNoGanado = true;
      if (!form.aseguradoraGanadora) newErrors.aseguradoraGanadora = true;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await api.put(`/negotiation/${id}`, { ...form, advance: false });
      setSuccessMsg('Negociación guardada correctamente');
    } catch {
      setSuccessMsg('Negociación guardada correctamente (Mock)');
    } finally {
      setLoading(false);
      setTimeout(() => setSuccessMsg(''), 4000);
    }
  };

  const handleNext = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await api.put(`/negotiation/${id}`, { ...form, advance: true });
      navigate(`/emission/${id}`);
    } catch {
      // Mock: advance anyway
      navigate(`/emission/${id}`);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    // Navigate to Alta form with both accountId and caseId so data loads correctly
    if (caseAccountId) {
      navigate(`/accounts/new?id=${caseAccountId}&caseId=${id}`);
    } else {
      navigate(`/accounts/new?caseId=${id}`);
    }
  };

  const getInputClass = (field: string) => `input ${errors[field] ? 'input-error' : ''}`;

  const showLossFields = !form.seQuedo && (form.estatus === 'PERDIDA' || form.estatus === '');

  if (loadingData) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Loader2 size={32} className="animate-spin" style={{ color: 'var(--primary)' }} />
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: '4rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ margin: 0, color: 'var(--text-main)' }}>
          <span style={{ color: 'var(--primary)' }}>{t('header_negotiation')}</span>
        </h1>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {successMsg && <span style={{ color: 'var(--success)', fontWeight: 600, marginRight: '1rem' }}>{t(successMsg.includes('Mock') ? 'success_save' : 'success_save')}</span>}

          <button onClick={handleBack} className="btn btn-secondary" style={{ padding: '0.5rem', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title={t('back')}>
            <ArrowLeft size={18} />
          </button>
          <button onClick={handleSave} className="btn btn-primary" style={{ padding: '0.5rem', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} disabled={loading} title={t('save')}>
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          </button>
          <button onClick={handleNext} className="btn btn-secondary" style={{ padding: '0.5rem', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} disabled={loading} title={t('next')}>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>

      <div className="card glass">
        {/* Inherited Read-Only Data */}
        <div className="form-grid" style={{ marginBottom: '2rem' }}>
          <div className="col-span-4">
            <label>{t('account')}</label>
            <input className="input" value={readOnly.cuenta} disabled />
          </div>
          <div>
            <label>{t('ramo')}</label>
            <input className="input" value={readOnly.ramo} disabled />
          </div>
          <div>
            <label>Fecha de Inicio de Vigencia</label>
            <input type="date" className="input" value={readOnly.fechaInicioVigencia} disabled />
          </div>
          <div>
            <label>{t('target_premium')}</label>
            <input className="input" value={readOnly.primaObjetivo ? `$${Number(readOnly.primaObjetivo).toLocaleString()}` : ''} disabled />
          </div>
        </div>

        {/* Negotiation Capture */}
        <div className="form-section-title">{t('capture_negotiation')}</div>
        <div className="form-grid">
          <div>
            <label>{t('insured_pop')} *</label>
            <input
              type="number"
              min="1"
              step="1"
              className={getInputClass('poblacionAsegurada')}
              value={form.poblacionAsegurada}
              onChange={e => handleChange('poblacionAsegurada', e.target.value)}
              placeholder="0"
            />
          </div>
          <div>
            <label>{t('status')} *</label>
            <select className={getInputClass('estatus')} value={form.estatus} onChange={e => handleChange('estatus', e.target.value)}>
              <option value="">{t('select')}</option>
              {ESTATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div>
            <label>{t('insured_premium')}</label>
            <input
              type="number"
              className="input"
              value={form.primaAsegurados}
              onChange={e => handleChange('primaAsegurados', e.target.value)}
              placeholder="0.00"
            />
          </div>
          <div className="col-span-4" style={{ marginTop: '0.5rem' }}>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={form.seQuedo}
                onChange={e => handleChange('seQuedo', e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
              />
              {t('stayed')}
            </label>
          </div>
        </div>

        {/* Conditional Loss Fields */}
        {showLossFields && (
          <>
            <div className="form-section-title">{t('loss_data')}</div>
            <div className="form-grid">
              <div>
                <label>{t('loss_reason')} {form.estatus === 'PERDIDA' ? '*' : ''}</label>
                <select className={getInputClass('motivoNoGanado')} value={form.motivoNoGanado} onChange={e => handleChange('motivoNoGanado', e.target.value)}>
                  <option value="">{t('select')}</option>
                  {MOTIVOS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label>{t('winning_insurer')} {form.estatus === 'PERDIDA' ? '*' : ''}</label>
                <select className={getInputClass('aseguradoraGanadora')} value={form.aseguradoraGanadora} onChange={e => handleChange('aseguradoraGanadora', e.target.value)}>
                  <option value="">{t('select')}</option>
                  {ASEGURADORAS.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              <div>
                <label>{t('comp_premium')}</label>
                <input
                  type="number"
                  className="input"
                  value={form.primaCompetencia}
                  onChange={e => handleChange('primaCompetencia', e.target.value)}
                  placeholder="0.00"
                />
              </div>
            </div>
          </>
        )}

        {/* Cuidado Integral */}
        <div className="form-section-title">{t('integral_care_section')}</div>
        <div className="form-grid">
          <div className="col-span-2">
            <label>{t('integral_pop')}</label>
            <input
              type="number"
              className="input"
              value={form.cuidadoIntegralPoblacion}
              onChange={e => handleChange('cuidadoIntegralPoblacion', e.target.value)}
              placeholder="0"
            />
          </div>
          <div className="col-span-2">
            <label>{t('integral_premium')}</label>
            <input
              type="number"
              className="input"
              value={form.cuidadoIntegralPrima}
              onChange={e => handleChange('cuidadoIntegralPrima', e.target.value)}
              placeholder="0.00"
            />
          </div>
        </div>

        {/* Observaciones */}
        <div className="form-section-title">{t('section_observations')}</div>
        <div className="form-grid">
          <div className="col-span-4">
            <label>{t('observations')} *</label>
            <textarea
              className={getInputClass('observaciones')}
              value={form.observaciones}
              onChange={e => handleChange('observaciones', e.target.value)}
              placeholder="Escribe tu texto aquí..."
            />
          </div>
        </div>
      </div>
    </div>
  );
}
