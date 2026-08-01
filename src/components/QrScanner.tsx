import { useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';

export const QR_PREFIX = 'BLAZED_PURCHASE:';

interface QrScannerProps {
  onDetect: (dealId: string) => void;
  onClose: () => void;
}

export default function QrScanner({ onDetect, onClose }: QrScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let frameId: number;
    let stopped = false;

    const tick = () => {
      if (stopped) return;
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        if (code?.data.startsWith(QR_PREFIX)) {
          stopped = true;
          onDetect(code.data.slice(QR_PREFIX.length));
          return;
        }
      }
      frameId = requestAnimationFrame(tick);
    };

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'environment' } })
      .then((s) => {
        stream = s;
        if (videoRef.current) {
          videoRef.current.srcObject = s;
          videoRef.current.play();
        }
        frameId = requestAnimationFrame(tick);
      })
      .catch(() => setError('Camera access denied or unavailable. You can allow camera access and try again.'));

    return () => {
      stopped = true;
      cancelAnimationFrame(frameId);
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [onDetect]);

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/70 px-4">
      <div className="bg-white dark:bg-neutral-900 rounded-xl p-4 max-w-xs w-full text-center">
        <p className="font-medium text-neutral-900 dark:text-neutral-100 mb-3">Scan your receipt QR code</p>
        {error ? (
          <p className="text-sm text-red-600 dark:text-red-400 mb-3">{error}</p>
        ) : (
          <div className="relative rounded-lg overflow-hidden bg-black aspect-square mb-3">
            <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
          </div>
        )}
        <canvas ref={canvasRef} className="hidden" />
        <button
          type="button"
          onClick={onClose}
          className="text-sm font-medium text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
