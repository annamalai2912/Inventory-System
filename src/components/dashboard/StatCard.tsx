import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: number | string;
  sub?: string;
  icon: LucideIcon;
  color: 'emerald' | 'amber' | 'sky' | 'rose';
}

export function StatCard({ label, value, sub, icon: Icon, color }: StatCardProps) {
  return (
    <div className={`stat-card ${color}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="stat-label">{label}</span>
        <div className={`stat-icon ${color}`}>
          <Icon size={18} />
        </div>
      </div>
      <div className="stat-value">{value}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  );
}
