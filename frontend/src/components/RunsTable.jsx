import { useState, useEffect } from 'react';
import StatusBadge from './StatusBadge';
import { getRunDetails } from '../services/api';
import { FaChevronDown, FaChevronRight, FaBoxOpen, FaHashtag, FaFire, FaChartLine, FaSlidersH } from 'react-icons/fa';
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  PointElement, LineElement, Tooltip, Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

function fmt(dt) {
  if (!dt) return '—';
  return new Date(dt).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' });
}

function duration(start, end) {
  if (!start || !end) return null;
  const ms = new Date(end) - new Date(start);
  const s = Math.floor(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  return `${m}m ${s % 60}s`;
}

function MiniSparkline({ data, color = '#f6821f' }) {
  if (!data || data.length < 2) return null;
  const chartData = {
    labels: data.map((_, i) => i),
    datasets: [{
      data: data.map(d => d.value ?? d),
      borderColor: color,
      backgroundColor: color + '15',
      fill: true,
      tension: 0.4,
      pointRadius: 0,
      borderWidth: 1.5,
    }]
  };
  return (
    <div style={{ width: 80, height: 28 }}>
      <Line
        data={chartData}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false }, tooltip: { enabled: false } },
          scales: { x: { display: false }, y: { display: false } },
          animation: { duration: 600 }
        }}
      />
    </div>
  );
}

