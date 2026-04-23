import { MAPPLS_CONFIG } from '../config/map.config';

export interface LatLng { lat: number; lng: number }

export interface Suggestion {
  id: string;
  name: string;
  address: string;
  lat?: number;
  lng?: number;
}

// ─── OAuth token cache ────────────────────────────────────────────────────────

let _token: string | null = null;
let _tokenExpiry = 0;

async function getToken(): Promise<string | null> {
  const now = Date.now();
  if (_token && now < _tokenExpiry) return _token;
  try {
    const body = new URLSearchParams({
      grant_type:    'client_credentials',
      client_id:     MAPPLS_CONFIG.CLIENT_ID,
      client_secret: MAPPLS_CONFIG.CLIENT_SECRET,
    });
    const res = await fetch('https://outpost.mappls.com/api/security/oauth/token', {
      method:  'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body:    body.toString(),
    });
    const data = await res.json();
    if (data?.access_token) {
      _token       = data.access_token;
      _tokenExpiry = now + ((data.expires_in ?? 3600) - 60) * 1000;
      return _token;
    }
    return null;
  } catch {
    return null;
  }
}

// ─── Tile URL ─────────────────────────────────────────────────────────────────

export function getTileUrl(z: number, x: number, y: number): string {
  return `https://apis.mappls.com/advancedmaps/v1/${MAPPLS_CONFIG.REST_KEY}/still_map/${z}/${x}/${y}.png`;
}

// ─── Forward geocode — Nominatim ─────────────────────────────────────────────

export async function forwardGeocode(query: string): Promise<LatLng | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query.trim())}&format=json&countrycodes=in&limit=1`,
      { headers: { 'Accept-Language': 'en', 'User-Agent': 'TranspportApp/1.0' } }
    );
    const data = await res.json();
    console.log('🌐 forwardGeocode RAW:', JSON.stringify(data?.[0], null, 2));

    if (data?.[0]?.lat && data?.[0]?.lon) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
      };
    }
    return null;
  } catch (err) {
    console.log('❌ forwardGeocode ERROR:', err);
    return null;
  }
}

// ─── Reverse geocode — Mappls (same as before) ───────────────────────────────

export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch(
      `https://apis.mappls.com/advancedmaps/v1/${MAPPLS_CONFIG.REST_KEY}/rev_geocode?lat=${lat}&lng=${lng}&region=IND`,
    );
    const data = await res.json();
    const result = data?.results?.[0];
    if (result) {
      return result.formatted_address || result.locality || result.city || 'Selected Location';
    }
    return 'Selected Location';
  } catch {
    return 'Selected Location';
  }
}

// ─── Search suggestions — Nominatim ──────────────────────────────────────────

export async function searchSuggestions(query: string): Promise<Suggestion[]> {
  if (!query || query.trim().length < 2) return [];
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query.trim())}&format=json&countrycodes=in&limit=5&addressdetails=1`,
      { headers: { 'Accept-Language': 'en', 'User-Agent': 'TranspportApp/1.0' } }
    );
    const data = await res.json();
    console.log('🔍 Nominatim suggestions RAW:', JSON.stringify(data?.[0], null, 2));

    return (data ?? []).map((item: any) => {
      const name =
        item.address?.road ??
        item.address?.suburb ??
        item.address?.city ??
        item.display_name?.split(',')?.[0] ??
        'Unknown';

      const address = item.display_name ?? '';

      return {
        id:      item.place_id?.toString() ?? String(Math.random()),
        name,
        address,
        lat:     parseFloat(item.lat),
        lng:     parseFloat(item.lon),
      };
    }).filter((s: Suggestion) => s.lat != null && s.lng != null && !isNaN(s.lat!) && !isNaN(s.lng!));

  } catch (err) {
    console.log('❌ searchSuggestions ERROR:', err);
    return [];
  }
}