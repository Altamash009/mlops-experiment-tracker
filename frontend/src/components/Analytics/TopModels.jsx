import StatusBadge from '../StatusBadge';

export default function TopModels({ models = [] }) {
  if (!models.length) {
    return (
      <div className="chart-card">
        <div className="chart-title">Top Models</div>
        <div className="chart-subtitle">Best performing registered models</div>
        <div className="empty-state" style={{ padding: '32px 0' }}>
          <div className="empty-icon">🏆</div>
          <div className="empty-title">No models registered yet</div>
        </div>
      </div>
    );
  }

  const max = Math.max(...models.map(m => m.accuracy || 0), 0.01);

  return (
    <div className="chart-card">
      <div className="chart-title">Top Models</div>
      <div className="chart-subtitle">Ranked by accuracy — top {models.length}</div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 8 }}>
        {models.map((model, i) => {
          const pct = ((model.accuracy || 0) / max) * 100;
          return (
            <div key={i} className="animate-fadeIn" style={{ animationDelay: `${i * 80}ms` }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    width: 20, height: 20, borderRadius: 6,
                    background: i === 0 ? 'var(--cf-orange-dim)' : 'var(--cf-surface)',
                    color: i === 0 ? 'var(--cf-orange)' : 'var(--cf-text-muted)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 10, fontWeight: 700
                  }}>
                    {i + 1}
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--cf-text-primary)' }}>
                    {model.model_name}
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--cf-text-muted)' }}>v{model.version}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <StatusBadge status={model.stage} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--cf-orange)', minWidth: 44, textAlign: 'right' }}>
                    {((model.accuracy || 0) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
              {/* Bar */}
              <div style={{ height: 5, background: 'var(--cf-surface)', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${pct}%`,
                  background: i === 0
                    ? 'linear-gradient(90deg, var(--cf-orange), #f6a21f)'
                    : 'linear-gradient(90deg, var(--cf-blue), #60a5fa)',
                  borderRadius: 99,
                  transition: 'width 0.8s ease',
                }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}