export default function RunsTable({ runs = [], onSelectRun }) {
  const [expanded, setExpanded] = useState(null);

  if (!runs.length) {
    return (
      <div className="card">
        <div className="empty-state">
          <div className="empty-icon">🔬</div>
          <div className="empty-title">No runs found</div>
          <div className="empty-subtitle">Start a run using the SDK or API to see it here.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="table-wrapper runs-table-wrapper">
      <table>
        <thead>
          <tr>
            <th style={{ width: 32 }} />
            <th>Run Name</th>
            <th>Status</th>
            <th>Started</th>
            <th>Duration</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          {runs.map((run, idx) => {
            const isOpen = expanded === run.run_id;
            const dur    = duration(run.start_time, run.end_time);
            return (
              <RunsRow
                key={run.run_id}
                run={run}
                isOpen={isOpen}
                dur={dur}
                idx={idx}
                onToggle={() => {
                  setExpanded(isOpen ? null : run.run_id);
                  if (onSelectRun) onSelectRun(run.run_id);
                }}
              />
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function RunsRow({ run, isOpen, dur, idx, onToggle }) {
  return (
    <>
      <tr
        onClick={onToggle}
        className={`runs-row ${isOpen ? 'runs-row--open' : ''}`}
        style={{ animationDelay: `${idx * 30}ms` }}
      >
        <td>
          <span className={`runs-chevron ${isOpen ? 'runs-chevron--open' : ''}`}>
            {isOpen ? <FaChevronDown /> : <FaChevronRight />}
          </span>
        </td>
        <td>
          <div className="runs-name">{run.run_name}</div>
          <div className="runs-id">ID #{run.run_id}</div>
        </td>
        <td><StatusBadge status={run.status} /></td>
        <td className="text-muted">{fmt(run.start_time)}</td>
        <td>
          {dur
            ? <span className="mono">{dur}</span>
            : <span className="text-muted">—</span>
          }
        </td>
        <td style={{ maxWidth: 200 }}>
          <span className="text-muted truncate" style={{ display: 'block' }}>
            {run.notes || '—'}
          </span>
        </td>
      </tr>
      {isOpen && (
        <tr className="runs-detail-row">
          <td colSpan={6} style={{ padding: 0 }}>
            <div className="runs-detail-panel">
              <RunDetail runId={run.run_id} />
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function RunDetail({ runId }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    setLoading(true);
    getRunDetails(runId)
      .then(d => setDetail(d))
      .catch(() => setDetail(null))
      .finally(() => setLoading(false));
  }, [runId]);

  if (loading) return (
    <div className="run-detail-loading">
      <div className="spinner" style={{ width: 24, height: 24, borderWidth: 2 }} />
      <span>Loading run details...</span>
    </div>
  );

  if (!detail) return <div className="run-detail-empty">No detail available.</div>;

  const run       = detail.run || detail;
  const params    = run.parameters  || {};
  const metrics   = run.metrics     || {};
  const arts      = run.artifacts   || [];
  const models    = run.registered_models || [];

  return (
    <div className="run-detail animate-fadeIn">
      {/* Tabs */}
      <div className="run-detail-tabs">
        {[
          { key: 'overview', label: 'Overview', icon: <FaHashtag /> },
          { key: 'params', label: `Parameters (${Object.keys(params).length})`, icon: <FaSlidersH /> },
          { key: 'metrics', label: `Metrics (${Object.keys(metrics).length})`, icon: <FaChartLine /> },
          { key: 'artifacts', label: `Artifacts (${arts.length})`, icon: <FaBoxOpen /> },
        ].map(tab => (
          <button
            key={tab.key}
            className={`run-detail-tab ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="run-detail-content">
        {activeTab === 'overview' && (
          <div className="run-detail-overview">
            {/* Quick stats */}
            <div className="run-detail-stats">
              <div className="run-stat-chip">
                <FaSlidersH style={{ color: 'var(--cf-blue)' }} />
                <span>{Object.keys(params).length} params</span>
              </div>
              <div className="run-stat-chip">
                <FaChartLine style={{ color: 'var(--cf-orange)' }} />
                <span>{Object.keys(metrics).length} metrics</span>
              </div>
              <div className="run-stat-chip">
                <FaBoxOpen style={{ color: 'var(--cf-purple)' }} />
                <span>{arts.length} artifacts</span>
              </div>
              {models.length > 0 && (
                <div className="run-stat-chip">
                  <FaFire style={{ color: 'var(--cf-green)' }} />
                  <span>{models.length} model{models.length > 1 ? 's' : ''}</span>
                </div>
              )}
            </div>

            {/* Key metrics preview */}
            {Object.keys(metrics).length > 0 && (
              <div className="run-detail-section">
                <div className="run-detail-section-title">
                  <FaChartLine /> Key Metrics
                </div>
                <div className="run-metrics-grid">
                  {Object.entries(metrics).slice(0, 4).map(([name, values]) => {
                    const latest = Array.isArray(values) && values.length > 0 ? values[values.length - 1] : null;
                    return (
                      <div key={name} className="run-metric-card">
                        <div className="run-metric-name">{name}</div>
                        <div className="run-metric-value">
                          {latest ? Number(latest.value).toFixed(4) : '—'}
                        </div>
                        {Array.isArray(values) && values.length > 1 && (
                          <MiniSparkline data={values} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Key params preview */}
            {Object.keys(params).length > 0 && (
              <div className="run-detail-section">
                <div className="run-detail-section-title">
                  <FaSlidersH /> Key Parameters
                </div>
                <div className="run-params-grid">
                  {Object.entries(params).slice(0, 6).map(([k, v]) => (
                    <div key={k} className="run-param-chip">
                      <span className="run-param-key">{k}</span>
                      <span className="run-param-val">{String(v)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'params' && (
          <div className="run-detail-section">
            {Object.keys(params).length === 0
              ? <div className="run-detail-empty-inline">No parameters logged for this run.</div>
              : (
                <div className="table-wrapper" style={{ border: 'none' }}>
                  <table>
                    <thead>
                      <tr>
                        <th>Parameter</th>
                        <th>Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(params).map(([k, v]) => (
                        <tr key={k}>
                          <td style={{ fontWeight: 600, color: 'var(--cf-text-secondary)' }}>{k}</td>
                          <td><span className="mono">{String(v)}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            }
          </div>
        )}

        {activeTab === 'metrics' && (
          <div className="run-detail-section">
            {Object.keys(metrics).length === 0
              ? <div className="run-detail-empty-inline">No metrics logged for this run.</div>
              : (
                <div className="run-metrics-full">
                  {Object.entries(metrics).map(([name, values]) => {
                    const arr = Array.isArray(values) ? values : [];
                    const latest = arr.length > 0 ? arr[arr.length - 1] : null;
                    const first = arr.length > 0 ? arr[0] : null;
                    const min = arr.length > 0 ? Math.min(...arr.map(v => v.value)) : null;
                    const max = arr.length > 0 ? Math.max(...arr.map(v => v.value)) : null;
                    const improved = first && latest && latest.value > first.value;

                    return (
                      <div key={name} className="run-metric-full-card">
                        <div className="run-metric-full-header">
                          <div>
                            <div className="run-metric-full-name">{name}</div>
                            {arr.length > 1 && (
                              <div className="run-metric-full-range">
                                {arr.length} steps · {min !== null ? min.toFixed(4) : '—'} → {max !== null ? max.toFixed(4) : '—'}
                              </div>
                            )}
                          </div>
                          <div className="run-metric-full-value">
                            {latest ? Number(latest.value).toFixed(4) : '—'}
                            {improved && <span className="run-metric-trend up">↑</span>}
                            {!improved && first && latest && latest.value < first.value && <span className="run-metric-trend down">↓</span>}
                          </div>
                        </div>
                        {arr.length > 1 && (
                          <div className="run-metric-chart">
                            <Line
                              data={{
                                labels: arr.map(v => `Step ${v.step}`),
                                datasets: [{
                                  data: arr.map(v => v.value),
                                  borderColor: improved ? '#22c55e' : '#f6821f',
                                  backgroundColor: (improved ? 'rgba(34,197,94,0.08)' : 'rgba(246,130,31,0.08)'),
                                  fill: true,
                                  tension: 0.4,
                                  pointRadius: arr.length < 20 ? 3 : 0,
                                  pointBackgroundColor: improved ? '#22c55e' : '#f6821f',
                                  pointBorderColor: '#0d1117',
                                  pointBorderWidth: 1.5,
                                  borderWidth: 2,
                                }]
                              }}
                              options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: { legend: { display: false }, tooltip: { backgroundColor: '#1c2333', titleColor: '#e8eaf0', bodyColor: '#8b93a7', borderColor: 'rgba(255,255,255,0.07)', borderWidth: 1 } },
                                scales: {
                                  x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#4b5263', font: { size: 9 }, maxTicksLimit: 8 } },
                                  y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#4b5263', font: { size: 9 } } },
                                },
                                animation: { duration: 600 }
                              }}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )
            }
          </div>
        )}

        {activeTab === 'artifacts' && (
          <div className="run-detail-section">
            {arts.length === 0
              ? <div className="run-detail-empty-inline">No artifacts uploaded for this run.</div>
              : (
                <div className="run-artifacts-grid">
                  {arts.map((a, i) => (
                    <div key={i} className="run-artifact-card">
                      <div className="run-artifact-icon">📦</div>
                      <div className="run-artifact-info">
                        <div className="run-artifact-name">{a.artifact_name || a.name || `Artifact ${i + 1}`}</div>
                        {a.artifact_type && <span className="tag">{a.artifact_type}</span>}
                        {a.file_size && <div className="run-artifact-size">{(a.file_size / 1024).toFixed(1)} KB</div>}
                      </div>
                    </div>
                  ))}
                </div>
              )
            }
            {models.length > 0 && (
              <div className="run-detail-section" style={{ marginTop: 20 }}>
                <div className="run-detail-section-title">
                  <FaFire /> Registered Models
                </div>
                <div className="run-models-grid">
                  {models.map((m, i) => (
                    <div key={i} className="run-model-chip">
                      <span className="run-model-name">{m.model_name}</span>
                      <span className="tag">v{m.version}</span>
                      <StatusBadge status={m.stage} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
