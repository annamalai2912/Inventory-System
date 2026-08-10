import { useState, useEffect } from 'react';
import { FolderOpen, Plus, Trash2, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/auth.store';
import { useToast } from '../components/ui/Toast';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Modal } from '../components/ui/Modal';
import type { Project } from '../types';

export function ProjectsPage() {
  const { user } = useAuthStore();
  const toast = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchProjects = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });
    setProjects(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchProjects(); }, []);

  const createProject = async () => {
    if (!name.trim()) return;
    setSaving(true);
    const { data, error } = await supabase
      .from('projects')
      .insert({ name: name.trim(), description: description.trim() || null, created_by: user?.id })
      .select()
      .single();
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    setProjects((p) => [data, ...p]);
    setModalOpen(false);
    setName('');
    setDescription('');
    toast.success('Project created!');
  };

  const deleteProject = async () => {
    if (!deleteId) return;
    setDeleting(true);
    const { error } = await supabase.from('projects').delete().eq('id', deleteId);
    setDeleting(false);
    if (error) { toast.error(error.message); return; }
    setProjects((p) => p.filter((x) => x.id !== deleteId));
    setDeleteId(null);
    toast.success('Project deleted.');
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Projects</h1>
          <p className="page-subtitle">Tag components to projects for usage tracking.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModalOpen(true)} id="btn-new-project">
          <Plus size={15} /> New Project
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 'var(--sp-4)' }}>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 120, borderRadius: 'var(--r-lg)' }} />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><FolderOpen size={28} /></div>
          <div className="empty-state-title">No projects yet</div>
          <p className="empty-state-desc">
            Create a project to tag components when logging stock usage — e.g. "Echo Guardian Pro" or "Smart Attendance System".
          </p>
          <button className="btn btn-primary" onClick={() => setModalOpen(true)} id="empty-new-project">
            <Plus size={15} /> Create First Project
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 'var(--sp-4)' }}>
          {projects.map((p) => (
            <div key={p.id} className="card" style={{ position: 'relative', transition: 'all var(--t-base)' }} id={`project-${p.id}`}>
              <div
                style={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: 3,
                  background: 'linear-gradient(90deg, var(--emerald-500), var(--emerald-800))',
                  borderRadius: 'var(--r-lg) var(--r-lg) 0 0',
                }}
              />
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--sp-2)', marginBottom: 'var(--sp-2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
                  <FolderOpen size={16} style={{ color: 'var(--emerald-500)', flexShrink: 0 }} />
                  <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--ivory)' }}>{p.name}</span>
                </div>
                <button
                  className="btn btn-icon btn-ghost btn-sm"
                  onClick={() => setDeleteId(p.id)}
                  id={`delete-project-${p.id}`}
                  style={{ color: 'var(--rose)', flexShrink: 0 }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
              {p.description && (
                <p style={{ fontSize: '0.8rem', color: 'var(--ivory-muted)', lineHeight: 1.6, marginBottom: 'var(--sp-3)' }}>
                  {p.description}
                </p>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--ivory-muted)', fontSize: '0.7rem', marginTop: 'auto' }}>
                <Clock size={10} />
                {new Date(p.created_at).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New Project">
        <div className="flex flex-col gap-4">
          <div className="form-group">
            <label className="form-label" htmlFor="proj-name">Project Name <span>*</span></label>
            <input
              id="proj-name"
              className="form-input"
              placeholder="e.g. Echo Guardian Pro"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && createProject()}
              autoFocus
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="proj-desc">Description</label>
            <textarea
              id="proj-desc"
              className="form-textarea"
              rows={2}
              placeholder="Brief description of the project…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="flex gap-3 justify-between">
            <button className="btn btn-ghost" onClick={() => setModalOpen(false)} disabled={saving}>Cancel</button>
            <button className="btn btn-primary" onClick={createProject} disabled={saving || !name.trim()} id="btn-create-project">
              {saving ? <span className="spinner" style={{ width: 14, height: 14 }} /> : <Plus size={14} />}
              Create Project
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        onConfirm={deleteProject}
        title="Delete Project"
        message="Delete this project? Component stock logs that reference it will keep the tag name as text."
        confirmLabel="Delete"
        danger
        loading={deleting}
      />
    </div>
  );
}
