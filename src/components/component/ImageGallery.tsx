import { useState } from 'react';
import { X, ZoomIn } from 'lucide-react';

interface ImageGalleryProps {
  urls: string[];
  alt?: string;
}

export function ImageGallery({ urls, alt = 'Component image' }: ImageGalleryProps) {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  if (!urls || urls.length === 0) return null;

  return (
    <div>
      {/* Main preview */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '4/3',
          background: 'var(--bg-surface)',
          borderRadius: 'var(--r-lg)',
          overflow: 'hidden',
          marginBottom: 'var(--sp-2)',
          cursor: 'zoom-in',
        }}
        onClick={() => setLightbox(true)}
        id="image-gallery-main"
      >
        <img
          src={urls[active]}
          alt={alt}
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        />
        <div style={{
          position: 'absolute', bottom: 'var(--sp-2)', right: 'var(--sp-2)',
          background: 'rgba(0,0,0,0.5)', borderRadius: 'var(--r-sm)',
          padding: '4px 8px', display: 'flex', alignItems: 'center', gap: 4,
          color: 'var(--ivory-muted)', fontSize: '0.7rem',
        }}>
          <ZoomIn size={11} /> Zoom
        </div>
      </div>

      {/* Thumbnails */}
      {urls.length > 1 && (
        <div className="image-gallery">
          {urls.map((url, i) => (
            <div
              key={url}
              className={`image-thumb${i === active ? ' active' : ''}`}
              onClick={() => setActive(i)}
              id={`img-thumb-${i}`}
            >
              <img src={url} alt={`${alt} ${i + 1}`} />
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)',
            zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 'var(--sp-4)',
          }}
          onClick={() => setLightbox(false)}
        >
          <button
            style={{ position: 'absolute', top: 'var(--sp-4)', right: 'var(--sp-4)' }}
            className="btn btn-icon btn-secondary"
            onClick={() => setLightbox(false)}
            id="lightbox-close"
          >
            <X size={20} />
          </button>
          <img
            src={urls[active]}
            alt={alt}
            style={{ maxWidth: '90vw', maxHeight: '90vh', objectFit: 'contain', borderRadius: 'var(--r-lg)' }}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
