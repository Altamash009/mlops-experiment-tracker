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

      {/* ── TOP ROW: text left / pills right ─────────────────────── */}
      <div
        className="hero-content"
        style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 24, alignItems: 'flex-start', paddingBottom: 0 }}
      >
        {/* Left: headline + CTAs */}
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

          <p className="hero-subtitle" style={{ maxWidth: 480, marginBottom: 20 }}>
            Observe model convergence, benchmark hyperparameter sweeps, and govern
            production registry checkpoints.{' '}
            <strong style={{ color: 'var(--cf-text-muted)', fontWeight: 400 }}>
              Scroll to scrub the 3D pipeline.
            </strong>
          </p>

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

        {/* Right: metric pills */}
        {summary && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, zIndex: 2, minWidth: 120 }}>
            <div className="hero-metric-pill" style={{ padding: '10px 14px', textAlign: 'center' }}>
              <span className="hero-metric-val" style={{ fontSize: 22 }}>{summary.total_runs ?? 0}</span>
              <span className="hero-metric-lbl" style={{ fontSize: 10 }}>Runs</span>
            </div>
            <div className="hero-metric-pill" style={{ padding: '10px 14px', textAlign: 'center' }}>
              <span className="hero-metric-val" style={{ fontSize: 22, color: '#22c55e' }}>
                {bestAccuracy != null
                  ? `${(bestAccuracy * 100).toFixed(0)}%`
                  : summary.production_models ?? '—'}
              </span>
              <span className="hero-metric-lbl" style={{ fontSize: 10 }}>Best Acc</span>
            </div>
            <div className="hero-metric-pill" style={{ padding: '10px 14px', textAlign: 'center' }}>
              <span className="hero-metric-val" style={{ fontSize: 22, color: '#a0c3ec' }}>
                {summary.registered_models ?? 0}
              </span>
              <span className="hero-metric-lbl" style={{ fontSize: 10 }}>Models</span>
            </div>
          </div>
        )}
      </div>

      {/* ── FULL-WIDTH 3D SCENE ───────────────────────────────────── */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: '380px',
        marginTop: 24,
        borderRadius: '12px',
        overflow: 'hidden',
        border: '1px solid var(--cf-border)',
        background: 'rgba(10,10,10,0.6)',
      }}>
        {/* Label */}
        <div style={{
          position: 'absolute',
          top: 10,
          left: 14,
          zIndex: 10,
          fontSize: 10,
          fontFamily: 'JetBrains Mono, monospace',
          color: 'rgba(160,195,236,0.7)',
          textTransform: 'uppercase',
          letterSpacing: '1.2px',
          pointerEvents: 'none',
        }}>
          ● MLOps 3D Pipeline — Neural Network Visualizer
        </div>

        {/* Scroll indicator */}
        <div style={{
          position: 'absolute',
          top: '50%',
          right: 18,
          transform: 'translateY(-50%)',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 4,
          pointerEvents: 'none',
        }}>
          <div style={{ width: 1, height: 40, background: 'linear-gradient(to bottom, transparent, rgba(26,114,245,0.6))' }} />
          <div style={{ fontSize: 9, fontFamily: 'JetBrains Mono', color: 'rgba(26,114,245,0.5)', textTransform: 'uppercase', letterSpacing: '0.8px', writingMode: 'vertical-rl' }}>
            scroll
          </div>
          <div style={{ width: 1, height: 40, background: 'linear-gradient(to bottom, rgba(26,114,245,0.6), transparent)' }} />
        </div>

        <Dashboard3DScene />
      </div>
    </div>
  );
}
