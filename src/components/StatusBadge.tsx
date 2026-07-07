import './StatusBadge.css';

interface StatusBadgeProps {
  label: string;
  color: string;
  dot: string;
}

function StatusBadge({ label, color, dot }: StatusBadgeProps) {
  return (
    <span className="status-badge" style={{ color }}>
      <span className="status-dot" style={{ background: dot }} />
      {label}
    </span>
  );
}

export default StatusBadge;
