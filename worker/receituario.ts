// Chamada autenticada à API v1 do Consul+ pelo SERVIDOR do site.
// Usa a integração "receituario" conectada (chave cifrada guardada). A chave NUNCA vai ao navegador.
import { decryptSecret } from './crypto';

type Fail = (status: number, message: string) => never;
interface Env { DB: { prepare(sql: string): any }; INTEGRATIONS_SECRET?: string }

const MAX_BYTES = 262144; // 256 KB — teto defensivo para a resposta

async function receituario(env: Env, fail: Fail, integrationId?: string): Promise<{ baseUrl: string; key: string }> {
  if (!env.INTEGRATIONS_SECRET || env.INTEGRATIONS_SECRET.length < 32) fail(503, 'Integração com o sistema de receitas indisponível.');
  const row = (integrationId
    ? await env.DB.prepare("SELECT base_url,key_cipher FROM integrations WHERE id=? AND kind='receituario' AND status='connected'").bind(integrationId).first()
    : await env.DB.prepare("SELECT base_url,key_cipher FROM integrations WHERE kind='receituario' AND status='connected' ORDER BY created_at DESC LIMIT 1").first()) as { base_url: string; key_cipher: string } | null;
  if (!row) fail(503, 'O site ainda não está conectado ao sistema de receitas.');
  try { return { baseUrl: row!.base_url, key: await decryptSecret(row!.key_cipher, env.INTEGRATIONS_SECRET as string) }; }
  catch { return fail(503, 'A conexão com o sistema de receitas precisa ser refeita (Configurações → API).'); }
}

// path já inclui o /api/v1/... e a query. Ex.: '/api/v1/records?patient=<id>&kind=prescription'.
export async function consulFetch<T = any>(env: Env, path: string, fail: Fail, integrationId?: string): Promise<T> {
  const { baseUrl, key } = await receituario(env, fail, integrationId);
  let response: Response;
  try {
    response = await fetch(baseUrl + path, {
      headers: { Authorization: 'Bearer ' + key, Accept: 'application/json' },
      redirect: 'manual',
      signal: AbortSignal.timeout(10000),
    });
  } catch { return fail(502, 'O sistema de receitas não respondeu. Tente novamente.'); }
  if (Number(response.headers.get('Content-Length') || 0) > MAX_BYTES) fail(502, 'Resposta inesperada do sistema de receitas.');
  let data: any = null;
  try { const raw = await response.text(); if (raw.length <= MAX_BYTES) data = raw ? JSON.parse(raw) : null; } catch { data = null; }
  if (response.status === 401 || response.status === 403) fail(502, 'O sistema de receitas recusou a conexão. Reconecte em Configurações → API.');
  if (!response.ok) fail(502, (data && data.error) || 'O sistema de receitas respondeu com erro.');
  return data as T;
}
