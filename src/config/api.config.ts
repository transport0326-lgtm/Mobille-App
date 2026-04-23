const BASE_URL         = 'http://10.0.2.2:3000';
const BOOKING_BASE_URL = 'http://10.0.2.2:3003';
const USER_BASE_URL    = 'http://10.0.2.2:3001';
const RIDER_BASE_URL   = 'http://10.0.2.2:3002';
const BASE_URL2 = 'http://10.0.2.2:3004';

// ─── Endpoints ───────────────────────────────────────────────────────────────

export const API_ENDPOINTS = {
  // Auth
  SEND_OTP:        'auth/send-otp',
  VERIFY_OTP:      'auth/verify-otp',
  REGISTER:        'auth/register',
  UPLOAD_DOCUMENT: 'auth/upload',
  // Booking
  FARE_ESTIMATE:   'bookings/fare-estimate',
  CREATE_BOOKING:  'bookings',
  FETCH_ORDERS:    'bookings',
  // Profile
  PROFILE:       'users/profile',
  RIDER_PROFILE:    'riders/profile',
  RIDER_BANK:         'riders/bank-account',
  RIDER_BANK_DETAILS: 'riders/bank-details',
  GO_ONLINE:          'riders/go-online',
  GO_OFFLINE:         'riders/go-offline',
  ACCEPT_BOOKING:     'bookings',
  RIDER_HOME:       'riders/home',
  RIDER_ACTIVE:       'bookings/rider/active',
  RATINGS:       'ratings',
  NOTIFICATIONS:  'notifications',
} as const;

export { BOOKING_BASE_URL, USER_BASE_URL, RIDER_BASE_URL ,BASE_URL2};

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  status: number;
  data: T;
}

export interface ApiError extends Error {
  status: number;
  statusText: string;
  data: unknown;
}

// ─── Auth Token ───────────────────────────────────────────────────────────────
// Call setAuthToken(token) right after login. It will be attached to every
// subsequent request as a Bearer token.

let _authToken: string | null = null;

export const setAuthToken = (token: string | null): void => {
  _authToken = token;
  console.log('🔑 Bearer token:', token);
};

export const getAuthToken = (): string | null => _authToken;

// ─── Core Request ─────────────────────────────────────────────────────────────

export const apiRequest = async <T = unknown>(
  endpoint: string,
  options: RequestInit = {},
  baseUrl: string = BASE_URL,
): Promise<ApiResponse<T>> => {
  const requestId = Math.random().toString(36).substring(2, 6);

  const cleanEndpoint = endpoint.replace(/^\/+/, '');
  const url = `${baseUrl}/${cleanEndpoint}`;

  // Plain object headers — React Native fetch does not support the browser's
  // Headers constructor, and mode / credentials options are also ignored in RN.
  const headers: Record<string, string> = {
    Accept: 'application/json',
  };

  const method = (options.method ?? 'GET').toUpperCase();

  // Skip Content-Type for FormData — fetch sets it automatically with the boundary
  if (['POST', 'PUT', 'PATCH'].includes(method) && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (_authToken) {
    headers['Authorization'] = `Bearer ${_authToken}`;
  }

  // Caller-provided headers take precedence
  if (options.headers) {
    Object.assign(headers, options.headers as Record<string, string>);
  }

  // Request debug log
  if (options.body) {
    try {
      const bodyObj =
        typeof options.body === 'string' ? JSON.parse(options.body) : options.body;
      console.log(`🌐 [${requestId}] ${method} /${cleanEndpoint}`, bodyObj);
    } catch {
      console.log(`🌐 [${requestId}] ${method} /${cleanEndpoint} (non-JSON body)`);
    }
  } else {
    console.log(`🌐 [${requestId}] ${method} /${cleanEndpoint}`);
  }

  const config: RequestInit = { ...options, headers };

  try {
    const response = await fetch(url, config);
    const responseText = await response.text();

    let responseData: unknown;
    try {
      responseData = responseText ? JSON.parse(responseText) : null;
    } catch {
      responseData = responseText;
    }

    if (!response.ok) {
      let errorMessage = 'An error occurred';

      if (typeof responseData === 'object' && responseData !== null) {
        const d = responseData as Record<string, unknown>;
        if (typeof d.error === 'string')        errorMessage = d.error;
        else if (typeof d.message === 'string') errorMessage = d.message;
        else if (d.errors) {
          errorMessage = Array.isArray(d.errors)
            ? d.errors
                .map(e =>
                  typeof e === 'object' && e !== null && 'message' in e
                    ? (e as { message: string }).message
                    : String(e),
                )
                .join(', ')
            : String(d.errors);
        }
      } else if (response.statusText) {
        errorMessage = response.statusText;
      }

      console.error(`🌐 [${requestId}] ✗ ${response.status} – ${errorMessage}`);

      const error      = new Error(errorMessage) as ApiError;
      error.status     = response.status;
      error.statusText = response.statusText;
      error.data       = responseData;
      throw error;
    }

    console.log(`🌐 [${requestId}] ✓ ${response.status}`);

    return { status: response.status, data: responseData as T };

  } catch (err: unknown) {
    // Re-throw API errors that already have .status attached
    if ((err as ApiError).status !== undefined) {
      throw err;
    }

    const message = err instanceof Error ? err.message : 'Network error occurred';
    console.error(`🌐 [${requestId}] Network error:`, message);

    const networkError        = new Error(message) as ApiError;
    networkError.status       = 0;
    networkError.statusText   = 'Network Error';
    networkError.data         = null;
    throw networkError;
  }
};

export default API_ENDPOINTS;
