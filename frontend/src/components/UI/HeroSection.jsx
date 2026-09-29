import { Link } from 'react-router-dom';
import { FaExchangeAlt, FaBoxOpen, FaBolt } from 'react-icons/fa';
import Dashboard3DScene from '../Dashboard3DScene';

export default function HeroSection({ projectName, summary, bestAccuracy }) {
  return (
    <div
      className="hero-banner animate-fadeIn"
      style={{ position: 'relative', overflow: 'hidden', marginBottom: 32 }}
    >
      {/* Ambient glow layers */}
      <div className="hero-glow-bg" />
      <div className="hero-grid-pattern" />

      {/* ── SIDE-BY-SIDE: left text | right 3D ─────────────────────── */}
      <div className="hero-grid-layout">
        {/* ── LEFT: headline, stats, CTAs ──────────────────────────── */}
        <div style={{ zIndex: 2 }}>
          <div className="hero-tag">
            <span className="hero-tag-pulse" />
            <span>MLOps Telemetry Active</span>
            <span style={{ color: 'var(--cf-text-muted)', margin: '0 4px' }}>•</span>
            <span style={{ color: 'var(--cf-text-primary)', fontWeight: 600 }}>
              {projectName || 'Live Workspace'}
            </span>
          </div>

          <h1 className="hero-title" style={{ marginBottom: 12 }}>
            Real-Time Experiment &amp;{' '}
            <span className="hero-accent-text">Model Tracking</span>
          </h1>

          <p className="hero-subtitle" style={{ maxWidth: 460, marginBottom: 20 }}>
            Observe model convergence, benchmark hyperparameter sweeps, and govern
            production registry checkpoints.
          </p>

          {/* Metric pills inline */}
          {summary && (
            <div style={{ display: 'flex', gap: 10, marginBottom: 22, flexWrap: 'wrap' }}>
              <div className="hero-metric-pill" style={{ padding: '8px 16px', textAlign: 'center' }}>
                <span className="hero-metric-val" style={{ fontSize: 20, color: 'var(--cf-text-primary)' }}>
                  {summary.total_runs ?? 0}
                </span>
                <span className="hero-metric-lbl" style={{ fontSize: 10 }}>Runs</span>
              </div>
              <div className="hero-metric-pill" style={{ padding: '8px 16px', textAlign: 'center' }}>
                <span className="hero-metric-val" style={{ fontSize: 20, color: 'var(--cf-green)' }}>
                  {bestAccuracy != null
                    ? `${(bestAccuracy * 100).toFixed(0)}%`
                    : summary.production_models ?? '—'}
                </span>
                <span className="hero-metric-lbl" style={{ fontSize: 10 }}>Best Acc</span>
              </div>
              <div className="hero-metric-pill" style={{ padding: '8px 16px', textAlign: 'center' }}>
                <span className="hero-metric-val" style={{ fontSize: 20, color: 'var(--cf-blue)' }}>
                  {summary.registered_models ?? 0}
                </span>
                <span className="hero-metric-lbl" style={{ fontSize: 10 }}>Models</span>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Link to="/runs" className="btn btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <FaBolt style={{ fontSize: 12, color: 'var(--cf-orange)' }} /> Explore Runs
            </Link>
            <Link to="/compare" className="btn btn-secondary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <FaExchangeAlt style={{ fontSize: 11 }} /> Compare Metrics
            </Link>
            <Link to="/registry" className="btn btn-ghost"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <FaBoxOpen style={{ fontSize: 12 }} /> Model Registry
            </Link>
          </div>
        </div>

        {/* ── RIGHT: 3D scene panel ─────────────────────────────────── */}
        <div className="hero-3d-panel">
          {/* Label */}
          <div style={{
            position: 'absolute',
            top: 10,
            left: 14,
            zIndex: 10,
            fontSize: 9,
            fontFamily: 'JetBrains Mono, monospace',
            color: 'rgba(160,195,236,0.85)',
            textTransform: 'uppercase',
            letterSpacing: '1.2px',
            pointerEvents: 'none',
          }}>
            ● Neural Network Pipeline
          </div>

          <Dashboard3DScene />
        </div>
      </div>
    </div>
  );
}
