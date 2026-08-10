import { useState } from 'react';
import { Minus, Plus, Zap } from 'lucide-react';
import { useStockLog } from '../../hooks/useStockLog';
import { Modal } from '../ui/Modal';
import type { ChangeType } from '../../types';

interface QuantityControlProps {
  componentId: string;
  currentQty: number;
  unit: string;
  onUpdated?: (newQty: number) => void;
}

const CHANGE_TYPES: { value: ChangeType; label: string }[] = [
  { value: 'adjust',  label: 'General Adjust' },
  { value: 'use',     label: 'Used in Project' },
  { value: 'restock', label: 'Restocked' },
  { value: 'add',     label: 'Added to Stock' },
  { value: 'remove',  label: 'Removed / Lost' },
];

export function QuantityControl({ componentId, currentQty, unit, onUpdated }: QuantityControlProps) {
  const { logChange } = useStockLog(componentId);
  const [delta, setDelta] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [changeType, setChangeType] = useState<ChangeType>('adjust');
  const [projectTag, setProjectTag] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [pendingDelta, setPendingDelta] = useState<number>(0);

  const openModal = (d: number) => {
    setPendingDelta(d);
    setModalOpen(true);
  };

  const apply = async () => {
    setLoading(true);
    const { error, component } = await logChange(componentId, pendingDelta, changeType, projectTag || undefined, notes || undefined);
    setLoading(false);
    if (!error && component) {
      onUpdated?.(component.quantity);
      setModalOpen(false);
      setProjectTag('');
      setNotes('');
    }
  };

  const quickApply = async (d: number) => {
    setLoading(true);
    const { error, component } = await logChange(componentId, d, 'adjust');
    setLoading(false);
    if (!error && component) onUpdated?.(component.quantity);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
      {/* Quick +/- strip */}
      <div className="quantity-control">
        <button className="qty-btn qty-btn-minus" disabled={currentQty <= 0 || loading} onClick={() => quickApply(-delta)} title={`Remove ${delta}`} id="qty-minus">
          <Minus size={16} />
        </button>
        <input
          className="qty-input"
          type="number"
          min={1}
          value={delta}
          onChange={(e) => setDelta(Math.max(1, parseInt(e.target.value) || 1))}
          id="qty-delta-input"
        />
        <button className="qty-btn qty-btn-plus" disabled={loading} onClick={() => quickApply(delta)} title={`Add ${delta}`} id="qty-plus">
          <Plus size={16} />
        </button>
        <div style={{ marginLeft: 'auto', paddingRight: 'var(--sp-2)', fontFamily: 'var(--font-mono)', color: 'var(--ivory-muted)', fontSize: '0.75rem' }}>
          {unit}
        </div>
      </div>

      {/* Detailed log action */}
      <button className="btn btn-secondary btn-sm" onClick={() => openModal(1)} id="btn-log-usage" style={{ alignSelf: 'flex-start' }}>
        <Zap size={13} /> Log Usage / Restock
      </button>

      {/* Detail Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Log Stock Change">
        <div className="flex flex-col gap-4">
          <div className="form-group">
            <label className="form-label">Change Type</label>
            <select
              className="form-select"
              value={changeType}
              onChange={(e) => setChangeType(e.target.value as ChangeType)}
              id="change-type-select"
            >
              {CHANGE_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Quantity</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                className="form-input"
                value={Math.abs(pendingDelta)}
                onChange={(e) => {
                  const abs = Math.max(1, parseInt(e.target.value) || 1);
                  setPendingDelta((['remove', 'use'].includes(changeType) ? -1 : 1) * abs);
                }}
                min={1}
                id="log-qty-input"
              />
              <span style={{ color: 'var(--ivory-muted)', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>{unit}</span>
            </div>
          </div>

          {changeType === 'use' && (
            <div className="form-group">
              <label className="form-label">Project Tag</label>
              <input
                className="form-input"
                placeholder="e.g. Echo Guardian Pro"
                value={projectTag}
                onChange={(e) => setProjectTag(e.target.value)}
                id="log-project-tag"
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Notes (optional)</label>
            <textarea
              className="form-textarea"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any extra context…"
              rows={2}
              id="log-notes"
            />
          </div>

          <div className="flex gap-3 justify-between">
            <button className="btn btn-ghost" onClick={() => setModalOpen(false)} disabled={loading}>Cancel</button>
            <button className="btn btn-primary" onClick={apply} disabled={loading} id="btn-log-apply">
              {loading ? <span className="spinner" style={{ width: 14, height: 14 }} /> : null}
              Apply Change
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
