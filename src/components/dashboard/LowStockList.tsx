import { useNavigate } from 'react-router-dom';
import { AlertTriangle, ChevronRight } from 'lucide-react';
import type { Component } from '../../types';
import { CategoryBadge } from '../ui/Badge';

interface LowStockListProps {
  components: Component[];
}

export function LowStockList({ components }: LowStockListProps) {
  const navigate = useNavigate();
  const lowStock = components
    .filter((c) => c.quantity <= c.low_stock_threshold)
    .sort((a, b) => a.quantity - b.quantity)
    .slice(0, 8);

  if (lowStock.length === 0) {
    return (
      <div className="chart-card">
        <div className="chart-title flex items-center gap-2">
          <AlertTriangle size={14} style={{ color: 'var(--amber)' }} />
          Low Stock Alerts
        </div>
        <div style={{ color: 'var(--ivory-muted)', fontSize: '0.875rem', textAlign: 'center', padding: 'var(--sp-6) 0' }}>
          ✅ All components are well stocked!
        </div>
      </div>
    );
  }

  return (
    <div className="chart-card">
      <div className="chart-title flex items-center gap-2">
        <AlertTriangle size={14} style={{ color: 'var(--amber)' }} />
        Low Stock Alerts
        <span className="badge badge-amber" style={{ marginLeft: 'auto' }}>{lowStock.length}</span>
      </div>
      <div className="flex flex-col" style={{ gap: '2px' }}>
        {lowStock.map((c) => (
          <div
            key={c.id}
            className="flex items-center gap-3"
            style={{
              padding: 'var(--sp-2) var(--sp-3)',
              borderRadius: 'var(--r-md)',
              cursor: 'pointer',
              transition: 'background var(--t-fast)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--glass-bg)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            onClick={() => navigate(`/component/${c.id}`)}
            id={`low-stock-item-${c.id}`}
          >
            <div className="low-stock-dot" />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="truncate" style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--ivory)' }}>{c.name}</div>
              <CategoryBadge category={c.category} />
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div className="text-mono" style={{ color: c.quantity === 0 ? 'var(--rose)' : 'var(--amber)', fontWeight: 700, fontSize: '1rem' }}>
                {c.quantity}
              </div>
              <div style={{ fontSize: '0.65rem', color: 'var(--ivory-muted)' }}>/ {c.low_stock_threshold} min</div>
            </div>
            <ChevronRight size={14} style={{ color: 'var(--ivory-muted)', flexShrink: 0 }} />
          </div>
        ))}
      </div>
    </div>
  );
}
