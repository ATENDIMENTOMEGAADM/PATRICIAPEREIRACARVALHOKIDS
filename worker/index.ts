// Backend do site: login da área restrita e integrações configuradas em Configurações → API.
// O site é independente do sistema de receitas; ele só se conecta por chave de API.
import { encryptSecret, decryptSecret, hashPassword, verifyPassword, randomToken, sha256 } from './crypto';
import { connectors, type ConnectorKind } from './connectors';

interface D1Result<T> { results: T[] }
interface D1Statement {
  bind(...values: unknown[]): D1Statement;
  first<T = Record<string, any>>(): Promise<T | null>;
  all<T = Record<string, any>>(): Promise<D1Result<T>>;
  run(): Promise<{ meta: { changes: number } }>;
}
export interface Env {
  DB: { prepare(sql: string): D1Statement };
  ASSETS: { fetch(request: Request): Promise<Response> };
  ADMIN_SETUP_TOKEN?: string;
  INTEGRATIONS_SECRET?: string;
  ALLOW_LOCAL_INTEGRATIONS?: string;
}

const COOKIE = '__Host-site_session', LIFETIME = 12 * 3600, IDLE = 2 * 3600;
const now = () => Math.floor(Date.now() / 1000);

class HttpError extends Error { constructor(public status: number, message: string) { super(message); } }
const fail = (status: number, message: string): never => { throw new HttpError(status, message); };
const json = (data: unknown, status = 200, headers: Record<string, string> = {}) =>
  Response.json(data, { status, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', ...headers } });
const cookie = (token: string, maxAge = LIFETIME) => `${COOKIE}=${token}; Path=/; Secure; HttpOnly; SameSite=Strict; Max-Age=${maxAge}`;

async function readJson(request: Request): Promise<Record<string, any>> {
  if (!request.headers.get('Content-Type')?.includes('application/json')) fail(415, 'Formato de envio inválido.');
  const text = await request.text();
  if (text.length > 20000) fail(413, 'Envio muito grande.');
  try { const data = JSON.parse(text || '{}'); if (!data || typeof data !== 'object' || Array.isArray(data)) throw Error(); return data; }
  catch { return fail(400, 'Não foi possível ler o envio.'); }
}
const text = (value: unknown, max: number, label: string) => {
  if (typeof value !== 'string' || !value.trim() || value.length > max) fail(400, `Confira o campo ${label}.`);
  return (value as string).trim();
};
function email(value: unknown) {
  const v = text(value, 180, 'e-mail').toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(v)) fail(400, 'Informe um e-mail válido.');
  return v;
}
function newPassword(value: unknown) {
  if (typeof value !== 'string' || value.length < 10 || value.length > 128) fail(400, 'Use uma senha de 10 a 128 caracteres.');
  return value as string;
}
async function limit(env: Env, scope: string, identity: string, max: number) {
  const t = now(), key = scope + ':' + await sha256(identity);
  const row = await env.DB.prepare('INSERT INTO login_attempts (key,attempts,expires_at) VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET attempts=CASE WHEN expires_at<=? THEN 1 ELSE attempts+1 END, expires_at=CASE WHEN expires_at<=? THEN excluded.expires_at ELSE expires_at END RETURNING attempts')
    .bind(key, t + 900, t, t).first<{ attempts: number }>();
  if ((row?.attempts ?? 0) > max) fail(429, 'Muitas tentativas. Aguarde 15 minutos.');
}
function sessionToken(request: Request) {
  const found = (request.headers.get('Cookie') || '').split(';').map(v => v.trim()).find(v => v.startsWith(COOKIE + '='));
  const token = found?.slice(COOKIE.length + 1) ?? '';
  return /^[A-Za-z0-9_-]{43}$/.test(token) ? token : null;
}
async function currentUser(request: Request, env: Env) {
  const token = sessionToken(request); if (!token) return null;
  const t = now(), hash = await sha256(token);
  const row = await env.DB.prepare('SELECT u.id,u.name,u.email,s.last_seen FROM admin_sessions s JOIN admin_users u ON u.id=s.user_id WHERE s.token_hash=? AND s.expires_at>? AND s.last_seen>?')
    .bind(hash, t, t - IDLE).first<{ id: string; name: string; email: string; last_seen: number }>();
  if (!row) return null;
  if (row.last_seen < t - 60) await env.DB.prepare('UPDATE admin_sessions SET last_seen=? WHERE token_hash=?').bind(t, hash).run();
  return { id: row.id, name: row.name, email: row.email, tokenHash: hash };
}
async function startSession(env: Env, userId: string) {
  const token = randomToken(), t = now();
  await env.DB.prepare('INSERT INTO admin_sessions (token_hash,user_id,created_at,last_seen,expires_at) VALUES (?,?,?,?,?)').bind(await sha256(token), userId, t, t, t + LIFETIME).run();
  return token;
}
// Toda alteração exige mesma origem; o cookie SameSite=Strict é a segunda barreira.
function sameOrigin(request: Request) {
  const url = new URL(request.url);
  if (request.headers.get('Origin') !== url.origin || request.headers.get('X-Site-Request') !== '1') fail(403, 'Reabra a área restrita e tente novamente.');
}

function integrationView(row: Record<string, any>) {
  return {
    id: row.id, kind: row.kind, name: row.name, baseUrl: row.base_url, keyPrefix: row.key_prefix,
    remoteAccount: row.remote_account, remoteKeyName: row.remote_key_name, scopes: JSON.parse(row.scopes || '[]'),
    status: row.status, statusMessage: row.status_message,
    checkedAt: row.checked_at ? new Date(row.checked_at * 1000).toISOString() : null,
    createdAt: new Date(row.created_at * 1000).toISOString(),
  };
}
function secret(env: Env) {
  if (!env.INTEGRATIONS_SECRET || env.INTEGRATIONS_SECRET.length < 32) fail(503, 'O segredo INTEGRATIONS_SECRET do servidor não está configurado.');
  return env.INTEGRATIONS_SECRET as string;
}

async function api(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url), path = url.pathname, method = request.method;
  if (!env.DB) fail(503, 'Banco do site indisponível.');
  if (method !== 'GET') sameOrigin(request);

  if (path === '/api/auth/state' && method === 'GET') {
    const users = await env.DB.prepare('SELECT count(*) AS n FROM admin_users').first<{ n: number }>();
    const user = await currentUser(request, env);
    return json({ setupRequired: !users?.n, user: user && { name: user.name, email: user.email } });
  }
  if (path === '/api/auth/setup' && method === 'POST') {
    const data = await readJson(request), ip = request.headers.get('CF-Connecting-IP') || 'local';
    await limit(env, 'setup', ip, 10);
    if (!env.ADMIN_SETUP_TOKEN || env.ADMIN_SETUP_TOKEN.length < 16) fail(503, 'Configure o segredo ADMIN_SETUP_TOKEN no servidor antes de criar o primeiro acesso.');
    if (data.setupToken !== env.ADMIN_SETUP_TOKEN) fail(403, 'Código de instalação incorreto.');
    const name = text(data.name, 80, 'nome'), address = email(data.email), hash = await hashPassword(newPassword(data.password));
    const id = crypto.randomUUID();
    // O INSERT só acontece se ainda não houver nenhum administrador.
    const result = await env.DB.prepare('INSERT INTO admin_users (id,name,email,password_hash,created_at) SELECT ?,?,?,?,? WHERE NOT EXISTS (SELECT 1 FROM admin_users)').bind(id, name, address, hash, now()).run();
    if (!result.meta.changes) fail(409, 'O primeiro acesso já foi criado. Use Entrar.');
    return json({ user: { name, email: address } }, 201, { 'Set-Cookie': cookie(await startSession(env, id)) });
  }
  if (path === '/api/auth/login' && method === 'POST') {
    const data = await readJson(request), address = email(data.email), ip = request.headers.get('CF-Connecting-IP') || 'local';
    await limit(env, 'login-ip', ip, 50); await limit(env, 'login', address, 10);
    const row = await env.DB.prepare('SELECT id,name,email,password_hash FROM admin_users WHERE email=?').bind(address).first<Record<string, string>>();
    const valid = await verifyPassword(typeof data.password === 'string' ? data.password.slice(0, 128) : '', row?.password_hash);
    if (!row || !valid) fail(401, 'E-mail ou senha incorretos.');
    return json({ user: { name: row!.name, email: row!.email } }, 200, { 'Set-Cookie': cookie(await startSession(env, row!.id)) });
  }

  const user = await currentUser(request, env);
  if (!user) fail(401, 'Entre novamente na área restrita.');
  if (path === '/api/auth/logout' && method === 'POST') {
    await env.DB.prepare('DELETE FROM admin_sessions WHERE token_hash=?').bind(user!.tokenHash).run();
    return json({ ok: true }, 200, { 'Set-Cookie': cookie('', 0) });
  }

  if (path === '/api/settings/integrations' && method === 'GET') {
    const rows = await env.DB.prepare('SELECT * FROM integrations ORDER BY created_at').all();
    return json({ items: rows.results.map(integrationView), connectors: Object.fromEntries(Object.entries(connectors).map(([k, c]) => [k, { label: c.label, description: c.description, icon: c.icon }])) });
  }
  if (path === '/api/settings/integrations' && method === 'POST') {
    const data = await readJson(request), kind = data.kind as ConnectorKind;
    const connector = connectors[kind]; if (!connector) fail(400, 'Tipo de integração inválido.');
    const name = text(data.name, 60, 'nome'), baseUrl = connector.baseUrl(data.baseUrl, env.ALLOW_LOCAL_INTEGRATIONS === '1', fail);
    const key = text(data.apiKey, 200, 'chave');
    const check = await connector.check(baseUrl, key, fail);
    const id = crypto.randomUUID(), t = now();
    await env.DB.prepare('INSERT INTO integrations (id,kind,name,base_url,key_cipher,key_prefix,remote_account,remote_key_name,scopes,status,status_message,checked_at,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)')
      .bind(id, kind, name, baseUrl, await encryptSecret(key, secret(env)), key.slice(0, 12), check.account, check.keyName, JSON.stringify(check.scopes), 'connected', 'Conectado', t, t, t).run();
    return json(integrationView((await env.DB.prepare('SELECT * FROM integrations WHERE id=?').bind(id).first())!), 201);
  }
  const action = path.match(/^\/api\/settings\/integrations\/([\w-]+)\/(test|delete)$/);
  if (action && method === 'POST') {
    const row = await env.DB.prepare('SELECT * FROM integrations WHERE id=?').bind(action[1]).first();
    if (!row) fail(404, 'Integração não encontrada.');
    if (action[2] === 'delete') {
      await env.DB.prepare('DELETE FROM integrations WHERE id=?').bind(action[1]).run();
      return json({ ok: true });
    }
    const connector = connectors[row!.kind as ConnectorKind], t = now();
    try {
      const check = await connector.check(row!.base_url, await decryptSecret(row!.key_cipher, secret(env)), fail);
      await env.DB.prepare("UPDATE integrations SET status='connected',status_message='Conectado',remote_account=?,remote_key_name=?,scopes=?,checked_at=?,updated_at=? WHERE id=?")
        .bind(check.account, check.keyName, JSON.stringify(check.scopes), t, t, action[1]).run();
    } catch (error) {
      if (!(error instanceof HttpError) || error.status === 503 && error.message.includes('INTEGRATIONS_SECRET')) throw error;
      await env.DB.prepare("UPDATE integrations SET status='error',status_message=?,checked_at=?,updated_at=? WHERE id=?").bind(error.message, t, t, action[1]).run();
    }
    return json(integrationView((await env.DB.prepare('SELECT * FROM integrations WHERE id=?').bind(action[1]).first())!));
  }
  return fail(404, 'Rota não encontrada.');
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname.startsWith('/api/')) {
      try { return await api(request, env); }
      catch (error) {
        if (error instanceof HttpError) return json({ error: error.message }, error.status);
        console.error('site api failure', (error as Error)?.name);
        return json({ error: 'Não foi possível concluir. Tente novamente.' }, 503);
      }
    }
    const response = await env.ASSETS.fetch(request);
    if (!url.pathname.startsWith('/admin')) return response;
    // A área restrita nunca é guardada em cache nem exibida dentro de outros sites.
    const headers = new Headers(response.headers);
    headers.set('Cache-Control', 'no-store'); headers.set('X-Frame-Options', 'DENY'); headers.set('Referrer-Policy', 'same-origin');
    headers.set('X-Robots-Tag', 'noindex');
    headers.set('X-Content-Type-Options', 'nosniff');
    headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    headers.set('Content-Security-Policy', "default-src 'self'; base-uri 'none'; object-src 'none'; frame-ancestors 'none'; form-action 'self'; img-src 'self' data:; font-src 'self' https://fonts.gstatic.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; script-src 'self'; connect-src 'self'");
    return new Response(response.body, { status: response.status, headers });
  },
};
