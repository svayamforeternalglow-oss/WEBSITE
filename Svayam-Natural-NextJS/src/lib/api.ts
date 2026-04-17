const API_BASE = process.env.NEXT_PUBLIC_API_URL?.trim();
const API_BASE_FALLBACK = process.env.NEXT_PUBLIC_API_URL_FALLBACK?.trim();
const PRODUCTION_API_BASE_FALLBACK = 'https://api.svayamnatural.com/api/v1';

const API_BASE_URL = API_BASE ? API_BASE.replace(/\/$/, '') : null;
const API_BASE_FALLBACK_URL = API_BASE_FALLBACK ? API_BASE_FALLBACK.replace(/\/$/, '') : null;

interface ErrorResponse {
  message?: string;
  error?: string;
}

const normalizeEndpoint = (endpoint: string): string =>
  endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

const buildUrl = (baseUrl: string, endpoint: string): string =>
  `${baseUrl}${normalizeEndpoint(endpoint)}`;

const getUrlHost = (value: string): string | null => {
  try {
    return new URL(value).host.toLowerCase();
  } catch {
    return null;
  }
};

const isStorefrontProductionHost = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }

  return /(^|\.)svayamnatural\.com$/i.test(window.location.hostname);
};

const getPrimaryApiBaseUrl = (): string => {
  if (API_BASE_URL) {
    return API_BASE_URL;
  }

  if (isStorefrontProductionHost()) {
    return PRODUCTION_API_BASE_FALLBACK;
  }

  throw new Error('NEXT_PUBLIC_API_URL is not defined');
};

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

const hasHeader = (headers: Record<string, string>, target: string): boolean =>
  Object.keys(headers).some((name) => name.toLowerCase() === target.toLowerCase());

const canRetryWithFallback = (method: string): boolean => {
  const normalizedMethod = method.toUpperCase();

  if (normalizedMethod === 'GET' || normalizedMethod === 'HEAD' || normalizedMethod === 'OPTIONS') {
    return true;
  }

  return false;
};

const getFallbackBaseUrl = (primaryBaseUrl: string, method: string): string | null => {
  if (!API_BASE_FALLBACK_URL) {
    return null;
  }

  if (!canRetryWithFallback(method)) {
    return null;
  }

  // In production storefront traffic, do not auto-hop to a different host.
  if (isStorefrontProductionHost()) {
    const primaryHost = getUrlHost(primaryBaseUrl);
    const fallbackHost = getUrlHost(API_BASE_FALLBACK_URL);
    if (primaryHost && fallbackHost && primaryHost !== fallbackHost) {
      return null;
    }
  }

  return API_BASE_FALLBACK_URL;
};

const logFallbackSkip = (reason: string, details: Record<string, string>): void => {
  if (typeof window === 'undefined') {
    return;
  }

  console.warn('[API] Fallback retry skipped', { reason, ...details });
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

  const requestHeaders: Record<string, string> = {
    ...headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  if (typeof body !== 'undefined' && !hasHeader(requestHeaders, 'Content-Type')) {
    requestHeaders['Content-Type'] = 'application/json';
  }

  const config: RequestInit = {
    method,
    headers: requestHeaders,
  };

  if (typeof body !== 'undefined') {
    config.body = JSON.stringify(body);
  }

  const primaryBaseUrl = getPrimaryApiBaseUrl();
  const fallbackBaseUrl = getFallbackBaseUrl(primaryBaseUrl, method);

  try {
    return await requestWithBase<T>(primaryBaseUrl, endpoint, config);
  } catch (error) {
    if (fallbackBaseUrl && isNetworkError(error)) {
      return requestWithBase<T>(fallbackBaseUrl, endpoint, config);
    }

    if (API_BASE_FALLBACK_URL && isNetworkError(error) && !fallbackBaseUrl) {
      logFallbackSkip('policy_blocked', {
        method: method.toUpperCase(),
        endpoint: normalizeEndpoint(endpoint),
        primaryBaseUrl,
        fallbackBaseUrl: API_BASE_FALLBACK_URL,
      });
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
    const primaryBaseUrl = getPrimaryApiBaseUrl();
    const fallbackBaseUrl = getFallbackBaseUrl(primaryBaseUrl, 'GET');

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
      return await fetchBlob(primaryBaseUrl);
    } catch (error) {
      if (fallbackBaseUrl && isNetworkError(error)) {
        return fetchBlob(fallbackBaseUrl);
      }

      if (API_BASE_FALLBACK_URL && isNetworkError(error) && !fallbackBaseUrl) {
        logFallbackSkip('policy_blocked', {
          method: 'GET',
          endpoint: normalizeEndpoint(endpoint),
          primaryBaseUrl,
          fallbackBaseUrl: API_BASE_FALLBACK_URL,
        });
      }

      throw error;
    }
  },
};
