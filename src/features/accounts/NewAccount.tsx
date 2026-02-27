import { useState, useEffect } from 'react';
import api from '../../api/client';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { Save, ArrowRight, Loader2, X } from 'lucide-react';

interface FormState {
  // General
  name: string;
  ramo: string;
  subramo: string;
  giroNegocio: string;
  tipoExperiencia: string;
  etapa: string;
  fechaInicioVigencia: string;

  primaObjetivo: string;
  cuidadoIntegral: string; // New field

  // Agente
  claveAgente: string;
  nombreAgente: string;
  promotor: string;
  territorio: string;
  oficina: string;
  canal: string;
  centroCostos: string;

  // Producto/Suscripcion
  nuevoConducto: string;
  nearshoring: string;
  cuentaConPlanmed: string;
  plan: string;
  primaCotizada: string;
  poblacion: string;
  incisos: string;
  ubicaciones: string;
  instanciaFolio: string;
  responsableSuscripcion: string;
  fechaSolicitud: string;
  fechaEntrega: string;

  // Observaciones
  observaciones: string;
}

const INITIAL_STATE: FormState = {
  name: '', ramo: '', subramo: '', giroNegocio: '', tipoExperiencia: '', etapa: 'Creado', fechaInicioVigencia: '', primaObjetivo: '', cuidadoIntegral: '',
  claveAgente: '', nombreAgente: '', promotor: '', territorio: '', oficina: '', canal: '', centroCostos: '',
  nuevoConducto: '', nearshoring: '', cuentaConPlanmed: '', plan: '', primaCotizada: '', poblacion: '', incisos: '', ubicaciones: '', instanciaFolio: '', responsableSuscripcion: '', fechaSolicitud: '', fechaEntrega: '',
  observaciones: ''
};

const RAMOS = ['Autos', 'Daños', 'Salud', 'Vida'];

const SUBRAMOS = [
  'Múltiple Empresarial (MEM)',
  'L. Com Transportes',
  'L. Com Responsabilidad Civil',
  'L. Com Ramos Técnicos',
  'L. Est. Transportes',
  'L. Est. Responsabilidad Civil',
  'L. Est Ramos Técnicos',
  'Obras de Arte',
  'Aviación',
  'Financieras & Cyber',
  'Property',
  'Parámetro',
  'Otro',
];

const AGENTS_MOCK: Record<string, any> = {
  '26601': { nombre: 'JUAN PEREZ', promotor: 'PROMOTORIA NORTE', territorio: 'NORTE', oficina: 'MONTERREY', canal: 'AGENTE', centroCostos: 'CC-001' },
  '12345': { nombre: 'MARIA LOPEZ', promotor: 'PROMOTORIA SUR', territorio: 'SUR', oficina: 'CDMX SUR', canal: 'BROKER', centroCostos: 'CC-002' }
};

