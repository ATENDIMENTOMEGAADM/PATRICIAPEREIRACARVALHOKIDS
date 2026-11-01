export class ApiError extends Error { constructor(public status: number, message: string) { super(message); } }

export async function api<T = any>(path: string, body?: unknown): Promise<T> {
  const response = await fetch('/api/' + path, {
    method: body === undefined ? 'GET' : 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Site-Request': '1' },
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: 'no-store',
    credentials: 'same-origin',
  });
  const data = await response.json().catch(() => ({ error: 'Não foi possível conectar ao servidor do site.' }));
  if (!response.ok) throw new ApiError(response.status, data.error || 'Não foi possível concluir.');
  return data as T;
}

export interface AdminUser { name: string; email: string }
export interface Integration {
  id: string; kind: string; name: string; baseUrl: string; keyPrefix: string;
  remoteAccount: string | null; remoteKeyName: string | null; scopes: string[];
  status: 'connected' | 'error'; statusMessage: string | null; checkedAt: string | null; createdAt: string;
}
export interface ConnectorInfo { label: string; description: string; icon?: string }
