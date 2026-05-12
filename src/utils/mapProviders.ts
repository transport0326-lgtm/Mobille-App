import { GOOGLE_MAPS_CONFIG } from '../config/map.config';

export interface LatLng { lat: number; lng: number }

export interface Suggestion {
  id: string;       // Google place_id
  name: string;
  address: string;
  lat?: number;
  lng?: number;
}

const KEY = GOOGLE_MAPS_CONFIG.API_KEY;

// ─── Reverse geocode — Google Geocoding API ───────────────────────────────────

export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${KEY}`,
    );
    const data = await res.json();
    if (data.status === 'OK' && data.results?.[0]) {
      return data.results[0].formatted_address ?? 'Selected Location';
    }
    return 'Selected Location';
  } catch {
    return 'Selected Location';
  }
}

// ─── Forward geocode — Google Geocoding API ───────────────────────────────────

export async function forwardGeocode(query: string): Promise<LatLng | null> {
  try {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query.trim())}&region=in&key=${KEY}`,
    );
    const data = await res.json();
    if (data.status === 'OK' && data.results?.[0]?.geometry?.location) {
      const { lat, lng } = data.results[0].geometry.location;
      return { lat, lng };
    }
    return null;
  } catch {
    return null;
  }
}

// ─── Search suggestions — Google Places Autocomplete ─────────────────────────

export async function searchSuggestions(query: string): Promise<Suggestion[]> {
  if (!query || query.trim().length < 2) return [];
  try {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query.trim())}&components=country:in&key=${KEY}`,
    );
    const data = await res.json();
    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') return [];
    return (data.predictions ?? []).map((p: any) => ({
      id:      p.place_id,
      name:    p.structured_formatting?.main_text ?? p.description,
      address: p.structured_formatting?.secondary_text ?? '',
    }));
  } catch {
    return [];
  }
}

// ─── Place details — resolves place_id → LatLng ───────────────────────────────

export async function getPlaceCoords(placeId: string): Promise<LatLng | null> {
  try {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=geometry&key=${KEY}`,
    );
    const data = await res.json();
    const loc = data.result?.geometry?.location;
    if (loc) return { lat: loc.lat, lng: loc.lng };
    return null;
  } catch {
    return null;
  }
}
