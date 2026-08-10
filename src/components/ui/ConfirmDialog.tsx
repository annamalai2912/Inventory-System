import { AlertTriangle } from 'lucide-react';
import { Modal } from './Modal';

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
  loading?: boolean;
}

export function ConfirmDialog({
  open, onClose, onConfirm, title = 'Confirm', message,
  confirmLabel = 'Confirm', danger = false, loading = false,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <div className="flex flex-col gap-4">
        {danger && (
          <div className="flex items-center gap-2" style={{ color: 'var(--rose)', fontSize: '0.875rem' }}>
            <AlertTriangle size={16} />
            <span>This action cannot be undone.</span>
          </div>
        )}
        <p style={{ color: 'var(--ivory-dim)', fontSize: '0.9rem', lineHeight: 1.6 }}>{message}</p>
        <div className="flex gap-3 justify-between">
          <button className="btn btn-ghost" onClick={onClose} disabled={loading}>Cancel</button>
          <button
            className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`}
            onClick={onConfirm}
            disabled={loading}
            id="confirm-dialog-ok"
          >
            {loading ? <span className="spinner" style={{ width: 14, height: 14 }} /> : null}
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
