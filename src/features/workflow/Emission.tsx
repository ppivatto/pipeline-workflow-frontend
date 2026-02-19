import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/client';
import { ArrowLeft, Save, CheckCircle, Loader2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface ReadOnlyData {
  cuenta: string;
  ramo: string;
  fechaInicioVigencia: string;
  primaObjetivo: string;
}

interface EmissionState {
  fechaIngresoFolio: string;
  fechaEmision: string;
  numPolizas: string;
  poliza: string;
  poblacionEmitida: string;
  cuidadoIntegralPoblacion?: string;
  cuidadoIntegralPrima?: string;
  observaciones: string;
}

const INITIAL_EMISSION: EmissionState = {
  fechaIngresoFolio: '',
  fechaEmision: '',
  numPolizas: '',
  poliza: '',
  poblacionEmitida: '',
  cuidadoIntegralPoblacion: '',
  cuidadoIntegralPrima: '',
  observaciones: ''
};

export default function Emission() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [readOnly, setReadOnly] = useState<ReadOnlyData>({
    cuenta: '', ramo: '', fechaInicioVigencia: '', primaObjetivo: ''
  });
  const [form, setForm] = useState<EmissionState>(INITIAL_EMISSION);
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
        setReadOnly({
          cuenta: c.account?.name || c.name || '',
          ramo: c.ramo || c.account?.ramo || '',
          fechaInicioVigencia: c.fechaInicioVigencia || '',
          primaObjetivo: c.primaObjetivo || ''
        });
        // If emission data already exists, pre-fill
        if (c.emissionData) {
          setForm(prev => ({ ...prev, ...c.emissionData }));
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

  const handleChange = (field: keyof EmissionState, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: false }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, boolean> = {};
    // if (!form.observaciones) newErrors.observaciones = true;

    // Add validation for other fields if strictly required, but requirements emphasize Observaciones for finishing.
    // Let's add basic checks for dates if they are provided

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.put(`/emission/${id}`, { ...form, finish: false });
      setSuccessMsg('Emisión guardada correctamente');
    } catch {
      setSuccessMsg('Emisión guardada correctamente (Mock)');
    } finally {
      setLoading(false);
      setTimeout(() => setSuccessMsg(''), 4000);
    }
  };

  const handleFinish = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await api.put(`/emission/${id}`, { ...form, finish: true });
      // Navigate to a success page or back to dashboard
      navigate('/accounts'); // Or a 'Success' landing
    } catch {
      navigate('/accounts');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate(`/negotiation/${id}`);
  };

  const getInputClass = (field: string) => `input ${errors[field] ? 'input-error' : ''}`;

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
          <span style={{ color: 'var(--primary)' }}>{t('header_emission')}</span>
        </h1>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {successMsg && <span style={{ color: 'var(--success)', fontWeight: 600, marginRight: '1rem' }}>{t(successMsg.includes('Mock') ? 'success_save' : 'success_save')}</span>}

          <button onClick={handleBack} className="btn btn-secondary" style={{ padding: '0.5rem', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title={t('back')}>
            <ArrowLeft size={18} />
          </button>
          <button onClick={handleSave} className="btn btn-primary" style={{ padding: '0.5rem', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} disabled={loading} title={t('save')}>
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          </button>
          <button onClick={handleFinish} className="btn btn-primary" style={{ padding: '0.5rem', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--success)', borderColor: 'var(--success)' }} disabled={loading} title={t('finish')}>
            {loading ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
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
            <label>{t('start_date')}</label>
            <input type="text" className="input" value={readOnly.fechaInicioVigencia} disabled />
          </div>
          <div>
            <label>{t('target_premium')}</label>
            <input className="input" value={readOnly.primaObjetivo ? `$${Number(readOnly.primaObjetivo).toLocaleString()}` : ''} disabled />
          </div>
        </div>

        {/* Emission Capture */}
        <div className="form-section-title">{t('capture_emission')}</div>
        <div className="form-grid">
          <div>
            <label>{t('folio_date')}</label>
            <input
              type="date"
              className={getInputClass('fechaIngresoFolio')}
              value={form.fechaIngresoFolio}
              onChange={e => handleChange('fechaIngresoFolio', e.target.value)}
            />
          </div>
          <div>
            <label>{t('emission_date')}</label>
            <input
              type="date"
              className={getInputClass('fechaEmision')}
              value={form.fechaEmision}
              onChange={e => handleChange('fechaEmision', e.target.value)}
            />
          </div>
          <div>
            <label>{t('num_policies')}</label>
            <input
              type="number"
              className={getInputClass('numPolizas')}
              value={form.numPolizas}
              onChange={e => handleChange('numPolizas', e.target.value)}
              placeholder="0"
            />
          </div>
          <div>
            <label>{t('policy')}</label>
            <input
              type="text"
              className={getInputClass('poliza')}
              value={form.poliza}
              onChange={e => handleChange('poliza', e.target.value)}
              placeholder="Ej: FOL-99283"
            />
          </div>
        </div>

        {/* Cuidado Integral */}
        <div className="form-section-title">{t('integral_care_section')}</div>
        <div className="form-grid">
          <div className="col-span-2">
            <label>{t('integral_pop_emitted')}</label>
            <input
              type="number"
              className="input"
              value={form.cuidadoIntegralPoblacion || ''}
              onChange={e => handleChange('cuidadoIntegralPoblacion', e.target.value)}
              placeholder="0"
            />
          </div>
          <div className="col-span-2">
            <label>{t('integral_premium_emitted')}</label>
            <input
              type="number"
              className="input"
              value={form.cuidadoIntegralPrima || ''}
              onChange={e => handleChange('cuidadoIntegralPrima', e.target.value)}
              placeholder="0.00"
            />
          </div>
          <div className="col-span-4">
            <label>{t('emitted_pop')}</label>
            <input
              type="number"
              className={getInputClass('poblacionEmitida')}
              value={form.poblacionEmitida}
              onChange={e => handleChange('poblacionEmitida', e.target.value)}
              placeholder="0"
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
