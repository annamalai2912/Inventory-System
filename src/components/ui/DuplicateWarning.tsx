import { AlertTriangle, ArrowRight, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { DuplicateMatch } from '../../lib/fuzzy';

interface DuplicateWarningProps {
  matches: DuplicateMatch[];
  onDismiss: () => void;
  onCreateAnyway: () => void;
}

export function DuplicateWarning({ matches, onDismiss, onCreateAnyway }: DuplicateWarningProps) {
  const navigate = useNavigate();

  if (matches.length === 0) return null;

  return (
    <div className="duplicate-warning animate-fade-in">
      <div className="duplicate-warning-title">
        <AlertTriangle size={15} />
        Possible duplicate{matches.length > 1 ? 's' : ''} found
      </div>

      <div className="flex flex-col gap-2">
        {matches.slice(0, 3).map(({ component }) => (
          <div key={component.id} className="duplicate-match">
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--ivory)' }}>{component.name}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--ivory-muted)' }}>
                Qty: <span className="text-mono" style={{ color: 'var(--emerald-400)' }}>{component.quantity} {component.unit}</span>
              </div>
            </div>
            <button
              type="button"
              className="btn btn-sm btn-secondary"
              onClick={() => navigate(`/component/${component.id}`)}
              style={{ gap: '4px', fontSize: '0.75rem' }}
            >
              View <ArrowRight size={12} />
            </button>
          </div>
        ))}
      </div>

      <div className="flex gap-2" style={{ marginTop: '4px' }}>
        <button type="button" className="btn btn-sm btn-ghost" onClick={onDismiss}>
          Cancel
        </button>
        <button type="button" className="btn btn-sm btn-secondary" onClick={onCreateAnyway}>
          <Plus size={13} /> Create anyway
        </button>
      </div>
    </div>
  );
}
