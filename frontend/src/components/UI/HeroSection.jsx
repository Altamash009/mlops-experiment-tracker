import { Link } from 'react-router-dom';
import { FaExchangeAlt, FaBoxOpen, FaBolt } from 'react-icons/fa';

export default function HeroSection({ projectName, summary, bestAccuracy }) {
  return (
    <div className="hero-banner animate-fadeIn">
      {/* Decorative ambient glowing background */}
      <div className="hero-glow-bg" />
      <div className="hero-grid-pattern" />

      <div className="hero-content">
        <div style={{ flex: 1 }}>
          {/* Animated live telemetry tag */}
          <div className="hero-tag">
            <span className="hero-tag-pulse" />
            <span>MLOps Telemetry Active</span>
            <span style={{ color: 'var(--cf-text-muted)', margin: '0 4px' }}>•</span>
            <span style={{ color: 'var(--cf-text-primary)', fontWeight: 600 }}>{projectName || 'Live Workspace'}</span>
          </div>

          <h1 className="hero-title">
            Real-Time Experiment &amp; <span className="hero-accent-text">Model Tracking</span>
          </h1>

          <p className="hero-subtitle">
            Observe model convergence, benchmark hyperparameter sweeps, and govern production registry checkpoints with sub-second precision.
          </p>

          {/* Quick action buttons with hover animations */}
          <div style={{ display: 'flex', gap: 12, marginTop: 24, flexWrap: 'wrap' }}>
            <Link to="/runs" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <FaBolt style={{ fontSize: 13, color: 'var(--cf-orange)' }} /> Explore Runs
            </Link>
            <Link to="/compare" className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <FaExchangeAlt style={{ fontSize: 12 }} /> Compare Metrics
            </Link>
            <Link to="/registry" className="btn btn-ghost" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <FaBoxOpen style={{ fontSize: 13 }} /> Model Registry
            </Link>
          </div>
        </div>

        {/* Dynamic Metric Badges */}
        {summary && (
          <div className="hero-badges">
            <div className="hero-metric-pill">
              <span className="hero-metric-val">{summary.total_runs ?? 0}</span>
              <span className="hero-metric-lbl">Total Runs</span>
            </div>

            <div className="hero-metric-pill">
              <span className="hero-metric-val" style={{ color: '#22c55e' }}>
                {bestAccuracy != null ? `${(bestAccuracy * 100).toFixed(1)}%` : (summary.production_models ? `${summary.production_models} Active` : '—')}
              </span>
              <span className="hero-metric-lbl">Best Metric</span>
            </div>

            <div className="hero-metric-pill">
              <span className="hero-metric-val" style={{ color: '#a0c3ec' }}>
                {summary.registered_models ?? 0}
              </span>
              <span className="hero-metric-lbl">Models Logged</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
