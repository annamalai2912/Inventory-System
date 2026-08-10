import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Edit2, Trash2, Clock, User, Package,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useComponentsStore } from '../store/components.store';
import { useToast } from '../components/ui/Toast';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { QuantityControl } from '../components/component/QuantityControl';
import { AuditLog } from '../components/component/AuditLog';
import { ImageGallery } from '../components/component/ImageGallery';
import { CategoryBadge } from '../components/ui/Badge';
import type { ComponentWithUser } from '../types';

export function ComponentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const { deleteComponent } = useComponentsStore();
  const [component, setComponent] = useState<ComponentWithUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchComponent = async () => {
    if (!id) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('components')
      .select('*, profiles(name, avatar_url)')
      .eq('id', id)
      .single();
    if (error || !data) { navigate('/catalog'); return; }
    setComponent(data as unknown as ComponentWithUser);
    setLoading(false);
  };

  useEffect(() => { fetchComponent(); }, [id]);

  const handleDelete = async () => {
    if (!id) return;
    setDeleting(true);
    const { error } = await deleteComponent(id);
    setDeleting(false);
    if (error) { toast.error(error); return; }
    toast.success('Component deleted.');
    navigate('/catalog');
  };

  const handleQtyUpdated = (newQty: number) => {
    setComponent((prev) => prev ? { ...prev, quantity: newQty } : null);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)', maxWidth: 800 }}>
        <div className="skeleton" style={{ height: 32, width: 200 }} />
        <div className="skeleton" style={{ height: 280 }} />
        <div className="skeleton" style={{ height: 120 }} />
      </div>
    );
  }

  if (!component) return null;

  return (
    <div className="animate-fade-in" style={{ maxWidth: 900 }}>
      {/* Back + actions */}
      <div className="flex items-center justify-between mb-6" style={{ flexWrap: 'wrap', gap: 'var(--sp-3)' }}>
        <button className="btn btn-ghost" onClick={() => navigate(-1)} id="btn-back">
          <ArrowLeft size={16} /> Back
        </button>
        <div className="flex gap-2">
          <button
            className="btn btn-secondary"
            onClick={() => navigate(`/edit/${id}`)}
            id="btn-edit-component"
          >
            <Edit2 size={14} /> Edit
          </button>
          <button
            className="btn btn-danger"
            onClick={() => setConfirmDelete(true)}
            id="btn-delete-component"
          >
            <Trash2 size={14} /> Delete
          </button>
        </div>
      </div>

      {/* Main layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 'var(--sp-6)', alignItems: 'start' }}>
        {/* Left col — image + quantity */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
          {component.image_urls?.length > 0
            ? <ImageGallery urls={component.image_urls} alt={component.name} />
            : (
              <div style={{ aspectRatio: '4/3', background: 'var(--bg-base)', borderRadius: 'var(--r-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-subtle)', border: '1px solid var(--border)' }}>
                <Package size={48} strokeWidth={1} />
              </div>
            )
          }

          {/* Quantity section */}
          <div className="card">
            <div className="section-label">Quantity On Hand</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--sp-2)', marginBottom: 'var(--sp-4)' }}>
              <span
                className="text-mono"
                style={{
                  fontSize: '3.2rem', fontWeight: 800, lineHeight: 1, color: 'var(--emerald-700)',
                }}
              >
                {component.quantity}
              </span>
              <span style={{ color: 'var(--text-muted)', fontSize: '1rem', fontWeight: 600 }}>{component.unit}</span>
            </div>
            <QuantityControl
              componentId={component.id}
              currentQty={component.quantity}
              unit={component.unit}
              onUpdated={handleQtyUpdated}
            />
          </div>
        </div>

        {/* Right col — details + audit */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
          {/* Header */}
          <div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--sp-3)', flexWrap: 'wrap', marginBottom: 'var(--sp-2)' }}>
              <CategoryBadge category={component.category} />
            </div>
            <h1 className="page-title" style={{ fontSize: '1.6rem' }}>{component.name}</h1>
          </div>

          {/* Meta info */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
            <div className="section-label">Details</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-3)' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <User size={12} /> Added by
                </div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)' }}>{(component as any).profiles?.name ?? '—'}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Clock size={12} /> Last updated
                </div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)' }}>{new Date(component.updated_at).toLocaleDateString()}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 2 }}>Unit of Measure</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>{component.unit}</div>
              </div>
            </div>
          </div>

          {/* Audit log */}
          <div className="card">
            <div className="section-label" style={{ marginBottom: 'var(--sp-4)' }}>Stock Activity History</div>
            <AuditLog componentId={component.id} />
          </div>
        </div>
      </div>

      {/* Delete confirm */}
      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        title="Delete Component"
        message={`Are you sure you want to delete "${component.name}"? This will remove it from your inventory.`}
        confirmLabel="Delete"
        danger
        loading={deleting}
      />
    </div>
  );
}
