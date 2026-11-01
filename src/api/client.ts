/**
 * FinEdge API Client
 * Decoupled integration layer supporting configurable base URL, JWT auth, and endpoints.
 */

export const API_CONFIG = {
  useMockData: import.meta.env.VITE_USE_MOCK_DATA !== 'false',
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
};

// ── Token Management ──────────────────────────────────────────────────────────

const TOKEN_KEY = 'finedge_jwt';

export const authToken = {
  get: (): string | null => localStorage.getItem(TOKEN_KEY),
  set: (token: string): void => localStorage.setItem(TOKEN_KEY, token),
  clear: (): void => localStorage.removeItem(TOKEN_KEY),
};

// ── HTTP Client ───────────────────────────────────────────────────────────────

/**
 * Generic HTTP client — automatically attaches JWT Bearer token when available.
 */
export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_CONFIG.baseURL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  const token = authToken.get();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, { ...options, headers });

  if (response.status === 401) {
    authToken.clear();
    throw new Error('Session expired. Please log in again.');
  }

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`API Error [${response.status} ${response.statusText}]: ${errorBody}`);
  }

  // 204 No Content
  if (response.status === 204) return undefined as unknown as T;

  return response.json() as Promise<T>;
}
