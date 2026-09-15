import { useState, useEffect, useCallback } from 'react';
import Layout from '../components/Layout';
import RunsTable from '../components/RunsTable';
import DashboardCard from '../components/DashboardCard';
import { useAuth } from '../context/AuthContext';
import { getProjectRuns, getBestRun } from '../services/api';
import { FaDatabase, FaRocket, FaSyncAlt, FaFolderOpen, FaTrophy, FaExclamationTriangle } from 'react-icons/fa';

const STATUSES = ['All', 'RUNNING', 'COMPLETED', 'FAILED'];

export default function Runs() {
  const { selectedProjectId, selectedProjectName } = useAuth();
  const [runs,    setRuns]    = useState([]);
  const [bestRun, setBestRun] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [filter,  setFilter]  = useState('All');

  const load = useCallback(async () => {
    if (!selectedProjectId) return;
    setLoading(true); setError('');
    try {
      const [rData, bData] = await Promise.all([
        getProjectRuns(selectedProjectId),
        getBestRun(selectedProjectId, 'accuracy').catch(() => null),
      ]);
      setRuns(Array.isArray(rData.runs) ? rData.runs : (Array.isArray(rData) ? rData : []));
      setBestRun(bData);
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to load runs.');
    } finally { setLoading(false); }
  }, [selectedProjectId]);

  useEffect(() => { load(); }, [load]);

  const filtered = filter === 'All' ? runs : runs.filter(r => r.status === filter);

  const counts = {
    All: runs.length,
    RUNNING:   runs.filter(r => r.status === 'RUNNING').length,
    COMPLETED: runs.filter(r => r.status === 'COMPLETED').length,
    FAILED:    runs.filter(r => r.status === 'FAILED').length,
  };

  if (!selectedProjectId) return (
    <Layout title="Runs">
      <div className="card"><div className="empty-state">
        <div className="empty-icon"><FaFolderOpen /></div>
        <div className="empty-title">No Project Selected</div>
        <div className="empty-subtitle">Select a project from the sidebar to view its runs.</div>
      </div></div>
    </Layout>
  );

  return (
    <Layout
      title="Experiment Runs"
      subtitle={selectedProjectName}
      actions={
        <button className="btn btn-secondary btn-sm" onClick={load} disabled={loading}>
          <FaSyncAlt style={{ fontSize: 12 }} /> Refresh
        </button>
      }
    >
      {error && <div className="alert alert-error">{error}</div>}

      {/* ── STAT STRIP ─────────────────────────────── */}
      <div className="grid-4 stagger" style={{ marginBottom: 28 }}>
        <DashboardCard title="Total Runs"     value={counts.All}       icon={<FaDatabase />} color="blue"   />
        <DashboardCard title="Running"        value={counts.RUNNING}   icon={<FaSyncAlt />}  color="orange" />
        <DashboardCard title="Completed"      value={counts.COMPLETED} icon={<FaRocket />}   color="green"  />
        <DashboardCard title="Failed"         value={counts.FAILED}    icon={<FaExclamationTriangle />} color="red"    />
      </div>

      {/* ── BEST RUN ─────────────────────────────────── */}
      {bestRun && bestRun.best_run && (
        <div className="card animate-fadeIn" style={{ marginBottom: 28, borderColor: 'rgba(249,115,22,0.35)', background: 'linear-gradient(135deg, rgba(249,115,22,0.08), var(--cf-navy-2))', position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ fontSize: 32 }} className="float-slow"><FaTrophy style={{ color: 'var(--cf-orange)' }} /></div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--cf-orange)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'JetBrains Mono, monospace' }}>
                Benchmark Leader — Highest Accuracy
              </div>
              <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--cf-text-primary)' }}>
                {bestRun.best_run.run_name || `Run #${bestRun.best_run.run_id}`}
              </div>
            </div>
            <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
              <div style={{ fontSize: 30, fontWeight: 800, color: 'var(--cf-orange)', fontFamily: 'JetBrains Mono, monospace' }}>
                {bestRun.best_run.metric_value != null ? `${(bestRun.best_run.metric_value * 100).toFixed(1)}%` : '—'}
              </div>
              <div style={{ fontSize: 11, color: 'var(--cf-text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>ACCURACY</div>
            </div>
          </div>
          {/* Decorative glow */}
          <div style={{
            position: 'absolute', top: -40, right: -40, width: 140, height: 140,
            background: 'radial-gradient(circle, rgba(249,115,22,0.15), transparent 70%)',
            borderRadius: '50%', pointerEvents: 'none'
          }} />
        </div>
      )}

      {/* ── FILTER TABS ──────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <div className="filter-tabs">
          {STATUSES.map(s => (
            <button key={s} className={`filter-tab${filter === s ? ' active' : ''}`} onClick={() => setFilter(s)}>
              {s} <span style={{ opacity: 0.6, marginLeft: 4, fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}>({counts[s] || 0})</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── RUNS TABLE ───────────────────────────────── */}
      {loading
        ? <div className="loading-overlay"><div className="spinner" /><span>Loading runs telemetry…</span></div>
        : <RunsTable runs={filtered} />
      }
    </Layout>
  );
}
