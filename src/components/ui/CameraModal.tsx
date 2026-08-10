import { useState, useRef, useEffect } from 'react';
import { Camera, X, RefreshCw, Check } from 'lucide-react';

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (file: File, dataUrl: string) => void;
}

export function CameraModal({ isOpen, onClose, onCapture }: CameraModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');

  const startCamera = async () => {
    setCameraError(null);
    setCapturedImage(null);
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: facingMode }, width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      setCameraError('Unable to access device camera. Please check permissions.');
    }
  };

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode]);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const takePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setCapturedImage(dataUrl);
  };

  const handleConfirm = () => {
    if (!capturedImage) return;
    // Convert data URL to File object
    fetch(capturedImage)
      .then((res) => res.blob())
      .then((blob) => {
        const file = new File([blob], `photo_${Date.now()}.jpg`, { type: 'image/jpeg' });
        onCapture(file, capturedImage);
        onClose();
      });
  };

  const toggleCamera = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--sp-4)',
      }}
      className="animate-fade-in"
    >
      <div
        style={{
          background: 'var(--bg-surface)',
          borderRadius: 'var(--r-xl)',
          width: '100%',
          maxWidth: 540,
          overflow: 'hidden',
          boxShadow: 'var(--shadow-xl)',
          border: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: 'var(--sp-4) var(--sp-6)',
            background: 'var(--bg-base)',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: '1rem', color: 'var(--text-main)' }}>
            <Camera size={20} style={{ color: 'var(--emerald-600)' }} />
            Take Component Photo
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose} id="btn-close-camera">
            <X size={18} />
          </button>
        </div>

        {/* Camera Viewport / Captured Preview */}
        <div style={{ position: 'relative', width: '100%', aspectRatio: '4/3', background: '#000', overflow: 'hidden' }}>
          {cameraError ? (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff', padding: 'var(--sp-4)', textAlign: 'center' }}>
              <p style={{ color: 'var(--rose)', fontWeight: 600, marginBottom: 'var(--sp-2)' }}>{cameraError}</p>
              <button className="btn btn-secondary btn-sm" onClick={startCamera}>Retry Camera Access</button>
            </div>
          ) : capturedImage ? (
            <img src={capturedImage} alt="Captured" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          )}

          <canvas ref={canvasRef} style={{ display: 'none' }} />

          {/* Switch camera button floating */}
          {!capturedImage && !cameraError && (
            <button
              onClick={toggleCamera}
              className="btn btn-secondary btn-icon"
              style={{ position: 'absolute', top: 12, right: 12, borderRadius: '50%', background: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none' }}
              title="Flip camera"
            >
              <RefreshCw size={16} />
            </button>
          )}
        </div>

        {/* Action Controls */}
        <div style={{ padding: 'var(--sp-4)', display: 'flex', alignItems: 'center', justifyContent: 'space-around', background: 'var(--bg-base)' }}>
          {capturedImage ? (
            <>
              <button className="btn btn-ghost" onClick={() => setCapturedImage(null)} id="btn-retake-photo">
                <RefreshCw size={16} /> Retake
              </button>
              <button className="btn btn-primary" onClick={handleConfirm} id="btn-use-photo">
                <Check size={16} /> Use Photo
              </button>
            </>
          ) : (
            <button
              className="btn btn-primary btn-lg"
              onClick={takePhoto}
              disabled={Boolean(cameraError)}
              style={{ borderRadius: 'var(--r-full)', padding: '12px 28px', gap: 8 }}
              id="btn-shutter-snap"
            >
              <Camera size={20} /> Snap Photo
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
