import { useState, useEffect, useCallback } from 'react';
import Layout from '../components/Layout';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import { getProjectModels, promoteModel, rollbackModel, getModelHistory } from '../services/api';
import {
  FaBoxOpen, FaArrowUp, FaUndo, FaHistory,
  FaFolderOpen, FaSyncAlt
} from 'react-icons/fa';

function fmt(dt) {
  if (!dt) return '—';
  return new Date(dt).toLocaleDateString(undefined, { dateStyle: 'medium' });
}

export default function Registry() {
  const { selectedProjectId, selectedProjectName } = useAuth();
  const [models,  setModels]  = useState([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [history, setHistory] = useState(null);
  const [historyName, setHistoryName] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  const load = useCallback(async () => {
    if (!selectedProjectId) return;
    setLoading(true); setError('');
    try {
      const data = await getProjectModels(selectedProjectId);
      setModels(Array.isArray(data.models) ? data.models : (Array.isArray(data) ? data : []));
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to load models.');
    } finally { setLoading(false); }
  }, [selectedProjectId]);

  useEffect(() => { load(); }, [load]);

  const handlePromote = async (modelId) => {
    setActionLoading(modelId + '-promote');
    try {
      await promoteModel(modelId);
      await load();
    } catch (e) { setError(e.response?.data?.error || 'Promote failed.'); }
    finally { setActionLoading(null); }
  };

  const handleRollback = async (modelId) => {
    setActionLoading(modelId + '-rollback');
    try {
      await rollbackModel(modelId);
      await load();
    } catch (e) { setError(e.response?.data?.error || 'Rollback failed.'); }
    finally { setActionLoading(null); }
  };

  const handleHistory = async (modelName) => {
    setHistoryName(modelName);
    try {
      const data = await getModelHistory(selectedProjectId, modelName);
      setHistory(Array.isArray(data.history) ? data.history : (Array.isArray(data) ? data : []));
    } catch { setHistory([]); }
  };

  if (!selectedProjectId) return (
    <Layout title="Model Registry">
      <div className="card"><div className="empty-state">
        <div className="empty-icon"><FaFolderOpen /></div>
        <div className="empty-title">No Project Selected</div>
      </div></div>
    </Layout>
  );

  const stageOrder = { Production: 0, Staging: 1, Development: 2 };
  const sorted = [...models].sort((a, b) => (stageOrder[a.stage] ?? 9) - (stageOrder[b.stage] ?? 9));

  return (
    <Layout
      title="Model Registry"
      subtitle={selectedProjectName}
      actions={
        <button className="btn btn-secondary btn-sm" onClick={load} disabled={loading}>
          <FaSyncAlt style={{ fontSize: 12 }} /> Refresh
        </button>
      }
    >
      {error && <div className="alert alert-error">{error}</div>}

      {loading
        ? <div className="loading-overlay"><div className="spinner" /><span>Loading models…</span></div>
        : sorted.length === 0
          ? (
            <div className="card">
              <div className="empty-state">
                <div className="empty-icon"><FaBoxOpen /></div>
                <div className="empty-title">No Registered Models</div>
                <div className="empty-subtitle">Register a model from a completed run using the SDK.</div>
              </div>
            </div>
          )
          : (
            <div className="grid-3 stagger">
              {sorted.map((m, i) => {
                const isProduction = m.stage === 'Production';
                return (
                  <div
                    key={m.model_id}
                    className="card animate-fadeIn"
                    style={{
                      animationDelay: `${i * 60}ms`,
                      borderColor: isProduction ? 'rgba(34,197,94,0.3)' : undefined,
                      background: isProduction
                        ? 'linear-gradient(135deg, rgba(34,197,94,0.05), var(--cf-navy-2))'
                        : undefined,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'var(--cf-orange-dim)', color: 'var(--cf-orange)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                        <FaBoxOpen />
                      </div>
                      <StatusBadge status={m.stage} />
                    </div>

                    <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--cf-text-primary)', marginBottom: 4 }}>{m.model_name}</h3>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                      <span className="tag">v{m.version}</span>
                      <span className="tag">Run #{m.run_id}</span>
                    </div>
                    {m.description && (
                      <p style={{ fontSize: 12, color: 'var(--cf-text-muted)', marginBottom: 10 }}>{m.description}</p>
                    )}
                    <div style={{ fontSize: 11, color: 'var(--cf-text-muted)', marginBottom: 16 }}>
                      Registered {fmt(m.registered_at)}
                    </div>

                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {m.stage !== 'Production' && (
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => handlePromote(m.model_id)}
                          disabled={actionLoading === `${m.model_id}-promote`}
                        >
                          <FaArrowUp style={{ fontSize: 11 }} />
                          {actionLoading === `${m.model_id}-promote` ? '…' : 'Promote'}
                        </button>
                      )}
                      {m.stage === 'Production' && (
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleRollback(m.model_id)}
                          disabled={actionLoading === `${m.model_id}-rollback`}
                        >
                          <FaUndo style={{ fontSize: 11 }} />
                          {actionLoading === `${m.model_id}-rollback` ? '…' : 'Rollback'}
                        </button>
                      )}
                      <button className="btn btn-ghost btn-sm" onClick={() => handleHistory(m.model_name)}>
                        <FaHistory style={{ fontSize: 11 }} /> History
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )
      }

      {/* History Modal */}
      {history !== null && (
        <Modal title={`Version History — ${historyName}`} onClose={() => setHistory(null)} size="lg">
          {history.length === 0
            ? <div className="text-muted">No history found.</div>
            : (
              <div className="table-wrapper">
                <table>
                  <thead><tr><th>Version</th><th>Stage</th><th>Run ID</th><th>Registered</th></tr></thead>
                  <tbody>
                    {history.map((h, i) => (
                      <tr key={i}>
                        <td><span className="mono">v{h.version}</span></td>
                        <td><StatusBadge status={h.stage} /></td>
                        <td className="text-muted">#{h.run_id}</td>
                        <td className="text-muted">{fmt(h.registered_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          }
        </Modal>
      )}
    </Layout>
  );
}