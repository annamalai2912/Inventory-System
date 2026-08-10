import { useEffect } from 'react';
import { Clock, User } from 'lucide-react';
import { useStockLog } from '../../hooks/useStockLog';
import type { ChangeType } from '../../types';

const CHANGE_LABELS: Record<ChangeType, string> = {
  add:     'Added to stock',
  remove:  'Removed',
  use:     'Used in project',
  restock: 'Restocked',
  adjust:  'Adjusted',
};

interface AuditLogProps {
  componentId: string;
}

export function AuditLog({ componentId }: AuditLogProps) {
  const { logs, loading, fetchLogs } = useStockLog(componentId);

  useEffect(() => {
    fetchLogs(componentId);
  }, [componentId]);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="skeleton" style={{ height: 48, borderRadius: 'var(--r-md)' }} />
        ))}
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <p style={{ color: 'var(--ivory-muted)', fontSize: '0.875rem', textAlign: 'center', padding: 'var(--sp-6) 0' }}>
        No stock changes recorded yet.
      </p>
    );
  }

  return (
    <div className="audit-log">
      {logs.map((log) => {
        const isPos = log.quantity_delta > 0;
        const type = log.change_type as ChangeType;
        return (
          <div key={log.id} className="audit-entry">
            <div className={`audit-timeline-dot ${type}`} style={{ marginTop: 4 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--sp-2)' }}>
                <span className="audit-user">{CHANGE_LABELS[type]}</span>
                <span className={isPos ? 'audit-delta-pos' : 'audit-delta-neg'}>
                  {isPos ? '+' : ''}{log.quantity_delta}
                </span>
              </div>
              <div className="audit-meta" style={{ display: 'flex', gap: 'var(--sp-3)', marginTop: 2, flexWrap: 'wrap' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                  <User size={10} />
                  {(log as any).profiles?.name ?? 'Unknown'}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                  <Clock size={10} />
                  {new Date(log.timestamp).toLocaleString()}
                </span>
                {log.project_tag && (
                  <span style={{ color: 'var(--emerald-400)', fontSize: '0.7rem' }}>📁 {log.project_tag}</span>
                )}
                {log.notes && (
                  <span style={{ color: 'var(--ivory-muted)', fontStyle: 'italic' }}>"{log.notes}"</span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
