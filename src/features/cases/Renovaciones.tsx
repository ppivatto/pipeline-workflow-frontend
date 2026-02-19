import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/client';
import { Plus, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import Combobox from '../../components/Combobox';

interface Case {
  id: string;
  refnum: string;
  account: {
    id: string;
    name: string;
    ramo: string;
  };
  workflowStep: string;
  status: string;
  ramo: string;
  data: any;
  lastModified: string;
}

interface Account {
  id: string;
  name: string;
}

export default function Renovaciones() {
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const { t } = useLanguage();
  const navigate = useNavigate();

  // Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const { data: accounts = [] } = useQuery<Account[]>({
    queryKey: ['accounts'],
    queryFn: async () => {
      const res = await api.get('/accounts');
      return res.data;
    }
  });

  const { data: cases = [], isLoading: loadingCases } = useQuery<Case[]>({
    queryKey: ['cases', 'renovaciones', selectedAccountId],
    queryFn: async () => {
      // If no account selected, fetch all renewals for the user
      const endpoint = selectedAccountId
        ? `/cases/renovaciones?accountId=${selectedAccountId}`
        : '/cases/renovaciones';
      const res = await api.get(endpoint);
      return res.data;
    }
  });

  const handleCreateRenewal = (parentCase: Case) => {
    navigate(`/accounts/new?id=${parentCase.account.id}&parentCaseId=${parentCase.id}`);
  };

  const totalPages = Math.ceil(cases.length / limit);
  const paginatedCases = cases.slice((page - 1) * limit, page * limit);

  return (
    <div style={{ paddingBottom: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
        <h1 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.5rem', fontWeight: 700 }}>{t('header_renewals')}</h1>
      </div>

      <div className="card glass">
        {/* Account Filter */}
        <div style={{ marginBottom: '1.5rem' }}>
          <Combobox
            label={t('account')}
            options={accounts}
            value={selectedAccountId}
            onChange={(val) => {
              setSelectedAccountId(val);
              setPage(1);
            }}
            placeholder={t('search_placeholder')}
          />
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto', minHeight: '200px' }}>
          {loadingCases ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
              <Loader2 size={32} className="animate-spin" style={{ color: 'var(--primary)' }} />
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '1rem' }}>{t('col_number')}</th>
                  <th style={{ padding: '1rem' }}>{t('col_account')}</th>
                  <th style={{ padding: '1rem' }}>{t('col_line')}</th>
                  <th style={{ padding: '1rem' }}>{t('col_step')}</th>
                  <th style={{ padding: '1rem' }}>{t('col_type')}</th>
                  <th style={{ padding: '1rem' }}>{t('col_subtype')}</th>
                  <th style={{ padding: '1rem' }}>{t('col_status')}</th>
                  <th style={{ padding: '1rem' }}>{t('col_actions')}</th>
                </tr>
              </thead>
              <tbody>
                {paginatedCases.length > 0 ? (
                  paginatedCases.map((c) => (
                    <tr key={c.id} style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-main)' }}>
                      <td style={{ padding: '1rem' }}>{c.refnum}</td>
                      <td style={{ padding: '1rem' }}>{c.account.name}</td>
                      <td style={{ padding: '1rem' }}><span className="badge">{c.ramo || c.account.ramo}</span></td>
                      <td style={{ padding: '1rem' }}>{c.workflowStep}</td>
                      <td style={{ padding: '1rem' }}>{c.data?.tipo || '-'}</td>
                      <td style={{ padding: '1rem' }}>{c.data?.subtipo || '-'}</td>
                      <td style={{ padding: '1rem' }}>{c.status}</td>
                      <td style={{ padding: '1rem' }}>
                        <button
                          onClick={() => handleCreateRenewal(c)}
                          className="btn btn-primary"
                          style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                        >
                          <Plus size={14} /> {t('new_case')}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      {selectedAccountId ? t('no_cases') : t('select_account')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {cases.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
            <select
              value={limit}
              onChange={e => { setLimit(Number(e.target.value)); setPage(1); }}
              className="input"
              style={{ width: 'auto', padding: '0.4rem 2rem 0.4rem 0.8rem', marginBottom: 0 }}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button
                className="btn btn-secondary"
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                style={{ padding: '0.4rem' }}
              >
                <ChevronLeft size={16} /> {t('back')}
              </button>
              <span style={{ color: 'var(--text-main)', padding: '0 0.5rem' }}>
                <span style={{ background: 'var(--primary)', color: 'white', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.9rem' }}>{page}</span>
              </span>
              <button
                className="btn btn-secondary"
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
                style={{ padding: '0.4rem' }}
              >
                {t('next')} <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

