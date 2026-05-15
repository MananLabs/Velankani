export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export type AuthTokenGetter = () => Promise<string | null>;

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
  signal?: AbortSignal;
  parseAs?: 'json' | 'text' | 'void';
}

function joinUrl(base: string, path: string): string {
  const normalizedBase = base.endsWith('/') ? base.slice(0, -1) : base;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
}

export async function apiRequest<T = unknown>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const {
    method = 'GET',
    body,
    headers = {},
    signal,
    parseAs = 'json',
  } = options;

  const response = await fetch(joinUrl(API_BASE, path), {
    method,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal,
  });

  if (!response.ok) {
    const fallback = `API error ${response.status}`;
    const errText = await response.text().catch(() => '');
    throw new Error(errText || fallback);
  }

  if (parseAs === 'void') return undefined as T;
  if (parseAs === 'text') return (await response.text()) as T;

  return (await response.json()) as T;
}

export function createAuthedRequest(getToken: AuthTokenGetter) {
  return async function authedRequest<T = unknown>(
    path: string,
    options: RequestOptions = {},
  ): Promise<T> {
    const token = await getToken();
    return apiRequest<T>(path, {
      ...options,
      headers: {
        ...options.headers,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
  };
}
