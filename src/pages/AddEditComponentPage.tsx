import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Upload, X, Save, Loader, Camera } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/auth.store';
import { useComponentsStore } from '../store/components.store';
import { useToast } from '../components/ui/Toast';
import { CameraModal } from '../components/ui/CameraModal';
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
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

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

  // Add images to state
  const addImages = (files: FileList | File[]) => {
    const arr = Array.from(files).slice(0, 5 - (imageFiles.length + existingImageUrls.length));
    if (arr.length === 0) return;

    setImageFiles((prev) => [...prev, ...arr]);
    arr.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setImagePreviews((p) => [...p, e.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleCameraCapture = (file: File, dataUrl: string) => {
    setImageFiles((prev) => [...prev, file]);
    setImagePreviews((prev) => [...prev, dataUrl]);
  };

  const removeNewImage = (i: number) => {
    setImageFiles((p) => p.filter((_, idx) => idx !== i));
    setImagePreviews((p) => p.filter((_, idx) => idx !== i));
  };

  const removeExistingImage = (url: string) =>
    setExistingImageUrls((p) => p.filter((u) => u !== url));

  // Bulletproof image processor: tries Supabase storage, falls back to optimized Base64
  const processImageFile = async (file: File, previewUrl: string, compId: string): Promise<string> => {
    try {
      const ext = file.name.split('.').pop() || 'jpg';
      const path = `${compId}/${Date.now()}_${Math.random().toString(36).slice(2, 7)}.${ext}`;
      const { error } = await supabase.storage
        .from('component-images')
        .upload(path, file, { upsert: true });

      if (!error) {
        const { data } = supabase.storage.from('component-images').getPublicUrl(path);
        if (data?.publicUrl) return data.publicUrl;
      }
    } catch (err) {
      console.warn('Storage upload error, using inline image string fallback:', err);
    }
    return previewUrl;
  };

  const onSubmit = async (data: FormData) => {
    if (duplicates.length > 0 && !ignoreWarning) {
      toast.warning('Please review the duplicate warning first.');
      return;
    }
    setSaving(true);

    const initialPayload: Partial<Component> = {
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

    // First upsert component row
    const { error: upsertErr, id: compId } = await upsertComponent(initialPayload);
    if (upsertErr || !compId) {
      toast.error(upsertErr ?? 'Failed to save component');
      setSaving(false);
      return;
    }

    // Process new images
    if (imageFiles.length > 0) {
      const uploadedUrls: string[] = [];
      for (let i = 0; i < imageFiles.length; i++) {
        const url = await processImageFile(imageFiles[i], imagePreviews[i], compId);
        uploadedUrls.push(url);
      }
      const finalUrls = [...existingImageUrls, ...uploadedUrls];
      await supabase.from('components').update({ image_urls: finalUrls }).eq('id', compId);
      // update local store
      useComponentsStore.getState().fetchComponents();
    }

    setSaving(false);
    toast.success(isEdit ? 'Component updated!' : 'Component added!');
    navigate(`/component/${compId}`);
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: 700 }}>
      {/* Camera Modal */}
      <CameraModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCameraCapture}
      />

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

          {/* Component Photos */}
          <div className="card">
            <div className="section-label mb-4" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>Component Photos</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {existingImageUrls.length + imageFiles.length} / 5 photos
              </span>
            </div>

            {/* Existing images */}
            {existingImageUrls.length > 0 && (
              <div style={{ display: 'flex', gap: 'var(--sp-3)', flexWrap: 'wrap', marginBottom: 'var(--sp-4)' }}>
                {existingImageUrls.map((url) => (
                  <div key={url} style={{ position: 'relative' }}>
                    <img src={url} alt="existing" style={{ width: 84, height: 84, objectFit: 'cover', borderRadius: 'var(--r-md)', border: '1px solid var(--border)' }} />
                    <button
                      type="button"
                      className="btn btn-danger btn-icon"
                      style={{ position: 'absolute', top: -6, right: -6, padding: 3, borderRadius: '50%', width: 22, height: 22, fontSize: 10 }}
                      onClick={() => removeExistingImage(url)}
                      title="Remove image"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* New previews */}
            {imagePreviews.length > 0 && (
              <div style={{ display: 'flex', gap: 'var(--sp-3)', flexWrap: 'wrap', marginBottom: 'var(--sp-4)' }}>
                {imagePreviews.map((src, i) => (
                  <div key={i} style={{ position: 'relative' }}>
                    <img src={src} alt="new preview" style={{ width: 84, height: 84, objectFit: 'cover', borderRadius: 'var(--r-md)', border: '2px solid var(--emerald-500)' }} />
                    <button
                      type="button"
                      className="btn btn-danger btn-icon"
                      style={{ position: 'absolute', top: -6, right: -6, padding: 3, borderRadius: '50%', width: 22, height: 22, fontSize: 10 }}
                      onClick={() => removeNewImage(i)}
                      title="Remove preview"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Photo Action Zone */}
            <div
              className={`dropzone${dragging ? ' dragging' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => { e.preventDefault(); setDragging(false); addImages(e.dataTransfer.files); }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--sp-3)', padding: 'var(--sp-6)' }}
            >
              <div style={{ display: 'flex', gap: 'var(--sp-3)', flexWrap: 'wrap', justifyContent: 'center' }}>
                {/* Live Camera Button */}
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={(e) => { e.stopPropagation(); setIsCameraOpen(true); }}
                  id="btn-open-camera"
                  style={{ gap: 8, padding: '10px 18px' }}
                >
                  <Camera size={18} /> Take Picture in Site
                </button>

                {/* Choose Files Button */}
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                  id="btn-upload-files"
                  style={{ gap: 8, padding: '10px 18px' }}
                >
                  <Upload size={18} /> Choose File
                </button>

                {/* Mobile Camera Shutter Fallback */}
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={(e) => { e.stopPropagation(); cameraInputRef.current?.click(); }}
                  id="btn-mobile-camera-input"
                  style={{ gap: 6, fontSize: '0.8rem', color: 'var(--text-muted)' }}
                >
                  <Camera size={15} /> Device Camera App
                </button>
              </div>

              <span className="dropzone-hint" style={{ marginTop: 4 }}>
                Drag & drop photos or capture directly via webcam / phone camera
              </span>

              {/* Hidden File Inputs */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                style={{ display: 'none' }}
                onChange={(e) => e.target.files && addImages(e.target.files)}
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
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
