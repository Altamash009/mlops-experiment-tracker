import { useState, useEffect, useCallback } from 'react';
import Layout from '../components/Layout';
import DashboardCard from '../components/DashboardCard';
import RunsTable from '../components/RunsTable';
import AccuracyChart from '../components/Analytics/AccuracyChart';
import StatusChart from '../components/Analytics/StatusChart';
import TopModels from '../components/Analytics/TopModels';
import HeroSection from '../components/UI/HeroSection';
import { useAuth } from '../context/AuthContext';
import { getDashboardSummary, getRecentRuns, getDashboardAnalytics } from '../services/api';
import {
  FaDatabase, FaBoxOpen, FaCube, FaRocket,
  FaSyncAlt, FaFolderOpen
} from 'react-icons/fa';

export default function Dashboard() {
  const { selectedProjectId, selectedProjectName } = useAuth();
  const [summary,   setSummary]   = useState(null);
  const [runs,      setRuns]      = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);

  const load = useCallback(async () => {
    if (!selectedProjectId) return;
    setLoading(true); setError('');
    try {
      const [s, r, a] = await Promise.all([
        getDashboardSummary(selectedProjectId),
        getRecentRuns(selectedProjectId),
        getDashboardAnalytics(selectedProjectId),
      ]);
      setSummary(s);
      setRuns(Array.isArray(r.runs) ? r.runs : []);
      setAnalytics(a);
      setLastUpdated(new Date());
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to load dashboard. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  }, [selectedProjectId]);

  useEffect(() => { load(); }, [load]);

  const refreshBtn = (
    <button
      className="btn btn-secondary btn-sm"
      onClick={load}
      disabled={loading || !selectedProjectId}
      id="dashboard-refresh-btn"
    >
      <FaSyncAlt style={{ fontSize: 12, ...(loading && { animation: 'spin 1s linear infinite' }) }} />
      {loading ? 'Refreshing…' : 'Refresh'}
    </button>
  );

  // No project selected
  if (!selectedProjectId) {
    return (
      <Layout title="Dashboard" actions={refreshBtn}>
        <div className="card" style={{ marginTop: 40 }}>
          <div className="empty-state">
            <div className="empty-icon"><FaFolderOpen /></div>
            <div className="empty-title">No Project Selected</div>
            <div className="empty-subtitle">
              Use the project selector in the sidebar to select or create a project to view its dashboard.
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      title={selectedProjectName || 'Dashboard'}
      subtitle={lastUpdated ? `Last updated ${lastUpdated.toLocaleTimeString()}` : undefined}
      actions={refreshBtn}
    >
      {/* Error */}
      {error && <div className="alert alert-error">{error}</div>}

      {/* Loading skeleton */}
      {loading && !summary && (
        <div className="loading-overlay">
          <div className="spinner" />
          <span>Loading dashboard…</span>
        </div>
      )}

      {summary && (
        <>
          {/* ── HERO BANNER ────────────────────────────── */}
          <HeroSection
            projectName={selectedProjectName}
            summary={summary}
            bestAccuracy={
              analytics?.top_models?.[0]?.accuracy ??
              (analytics?.metric_trends?.accuracy?.length
                ? Math.max(...analytics.metric_trends.accuracy.map(a => a.value))
                : null)
            }
          />

          {/* ── STAT CARDS ─────────────────────────────── */}
          <div className="grid-4 stagger" style={{ marginBottom: 32 }}>
            <DashboardCard title="Total Runs"        value={summary.total_runs}         icon={<FaDatabase />} color="blue"   delay={0}   sub={summary.running_runs > 0 ? `${summary.running_runs} running` : 'None active'} />
            <DashboardCard title="Registered Models" value={summary.registered_models}  icon={<FaBoxOpen />}  color="orange" delay={60}  sub={summary.latest_model ? `Latest: ${summary.latest_model}` : undefined} />
            <DashboardCard title="Artifacts"         value={summary.artifacts}           icon={<FaCube />}     color="purple" delay={120} />
            <DashboardCard title="In Production"     value={summary.production_models}   icon={<FaRocket />}   color="green"  delay={180} sub="Production stage models" />
          </div>

          {/* ── RECENT RUNS ─────────────────────────────── */}
          <div style={{ marginBottom: 32 }}>
            <div className="page-header" style={{ marginBottom: 16 }}>
              <div>
                <div className="chart-title" style={{ fontSize: 16 }}>Recent Runs</div>
                <div className="chart-subtitle">Last 10 experiment runs • Click a row to expand details</div>
              </div>
            </div>
            <RunsTable runs={runs} />
          </div>

          {/* ── ANALYTICS CHARTS ─────────────────────────── */}
          {analytics && (
            <div className="grid-3">
              <AccuracyChart data={analytics.metric_trends?.accuracy || []} />
              <StatusChart   data={analytics.status_distribution || {}} />
              <TopModels     models={analytics.top_models || []} />
            </div>
          )}
        </>
      )}
    </Layout>
  );
}