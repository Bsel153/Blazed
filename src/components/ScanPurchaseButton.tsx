import { useState } from 'react';
import { deals, dispensaries } from '../data/mockData';
import { usePurchases } from '../context/PurchasesContext';
import QrScanner from './QrScanner';

export default function ScanPurchaseButton() {
  const { logPurchase } = usePurchases();
  const [scanning, setScanning] = useState(false);
  const [toast, setToast] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);

  const handleDetect = async (dealId: string) => {
    setScanning(false);
    const deal = deals.find((d) => d.id === dealId);
    if (!deal) {
      setToast({ kind: 'error', text: "That code doesn't match a known purchase." });
    } else {
      const { error } = await logPurchase(deal);
      if (error) {
        setToast({ kind: 'error', text: error });
      } else {
        const dispensary = dispensaries.find((d) => d.id === deal.dispensaryId);
        setToast({
          kind: 'success',
          text: `Logged "${deal.title}" at ${dispensary?.name} — +${Math.round(deal.salePrice)} pts`,
        });
      }
    }
    setTimeout(() => setToast(null), 4000);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setScanning(true)}
        className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-3 py-2 rounded-lg shrink-0"
      >
        📷 Scan a purchase
      </button>

      {toast && (
        <div
          className={`fixed top-20 left-1/2 -translate-x-1/2 z-30 rounded-lg px-4 py-2 text-sm shadow-md ${
            toast.kind === 'success'
              ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
              : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
          }`}
        >
          {toast.text}
        </div>
      )}

      {scanning && <QrScanner onDetect={handleDetect} onClose={() => setScanning(false)} />}
    </>
  );
}
