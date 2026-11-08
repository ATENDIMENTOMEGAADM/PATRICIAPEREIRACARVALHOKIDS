// Backend do site: login da área restrita e integrações configuradas em Configurações → API.
// O site é independente do sistema de receitas; ele só se conecta por chave de API.
import { encryptSecret, decryptSecret, hashPassword, verifyPassword, randomToken, sha256, needsRehash, constantTimeEqual } from './crypto';
import { connectors, type ConnectorKind } from './connectors';
import { consulFetch } from './receituario';

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

const COOKIE = '__Host-site_session', PATIENT_COOKIE = '__Host-patient_session', LIFETIME = 12 * 3600, IDLE = 2 * 3600;
const now = () => Math.floor(Date.now() / 1000);

class HttpError extends Error { constructor(public status: number, message: string) { super(message); } }
const fail = (status: number, message: string): never => { throw new HttpError(status, message); };
const json = (data: unknown, status = 200, headers: Record<string, string> = {}) =>
  Response.json(data, { status, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', ...headers } });
const cookie = (token: string, maxAge = LIFETIME, name = COOKIE) => `${name}=${token}; Path=/; Secure; HttpOnly; SameSite=Strict; Max-Age=${maxAge}`;

async function readJson(request: Request): Promise<Record<string, any>> {
  if (!request.headers.get('Content-Type')?.includes('application/json')) fail(415, 'Formato de envio inválido.');
  if (Number(request.headers.get('Content-Length') || 0) > 20000) fail(413, 'Envio muito grande.');
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
function sessionToken(request: Request, name = COOKIE) {
  const found = (request.headers.get('Cookie') || '').split(';').map(v => v.trim()).find(v => v.startsWith(name + '='));
  const token = found?.slice(name.length + 1) ?? '';
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
// --- Sessão do PACIENTE (separada da equipe: cookie e tabelas próprias) ---
async function currentPatient(request: Request, env: Env) {
  const token = sessionToken(request, PATIENT_COOKIE); if (!token) return null;
  const t = now(), hash = await sha256(token);
  const row = await env.DB.prepare("SELECT u.id,u.name,u.email,u.remote_patient_id,u.integration_id,s.last_seen FROM patient_sessions s JOIN patient_users u ON u.id=s.user_id WHERE s.token_hash=? AND u.status='active' AND s.expires_at>? AND s.last_seen>?")
    .bind(hash, t, t - IDLE).first<{ id: string; name: string; email: string; remote_patient_id: string; integration_id: string; last_seen: number }>();
  if (!row) return null;
  if (row.last_seen < t - 60) await env.DB.prepare('UPDATE patient_sessions SET last_seen=? WHERE token_hash=?').bind(t, hash).run();
  return { id: row.id, name: row.name, email: row.email, remotePatientId: row.remote_patient_id, integrationId: row.integration_id, tokenHash: hash };
}
async function startPatientSession(env: Env, userId: string) {
  const token = randomToken(), t = now();
  await env.DB.prepare('INSERT INTO patient_sessions (token_hash,user_id,created_at,last_seen,expires_at) VALUES (?,?,?,?,?)').bind(await sha256(token), userId, t, t, t + LIFETIME).run();
  return token;
}
// Toda alteração exige mesma origem; o cookie SameSite=Strict é a segunda barreira.
function sameOrigin(request: Request) {
  const url = new URL(request.url);
  if (request.headers.get('Origin') !== url.origin || request.headers.get('X-Site-Request') !== '1') fail(403, 'Reabra a área restrita e tente novamente.');
}
const clientIp = (request: Request) => request.headers.get('CF-Connecting-IP') || 'local';
const userAgent = (request: Request) => request.headers.get('User-Agent')?.slice(0, 256) ?? null;

// --- Trilha de auditoria (LGPD): registra acessos a dados de paciente e ações da equipe. ---
// Best-effort: uma falha ao gravar o log NUNCA pode derrubar a requisição do usuário.
interface AccessLogEntry {
  actorType: 'patient' | 'staff' | 'system';
  actorId?: string | null;
  patientUserId?: string | null;
  remotePatientId?: string | null;
  integrationId?: string | null;
  action: string;
  resourceId?: string | null;
  ip?: string | null;
  userAgent?: string | null;
}
async function logAccess(env: Env, e: AccessLogEntry) {
  try {
    await env.DB.prepare('INSERT INTO access_log (id,created_at,actor_type,actor_id,patient_user_id,remote_patient_id,integration_id,action,resource_id,ip,user_agent) VALUES (?,?,?,?,?,?,?,?,?,?,?)')
      .bind(crypto.randomUUID(), now(), e.actorType, e.actorId ?? null, e.patientUserId ?? null, e.remotePatientId ?? null, e.integrationId ?? null, e.action, e.resourceId ?? null, e.ip ?? null, e.userAgent ?? null).run();
  } catch (error) { console.error('access_log falhou', (error as Error)?.name); }
}

// --- Expurgo de sessões expiradas e tentativas de login vencidas (Cron Trigger diário). ---
// O access_log NÃO é expurgado aqui: é a trilha de auditoria e deve ser retida.
async function purgeExpired(env: Env) {
  const t = now();
  const statements = [
    env.DB.prepare('DELETE FROM patient_sessions WHERE expires_at<=? OR last_seen<=?').bind(t, t - IDLE),
    env.DB.prepare('DELETE FROM admin_sessions WHERE expires_at<=? OR last_seen<=?').bind(t, t - IDLE),
    env.DB.prepare('DELETE FROM login_attempts WHERE expires_at<=?').bind(t),
  ];
  for (const s of statements) { try { await s.run(); } catch (error) { console.error('expurgo falhou', (error as Error)?.name); } }
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

// --- API da ÁREA DO PACIENTE (/api/conta/*), isolada da área da equipe ---
async function contaApi(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url), path = url.pathname, method = request.method;
  if (method !== 'GET') sameOrigin(request);
  const ip = clientIp(request), ua = userAgent(request);

  if (path === '/api/conta/state' && method === 'GET') {
    const p = await currentPatient(request, env);
    return json({ user: p && { name: p.name } });
  }
  if (path === '/api/conta/invite' && method === 'GET') {
    const token = url.searchParams.get('token') || '';
    if (!/^[A-Za-z0-9_-]{43}$/.test(token)) fail(400, 'Convite inválido.');
    const row = await env.DB.prepare("SELECT name FROM patient_users WHERE invite_token_hash=? AND status='invited' AND invite_expires_at>?").bind(await sha256(token), now()).first<{ name: string }>();
    if (!row) fail(404, 'Convite inválido ou expirado. Fale com a clínica.');
    return json({ name: row!.name });
  }
  if (path === '/api/conta/invite/accept' && method === 'POST') {
    const data = await readJson(request);
    await limit(env, 'conta-invite', ip, 20);
    const token = typeof data.token === 'string' ? data.token : '';
    if (!/^[A-Za-z0-9_-]{43}$/.test(token)) fail(400, 'Convite inválido.');
    const pass = newPassword(data.password);
    const row = await env.DB.prepare("SELECT id,name,remote_patient_id,integration_id FROM patient_users WHERE invite_token_hash=? AND status='invited' AND invite_expires_at>?").bind(await sha256(token), now()).first<{ id: string; name: string; remote_patient_id: string; integration_id: string }>();
    if (!row) fail(404, 'Convite inválido ou expirado. Fale com a clínica.');
    await env.DB.prepare("UPDATE patient_users SET password_hash=?, status='active', invite_token_hash=NULL, invite_expires_at=NULL WHERE id=?").bind(await hashPassword(pass), row!.id).run();
    await logAccess(env, { actorType: 'patient', actorId: row!.id, patientUserId: row!.id, remotePatientId: row!.remote_patient_id, integrationId: row!.integration_id, action: 'patient.invite.accept', ip, userAgent: ua });
    return json({ user: { name: row!.name } }, 200, { 'Set-Cookie': cookie(await startPatientSession(env, row!.id), LIFETIME, PATIENT_COOKIE) });
  }
  if (path === '/api/conta/login' && method === 'POST') {
    const data = await readJson(request), address = email(data.email);
    await limit(env, 'conta-login-ip', ip, 50); await limit(env, 'conta-login', address, 10);
    const row = await env.DB.prepare("SELECT id,name,password_hash FROM patient_users WHERE email=? AND status='active'").bind(address).first<Record<string, string>>();
    const pw = typeof data.password === 'string' ? data.password.slice(0, 128) : '';
    const valid = await verifyPassword(pw, row?.password_hash);
    if (!row || !valid) fail(401, 'E-mail ou senha incorretos.');
    if (needsRehash(row!.password_hash)) await env.DB.prepare('UPDATE patient_users SET password_hash=? WHERE id=?').bind(await hashPassword(pw), row!.id).run();
    return json({ user: { name: row!.name } }, 200, { 'Set-Cookie': cookie(await startPatientSession(env, row!.id), LIFETIME, PATIENT_COOKIE) });
  }

  const patient = await currentPatient(request, env);
  if (!patient) fail(401, 'Entre novamente na sua área.');
  if (path === '/api/conta/logout' && method === 'POST') {
    await env.DB.prepare('DELETE FROM patient_sessions WHERE token_hash=?').bind(patient!.tokenHash).run();
    return json({ ok: true }, 200, { 'Set-Cookie': cookie('', 0, PATIENT_COOKIE) });
  }
  const rpid = patient!.remotePatientId, integ = patient!.integrationId;
  const mine = (v: any) => String(v) === rpid; // posse por id, normalizando o tipo (string x number)
  if (path === '/api/conta/consultas' && method === 'GET') {
    await limit(env, 'conta-dados', patient!.tokenHash, 300);
    const data = await consulFetch<{ last?: any; next?: any }>(env, '/api/v1/appointments?patient=' + encodeURIComponent(rpid), fail, integ);
    const slim = (a: any) => a && mine(a.patient_id) ? { startsAt: a.starts_at ?? null, endsAt: a.ends_at ?? null, status: a.status ?? null } : null;
    await logAccess(env, { actorType: 'patient', actorId: patient!.id, patientUserId: patient!.id, remotePatientId: rpid, integrationId: integ, action: 'patient.consultas.read', ip, userAgent: ua });
    return json({ last: slim(data?.last), next: slim(data?.next) });
  }
  if (path === '/api/conta/receitas' && method === 'GET') {
    await limit(env, 'conta-dados', patient!.tokenHash, 300);
    const data = await consulFetch<{ items?: any[] }>(env, '/api/v1/records?kind=prescription&patient=' + encodeURIComponent(rpid), fail, integ);
    const items = Array.isArray(data?.items) ? data!.items.filter(r => mine(r.patient_id) && r.kind === 'prescription').map(r => ({ id: r.id, title: r.title ?? '', occurredAt: r.occurred_at ?? null })) : [];
    await logAccess(env, { actorType: 'patient', actorId: patient!.id, patientUserId: patient!.id, remotePatientId: rpid, integrationId: integ, action: 'patient.receitas.list', ip, userAgent: ua });
    return json({ items });
  }
  const rec = path.match(/^\/api\/conta\/receitas\/([\w-]+)$/);
  if (rec && method === 'GET') {
    await limit(env, 'conta-dados', patient!.tokenHash, 300);
    const data = await consulFetch<any>(env, '/api/v1/records/' + encodeURIComponent(rec[1]), fail, integ);
    // CRÍTICO: só devolve se o registro for do paciente logado e for uma receita.
    if (!data || !mine(data.patient_id) || data.kind !== 'prescription') {
      await logAccess(env, { actorType: 'patient', actorId: patient!.id, patientUserId: patient!.id, remotePatientId: rpid, integrationId: integ, action: 'patient.receita.denied', resourceId: rec[1], ip, userAgent: ua });
      fail(404, 'Receita não encontrada.');
    }
    await logAccess(env, { actorType: 'patient', actorId: patient!.id, patientUserId: patient!.id, remotePatientId: rpid, integrationId: integ, action: 'patient.receita.read', resourceId: String(data.id ?? rec[1]), ip, userAgent: ua });
    return json({ id: data.id, title: data.title ?? '', occurredAt: data.occurred_at ?? null, payload: data.payload ?? null });
  }
  return fail(404, 'Rota não encontrada.');
}

async function api(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url), path = url.pathname, method = request.method;
  if (!env.DB) fail(503, 'Banco do site indisponível.');
  if (path === '/api/conta' || path.startsWith('/api/conta/')) return contaApi(request, env);
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
    if (!constantTimeEqual(typeof data.setupToken === 'string' ? data.setupToken : '', env.ADMIN_SETUP_TOKEN)) fail(403, 'Código de instalação incorreto.');
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
    const pw = typeof data.password === 'string' ? data.password.slice(0, 128) : '';
    const valid = await verifyPassword(pw, row?.password_hash);
    if (!row || !valid) fail(401, 'E-mail ou senha incorretos.');
    if (needsRehash(row!.password_hash)) await env.DB.prepare('UPDATE admin_users SET password_hash=? WHERE id=?').bind(await hashPassword(pw), row!.id).run();
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

  // --- Acessos de pacientes (provisionados pela equipe) ---
  if (path === '/api/settings/pacientes/buscar' && method === 'GET') {
    const q = (url.searchParams.get('q') || '').trim();
    if (q.length < 2) return json({ items: [] });
    const data = await consulFetch<{ items?: any[] }>(env, '/api/v1/patients?q=' + encodeURIComponent(q), fail);
    const items = Array.isArray(data?.items) ? data!.items.slice(0, 20).map(p => ({ id: p.id, name: p.name ?? '', cpf: p.cpf || '', birthDate: p.birth_date || '' })) : [];
    return json({ items });
  }
  if (path === '/api/settings/pacientes' && method === 'GET') {
    const rows = await env.DB.prepare('SELECT id,name,email,status,remote_patient_id,created_at FROM patient_users ORDER BY created_at DESC LIMIT 200').all();
    return json({ items: rows.results.map((r: any) => ({ id: r.id, name: r.name, email: r.email, status: r.status, createdAt: new Date(r.created_at * 1000).toISOString() })) });
  }
  if (path === '/api/settings/pacientes/acesso' && method === 'POST') {
    const data = await readJson(request);
    const remoteId = text(data.remotePatientId, 80, 'paciente'), address = email(data.email);
    const integ = await env.DB.prepare("SELECT id FROM integrations WHERE kind='receituario' AND status='connected' ORDER BY created_at DESC LIMIT 1").first<{ id: string }>();
    if (!integ) fail(503, 'Conecte o site ao sistema de receitas antes de criar acessos.');
    const p = await consulFetch<any>(env, '/api/v1/patients/' + encodeURIComponent(remoteId), fail, integ!.id);
    if (!p || !p.id) fail(404, 'Paciente não encontrado no sistema de receitas.');
    const name = text(data.name || p.name, 120, 'nome'), t = now(), token = randomToken(), tokenHash = await sha256(token);
    const existing = await env.DB.prepare('SELECT id,status FROM patient_users WHERE integration_id=? AND remote_patient_id=?').bind(integ!.id, p.id).first<{ id: string; status: string }>();
    if (existing && existing.status === 'active') fail(409, 'Este paciente já tem acesso ativo.');
    const patientUserId = existing ? existing.id : crypto.randomUUID();
    if (existing) {
      await env.DB.prepare("UPDATE patient_users SET email=?, name=?, invite_token_hash=?, invite_expires_at=?, status='invited' WHERE id=?").bind(address, name, tokenHash, t + 604800, existing.id).run();
    } else {
      try {
        await env.DB.prepare("INSERT INTO patient_users (id,email,name,remote_patient_id,integration_id,status,invite_token_hash,invite_expires_at,created_at) VALUES (?,?,?,?,?,'invited',?,?,?)")
          .bind(patientUserId, address, name, p.id, integ!.id, tokenHash, t + 604800, t).run();
      } catch { fail(409, 'Já existe um acesso com esse e-mail.'); }
    }
    await logAccess(env, { actorType: 'staff', actorId: user!.id, patientUserId, remotePatientId: String(p.id), integrationId: integ!.id, action: existing ? 'staff.access.reinvite' : 'staff.access.create', ip: clientIp(request), userAgent: userAgent(request) });
    return json({ inviteUrl: url.origin + '/conta?convite=' + token, name }, 201);
  }
  const revoke = path.match(/^\/api\/settings\/pacientes\/([\w-]+)\/revogar$/);
  if (revoke && method === 'POST') {
    const target = await env.DB.prepare('SELECT remote_patient_id,integration_id FROM patient_users WHERE id=?').bind(revoke[1]).first<{ remote_patient_id: string; integration_id: string }>();
    await env.DB.prepare('DELETE FROM patient_sessions WHERE user_id=?').bind(revoke[1]).run();
    const r = await env.DB.prepare('DELETE FROM patient_users WHERE id=?').bind(revoke[1]).run();
    if (!r.meta.changes) fail(404, 'Acesso não encontrado.');
    await logAccess(env, { actorType: 'staff', actorId: user!.id, patientUserId: revoke[1], remotePatientId: target?.remote_patient_id ?? null, integrationId: target?.integration_id ?? null, action: 'staff.access.revoke', ip: clientIp(request), userAgent: userAgent(request) });
    return json({ ok: true });
  }
  if (path === '/api/settings/auditoria' && method === 'GET') {
    const n = Math.min(Math.max(Number(url.searchParams.get('limit')) || 100, 1), 500);
    const rows = await env.DB.prepare('SELECT l.created_at,l.actor_type,l.action,l.remote_patient_id,l.resource_id,l.ip,u.name AS patient_name,u.email AS patient_email FROM access_log l LEFT JOIN patient_users u ON u.id=l.patient_user_id ORDER BY l.created_at DESC LIMIT ?').bind(n).all();
    return json({ items: rows.results.map((r: any) => ({ at: new Date(r.created_at * 1000).toISOString(), actor: r.actor_type, action: r.action, patientName: r.patient_name ?? null, patientEmail: r.patient_email ?? null, remotePatientId: r.remote_patient_id ?? null, resourceId: r.resource_id ?? null, ip: r.ip ?? null })) });
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
    if (!url.pathname.startsWith('/admin') && !url.pathname.startsWith('/conta')) return response;
    // A área restrita nunca é guardada em cache nem exibida dentro de outros sites.
    const headers = new Headers(response.headers);
    headers.set('Cache-Control', 'no-store'); headers.set('X-Frame-Options', 'DENY'); headers.set('Referrer-Policy', 'no-referrer');
    headers.set('X-Robots-Tag', 'noindex');
    headers.set('X-Content-Type-Options', 'nosniff');
    headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    headers.set('Content-Security-Policy', "default-src 'self'; base-uri 'none'; object-src 'none'; frame-ancestors 'none'; form-action 'self'; img-src 'self' data:; font-src 'self' https://fonts.gstatic.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; script-src 'self'; connect-src 'self'");
    return new Response(response.body, { status: response.status, headers });
  },
  // Cron Trigger diário: limpa sessões expiradas e tentativas de login vencidas (não toca no access_log).
  async scheduled(_event: unknown, env: Env): Promise<void> {
    await purgeExpired(env);
  },
};
