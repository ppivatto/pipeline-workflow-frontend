import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/client';
import { ArrowLeft, Save, ArrowRight, Loader2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { fmtMoney, formatMoneyInput, parseMoney } from '../../utils/moneyFormat';

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

export default function Negotiation() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, language } = useLanguage();

  const [catalogs, setCatalogs] = useState<Record<string, { key: string, value_es: string, value_en: string, value_pt: string }[]>>({});

  const catValues = (name: string): string[] => {
    const langKey = `value_${language}` as 'value_es' | 'value_en' | 'value_pt';
    return (catalogs[name] || []).map(e => e[langKey] || e.value_es || '');
  };

  const [readOnly, setReadOnly] = useState<ReadOnlyData>({
    cuenta: '', ramo: '', fechaInicioVigencia: '', primaObjetivo: ''
  });
  const [caseAccountId, setCaseAccountId] = useState<string | null>(null);
  const [form, setForm] = useState<NegotiationState>(INITIAL_NEG);
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');

  // Load catalogs from backend
  useEffect(() => {
    api.get('/catalogs')
      .then(res => setCatalogs(res.data))
      .catch(err => console.error('Error loading catalogs', err));
  }, []);

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
            observaciones: nd.observaciones || c.data?.observaciones || prev.observaciones,
          }));
        } else {
          // If no negotiation data, at least inherit observations from Alta
          setForm(prev => ({
            ...prev,
            observaciones: c.data?.observaciones || prev.observaciones,
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

  const LOSS_STATUSES = ['No Ganada', 'Rechazo de AXA', 'Cancelación'];

  const validate = () => {
    const newErrors: Record<string, boolean> = {};
    // Per spec US-4: only Observaciones is mandatory initially
    if (!form.observaciones) newErrors.observaciones = true;

    // Loss fields only mandatory if exactly "No Ganada"
    if (form.estatus === 'No Ganada' && !form.seQuedo) {
      if (!form.motivoNoGanado) newErrors.motivoNoGanado = true;
      if (!form.aseguradoraGanadora) newErrors.aseguradoraGanadora = true;
      if (!form.primaCompetencia) newErrors.primaCompetencia = true;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await api.put(`/negotiation/${id}`, { ...form, advance: false });

      // If loss status + not retained → move to RECHAZADO
      if (LOSS_STATUSES.includes(form.estatus) && !form.seQuedo) {
        try {
          await api.put(`/cases/${id}`, { ramo: readOnly.ramo, estatus: form.estatus, rejectedFromNegotiation: true });
        } catch { /* best effort */ }
        setSuccessMsg('Caso movido a Rechazados');
        setTimeout(() => navigate('/rechazados'), 1500);
        return;
      }

      setSuccessMsg('Negociación guardada correctamente');
    } catch {
      // Mock: still check auto-reject
      if (LOSS_STATUSES.includes(form.estatus) && !form.seQuedo) {
        setSuccessMsg('Caso movido a Rechazados (Mock)');
        setTimeout(() => navigate('/rechazados'), 1500);
        return;
      }
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
            <input className="input" value={readOnly.primaObjetivo ? fmtMoney(readOnly.primaObjetivo) : ''} disabled />
          </div>
        </div>

        {/* Negotiation Capture */}
        <div className="form-section-title">{t('capture_negotiation')}</div>
        <div className="form-grid">
          <div>
            <label>{t('insured_pop')}</label>
            <input
              type="number"
              min="1"
              step="1"
              className="input"
              value={form.poblacionAsegurada}
              onChange={e => handleChange('poblacionAsegurada', e.target.value)}
              placeholder="0"
            />
          </div>
          <div>
            <label>{t('status')}</label>
            <select className="input" value={form.estatus} onChange={e => handleChange('estatus', e.target.value)}>
              <option value="">{t('select')}</option>
              {catValues('estatus').map(e => <option key={e} value={e}>{e}</option>)}
            </select>
          </div>
          <div>
            <label>{t('insured_premium')}</label>
            <input
              type="text"
              className="input"
              value={formatMoneyInput(form.primaAsegurados).display}
              onChange={e => handleChange('primaAsegurados', parseMoney(e.target.value))}
              placeholder="0.00"
            />
          </div>
        </div>

        {/* Datos de Pérdida (Always Visible, Conditionally Mandatory) */}
        <div className="form-section-title">{t('loss_data')}</div>
        <div className="form-grid">
          <div>
            <label>{t('loss_reason')} {form.estatus === 'No Ganada' ? '*' : ''}</label>
            <select className={getInputClass('motivoNoGanado')} value={form.motivoNoGanado} onChange={e => handleChange('motivoNoGanado', e.target.value)}>
              <option value="">{t('select')}</option>
              {catValues('motivoNoGanado').map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label>{t('winning_insurer')} {form.estatus === 'No Ganada' ? '*' : ''}</label>
            <select className={getInputClass('aseguradoraGanadora')} value={form.aseguradoraGanadora} onChange={e => handleChange('aseguradoraGanadora', e.target.value)}>
              <option value="">{t('select')}</option>
              {catValues('aseguradoraGanadora').map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          <div>
            <label>{t('comp_premium')} {form.estatus === 'No Ganada' ? '*' : ''}</label>
            <input
              type="text"
              className={getInputClass('primaCompetencia')}
              value={formatMoneyInput(form.primaCompetencia).display}
              onChange={e => handleChange('primaCompetencia', parseMoney(e.target.value))}
              placeholder="0.00"
            />
          </div>
        </div>

        {/* Cuidado Integral */}
        <div className="form-section-title">{t('integral_care_section')}</div>
        <div className="form-grid" style={{ alignItems: 'flex-end' }}>
          <div style={{ paddingBottom: '0.5rem' }}>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 600 }}>
              <input
                type="checkbox"
                checked={form.seQuedo}
                onChange={e => handleChange('seQuedo', e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
              />
              {t('stayed')}
            </label>
          </div>
          {form.seQuedo && (
            <>
              <div>
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
                  type="text"
                  className="input"
                  value={formatMoneyInput(form.cuidadoIntegralPrima).display}
                  onChange={e => handleChange('cuidadoIntegralPrima', parseMoney(e.target.value))}
                  placeholder="0.00"
                />
              </div>
            </>
          )}
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
