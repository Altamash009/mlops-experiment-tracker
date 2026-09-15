import { useState, useEffect, useCallback } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { getProjectRuns, getRunArtifacts, downloadArtifact, deleteArtifact } from '../services/api';
import { FaCube, FaFolderOpen, FaSyncAlt, FaFile, FaImage, FaChartBar, FaCode, FaDownload, FaTrashAlt } from 'react-icons/fa';

function fmt(dt) {
  if (!dt) return '—';
  return new Date(dt).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' });
}

function formatSize(bytes) {
  if (!bytes) return '—';
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  return `${size.toFixed(size >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

function getIcon(type) {
  if (!type) return <FaFile />;
  const t = type.toLowerCase();
  if (t.includes('image') || t.includes('png') || t.includes('jpg')) return <FaImage />;
  if (t.includes('chart') || t.includes('plot') || t.includes('figure')) return <FaChartBar />;
  if (t.includes('model') || t.includes('pkl') || t.includes('pt')) return <FaCode />;
  if (t.includes('dataset') || t.includes('data')) return <FaCube />;
  if (t.includes('log')) return <FaFile />;
  if (t.includes('report')) return <FaChartBar />;
  if (t.includes('config')) return <FaCode />;
  return <FaFile />;
}

function ArtifactCard({ artifact, onDownload, onDelete, runStatus }) {
  const [hovered, setHovered] = useState(false);
  const [actionHover, setActionHover] = useState(null);

  const handleDownload = async () => {
    try {
      const data = await downloadArtifact(artifact.artifact_id);
      if (data.download_url) {
        window.open(data.download_url, '_blank', 'noopener,noreferrer');
      }
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${artifact.artifact_name}"? This cannot be undone.`)) return;
    try {
      await deleteArtifact(artifact.artifact_id);
      onDelete(artifact.artifact_id);
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Failed to delete artifact. The run may have already ended.');
    }
  };

  const canModify = runStatus === 'RUNNING';

  return (
    <div
      className="artifact-card"
      tabIndex={0}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      style={{
        animationDelay: `${artifact._index * 40}ms`,
        background: 'var(--cf-surface)',
        border: '1px solid var(--cf-border)',
        borderRadius: 'var(--radius-md)',
        padding: '14px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        transition: 'border-color 0.25s cubic-bezier(0.4, 0, 0.2, 1), transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'default',
        position: 'relative',
        overflow: 'hidden',
        outline: 'none',
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          background: 'var(--cf-navy-3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 18,
          flexShrink: 0,
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), background 0.3s',
          color: 'var(--cf-blue)',
        }}
      >
        {getIcon(artifact.artifact_type || artifact.type || '')}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontWeight: 600,
          fontSize: 13,
          color: 'var(--cf-text-primary)',
          marginBottom: 3,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          transition: 'color 0.2s',
        }}>
          {artifact.artifact_name || artifact.name || `Artifact ${artifact._index + 1}`}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {(artifact.artifact_type || artifact.type) && (
            <span className="tag" style={{ marginBottom: 4, transition: 'all 0.2s' }}>
              {artifact.artifact_type || artifact.type}
            </span>
          )}
          {artifact.file_size && (
            <span style={{ fontSize: 11, color: 'var(--cf-text-muted)', fontFamily: 'monospace' }}>
              {formatSize(artifact.file_size)}
            </span>
          )}
          <span style={{ fontSize: 11, color: 'var(--cf-text-muted)', marginLeft: 'auto' }}>
            {fmt(artifact.uploaded_at || artifact.created_at)}
          </span>
        </div>
        {artifact.description && (
          <div style={{
            fontSize: 11,
            color: 'var(--cf-text-muted)',
            marginTop: 4,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: 300,
          }}>
            {artifact.description}
          </div>
        )}
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          opacity: hovered ? 1 : 0,
          transform: hovered ? 'translateX(0)' : 'translateX(10px)',
          transition: 'opacity 0.25s cubic-bezier(0.4, 0, 0.2, 1), transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          flexShrink: 0,
        }}
      >
        <button
          onClick={handleDownload}
          onMouseEnter={() => setActionHover('download')}
          onMouseLeave={() => setActionHover(null)}
          className="btn btn-ghost btn-sm"
          style={{
            padding: '6px 8px',
            borderRadius: 8,
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            background: actionHover === 'download' ? 'var(--cf-blue-dim)' : 'transparent',
            color: actionHover === 'download' ? 'var(--cf-blue)' : 'var(--cf-text-secondary)',
            borderColor: actionHover === 'download' ? 'var(--cf-blue)' : 'var(--cf-border)',
          }}
          title="Download artifact"
          disabled={!canModify}
        >
          <FaDownload style={{ fontSize: 12 }} />
        </button>

        {canModify && (
          <button
            onClick={handleDelete}
            onMouseEnter={() => setActionHover('delete')}
            onMouseLeave={() => setActionHover(null)}
            className="btn btn-ghost btn-sm"
            style={{
              padding: '6px 8px',
              borderRadius: 8,
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              background: actionHover === 'delete' ? 'var(--cf-red-dim)' : 'transparent',
              color: actionHover === 'delete' ? 'var(--cf-red)' : 'var(--cf-text-secondary)',
              borderColor: actionHover === 'delete' ? 'var(--cf-red)' : 'var(--cf-border)',
            }}
            title="Delete artifact"
          >
            <FaTrashAlt style={{ fontSize: 11 }} />
          </button>
        )}

        {!canModify && (
          <button
            className="btn btn-ghost btn-sm"
            style={{
              padding: '6px 8px',
              borderRadius: 8,
              color: 'var(--cf-text-muted)',
              borderColor: 'var(--cf-border)',
              cursor: 'help',
            }}
            title="Artifacts can only be deleted while the run is RUNNING"
            disabled
          >
            <FaTrashAlt style={{ fontSize: 11, opacity: 0.4 }} />
          </button>
        )}
      </div>

      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          background: 'linear-gradient(90deg, var(--cf-orange), var(--cf-blue), var(--cf-purple))',
          transform: hovered ? 'scaleX(1)' : 'scaleX(0)',
          transformOrigin: 'left',
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          opacity: hovered ? 1 : 0,
        }}
      />
    </div>
  );
}

