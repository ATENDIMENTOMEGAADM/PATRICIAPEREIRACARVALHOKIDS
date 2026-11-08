// Cada integração de Configurações → API é um conector. Para adicionar outra, crie uma entrada aqui.
type Fail = (status: number, message: string) => never;
export interface CheckResult { account: string | null; keyName: string | null; scopes: string[] }
interface Connector {
  label: string;
  description: string;
  icon: string;
  baseUrl(value: unknown, allowLocal: boolean, fail: Fail): string;
  check(baseUrl: string, key: string, fail: Fail): Promise<CheckResult>;
}

function origin(value: unknown, allowLocal: boolean, fail: Fail) {
  if (typeof value !== 'string' || value.length > 300) return fail(400, 'Informe o endereço do sistema.');
  let url: URL;
  try { url = new URL(value.trim()); } catch { return fail(400, 'Endereço inválido. Exemplo: https://sistema.com.br'); }
  const local = ['localhost', '127.0.0.1'].includes(url.hostname);
  if (url.username || url.password || url.search || url.hash) fail(400, 'Use somente o endereço principal do sistema.');
  if (!(url.protocol === 'https:' || (allowLocal && local && url.protocol === 'http:'))) fail(400, 'O endereço precisa começar com https://.');
  if (local && !allowLocal) fail(400, 'Endereços locais não são aceitos neste servidor.');
  return url.origin;
}

// O conector Consul+ só fala com os endereços oficiais do Consul+.
// Impede enviar uma chave real a um host arbitrário (SSRF / egressão de segredo).
const RECEITUARIO_HOSTS = new Set(['consulmais.com', 'www.consulmais.com', 'consul-plus.consulmais.workers.dev']);
function receituarioBaseUrl(value: unknown, allowLocal: boolean, fail: Fail) {
  const result = origin(value, allowLocal, fail);
  const host = new URL(result).hostname;
  const local = ['localhost', '127.0.0.1'].includes(host);
  if (!RECEITUARIO_HOSTS.has(host) && !(allowLocal && local)) {
    fail(400, 'Para o Consul+, use o endereço oficial: https://consulmais.com');
  }
  return result;
}

export const connectors: Record<string, Connector> = {
  receituario: {
    label: 'Consul+',
    description: 'Sistema de receitas, prontuário e agenda. Gere a chave no Consul+ em Minha conta → Integrações (API) e cole abaixo.',
    icon: '/integracoes/consul-plus.png',
    baseUrl: receituarioBaseUrl,
    async check(baseUrl, key, fail) {
      if (!/^rcp_[A-Za-z0-9_-]{43}$/.test(key)) fail(400, 'A chave do Consul+ começa com rcp_ e tem 47 caracteres.');
      let response: Response;
      try {
        response = await fetch(baseUrl + '/api/v1/me', { headers: { Authorization: 'Bearer ' + key, Accept: 'application/json' }, redirect: 'manual', signal: AbortSignal.timeout(10000) });
      } catch { return fail(502, 'O Consul+ não respondeu. Confira o endereço.'); }
      if (Number(response.headers.get('Content-Length') || 0) > 65536) fail(502, 'Resposta inesperada do Consul+.');
      let data: any = null;
      try { const raw = await response.text(); if (raw.length <= 65536) data = raw ? JSON.parse(raw) : null; } catch { data = null; }
      if (response.status === 401) fail(400, 'Chave recusada pelo Consul+ (inválida ou revogada).');
      if (!response.ok || !data?.key) fail(502, data?.error || `O Consul+ respondeu com erro ${response.status}.`);
      return { account: data.clinic?.email ?? null, keyName: data.key.name ?? null, scopes: Array.isArray(data.key.scopes) ? data.key.scopes : [] };
    },
  },
};
export type ConnectorKind = keyof typeof connectors;
