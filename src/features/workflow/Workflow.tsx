import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/client';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function WorkflowDetail() {
  const { id } = useParams();
  const [caseData, setCaseData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { t } = useLanguage();

  useEffect(() => {
    api.get(`/cases/${id}`).then(res => {
      setCaseData(res.data);
      setLoading(false);
    });
  }, [id]);

  const handleAdvance = async (data: any, endpoint: string, isFinish: boolean = false) => {
    try {
      await api.put(`/${endpoint}/${id}`, { ...data, advance: !isFinish, finish: isFinish });
      if (isFinish) navigate('/renovaciones');
      else window.location.reload();
    } catch (error) {
      alert('Error al avanzar');
    }
  };

  if (loading) return <div>{t('loading')}</div>;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <h1 style={{ margin: 0, color: 'var(--text-main)' }}>{t('case_management')}: {caseData.refnum}</h1>
        <span className="glass" style={{ padding: '0.5rem 1rem', borderRadius: '20px', fontSize: '0.875rem', border: '1px solid var(--primary)', color: 'var(--text-main)' }}>
          {t('stage')}: {caseData.workflowStep}
        </span>
      </div>

      <div className="card glass" style={{ marginBottom: '2rem' }}>
        <h3 style={{ color: 'var(--text-main)' }}>{t('account_data')} (Read-only)</h3>
        <p style={{ color: 'var(--text-main)' }}><strong>{t('name')}:</strong> {caseData.account.name}</p>
        <p style={{ color: 'var(--text-main)' }}><strong>{t('ramo')}:</strong> {caseData.account.ramo} / {caseData.account.subramo}</p>
      </div>

      {caseData.workflowStep === 'ALTA' && (
        <div className="card glass">
          <h2 style={{ color: 'var(--text-main)' }}>{t('stage')}: {t('new_account_title')}</h2>
          <p style={{ color: 'var(--text-main)' }}>{t('stage_alta_desc')}</p>
          <button onClick={() => handleAdvance({}, 'negotiation')} className="btn btn-primary">
            {t('advance_negotiation')} <ArrowRight size={18} />
          </button>
        </div>
      )}

      {caseData.workflowStep === 'NEGOCIACION' && (
        <NegotiationForm
          data={caseData.negotiationData || {}}
          onSave={(data: any) => handleAdvance(data, 'negotiation')}
          t={t}
        />
      )}

      {caseData.workflowStep === 'EMISION' && (
        <EmissionForm
          data={caseData.emissionData || {}}
          onSave={(data: any) => handleAdvance(data, 'emission', true)}
          t={t}
        />
      )}
    </div>
  );
}

function NegotiationForm({ data, onSave, t }: any) {
  const [vals, setVals] = useState(data);
  return (
    <div className="card glass">
      <h2 style={{ color: 'var(--text-main)' }}>{t('negotiation')}</h2>
      <label style={{ color: 'var(--text-main)' }}>{t('stayed')}</label>
      <input type="checkbox" checked={vals.seQuedo} onChange={e => setVals({ ...vals, seQuedo: e.target.checked })} />
      <div style={{ marginTop: '1rem' }}>
        <label style={{ color: 'var(--text-main)' }}>{t('status')}</label>
        <select className="input" value={vals.estatus} onChange={e => setVals({ ...vals, estatus: e.target.value })}>
          <option value="">{t('select')}</option>
          <option value="GANADA">{t('won')}</option>
          <option value="PERDIDA">{t('lost')}</option>
        </select>
      </div>
      <button onClick={() => onSave({ ...vals, advance: true })} className="btn btn-primary">
        {t('save_advance')}
      </button>
    </div>
  );
}

function EmissionForm({ data, onSave, t }: any) {
  const [vals, setVals] = useState(data);
  return (
    <div className="card glass">
      <h2 style={{ color: 'var(--text-main)' }}>{t('emission')}</h2>
      <label style={{ color: 'var(--text-main)' }}>{t('policy')}</label>
      <input className="input" value={vals.poliza} onChange={e => setVals({ ...vals, poliza: e.target.value })} />
      <button onClick={() => onSave({ ...vals, finish: true })} className="btn btn-primary">
        <CheckCircle size={18} /> {t('finish_process')}
      </button>
    </div>
  );
}
