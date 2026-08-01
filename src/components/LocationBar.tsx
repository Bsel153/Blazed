import { useMemo } from 'react';
import { useLocation } from '../context/LocationContext';
import type { Dispensary } from '../types';

const ALL_STATES_VALUE = 'all';

export default function LocationBar({ dispensaries }: { dispensaries: Dispensary[] }) {
  const { stateCode, city, status, method, isManualOverride, setStateCode, retryDetection } = useLocation();

  const availableStates = useMemo(
    () => [...new Set(dispensaries.map((d) => d.state))].sort(),
    [dispensaries],
  );

  const knownState = stateCode !== null && availableStates.includes(stateCode);
  const approximate = method === 'ip' ? ' (approximate)' : '';

  let message: string;
  if (status === 'detecting') {
    message = 'Finding your location…';
  } else if (status === 'unavailable') {
    message = "Couldn't detect your location — pick your state to see nearby dispensaries.";
  } else if (status === 'detected' && !isManualOverride) {
    message = knownState
      ? `Showing dispensaries near ${city ? `${city}, ` : ''}${stateCode}${approximate}`
      : `You appear to be in ${stateCode} — we don't have dispensaries there yet, showing all states.`;
  } else {
    message = stateCode ? `Showing dispensaries in ${stateCode}` : 'Showing dispensaries in all states';
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950/40 px-4 py-3 mb-6">
      <div className="flex items-center gap-2 text-sm text-green-900 dark:text-green-200">
        <span>📍</span>
        <span>{message}</span>
        {status !== 'detecting' && isManualOverride && (
          <button
            type="button"
            onClick={retryDetection}
            className="text-xs underline text-green-700 dark:text-green-400 ml-1"
          >
            use my location
          </button>
        )}
      </div>

      <select
        value={stateCode ?? ALL_STATES_VALUE}
        onChange={(e) => setStateCode(e.target.value === ALL_STATES_VALUE ? null : e.target.value)}
        className="rounded-lg border border-green-300 dark:border-green-800 bg-white dark:bg-neutral-900 px-3 py-1.5 text-sm"
      >
        <option value={ALL_STATES_VALUE}>All states</option>
        {availableStates.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
    </div>
  );
}
