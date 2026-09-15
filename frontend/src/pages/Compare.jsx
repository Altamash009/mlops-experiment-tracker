import { useState, useCallback } from 'react';
import Layout from '../components/Layout';
import StatusBadge from '../components/StatusBadge';
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  PointElement, LineElement, Tooltip, Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { compareRuns, getProjectRuns } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FaExchangeAlt, FaFolderOpen, FaChartLine } from 'react-icons/fa';
import { useEffect } from 'react';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

const LINE_COLORS = ['#f6821f', '#3b82f6', '#22c55e', '#a855f7', '#eab308'];

export default function Compare() {
  const { selectedProjectId } = useAuth();
  const [allRuns,    setAllRuns]    = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [results,    setResults]    = useState(null);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState('');

  // Load project runs for selection
  useEffect(() => {
    if (!selectedProjectId) return;
    getProjectRuns(selectedProjectId)
      .then(d => setAllRuns(Array.isArray(d.runs) ? d.runs : (Array.isArray(d) ? d : [])))
      .catch(() => {});
  }, [selectedProjectId]);

  const toggleId = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleCompare = useCallback(async () => {
    if (selectedIds.length < 2) { setError('Select at least 2 runs to compare.'); return; }
    setLoading(true); setError(''); setResults(null);
    try {
      const data = await compareRuns(selectedIds);
      setResults(data);
    } catch (e) {
      setError(e.response?.data?.error || 'Comparison failed.');
    } finally { setLoading(false); }
  }, [selectedIds]);

  if (!selectedProjectId) return (
    <Layout title="Compare Runs">
      <div className="card"><div className="empty-state">
        <div className="empty-icon"><FaFolderOpen /></div>
        <div className="empty-title">No Project Selected</div>
      </div></div>
    </Layout>
  );

  // Build overlay chart from results
  const buildChart = () => {
    if (!results?.runs) return null;
    const runsArr = Object.values(results.runs);
    if (!runsArr.length) return null;

    // Collect all metric names
    const metricNames = new Set();
    runsArr.forEach(r => Object.keys(r.metrics || {}).forEach(m => metricNames.add(m)));

    // Build a dataset per run per metric (simplified: just show all metrics)
    const datasets = [];
    runsArr.forEach((run, idx) => {
      const metrics = run.metrics || {};
      Object.entries(metrics).forEach(([mName, val]) => {
        datasets.push({
          label: `${run.run_name} — ${mName}`,
          data: Array.isArray(val) ? val.map(v => v.value) : [val],
          borderColor: LINE_COLORS[idx % LINE_COLORS.length],
          backgroundColor: LINE_COLORS[idx % LINE_COLORS.length] + '10',
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointBackgroundColor: LINE_COLORS[idx % LINE_COLORS.length],
          pointBorderColor: '#0d1117',
          pointBorderWidth: 2,
          pointHoverRadius: 6,
          borderWidth: 2,
        });
      });
    });

    const maxLen = Math.max(...datasets.map(d => d.data.length), 1);
    const labels = Array.from({ length: maxLen }, (_, i) => `Step ${i}`);

    return { labels, datasets };
  };

  const chart = results ? buildChart() : null;

  return (
    <Layout
      title="Compare Runs"
      subtitle="Side-by-side experiment comparison"
      actions={
        <button className="btn btn-primary btn-sm" onClick={handleCompare} disabled={loading || selectedIds.length < 2} id="compare-btn">
          <FaExchangeAlt /> Compare ({selectedIds.length})
        </button>
      }
    >
      {error && <div className="alert alert-error">{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 24, alignItems: 'start' }}>
        {/* Run selector */}
        <div className="card" style={{ position: 'sticky', top: 80 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <div className="chart-title">Select Runs</div>
            {selectedIds.length > 0 && (
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setSelectedIds([])}
                style={{ padding: '2px 8px', fontSize: 11 }}
              >
                Clear
              </button>
            )}
          </div>
          <div className="chart-subtitle" style={{ marginBottom: 14 }}>
            Choose 2+ runs to compare
          </div>
          {allRuns.length === 0
            ? <div className="text-muted" style={{ fontSize: 13 }}>No runs found for this project.</div>
            : allRuns.map((r, idx) => {
              const sel = selectedIds.includes(r.run_id);
              return (
                <div
                  key={r.run_id}
                  onClick={() => toggleId(r.run_id)}
                  className="animate-fadeIn"
                  style={{
                    animationDelay: `${idx * 30}ms`,
                    padding: '10px 12px', marginBottom: 6, borderRadius: 'var(--radius-sm)',
                    border: sel ? '1px solid var(--cf-orange)' : '1px solid var(--cf-border)',
                    background: sel ? 'var(--cf-orange-dim)' : 'var(--cf-surface)',
                    cursor: 'pointer', transition: 'all 0.2s', display: 'flex',
                    alignItems: 'center', gap: 10,
                  }}
                >
                  <div style={{
                    width: 18, height: 18, borderRadius: 4,
                    border: sel ? 'none' : '1.5px solid var(--cf-border)',
                    background: sel ? 'var(--cf-orange)' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontSize: 10, flexShrink: 0,
                    transition: 'all 0.2s',
                  }}>
                    {sel && '✓'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--cf-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.run_name}</div>
                    <StatusBadge status={r.status} />
                  </div>
                </div>
              );
            })
          }
        </div>

        {/* Results */}
        <div>
          {loading && <div className="loading-overlay"><div className="spinner" /><span>Comparing runs…</span></div>}

          {results && (
            <div className="animate-fadeIn">
              {/* Overlay chart */}
              {chart && (
                <div className="chart-card" style={{ marginBottom: 24 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                    <FaChartLine style={{ color: 'var(--cf-orange)' }} />
                    <div className="chart-title">Metric Comparison</div>
                  </div>
                  <div className="chart-subtitle">Overlaid metric values across selected runs</div>
                  <Line
                    data={chart}
                    options={{
                      responsive: true,
                      animation: { duration: 800, easing: 'easeInOutQuart' },
                      plugins: {
                        legend: { labels: { color: '#8b93a7', font: { size: 11 }, usePointStyle: true, padding: 16 } },
                        tooltip: {
                          backgroundColor: '#1c2333', titleColor: '#e8eaf0',
                          bodyColor: '#8b93a7', borderColor: 'rgba(255,255,255,0.07)', borderWidth: 1,
                          padding: 12, cornerRadius: 8,
                        }
                      },
                      scales: {
                        x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#4b5263', font: { size: 10 } } },
                        y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#4b5263', font: { size: 10 } } },
                      }
                    }}
                  />
                </div>
              )}

              {/* Side-by-side table */}
              {results.runs && Object.entries(results.runs).map(([runId, run], idx) => (
                <div
                  key={runId}
                  className="card compare-run-card animate-fadeIn"
                  style={{ marginBottom: 16, animationDelay: `${idx * 60}ms` }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                    <div style={{
                      width: 10, height: 10, borderRadius: '50%',
                      background: LINE_COLORS[idx % LINE_COLORS.length],
                      boxShadow: `0 0 8px ${LINE_COLORS[idx % LINE_COLORS.length]}40`
                    }} />
                    <StatusBadge status={run.status} />
                    <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--cf-text-primary)' }}>{run.run_name}</span>
                    <span className="text-muted">#{runId}</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                    <div>
                      <div className="chart-subtitle" style={{ marginBottom: 8 }}>Parameters</div>
                      {Object.entries(run.parameters || {}).length === 0
                        ? <div className="text-muted">None</div>
                        : Object.entries(run.parameters).map(([k, v]) => (
                          <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                            <span style={{ fontSize: 12, color: 'var(--cf-text-secondary)' }}>{k}</span>
                            <span className="mono">{String(v)}</span>
                          </div>
                        ))
                      }
                    </div>
                    <div>
                      <div className="chart-subtitle" style={{ marginBottom: 8 }}>Metrics</div>
                      {Object.entries(run.metrics || {}).length === 0
                        ? <div className="text-muted">None</div>
                        : Object.entries(run.metrics).map(([k, v]) => (
                          <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                            <span style={{ fontSize: 12, color: 'var(--cf-text-secondary)' }}>{k}</span>
                            <span className="mono" style={{ color: 'var(--cf-orange)' }}>
                              {typeof v === 'number' ? v.toFixed(4) : (Array.isArray(v) ? v[v.length-1]?.value?.toFixed(4) : String(v))}
                            </span>
                          </div>
                        ))
                      }
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!results && !loading && (
            <div className="card">
              <div className="empty-state">
                <div className="empty-icon"><FaExchangeAlt /></div>
                <div className="empty-title">Ready to Compare</div>
                <div className="empty-subtitle">Select 2 or more runs from the left panel and click Compare.</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}