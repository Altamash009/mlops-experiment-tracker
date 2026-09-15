const STATUS_MAP = {
  RUNNING:     { cls: 'badge-running',     label: 'Running',     dot: 'var(--cf-blue)',   glow: true },
  COMPLETED:   { cls: 'badge-completed',   label: 'Completed',   dot: 'var(--cf-green)',  glow: false },
  FAILED:      { cls: 'badge-failed',      label: 'Failed',      dot: 'var(--cf-red)',    glow: false },
  PENDING:     { cls: 'badge-pending',     label: 'Pending',     dot: 'var(--cf-yellow)', glow: false },
  Development: { cls: 'badge-development', label: 'Development', dot: 'var(--cf-blue)',   glow: false },
  Staging:     { cls: 'badge-staging',     label: 'Staging',     dot: 'var(--cf-yellow)', glow: false },
  Production:  { cls: 'badge-production',  label: 'Production',  dot: 'var(--cf-green)',  glow: true },
  Archived:    { cls: 'badge-archived',    label: 'Archived',    dot: 'var(--cf-text-muted)', glow: false },
};

export default function StatusBadge({ status }) {
  const s = STATUS_MAP[status] || { cls: '', label: status, dot: 'var(--cf-text-muted)', glow: false };
  return (
    <span className={`badge ${s.cls}`}>
      <span className={`badge-dot ${s.glow ? 'badge-dot--glow' : ''}`} style={{ background: s.dot }} />
      {s.label}
    </span>
  );
}
