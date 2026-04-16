const API_BASE = process.env.NEXT_PUBLIC_API_URL;
const API_BASE_FALLBACK = process.env.NEXT_PUBLIC_API_URL_FALLBACK;

if (!API_BASE) {
  throw new Error('NEXT_PUBLIC_API_URL is not defined');
}

const API_BASE_URL = API_BASE.replace(/\/$/, '');
const API_BASE_FALLBACK_URL = API_BASE_FALLBACK ? API_BASE_FALLBACK.replace(/\/$/, '') : null;

interface ErrorResponse {
  message?: string;
  error?: string;
}

const normalizeEndpoint = (endpoint: string): string =>
  endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

const buildUrl = (baseUrl: string, endpoint: string): string =>
  `${baseUrl}${normalizeEndpoint(endpoint)}`;

const isNetworkError = (error: unknown): boolean => {
  if (error instanceof TypeError) {
    return true;
  }

  if (error instanceof Error) {
    return /failed to fetch|networkerror|load failed|fetch/i.test(error.message);
  }

  return false;
};

const extractErrorMessage = (payload: unknown, fallback: string): string => {
  if (payload && typeof payload === 'object') {
    const errorPayload = payload as ErrorResponse;
    if (typeof errorPayload.message === 'string' && errorPayload.message.trim()) {
      return errorPayload.message;
    }
    if (typeof errorPayload.error === 'string' && errorPayload.error.trim()) {
      return errorPayload.error;
    }
  }

  return fallback;
};

interface RequestOptions {
  method?: string;
  body?: unknown;
  token?: string;
  headers?: Record<string, string>;
}

async function requestWithBase<T>(
  baseUrl: string,
  endpoint: string,
  config: RequestInit
): Promise<T> {
  const res = await fetch(buildUrl(baseUrl, endpoint), config);
  const data: unknown = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(extractErrorMessage(data, `API request failed (${res.status})`));
  }

  return data as T;
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

  try {
    return await requestWithBase<T>(API_BASE_URL, endpoint, config);
  } catch (error) {
    if (API_BASE_FALLBACK_URL && isNetworkError(error)) {
      return requestWithBase<T>(API_BASE_FALLBACK_URL, endpoint, config);
    }

    throw error;
  }
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
    const config: RequestInit = {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    };

    const fetchBlob = async (baseUrl: string): Promise<Blob> => {
      const res = await fetch(buildUrl(baseUrl, endpoint), config);
      if (!res.ok) {
        const data: unknown = await res.json().catch(() => null);
        throw new Error(extractErrorMessage(data, `Download failed (${res.status})`));
      }
      return res.blob();
    };

    try {
      return await fetchBlob(API_BASE_URL);
    } catch (error) {
      if (API_BASE_FALLBACK_URL && isNetworkError(error)) {
        return fetchBlob(API_BASE_FALLBACK_URL);
      }

      throw error;
    }
  },
};
