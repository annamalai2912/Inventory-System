import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Upload, X, Save, Loader } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/auth.store';
import { useComponentsStore } from '../store/components.store';
import { useToast } from '../components/ui/Toast';
import { DuplicateWarning } from '../components/ui/DuplicateWarning';
import { findDuplicates } from '../lib/fuzzy';
import { CATEGORIES } from '../types';
import type { DuplicateMatch } from '../lib/fuzzy';
import type { Component } from '../types';

interface FormData {
  name: string;
  category: string;
  quantity: number;
  unit: string;
}

export function AddEditComponentPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuthStore();
  const { components, upsertComponent } = useComponentsStore();

  const [saving, setSaving] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [duplicates, setDuplicates] = useState<DuplicateMatch[]>([]);
  const [ignoreWarning, setIgnoreWarning] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register, handleSubmit, watch, setValue,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: { quantity: 0, unit: 'pcs', category: 'other' },
  });

  const watchedName = watch('name');
  const watchedCategory = watch('category');

  // Load existing component for edit
  useEffect(() => {
    if (!isEdit || !id) return;
    supabase.from('components').select('*').eq('id', id).single().then(({ data }) => {
      if (!data) return;
      setValue('name', data.name);
      setValue('category', data.category);
      setValue('quantity', data.quantity);
      setValue('unit', data.unit);
      setExistingImageUrls(data.image_urls ?? []);
    });
  }, [id, isEdit]);

  // Fuzzy duplicate check on name/category change
  useEffect(() => {
    if (!watchedName || ignoreWarning) { setDuplicates([]); return; }
    const matches = findDuplicates(watchedName, watchedCategory, components, id);
    setDuplicates(matches);
  }, [watchedName, watchedCategory, ignoreWarning]);

  // Image preview
  const addImages = (files: FileList | File[]) => {
    const arr = Array.from(files).slice(0, 5 - imageFiles.length);
    setImageFiles((prev) => [...prev, ...arr]);
    arr.forEach((f) => {
      const reader = new FileReader();
      reader.onload = (e) => setImagePreviews((p) => [...p, e.target?.result as string]);
      reader.readAsDataURL(f);
    });
  };

  const removeNewImage = (i: number) => {
    setImageFiles((p) => p.filter((_, idx) => idx !== i));
    setImagePreviews((p) => p.filter((_, idx) => idx !== i));
  };

  const removeExistingImage = (url: string) =>
    setExistingImageUrls((p) => p.filter((u) => u !== url));

  const uploadImages = async (componentId: string): Promise<string[]> => {
    const urls: string[] = [];
    for (const file of imageFiles) {
      const ext = file.name.split('.').pop();
      const path = `${componentId}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage
        .from('component-images')
        .upload(path, file, { upsert: true });
      if (!error) {
        const { data } = supabase.storage.from('component-images').getPublicUrl(path);
        urls.push(data.publicUrl);
      }
    }
    return urls;
  };

  const onSubmit = async (data: FormData) => {
    if (duplicates.length > 0 && !ignoreWarning) {
      toast.warning('Please review the duplicate warning first.');
      return;
    }
    setSaving(true);

    const payload: Partial<Component> = {
      ...(id ? { id } : {}),
      name: data.name.trim(),
      category: data.category,
      quantity: Number(data.quantity),
      unit: data.unit.trim() || 'pcs',
      low_stock_threshold: 0,
      sub_tags: [],
      added_by: user?.id ?? null,
      image_urls: existingImageUrls,
    };

    const { error: upsertErr, id: compId } = await upsertComponent(payload);
    if (upsertErr || !compId) {
      toast.error(upsertErr ?? 'Failed to save component');
      setSaving(false);
      return;
    }

    if (imageFiles.length > 0) {
      const newUrls = await uploadImages(compId);
      const allUrls = [...existingImageUrls, ...newUrls];
      await supabase.from('components').update({ image_urls: allUrls }).eq('id', compId);
    }

    setSaving(false);
    toast.success(isEdit ? 'Component updated!' : 'Component added!');
    navigate(`/component/${compId}`);
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: 700 }}>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button className="btn btn-ghost" onClick={() => navigate(-1)} id="btn-back-form">
          <ArrowLeft size={16} /> Back
        </button>
        <h1 className="page-title" style={{ fontSize: '1.4rem' }}>
          {isEdit ? 'Edit Component' : 'Add Component'}
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-5)' }}>

          {/* Basic info */}
          <div className="card">
            <div className="section-label mb-4">Basic Information</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="field-name">Component Name <span>*</span></label>
                <input
                  id="field-name"
                  className={`form-input${errors.name ? ' error' : ''}`}
                  placeholder="e.g. ESP32-WROOM-32, MQ-2 Gas Sensor…"
                  {...register('name', { required: 'Name is required' })}
                />
                {errors.name && <span className="form-error">{errors.name.message}</span>}
              </div>

              {/* Duplicate warning */}
              {duplicates.length > 0 && !ignoreWarning && (
                <DuplicateWarning
                  matches={duplicates}
                  onDismiss={() => navigate(-1)}
                  onCreateAnyway={() => setIgnoreWarning(true)}
                />
              )}

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="field-category">Category <span>*</span></label>
                  <select
                    id="field-category"
                    className="form-select"
                    {...register('category', { required: true })}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="field-unit">Unit</label>
                  <input
                    id="field-unit"
                    className="form-input"
                    placeholder="pcs, meters, kg…"
                    {...register('unit')}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Stock Quantity */}
          <div className="card">
            <div className="section-label mb-4">Stock Quantity On Hand</div>
            <div className="form-group">
              <label className="form-label" htmlFor="field-qty">Quantity On Hand <span>*</span></label>
              <input
                id="field-qty"
                className={`form-input${errors.quantity ? ' error' : ''}`}
                type="number"
                min={0}
                placeholder="e.g. 10"
                {...register('quantity', { required: true, min: 0, valueAsNumber: true })}
              />
            </div>
          </div>

          {/* Images */}
          <div className="card">
            <div className="section-label mb-4">Images</div>

            {/* Existing images */}
            {existingImageUrls.length > 0 && (
              <div style={{ display: 'flex', gap: 'var(--sp-2)', flexWrap: 'wrap', marginBottom: 'var(--sp-3)' }}>
                {existingImageUrls.map((url) => (
                  <div key={url} style={{ position: 'relative' }}>
                    <img src={url} alt="existing" style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 'var(--r-md)', border: '1px solid var(--border)' }} />
                    <button
                      type="button"
                      className="btn btn-danger btn-icon"
                      style={{ position: 'absolute', top: -6, right: -6, padding: 3, borderRadius: '50%', width: 20, height: 20, fontSize: 10 }}
                      onClick={() => removeExistingImage(url)}
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* New previews */}
            {imagePreviews.length > 0 && (
              <div style={{ display: 'flex', gap: 'var(--sp-2)', flexWrap: 'wrap', marginBottom: 'var(--sp-3)' }}>
                {imagePreviews.map((src, i) => (
                  <div key={i} style={{ position: 'relative' }}>
                    <img src={src} alt="new" style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 'var(--r-md)', border: '1px solid var(--border)' }} />
                    <button
                      type="button"
                      className="btn btn-danger btn-icon"
                      style={{ position: 'absolute', top: -6, right: -6, padding: 3, borderRadius: '50%', width: 20, height: 20, fontSize: 10 }}
                      onClick={() => removeNewImage(i)}
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div
              className={`dropzone${dragging ? ' dragging' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => { e.preventDefault(); setDragging(false); addImages(e.dataTransfer.files); }}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload size={24} className="dropzone-icon" />
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
                Click or drag images here
              </div>
              <span className="dropzone-hint">PNG, JPG up to 5MB (Max 5 photos)</span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                style={{ display: 'none' }}
                onChange={(e) => e.target.files && addImages(e.target.files)}
              />
            </div>
          </div>

          {/* Form Actions */}
          <div style={{ display: 'flex', gap: 'var(--sp-3)', justifyContent: 'flex-end' }}>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => navigate(-1)}
              id="btn-cancel-form"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={saving}
              id="btn-submit-component"
            >
              {saving ? <Loader size={16} className="spinner" /> : <Save size={16} />}
              {isEdit ? 'Save Changes' : 'Add Component'}
            </button>
          </div>

        </div>
      </form>
    </div>
  );
}
