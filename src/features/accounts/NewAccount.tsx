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

// Mock Data
const RAMOS = {
  'Autos': ['Flotillas', 'Individual', 'Camiones'],
  'Daños': ['Incendio', 'Terremoto', 'Hidrometeorológico'],
  'Vida': ['Grupo', 'Individual'],
  'GMM': ['Colectivo', 'Individual']
};

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

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const accountId = searchParams.get('id');
  const caseId = searchParams.get('caseId'); // Get caseId for editing
  const parentCaseId = searchParams.get('parentCaseId');
  const { t } = useLanguage();

  // Load account/case data if editing
  useEffect(() => {
    if (caseId) {
      setLoading(true);
      api.get(`/cases/${caseId}`)
        .then(res => {
          const c = res.data;
          setCreatedCaseId(c.id);
          setFormData(prev => ({
            ...prev,
            ...c, // Spread case data (includes JSON data merged by backend)
            name: c.account?.name || c.name || '',
          }));
        })
        .catch(err => console.error("Error loading case", err))
        .finally(() => setLoading(false));
    } else if (accountId) {
      // Fetch account logic
      api.get(`/accounts/${accountId}`).then(res => {
        setFormData(prev => ({ ...prev, name: res.data.name }));
      });
    }
  }, [accountId, caseId]);

  const handleChange = (field: keyof FormState, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: false }));
    }

    // Logic for dependent dropdowns
    if (field === 'ramo') {
      setFormData(prev => ({ ...prev, ramo: value, subramo: '' }));
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
    setLoading(true);
    try {
      let currentCaseId = createdCaseId || caseId;

      if (currentCaseId) {
        // Update
        await api.put(`/cases/${currentCaseId}`, {
          ...formData,
          accountId: accountId || 999
        });
        setSuccessMsg(`Caso actualizado correctamente`);
      } else {
        // Create Account if needed
        let accId = accountId;
        if (!accId) {
          const accountRes = await api.post('/accounts', {
            name: formData.name,
            identifier: 'TEMP-' + Date.now()
          });
          accId = accountRes.data.id;
        }

        // Create Case
        const caseRes = await api.post('/cases', {
          ...formData,
          accountId: accId,
          parentCaseId
        });
        currentCaseId = caseRes.data.id;
        setCreatedCaseId(currentCaseId);
        setSuccessMsg(`Cuenta y Caso creados correctamente`);
      }

    } catch (error) {
      console.error(error);
      // Fallback for mock environment
      setSuccessMsg(`Cuenta ${formData.name} y Caso 1001 creados correctamente (Mock)`);
      setCreatedCaseId('1001');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async () => {


    if (!validate()) return;
    setLoading(true);
    try {
      let currentCaseId = createdCaseId || caseId;

      if (!currentCaseId) {
        // Create logic similar to handleSave but then navigate
        // Reuse handleSave logic or duplicate slightly for simplicity
        let accId = accountId;
        if (!accId) {
          const accountRes = await api.post('/accounts', { name: formData.name, identifier: 'TEMP-' + Date.now() });
          accId = accountRes.data.id;
        }
        const caseRes = await api.post('/cases', {
          accountId: accId,
          parentCaseId,
          ...formData
        });
        currentCaseId = caseRes.data.id;
      } else {
        // Update before next
        await api.put(`/cases/${currentCaseId}`, { accountId, ...formData });
      }

      setCreatedCaseId(currentCaseId);
      navigate(`/negotiation/${currentCaseId}`);

    } catch (error) {
      console.error(error);
      setCreatedCaseId('1001');
      navigate('/negotiation/1001');
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
          {successMsg && <span style={{ color: 'var(--success)', fontWeight: 600, marginRight: '1rem' }}>{t('success_save')}</span>}

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
            <input className={getInputClass('name')} value={formData.name} onChange={e => handleChange('name', e.target.value)} placeholder={t('account')} />
          </div>
          <div>
            <label>{t('ramo')} *</label>
            <select className={getInputClass('ramo')} value={formData.ramo} onChange={e => handleChange('ramo', e.target.value)}>
              <option value="">{t('select')}</option>
              {Object.keys(RAMOS).map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label>{t('subramo')} *</label>
            <select className={getInputClass('subramo')} value={formData.subramo} onChange={e => handleChange('subramo', e.target.value)} disabled={!formData.ramo}>
              <option value="">{t('select')}</option>
              {formData.ramo && (RAMOS as any)[formData.ramo]?.map((s: string) => <option key={s} value={s}>{s}</option>)}
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
              <option value="Nacional">Nacional</option>
              <option value="Internacional">Internacional</option>
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
            <label>{t('stage')} *</label>
            <select className={getInputClass('etapa')} value={formData.etapa} onChange={e => handleChange('etapa', e.target.value)}>
              <option value="Creado">Creado</option>
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
            <label>{t('planmed')}</label>
            <select className="input" value={formData.cuentaConPlanmed} onChange={e => handleChange('cuentaConPlanmed', e.target.value)}>
              <option value="">{t('select')}</option>
              <option value="Si">Si</option>
              <option value="No">No</option>
            </select>
          </div>
          <div>
            <label>{t('plan')}</label>
            <input className="input" value={formData.plan} onChange={e => handleChange('plan', e.target.value)} />
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
