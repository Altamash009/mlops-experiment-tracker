import { useEffect, useState, useRef } from 'react';

function useCountUp(target, duration = 800) {
  const [count, setCount] = useState(0);
  const frameRef = useRef();

  useEffect(() => {
    if (target == null || isNaN(target)) { setCount(0); return; }
    const num = Number(target);
    if (num === 0) { setCount(0); return; }

    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * num));
      if (progress < 1) frameRef.current = requestAnimationFrame(step);
    };
    frameRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameRef.current);
  }, [target, duration]);

  return count;
}

export default function DashboardCard({ title, value, icon, color, sub, delay = 0 }) {
  const colorMap = {
    orange: { bg: 'var(--cf-orange-dim)', color: 'var(--cf-orange)', glow: 'rgba(249,115,22,0.18)', border: 'rgba(249,115,22,0.25)' },
    blue:   { bg: 'var(--cf-blue-dim)',   color: 'var(--cf-blue)',   glow: 'rgba(59,130,246,0.18)',   border: 'rgba(59,130,246,0.25)'   },
    green:  { bg: 'var(--cf-green-dim)',  color: 'var(--cf-green)',  glow: 'rgba(16,185,129,0.18)',   border: 'rgba(16,185,129,0.25)'   },
    red:    { bg: 'var(--cf-red-dim)',    color: 'var(--cf-red)',    glow: 'rgba(244,63,94,0.18)',    border: 'rgba(244,63,94,0.25)'    },
    purple: { bg: 'var(--cf-purple-dim)', color: 'var(--cf-purple)', glow: 'rgba(168,85,247,0.18)',  border: 'rgba(168,85,247,0.25)'   },
  };
  const c = colorMap[color] || colorMap.blue;
  const animatedValue = useCountUp(value);

  return (
    <div className="stat-card" style={{ animationDelay: `${delay}ms` }}>
      <div className="stat-icon" style={{ background: c.bg, color: c.color, border: `1px solid ${c.border}` }}>
        {icon}
      </div>
      <div className="stat-info">
        <div className="stat-label">{title}</div>
        <div className="stat-value" style={{ color: c.color }}>{animatedValue}</div>
        {sub && <div className="stat-sub">{sub}</div>}
      </div>
      {/* Corner Glow */}
      <div style={{
        position: 'absolute', top: 0, right: 0, width: 90, height: 90,
        background: `radial-gradient(circle at top right, ${c.glow}, transparent)`,
        borderRadius: 'var(--radius-xl)',
        pointerEvents: 'none',
      }} />
    </div>
  );
}
