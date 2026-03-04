import { useState, useEffect } from 'react';
import api from '../../api/client';
import { Save, Plus, Trash2, Loader2, Search, Settings2, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface CatalogEntry {
  key: string;
  value_es: string;
  value_en: string;
  value_pt: string;
}

/** Map catalog backend names → i18n keys for short (sidebar) and full (title) labels */
const CATALOG_I18N: Record<string, { short: string; full: string }> = {
  ramo: { short: 'cat_ramo', full: 'cat_ramo_full' },
  subramo: { short: 'cat_subramo', full: 'cat_subramo_full' },
  giroNegocio: { short: 'cat_giro', full: 'cat_giro_full' },
  tipoExperiencia: { short: 'cat_tipoExp', full: 'cat_tipoExp_full' },
  cuidaIntegral: { short: 'cat_cuidaInt', full: 'cat_cuidaInt_full' },
  tipoPlanMed: { short: 'cat_tipoPlanMed', full: 'cat_tipoPlanMed_full' },
  plan: { short: 'cat_plan', full: 'cat_plan_full' },
  etapa: { short: 'cat_etapa', full: 'cat_etapa_full' },
  seQuedo: { short: 'cat_seQuedo', full: 'cat_seQuedo_full' },
  estatus: { short: 'cat_estatus', full: 'cat_estatus_full' },
  motivoNoGanado: { short: 'cat_motivoNoGanado', full: 'cat_motivoNoGanado_full' },
  responsableSuscripcion: { short: 'cat_respSusc', full: 'cat_respSusc_full' },
  aseguradoraGanadora: { short: 'cat_asegGanadora', full: 'cat_asegGanadora_full' },
};

const CATALOG_ORDER = [
  'ramo', 'subramo', 'giroNegocio', 'tipoExperiencia',
  'cuidaIntegral', 'tipoPlanMed', 'plan', 'etapa',
  'seQuedo', 'estatus', 'motivoNoGanado',
  'responsableSuscripcion', 'aseguradoraGanadora',
];

export default function CatalogsConfig() {
  const { t } = useLanguage();
  const [catalogs, setCatalogs] = useState<Record<string, CatalogEntry[]>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [editEntries, setEditEntries] = useState<CatalogEntry[]>([]);
  const [original, setOriginal] = useState<CatalogEntry[]>([]);
  const [newKey, setNewKey] = useState('');
  const [newEs, setNewEs] = useState('');
  const [newEn, setNewEn] = useState('');
  const [newPt, setNewPt] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [tableSearch, setTableSearch] = useState('');
  const [keyError, setKeyError] = useState('');

  useEffect(() => {
    api.get('/catalogs')
      .then(res => {
        setCatalogs(res.data);
        const keys = getOrderedKeys(res.data);
        if (keys.length > 0) {
          setSelected(keys[0]);
          setEditEntries(JSON.parse(JSON.stringify(res.data[keys[0]])));
          setOriginal(JSON.parse(JSON.stringify(res.data[keys[0]])));
        }
      })
      .catch(err => console.error('Error loading catalogs', err))
      .finally(() => setLoading(false));
  }, []);

  const getOrderedKeys = (data: Record<string, CatalogEntry[]>) => {
    const ordered = CATALOG_ORDER.filter(k => data[k]);
    Object.keys(data).forEach(k => { if (!ordered.includes(k)) ordered.push(k); });
    return ordered;
  };

  const orderedKeys = getOrderedKeys(catalogs);

  const selectCatalog = (name: string) => {
    setSelected(name);
    setEditEntries(JSON.parse(JSON.stringify(catalogs[name] || [])));
    setOriginal(JSON.parse(JSON.stringify(catalogs[name] || [])));
    setTableSearch('');
    setNewKey(''); setNewEs(''); setNewEn(''); setNewPt('');
    setKeyError('');
  };

  const handleEntryChange = (index: number, field: keyof CatalogEntry, val: string) => {
    setEditEntries(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: val };
      return updated;
    });
    setKeyError('');
  };

  const handleRemove = (index: number) => {
    setEditEntries(prev => prev.filter((_, i) => i !== index));
  };

  /** Calculate the next auto-key based on existing entries */
  const getNextKey = (): string => {
    const numericKeys = editEntries.map(e => parseInt(e.key, 10)).filter(n => !isNaN(n));
    return String((numericKeys.length > 0 ? Math.max(...numericKeys) : 0) + 1);
  };

  const handleAdd = () => {
    const es = newEs.trim();
    const en = newEn.trim();
    const pt = newPt.trim();
    // Need at least one value
    if (!es && !en && !pt) return;
    // Auto-generate key if not provided
    const k = newKey.trim() || getNextKey();
    if (editEntries.some(e => e.key === k)) {
      setKeyError(`${t('cat_duplicate_key')}: "${k}"`);
      return;
    }
    // Fallback: fill empty fields from the first non-empty
    const fallback = es || en || pt;
    setEditEntries(prev => [...prev, {
      key: k,
      value_es: es || fallback,
      value_en: en || fallback,
      value_pt: pt || fallback,
    }]);
    setNewKey(''); setNewEs(''); setNewEn(''); setNewPt('');
    setKeyError('');
  };

  const handleSave = async () => {
    if (!selected) return;
    const keys = editEntries.map(e => e.key);
    const dupes = keys.filter((k, i) => keys.indexOf(k) !== i);
    if (dupes.length > 0) {
      setKeyError(`${t('cat_duplicate_key')}: ${[...new Set(dupes)].join(', ')}`);
      return;
    }
    setSaving(selected);
    try {
      await api.put(`/catalogs/${selected}`, { entries: editEntries });
      setCatalogs(prev => ({ ...prev, [selected]: JSON.parse(JSON.stringify(editEntries)) }));
      setOriginal(JSON.parse(JSON.stringify(editEntries)));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err) {
      console.error('Error saving', err);
    } finally {
      setSaving(null);
    }
  };

  const hasChanges = JSON.stringify(editEntries) !== JSON.stringify(original);

  const filteredCatalogKeys = orderedKeys.filter(k => {
    if (!searchTerm) return true;
    const label = CATALOG_I18N[k] ? t(CATALOG_I18N[k].short as any) : k;
    return label.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const filteredEntries = editEntries.filter(e => {
    if (!tableSearch) return true;
    const s = tableSearch.toLowerCase();
    return e.key.toLowerCase().includes(s) ||
      e.value_es.toLowerCase().includes(s) ||
      e.value_en.toLowerCase().includes(s) ||
      e.value_pt.toLowerCase().includes(s);
  });

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Loader2 size={32} className="animate-spin" style={{ color: 'var(--primary)' }} />
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <Settings2 size={22} style={{ color: 'var(--primary)' }} />
        <h1 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--primary)' }}>{t('header_catalogs')}</h1>
      </div>

      <div style={{ display: 'flex', gap: '1rem', height: 'calc(100vh - 180px)' }}>
        {/* Left panel: catalog list */}
        <div style={{
          width: '190px',
          minWidth: '190px',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.25rem',
          borderRight: '1px solid var(--border)',
          paddingRight: '0.75rem',
          overflow: 'hidden',
        }}>
          <div style={{ position: 'relative', marginBottom: '0.5rem' }}>
            <Search size={14} style={{ position: 'absolute', left: '8px', top: '9px', color: 'var(--text-muted)' }} />
            <input
              className="input"
              placeholder={t('cat_filter')}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '28px', fontSize: '0.78rem', padding: '0.4rem 0.5rem 0.4rem 28px' }}
            />
          </div>
          <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {filteredCatalogKeys.map(k => {
              const label = CATALOG_I18N[k] ? t(CATALOG_I18N[k].short as any) : k;
              return (
                <button
                  key={k}
                  onClick={() => selectCatalog(k)}
                  style={{
                    textAlign: 'left',
                    padding: '0.4rem 0.5rem',
                    borderRadius: '6px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.78rem',
                    fontWeight: selected === k ? 600 : 400,
                    background: selected === k ? 'var(--primary)' : 'transparent',
                    color: selected === k ? 'white' : 'var(--text-main)',
                    transition: 'all 0.15s',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {label}
                  <span style={{ fontSize: '0.6rem', marginLeft: '0.4rem', opacity: 0.6 }}>
                    ({(catalogs[k] || []).length})
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right panel: table */}
        {selected && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            {/* Toolbar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
              <h2 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-main)', fontWeight: 600 }}>
                {CATALOG_I18N[selected] ? t(CATALOG_I18N[selected].full as any) : selected}
              </h2>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                ({editEntries.length} {t('cat_records')})
              </span>
              <div style={{ flex: 1 }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ position: 'relative' }}>
                  <Search size={14} style={{ position: 'absolute', left: '8px', top: '9px', color: 'var(--text-muted)' }} />
                  <input
                    className="input"
                    placeholder={t('cat_search')}
                    value={tableSearch}
                    onChange={e => setTableSearch(e.target.value)}
                    style={{ paddingLeft: '28px', fontSize: '0.78rem', padding: '0.4rem 0.5rem 0.4rem 28px', width: '150px' }}
                  />
                </div>
                <button
                  onClick={handleSave}
                  disabled={saving !== null || (!hasChanges && !saveSuccess)}
                  style={{
                    height: '32px',
                    padding: '0 0.75rem',
                    fontSize: '0.8rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: hasChanges && !saving ? 'pointer' : 'not-allowed',
                    fontWeight: 600,
                    transition: 'background 0.3s, color 0.3s, opacity 0.2s',
                    background: saveSuccess ? '#16a34a' : 'var(--primary)',
                    color: 'white',
                    opacity: (!hasChanges && !saveSuccess && !saving) ? 0.4 : 1,
                  }}
                >
                  {saving
                    ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> {t('save')}</>
                    : saveSuccess
                      ? <><CheckCircle2 size={14} /> Guardado</>
                      : <><Save size={14} /> {t('save')}</>}
                </button>
              </div>
            </div>

            {keyError && (
              <div style={{ color: '#ef4444', fontSize: '0.75rem', marginBottom: '0.5rem', fontWeight: 600 }}>
                ⚠️ {keyError}
              </div>
            )}

            {/* Table */}
            <div style={{ flex: 1, overflowY: 'auto', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.03)', position: 'sticky', top: 0, zIndex: 1 }}>
                    <th style={{ ...thStyle, width: '70px' }}>{t('cat_key')}</th>
                    <th style={thStyle}>🇲🇽 {t('cat_value_es')}</th>
                    <th style={thStyle}>🇺🇸 {t('cat_value_en')}</th>
                    <th style={thStyle}>🇧🇷 {t('cat_value_pt')}</th>
                    <th style={{ ...thStyle, width: '36px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEntries.map((entry) => {
                    const realIdx = editEntries.indexOf(entry);
                    return (
                      <tr
                        key={realIdx}
                        style={{ borderBottom: '1px solid var(--border)' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <td style={tdStyle}>
                          <input
                            value={entry.key}
                            onChange={e => handleEntryChange(realIdx, 'key', e.target.value)}
                            style={cellInputStyle}
                          />
                        </td>
                        <td style={tdStyle}>
                          <input
                            value={entry.value_es}
                            onChange={e => handleEntryChange(realIdx, 'value_es', e.target.value)}
                            style={cellInputStyle}
                          />
                        </td>
                        <td style={tdStyle}>
                          <input
                            value={entry.value_en}
                            onChange={e => handleEntryChange(realIdx, 'value_en', e.target.value)}
                            style={{ ...cellInputStyle, opacity: entry.value_en ? 1 : 0.5 }}
                            placeholder={entry.value_es || '—'}
                          />
                        </td>
                        <td style={tdStyle}>
                          <input
                            value={entry.value_pt}
                            onChange={e => handleEntryChange(realIdx, 'value_pt', e.target.value)}
                            style={{ ...cellInputStyle, opacity: entry.value_pt ? 1 : 0.5 }}
                            placeholder={entry.value_es || '—'}
                          />
                        </td>
                        <td style={{ ...tdStyle, textAlign: 'center' }}>
                          <button
                            onClick={() => handleRemove(realIdx)}
                            style={{
                              background: 'transparent', border: 'none', cursor: 'pointer',
                              color: '#ef4444', padding: '2px', display: 'flex', alignItems: 'center',
                            }}
                            title={t('cat_delete')}
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {/* Add row */}
                  <tr style={{ borderBottom: '1px solid var(--border)', background: 'rgba(59,130,246,0.06)' }}>
                    <td style={tdStyle}>
                      <input
                        value={newKey}
                        onChange={e => { setNewKey(e.target.value); setKeyError(''); }}
                        placeholder={`Auto (${getNextKey()})`}
                        style={{ ...cellInputStyle, opacity: 0.7, fontStyle: 'italic' }}
                        onKeyDown={e => { if (e.key === 'Enter') handleAdd(); }}
                      />
                    </td>
                    <td style={tdStyle}>
                      <input
                        value={newEs}
                        onChange={e => setNewEs(e.target.value)}
                        placeholder={`Nuevo valor...`}
                        style={{ ...cellInputStyle, fontWeight: 500 }}
                        onKeyDown={e => { if (e.key === 'Enter') handleAdd(); }}
                        autoFocus={false}
                      />
                    </td>
                    <td style={tdStyle}>
                      <input
                        value={newEn}
                        onChange={e => setNewEn(e.target.value)}
                        placeholder={t('cat_value_en')}
                        style={{ ...cellInputStyle, opacity: 0.6 }}
                        onKeyDown={e => { if (e.key === 'Enter') handleAdd(); }}
                      />
                    </td>
                    <td style={tdStyle}>
                      <input
                        value={newPt}
                        onChange={e => setNewPt(e.target.value)}
                        placeholder={t('cat_value_pt')}
                        style={{ ...cellInputStyle, opacity: 0.6 }}
                        onKeyDown={e => { if (e.key === 'Enter') handleAdd(); }}
                      />
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'center' }}>
                      <button
                        onClick={handleAdd}
                        disabled={!newEs.trim() && !newEn.trim() && !newPt.trim()}
                        style={{
                          background: 'var(--primary)', border: 'none', cursor: (!newEs.trim() && !newEn.trim() && !newPt.trim()) ? 'not-allowed' : 'pointer',
                          color: 'white', padding: '4px', display: 'flex', alignItems: 'center',
                          borderRadius: '4px', opacity: (!newEs.trim() && !newEn.trim() && !newPt.trim()) ? 0.3 : 1,
                          transition: 'opacity 0.15s',
                        }}
                        title={t('cat_add')}
                      >
                        <Plus size={15} />
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const thStyle: React.CSSProperties = {
  padding: '0.5rem 0.4rem',
  textAlign: 'left',
  fontWeight: 600,
  fontSize: '0.68rem',
  color: 'var(--text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.03em',
  borderBottom: '1px solid var(--border)',
};

const tdStyle: React.CSSProperties = {
  padding: '0.15rem 0.25rem',
};

const cellInputStyle: React.CSSProperties = {
  width: '100%',
  background: 'transparent',
  border: '1px solid transparent',
  borderRadius: '4px',
  padding: '0.25rem 0.35rem',
  fontSize: '0.78rem',
  color: 'var(--text-main)',
  outline: 'none',
  transition: 'border-color 0.15s',
};
