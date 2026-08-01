import { stateNameToCode } from './usStates';

export interface DetectedLocation {
  stateCode: string;
  city: string | null;
}

export async function detectStateFromCoords(lat: number, lon: number): Promise<DetectedLocation | null> {
  const res = await fetch(
    `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`,
  );
  if (!res.ok) return null;
  const data = await res.json();
  const stateCode = stateNameToCode(data.principalSubdivision);
  if (!stateCode) return null;
  return { stateCode, city: data.city || data.locality || null };
}

export function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject(new Error('Geolocation is not supported by this browser.'));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      timeout: 8000,
      maximumAge: 300_000,
    });
  });
}

// No-permission fallback: approximates location from IP address, so the app
// can still find a state when GPS permission is denied, unavailable, or never asked.
export async function detectStateFromIP(): Promise<DetectedLocation | null> {
  const res = await fetch('https://ipapi.co/json/');
  if (!res.ok) return null;
  const data = await res.json();
  const stateCode: string | undefined = data.region_code;
  if (!stateCode || data.country_code !== 'US') return null;
  return { stateCode, city: data.city ?? null };
}
