import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const STATUS_COLORS = {
  COMPLETED: '#22c55e',
  RUNNING:   '#3b82f6',
  FAILED:    '#ef4444',
  PENDING:   '#eab308',
};

export default function StatusChart({ data = {} }) {
  const keys = Object.keys(data);

  if (!keys.length) {
    return (
      <div className="chart-card">
        <div className="chart-title">Run Status Distribution</div>
        <div className="chart-subtitle">Breakdown of run outcomes</div>
        <div className="empty-state" style={{ padding: '32px 0' }}>
          <div className="empty-icon">🍩</div>
          <div className="empty-title">No run data yet</div>
        </div>
      </div>
    );
  }

  const chartData = {
    labels: keys,
    datasets: [{
      data: keys.map(k => data[k]),
      backgroundColor: keys.map(k => STATUS_COLORS[k] || '#4b5263'),
      borderColor: '#0d1117',
      borderWidth: 3,
      hoverBorderWidth: 0,
    }]
  };

  const options = {
    responsive: true,
    cutout: '70%',
    animation: { duration: 800, animateRotate: true },
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#8b93a7',
          font: { size: 12 },
          padding: 16,
          usePointStyle: true,
          pointStyleWidth: 8,
        }
      },
      tooltip: {
        backgroundColor: '#1c2333',
        titleColor: '#e8eaf0',
        bodyColor: '#8b93a7',
        borderColor: 'rgba(255,255,255,0.07)',
        borderWidth: 1,
        padding: 12,
      }
    }
  };

  const total = keys.reduce((s, k) => s + data[k], 0);

  return (
    <div className="chart-card">
      <div className="chart-title">Run Status Distribution</div>
      <div className="chart-subtitle">{total} total runs across all statuses</div>
      <div style={{ position: 'relative', maxWidth: 220, margin: '0 auto' }}>
        <Doughnut data={chartData} options={options} />
        <div style={{
          position: 'absolute', top: '42%', left: '50%',
          transform: 'translate(-50%,-50%)', textAlign: 'center', pointerEvents: 'none'
        }}>
          <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--cf-text-primary)' }}>{total}</div>
          <div style={{ fontSize: 11, color: 'var(--cf-text-muted)' }}>Total</div>
        </div>
      </div>
    </div>
  );
}