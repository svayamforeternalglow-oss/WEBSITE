const API_BASE = process.env.NEXT_PUBLIC_API_URL!;

if (!API_BASE) {
  throw new Error('NEXT_PUBLIC_API_URL is not defined');
}

const API_BASE_URL = API_BASE.replace(/\/$/, '');

interface RequestOptions {
  method?: string;
  body?: unknown;
  token?: string;
  headers?: Record<string, string>;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, token, headers = {} } = options;

  const config: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const res = await fetch(`${API_BASE_URL}${endpoint}`, config);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || 'API request failed');
  }

  return data;
}

export const api = {
  get: <T>(endpoint: string, token?: string, headers?: Record<string, string>) =>
    request<T>(endpoint, { token, headers }),

  post: <T>(endpoint: string, body: unknown, token?: string, headers?: Record<string, string>) =>
    request<T>(endpoint, { method: 'POST', body, token, headers }),

  put: <T>(endpoint: string, body: unknown, token?: string, headers?: Record<string, string>) =>
    request<T>(endpoint, { method: 'PUT', body, token, headers }),

  patch: <T>(endpoint: string, body: unknown, token?: string, headers?: Record<string, string>) =>
    request<T>(endpoint, { method: 'PATCH', body, token, headers }),

  delete: <T>(endpoint: string, token?: string, headers?: Record<string, string>) =>
    request<T>(endpoint, { method: 'DELETE', token, headers }),

  /** Fetch blob (e.g. PDF/ZIP) and return as Blob for download */
  getBlob: async (endpoint: string, token?: string): Promise<Blob> => {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || 'Download failed');
    }
    return res.blob();
  },
};