export default function Artifacts() {
  const { selectedProjectId } = useAuth();
  const [runsWithArtifacts, setRunsWithArtifacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [totalCount, setTotalCount] = useState(0);

  const load = useCallback(async () => {
    if (!selectedProjectId) return;
    setLoading(true); setError('');
    try {
      const runsData = await getProjectRuns(selectedProjectId);
      const runs = Array.isArray(runsData.runs) ? runsData.runs : (Array.isArray(runsData) ? runsData : []);

      // Load artifacts for each run in parallel
      const results = await Promise.all(
        runs.map(async run => {
          try {
            const artData = await getRunArtifacts(run.run_id);
            const arts = Array.isArray(artData.artifacts) ? artData.artifacts : (Array.isArray(artData) ? artData : []);
            // Add index to each artifact for staggered animation
            const artifactsWithIndex = arts.map((art, idx) => ({ ...art, _index: idx }));
            return { ...run, artifacts: artifactsWithIndex };
          } catch {
            return { ...run, artifacts: [] };
          }
        })
      );

      const withArts = results.filter(r => r.artifacts.length > 0);
      setRunsWithArtifacts(withArts);
      setTotalCount(results.reduce((s, r) => s + r.artifacts.length, 0));
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to load artifacts.');
    } finally { setLoading(false); }
  }, [selectedProjectId]);

  useEffect(() => { load(); }, [load]);

  if (!selectedProjectId) return (
    <Layout title="Artifacts">
      <div className="card"><div className="empty-state">
        <div className="empty-icon float-slow"><FaFolderOpen /></div>
        <div className="empty-title">No Project Selected</div>
      </div></div>
    </Layout>
  );

  return (
    <Layout
      title="Artifacts"
      subtitle={`${totalCount} artifact${totalCount !== 1 ? 's' : ''} across all runs`}
      actions={
        <button className="btn btn-secondary btn-sm" onClick={load} disabled={loading}>
          <FaSyncAlt style={{ fontSize: 12 }} /> Refresh
        </button>
      }
    >
      {error && <div className="alert alert-error">{error}</div>}

      {loading
        ? <div className="loading-overlay"><div className="spinner" /><span>Loading artifacts…</span></div>
        : runsWithArtifacts.length === 0
          ? (
            <div className="card">
              <div className="empty-state">
                <div className="empty-icon float-slow"><FaCube /></div>
                <div className="empty-title">No Artifacts Found</div>
                <div className="empty-subtitle">Upload artifacts from your runs using the SDK to see them here.</div>
              </div>
            </div>
          )
          : runsWithArtifacts.map((run, ri) => (
            <div key={run.run_id} className="card animate-fadeIn" style={{ marginBottom: 20, animationDelay: `${ri * 60}ms` }}>
              {/* Run header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18, paddingBottom: 14, borderBottom: '1px solid var(--cf-border)' }}>
                <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-sm)', background: 'var(--cf-orange-dim)', color: 'var(--cf-orange)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>
                  <FaCube />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, color: 'var(--cf-text-primary)', fontSize: 15 }}>{run.run_name}</div>
                  <div style={{ fontSize: 11, color: 'var(--cf-text-muted)', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span>Run #{run.run_id} · {run.artifacts.length} artifact{run.artifacts.length !== 1 ? 's' : ''}</span>
                    {run.status && (
                      <>
                        <span
                          className={`badge badge-${run.status.toLowerCase()}`}
                          style={{ fontSize: 10 }}
                          title={run.status === 'RUNNING' ? 'Run is active - artifacts can be modified' : 'Run has ended - artifacts are read-only'}
                        >
                          {run.status}
                        </span>
                        {run.status === 'RUNNING' && (
                          <span className="status-dot" style={{ width: 6, height: 6 }} />
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Artifact grid */}
              <div className="grid-3 stagger-in">
                {run.artifacts.map((art, ai) => (
                  <ArtifactCard
                    key={art.artifact_id || ai}
                    artifact={art}
                    runStatus={run.status}
                    onDelete={(id) => {
                      setRunsWithArtifacts(prev =>
                        prev.map(r => {
                          if (r.run_id !== run.run_id) return r;
                          return {
                            ...r,
                            artifacts: r.artifacts.filter(a => a.artifact_id !== id),
                          };
                        })
                      );
                      setTotalCount(prev => prev - 1);
                    }}
                  />
                ))}
              </div>
            </div>
          ))
      }
    </Layout>
  );
}