export default function NewAccount() {
  const [formData, setFormData] = useState<FormState>(INITIAL_STATE);
  const [loading, setLoading] = useState(false);
  const [searchingAgent, setSearchingAgent] = useState(false);
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [successMsg, setSuccessMsg] = useState('');
  const [createdCaseId, setCreatedCaseId] = useState<string | null>(null);
  const [duplicateError, setDuplicateError] = useState('');

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const accountId = searchParams.get('id');
  const caseId = searchParams.get('caseId'); // Get caseId for editing
  const parentCaseId = searchParams.get('parentCaseId');
  const { t } = useLanguage();

  // Load account/case data if editing or renewal
  useEffect(() => {
    if (caseId) {
      setLoading(true);
      api.get(`/cases/${caseId}`)
        .then(res => {
          const c = res.data;
          // Exclude system/relation fields — only keep user-entered form data.
          // The backend merges c.data (JSON column) into the top-level response via findOne,
          // so all form fields (subramo, tipoExperiencia, etc.) are already at top level.
          const {
            id, refnum, status, workflowStep,
            accountId: _accountId, createdAt, updatedAt, lastModified,
            assignedTo, parentCaseId: _parentCaseId,
            account, negotiationData, emissionData,
            data: rawData,
            ...rest
          } = c;

          setCreatedCaseId(id);
          setFormData(prev => ({
            ...prev,
            ...(rawData && typeof rawData === 'object' ? rawData : {}), // persisted JSON form fields
            ...rest,                                                      // top-level columns (ramo, etc.)
            name: account?.name || rest.name || '',
          }));
        })
        .catch(err => console.error("Error loading case", err))
        .finally(() => setLoading(false));
    } else if (parentCaseId) {
      // Renewal: Load parent case data but treating as new entry
      setLoading(true);
      api.get(`/cases/${parentCaseId}`)
        .then(res => {
          const c = res.data;
          // Exclude system fields from spread to avoid accidental overwrites or dirty data
          const { id, refnum, status, workflowStep, createdAt, updatedAt, ...rest } = c;
          setFormData(prev => ({
            ...prev,
            ...rest,
            name: c.account?.name || c.name || '',
            etapa: 'Creado', // Reset status
            observaciones: `Renovación: ${c.refnum} - ${c.data?.observaciones || ''}`.substring(0, 500),
            // We could auto-increment dates here if we had logic, for now keep same
          }));
        })
        .catch(err => console.error("Error loading parent case", err))
        .finally(() => setLoading(false));
    } else if (accountId) {
      // Load the most recent ALTA case for this account so the form is pre-filled
      setLoading(true);
      api.get(`/cases?accountId=${accountId}`)
        .then(res => {
          const allCases: any[] = res.data || [];
          // Prefer the most recent ALTA case; fall back to any active case
          const latest = allCases
            .filter((c: any) => !['CANCELADO', 'RECHAZADO', 'TERMINADO'].includes(c.status))
            .sort((a: any, b: any) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0];

          if (latest) {
            return api.get(`/cases/${latest.id}`).then(cRes => {
              const c = cRes.data;
              const {
                id, refnum, status, workflowStep,
                accountId: _aId, createdAt, updatedAt, lastModified,
                assignedTo, parentCaseId: _pId,
                account, negotiationData, emissionData,
                data: rawData,
                ...rest
              } = c;
              setCreatedCaseId(id);
              setFormData(prev => ({
                ...prev,
                ...(rawData && typeof rawData === 'object' ? rawData : {}),
                ...rest,
                name: account?.name || rest.name || '',
              }));
            });
          } else {
            // No cases yet — just load the account name
            return api.get(`/accounts/${accountId}`).then(res => {
              setFormData(prev => ({ ...prev, name: res.data.name }));
            });
          }
        })
        .catch(err => console.error('Error loading account cases', err))
        .finally(() => setLoading(false));
    }
  }, [accountId, caseId, parentCaseId]);

  const handleChange = (field: keyof FormState, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: false }));
    }
    if (field === 'name') {
      setDuplicateError('');
    }

    // Logic for dependent dropdowns
    if (field === 'ramo') {
      setFormData(prev => ({ ...prev, ramo: value, subramo: '' }));
    }
  };

  const checkDuplicateAccount = async () => {
    // Only check when creating a new account (no accountId/caseId)
    if (accountId || caseId || !formData.name.trim()) return;
    try {
      const res = await api.get(`/accounts/check-duplicate?name=${encodeURIComponent(formData.name.trim())}`);
      if (res.data.exists) {
        setDuplicateError(`Cuenta "${formData.name}" ya existe. No se puede crear una cuenta duplicada.`);
      } else {
        setDuplicateError('');
      }
    } catch {
      // If endpoint fails, don't block
    }
  };

  const searchAgent = async () => {
    if (!formData.claveAgente) return;
    setSearchingAgent(true);

    // Simulate API call
    setTimeout(() => {
      const agent = AGENTS_MOCK[formData.claveAgente];
      if (agent) {
        setFormData(prev => ({
          ...prev,
          nombreAgente: agent.nombre,
          promotor: agent.promotor,
          territorio: agent.territorio,
          oficina: agent.oficina,
          canal: agent.canal,
          centroCostos: agent.centroCostos
        }));
      } else {
        alert('Agente no encontrado (Prueba con 26601 o 12345)');
      }
      setSearchingAgent(false);
    }, 500);
  };

  const validate = () => {
    const newErrors: Record<string, boolean> = {};
    const requiredFields: (keyof FormState)[] = [
      'name', 'ramo', 'subramo', 'giroNegocio', 'tipoExperiencia', 'etapa',
      'fechaInicioVigencia', 'primaObjetivo', 'claveAgente', 'nuevoConducto', 'nearshoring', 'observaciones'
    ];

    requiredFields.forEach(field => {
      if (!formData[field]) newErrors[field] = true;
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    if (duplicateError) {
      alert(duplicateError);
      return;
    }
    setLoading(true);
    try {
      let currentCaseId = createdCaseId || caseId;

      if (currentCaseId) {
        // Update existing case
        await api.put(`/cases/${currentCaseId}`, { ...formData, accountId });
        setSuccessMsg(`Caso actualizado correctamente`);
      } else if (!accountId) {
        // Double-check duplicate before creating
        const dupCheck = await api.get(`/accounts/check-duplicate?name=${encodeURIComponent(formData.name.trim())}`);
        if (dupCheck.data.exists) {
          setDuplicateError(`Cuenta "${formData.name}" ya existe. No se puede crear una cuenta duplicada.`);
          alert(`Cuenta "${formData.name}" ya existe. No se puede crear una cuenta duplicada.`);
          setLoading(false);
          return;
        }
        // Create NEW Account AND Case (Transaction in backend)
        const res = await api.post('/accounts', { ...formData, parentCaseId });
        setCreatedCaseId(res.data.case.id);
        const folio = res.data.case.refnum || res.data.case.id;
        setSuccessMsg(`✅ Proceso exitoso — Folio: ${folio}`);
        // Update URL to prevent double creation
        navigate(`/accounts/new?id=${res.data.account.id}&caseId=${res.data.case.id}`, { replace: true });
      } else {
        // Create NEW Case for EXISTING Account
        const res = await api.post('/cases', { ...formData, accountId, parentCaseId });
        setCreatedCaseId(res.data.id);
        const folio = res.data.refnum || res.data.id;
        setSuccessMsg(`✅ Proceso exitoso — Folio: ${folio}`);
        navigate(`/accounts/new?id=${accountId}&caseId=${res.data.id}`, { replace: true });
      }
    } catch (error) {
      console.error(error);
      setSuccessMsg(`Error al guardar`);
    } finally {
      setLoading(false);
      setTimeout(() => setSuccessMsg(''), 6000);
    }
  };

  const handleNext = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      let currentCaseId = createdCaseId || caseId;

      if (!currentCaseId) {
        if (!accountId) {
          const res = await api.post('/accounts', { ...formData, parentCaseId });
          currentCaseId = res.data.case.id;
        } else {
          const res = await api.post('/cases', { ...formData, accountId, parentCaseId });
          currentCaseId = res.data.id;
        }
      } else {
        await api.put(`/cases/${currentCaseId}`, { ...formData, accountId });
      }

      navigate(`/negotiation/${currentCaseId}`);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (accountId) {
      navigate(`/seguimiento/${accountId}`);
    } else {
      navigate('/accounts');
    }
  };

  const getInputClass = (field: string) => `input ${errors[field] ? 'input-error' : ''}`;

  return (
    <div style={{ paddingBottom: '4rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ margin: 0, color: 'var(--text-main)' }}>
          {caseId ? t('header_new_case') : t('header_new_account')}
        </h1>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {successMsg && <span style={{ color: successMsg.includes('Error') ? '#ef4444' : 'var(--success)', fontWeight: 600, marginRight: '1rem', fontSize: '0.85rem' }}>{successMsg}</span>}

          <button onClick={handleCancel} className="btn btn-secondary" style={{ padding: '0.5rem', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title={t('cancel')}>
            <X size={18} />
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

        {/* A. Información General */}
        <div className="form-section-title">{t('section_general')}</div>
        <div className="form-grid">
          <div>
            <label>{t('account')} *</label>
            <input className={getInputClass('name')} value={formData.name} onChange={e => handleChange('name', e.target.value)} onBlur={checkDuplicateAccount} placeholder={t('account')} />
            {duplicateError && <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem', fontWeight: 600 }}>⚠️ {duplicateError}</p>}
          </div>
          <div>
            <label>{t('ramo')} *</label>
            <select className={getInputClass('ramo')} value={formData.ramo} onChange={e => handleChange('ramo', e.target.value)}>
              <option value="">{t('select')}</option>
              {RAMOS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label>{t('subramo')} *</label>
            <select className={getInputClass('subramo')} value={formData.subramo} onChange={e => handleChange('subramo', e.target.value)} disabled={!formData.ramo}>
              <option value="">{t('select')}</option>
              {SUBRAMOS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label>{t('business_type')} *</label>
            <select className={getInputClass('giroNegocio')} value={formData.giroNegocio} onChange={e => handleChange('giroNegocio', e.target.value)}>
              <option value="">{t('select')}</option>
              <option value="Retail">Retail</option>
              <option value="Manufactura">Manufactura</option>
              <option value="Servicios">Servicios</option>
              <option value="Tecnología">Tecnología</option>
            </select>
          </div>
          <div>
            <label>{t('exp_type')} *</label>
            <select className={getInputClass('tipoExperiencia')} value={formData.tipoExperiencia} onChange={e => handleChange('tipoExperiencia', e.target.value)}>
              <option value="">{t('select')}</option>
              <option value="Propia">Propia</option>
              <option value="Global">Global</option>
            </select>
          </div>
          <div>
            <label>{t('integral_care')}</label>
            <select className="input" value={formData.cuidadoIntegral} onChange={e => handleChange('cuidadoIntegral', e.target.value)}>
              <option value="">{t('select')}</option>
              <option value="Si">Si</option>
              <option value="No">No</option>
            </select>
          </div>
          <div>
            <label>{t('planmed')}</label>
            <select className="input" value={formData.cuentaConPlanmed} onChange={e => handleChange('cuentaConPlanmed', e.target.value)}>
              <option value="">{t('select')}</option>
              <option value="Planmed Hibrido">Planmed Híbrido</option>
              <option value="Planmed Estandar">Planmed Estándar</option>
              <option value="Planmed Esencial">Planmed Esencial</option>
              <option value="Planmed Optimo">Planmed Óptimo</option>
            </select>
          </div>
          <div>
            <label>{t('plan')}</label>
            <select className="input" value={formData.plan} onChange={e => handleChange('plan', e.target.value)}>
              <option value="">{t('select')}</option>
              <option value="Cuidado Integral Salud">Cuidado Integral Salud</option>
              <option value="Cuidado Integral Plus">Cuidado Integral Plus</option>
            </select>
          </div>
          <div>
            <label>{t('stage')} *</label>
            <select className={getInputClass('etapa')} value={formData.etapa} onChange={e => handleChange('etapa', e.target.value)}>
              <option value="Creado">Creado</option>
              <option value="Prospección">Prospección</option>
            </select>
          </div>
          <div>
            <label>{t('start_date')} *</label>
            <input type="date" className={getInputClass('fechaInicioVigencia')} value={formData.fechaInicioVigencia} onChange={e => handleChange('fechaInicioVigencia', e.target.value)} />
          </div>
          <div>
            <label>{t('target_premium')} *</label>
            <input type="number" className={getInputClass('primaObjetivo')} value={formData.primaObjetivo} onChange={e => handleChange('primaObjetivo', e.target.value)} placeholder="0.00" />
          </div>
        </div>

        {/* B. Datos del Agente */}
        <div className="form-section-title">{t('section_agent')}</div>
        <div className="form-grid">
          <div>
            <label>{t('agent_code')} *</label>
            <div style={{ position: 'relative' }}>
              <input
                className={getInputClass('claveAgente')}
                value={formData.claveAgente}
                onChange={e => handleChange('claveAgente', e.target.value)}
                onBlur={searchAgent}
                placeholder="ej: 26601"
              />
              {searchingAgent && <Loader2 size={16} className="animate-spin" style={{ position: 'absolute', right: '10px', top: '14px', color: 'var(--primary)' }} />}
            </div>
          </div>
          <div>
            <label>{t('agent_name')}</label>
            <input className="input" value={formData.nombreAgente} disabled />
          </div>
          <div>
            <label>{t('promoter')}</label>
            <input className="input" value={formData.promotor} disabled />
          </div>
          <div>
            <label>{t('territory')}</label>
            <input className="input" value={formData.territorio} disabled />
          </div>
          <div>
            <label>{t('office')}</label>
            <input className="input" value={formData.oficina} disabled />
          </div>
          <div>
            <label>{t('channel')}</label>
            <input className="input" value={formData.canal} disabled />
          </div>
          <div>
            <label>{t('cost_center')}</label>
            <input className="input" value={formData.centroCostos} disabled />
          </div>
        </div>

        {/* C. Producto y Suscripción */}
        <div className="form-section-title">{t('section_product')}</div>
        <div className="form-grid">
          <div>
            <label>{t('new_channel')} *</label>
            <select className={getInputClass('nuevoConducto')} value={formData.nuevoConducto} onChange={e => handleChange('nuevoConducto', e.target.value)}>
              <option value="">{t('select')}</option>
              <option value="Si">Si</option>
              <option value="No">No</option>
            </select>
          </div>
          <div>
            <label>{t('nearshoring')} *</label>
            <select className={getInputClass('nearshoring')} value={formData.nearshoring} onChange={e => handleChange('nearshoring', e.target.value)}>
              <option value="">{t('select')}</option>
              <option value="Si">Si</option>
              <option value="No">No</option>
            </select>
          </div>

          <div>
            <label>{t('quoted_premium')} *</label>
            <input type="number" className="input" value={formData.primaCotizada} onChange={e => handleChange('primaCotizada', e.target.value)} />
          </div>
          <div>
            <label>{t('population_incisos')}</label>
            <input type="text" className="input" value={formData.poblacion} onChange={e => handleChange('poblacion', e.target.value)} placeholder="" />
          </div>
          <div>
            <label>{t('instance_folio')}</label>
            <input className="input" value={formData.instanciaFolio} onChange={e => handleChange('instanciaFolio', e.target.value)} />
          </div>
          <div>
            <label>{t('underwriter')}</label>
            <select className="input" value={formData.responsableSuscripcion} onChange={e => handleChange('responsableSuscripcion', e.target.value)}>
              <option value="">{t('select')}</option>
              <option value="Juan Perez">Juan Perez</option>
              <option value="Maria Lopez">Maria Lopez</option>
            </select>
          </div>
          <div>
            <label>{t('req_date')}</label>
            <input type="date" className="input" value={formData.fechaSolicitud} onChange={e => handleChange('fechaSolicitud', e.target.value)} />
          </div>
          <div>
            <label>{t('delivery_date')}</label>
            <input type="date" className="input" value={formData.fechaEntrega} onChange={e => handleChange('fechaEntrega', e.target.value)} />
          </div>
        </div>

        {/* D. Observaciones */}
        <div className="form-section-title">{t('section_observations')}</div>
        <div className="form-grid">
          <div className="col-span-4">
            <label>{t('observations')} *</label>
            <textarea className={getInputClass('observaciones')} value={formData.observaciones} onChange={e => handleChange('observaciones', e.target.value)} />
          </div>
        </div>


      </div>
    </div>
  );
}
