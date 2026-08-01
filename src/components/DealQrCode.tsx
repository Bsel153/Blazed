import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import type { Deal } from '../types';

export const QR_PREFIX = 'BLAZED_DEAL:';

export default function DealQrCode({ deal, onClose }: { deal: Deal; onClose: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    QRCode.toCanvas(canvasRef.current, `${QR_PREFIX}${deal.id}`, { width: 220, margin: 1 }).catch(() =>
      setError('Could not generate QR code.'),
    );
  }, [deal.id]);

  return (
    <div
      className="fixed inset-0 z-20 flex items-center justify-center bg-black/50 px-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-neutral-900 rounded-xl p-6 max-w-xs w-full text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="font-medium text-neutral-900 dark:text-neutral-100 mb-1">{deal.title}</p>
        <p className="text-xs text-neutral-500 mb-4">
          Scan at checkout with the dispensary — or scan it yourself under "Scan a purchase" to log it and earn points.
        </p>
        {error ? (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        ) : (
          <canvas ref={canvasRef} className="mx-auto rounded-lg" />
        )}
        <button
          type="button"
          onClick={onClose}
          className="mt-4 text-sm font-medium text-green-700 dark:text-green-400 hover:underline"
        >
          Close
        </button>
      </div>
    </div>
  );
}
