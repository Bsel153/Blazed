import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { detectStateFromCoords, detectStateFromIP, getCurrentPosition } from '../lib/geo';

export type DetectionStatus = 'idle' | 'detecting' | 'detected' | 'unavailable';
export type DetectionMethod = 'gps' | 'ip' | null;

interface LocationContextValue {
  stateCode: string | null; // null = "all states"
  city: string | null;
  status: DetectionStatus;
  method: DetectionMethod;
  isManualOverride: boolean;
  setStateCode: (code: string | null) => void;
  retryDetection: () => void;
}

const LocationContext = createContext<LocationContextValue | null>(null);

export function LocationProvider({ children }: { children: ReactNode }) {
  const [stateCode, setStateCodeRaw] = useState<string | null>(null);
  const [city, setCity] = useState<string | null>(null);
  const [status, setStatus] = useState<DetectionStatus>('idle');
  const [method, setMethod] = useState<DetectionMethod>(null);
  const [isManualOverride, setIsManualOverride] = useState(false);

  const detect = useCallback(() => {
    setStatus('detecting');
    setIsManualOverride(false);

    // GPS is precise but needs a permission prompt the user might dismiss.
    // Fall back to IP-based lookup automatically — no permission required —
    // so the app can still find a state without the user doing anything.
    const viaIP = async () => {
      const result = await detectStateFromIP().catch(() => null);
      if (result) {
        setStateCodeRaw(result.stateCode);
        setCity(result.city);
        setMethod('ip');
        setStatus('detected');
      } else {
        setStatus('unavailable');
      }
    };

    getCurrentPosition()
      .then(async (position) => {
        const result = await detectStateFromCoords(position.coords.latitude, position.coords.longitude);
        if (result) {
          setStateCodeRaw(result.stateCode);
          setCity(result.city);
          setMethod('gps');
          setStatus('detected');
        } else {
          await viaIP();
        }
      })
      .catch(viaIP);
  }, []);

  useEffect(() => {
    detect();
  }, [detect]);

  const setStateCode = useCallback((code: string | null) => {
    setStateCodeRaw(code);
    setCity(null);
    setMethod(null);
    setIsManualOverride(true);
  }, []);

  return (
    <LocationContext.Provider
      value={{ stateCode, city, status, method, isManualOverride, setStateCode, retryDetection: detect }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error('useLocation must be used within a LocationProvider');
  return ctx;
}
