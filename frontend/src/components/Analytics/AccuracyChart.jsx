import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement,
  LineElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export default function AccuracyChart({ data = [] }) {
  if (!data.length) {
    return (
      <div className="chart-card">
        <div className="chart-title">Accuracy Trend</div>
        <div className="chart-subtitle">Step-by-step accuracy across runs</div>
        <div className="empty-state" style={{ padding: '32px 0' }}>
          <div className="empty-icon">📈</div>
          <div className="empty-title">No accuracy data yet</div>
        </div>
      </div>
    );
  }

  const labels  = data.map((d, i) => `Run ${d.run_id} · Step ${d.step}`);
  const values  = data.map(d => parseFloat((d.value * 100).toFixed(2)));

  const chartData = {
    labels,
    datasets: [{
      label: 'Accuracy (%)',
      data: values,
      borderColor: '#f6821f',
      backgroundColor: 'rgba(246,130,31,0.08)',
      fill: true,
      tension: 0.4,
      pointRadius: 4,
      pointBackgroundColor: '#f6821f',
      pointBorderColor: '#0d1117',
      pointBorderWidth: 2,
      pointHoverRadius: 6,
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    animation: { duration: 800, easing: 'easeInOutQuart' },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1c2333',
        titleColor: '#e8eaf0',
        bodyColor: '#8b93a7',
        borderColor: 'rgba(255,255,255,0.07)',
        borderWidth: 1,
        padding: 12,
        callbacks: { label: ctx => `Accuracy: ${ctx.parsed.y}%` }
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(255,255,255,0.04)' },
        ticks: { color: '#4b5263', font: { size: 10 }, maxTicksLimit: 6 }
      },
      y: {
        min: 0, max: 100,
        grid: { color: 'rgba(255,255,255,0.04)' },
        ticks: { color: '#4b5263', font: { size: 10 }, callback: v => v + '%' }
      }
    }
  };

  return (
    <div className="chart-card">
      <div className="chart-title">Accuracy Trend</div>
      <div className="chart-subtitle">Step-by-step accuracy across all runs</div>
      <Line data={chartData} options={options} />
    </div>
  );
}