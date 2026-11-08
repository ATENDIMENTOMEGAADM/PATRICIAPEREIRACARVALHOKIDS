import React, { useEffect, useState } from 'react';
import { Lock, Loader2, ArrowLeft, LogOut, Calendar, FileText, ChevronRight } from 'lucide-react';
import { api, ApiError } from '../admin/api';
import { Field, ErrorText, inputClass, primaryButton, secondaryButton } from '../admin/ui';

interface Me { name: string }
type State =
  | { status: 'loading' }
  | { status: 'offline'; message: string }
  | { status: 'invite'; token: string; name: string }
  | { status: 'login' }
  | { status: 'ready'; user: Me };

const dt = (v: string | null) => v ? new Date(v).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', dateStyle: 'long', timeStyle: 'short' }) : '—';
const d = (v: string | null) => v ? new Date(v).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit', year: 'numeric' }) : '—';

// Texto legível da receita (doc ProseMirror v1, ou receita de controle especial v2).
function receitaTexto(payload: any): string {
  try {
    if (!payload) return '';
    if (payload.version === 2 && payload.model === 'special') {
      const meds = Array.isArray(payload.special?.medicines) ? payload.special.medicines : [];
      const names = meds.map((m: any) => m?.name).filter((n: any) => typeof n === 'string' && n.trim());
      return names.length ? names.map((n: string, i: number) => `${i + 1}. ${n}`).join('\n') : 'Receita de controle especial.';
    }
    const walk = (n: any, depth: number): string => {
      if (depth > 20 || !n || typeof n !== 'object') return '';
      if (typeof n.text === 'string') return n.text;
      if (n.type === 'hardBreak') return '\n';
      const inner = Array.isArray(n.content) ? n.content.map((c: any) => walk(c, depth + 1)).join('') : '';
      return ['paragraph', 'heading', 'tableRow', 'horizontalRule'].includes(n.type) ? inner + '\n' : inner;
    };
    const base = payload.doc ? walk(payload.doc, 0).trim() : '';
    const obs = payload.observationsEnabled && payload.observations ? '\n\nObservações:\n' + payload.observations : '';
    return (base + obs).trim();
  } catch { return ''; }
}

function Brand() {
  return (
    <div className="text-center">
      <p className="font-serif text-2xl leading-tight text-[#5A5350]">Patrícia Carvalho</p>
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-dourado">Pediatra e Gastropediatra</p>
    </div>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-seda bg-polka flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-[28px] bg-white p-8 shadow-xl shadow-verde-agua/10 border border-gray-100">{children}</div>
    </div>
  );
}

function LoginForm({ onDone }: { onDone: (u: Me) => void }) {
  const [busy, setBusy] = useState(false), [error, setError] = useState('');
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setBusy(true); setError('');
    const v = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    try { const r = await api<{ user: Me }>('conta/login', v); onDone(r.user); }
    catch (err) { setError((err as Error).message); } finally { setBusy(false); }
  }
  return (
    <Shell>
      <div className="mb-6 flex justify-center"><Brand /></div>
      <div className="mb-2 flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-widest text-verde-agua"><Lock className="h-4 w-4" /> Área do paciente</div>
      <h1 className="text-center font-serif text-3xl text-[#5A5350]">Entrar</h1>
      <p className="mt-3 text-center text-sm leading-relaxed text-gray-500">Acesse suas receitas e consultas. O acesso é criado pela clínica.</p>
      <form onSubmit={submit} className="mt-8 grid gap-5">
        <Field label="E-mail"><input name="email" type="email" required maxLength={180} autoComplete="username" className={inputClass} /></Field>
        <Field label="Senha"><input name="password" type="password" required maxLength={128} autoComplete="current-password" className={inputClass} /></Field>
        <ErrorText message={error} />
        <button type="submit" disabled={busy} className={primaryButton}>{busy && <Loader2 className="h-4 w-4 animate-spin" />}Entrar</button>
      </form>
      <a href="/" className="mt-6 flex items-center justify-center gap-1 text-sm text-gray-500 hover:text-verde-agua"><ArrowLeft className="h-4 w-4" /> Voltar ao site</a>
    </Shell>
  );
}

function InviteForm({ token, name, onDone }: { token: string; name: string; onDone: (u: Me) => void }) {
  const [busy, setBusy] = useState(false), [error, setError] = useState('');
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setBusy(true); setError('');
    const v = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    try {
      if (v.password !== v.confirm) throw new Error('As senhas precisam ser iguais.');
      const r = await api<{ user: Me }>('conta/invite/accept', { token, password: v.password });
      onDone(r.user);
    } catch (err) { setError((err as Error).message); } finally { setBusy(false); }
  }
  return (
    <Shell>
      <div className="mb-6 flex justify-center"><Brand /></div>
      <div className="mb-2 flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-widest text-verde-agua"><Lock className="h-4 w-4" /> Área do paciente</div>
      <h1 className="text-center font-serif text-3xl text-[#5A5350]">Criar acesso</h1>
      <p className="mt-3 text-center text-sm leading-relaxed text-gray-500">Olá{name ? ', ' + name.split(' ')[0] : ''}! Defina uma senha para entrar na sua área.</p>
      <form onSubmit={submit} className="mt-8 grid gap-5">
        <Field label="Senha" hint="De 10 a 128 caracteres."><input name="password" type="password" required minLength={10} maxLength={128} autoComplete="new-password" className={inputClass} /></Field>
        <Field label="Confirmar senha"><input name="confirm" type="password" required minLength={10} maxLength={128} autoComplete="new-password" className={inputClass} /></Field>
        <ErrorText message={error} />
        <button type="submit" disabled={busy} className={primaryButton}>{busy && <Loader2 className="h-4 w-4 animate-spin" />}Criar acesso e entrar</button>
      </form>
    </Shell>
  );
}

function Dashboard({ user, onLogout }: { user: Me; onLogout: () => void }) {
  const [consultas, setConsultas] = useState<{ last: any; next: any } | null>(null);
  const [receitas, setReceitas] = useState<any[] | null>(null);
  const [erro, setErro] = useState('');
  const [aberta, setAberta] = useState<any | null>(null);
  const [carregando, setCarregando] = useState(false);

  function handle(e: unknown) { if (e instanceof ApiError && e.status === 401) return onLogout(); setErro((e as Error).message); }
  useEffect(() => {
    (async () => {
      try { setConsultas(await api('conta/consultas')); } catch (e) { handle(e); }
      try { const r = await api<{ items: any[] }>('conta/receitas'); setReceitas(r.items); } catch (e) { handle(e); }
    })();
  }, []);
  async function abrir(id: string) {
    setCarregando(true); setErro('');
    try { setAberta(await api('conta/receitas/' + id)); } catch (e) { handle(e); } finally { setCarregando(false); }
  }
  async function sair() { try { await api('conta/logout', {}); } finally { onLogout(); } }

  return (
    <div className="min-h-screen bg-seda bg-polka">
      <header className="border-b border-gray-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <Brand />
          <button type="button" onClick={sair} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600"><LogOut className="h-4 w-4" /> Sair</button>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="font-serif text-3xl text-[#5A5350]">Olá, {user.name.split(' ')[0]}</h1>
        <p className="mt-1 text-gray-600">Aqui estão suas consultas e receitas.</p>
        <div className="mt-4"><ErrorText message={erro} /></div>

        <section className="mt-6">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-verde-agua"><Calendar className="h-4 w-4" /> Consultas</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Próxima consulta</p>
              <p className="mt-2 text-[#5A5350]">{consultas === null ? '…' : consultas.next ? dt(consultas.next.startsAt) : 'Nenhuma agendada'}</p>
            </div>
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Última consulta</p>
              <p className="mt-2 text-[#5A5350]">{consultas === null ? '…' : consultas.last ? dt(consultas.last.startsAt) : '—'}</p>
            </div>
          </div>
        </section>

        <section className="mt-8">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-verde-agua"><FileText className="h-4 w-4" /> Minhas receitas</h2>
          {receitas === null ? <Loader2 className="h-5 w-5 animate-spin text-verde-agua" />
            : receitas.length === 0 ? <p className="text-sm text-gray-500">Nenhuma receita por aqui ainda.</p>
            : <ul className="grid gap-2">
                {receitas.map(r => (
                  <li key={r.id}>
                    <button type="button" onClick={() => abrir(r.id)} className="flex w-full items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-white p-4 text-left shadow-sm transition-shadow hover:shadow-md">
                      <span>
                        <span className="block font-medium text-[#5A5350]">{r.title || 'Receita'}</span>
                        <span className="text-sm text-gray-500">{d(r.occurredAt)}</span>
                      </span>
                      <ChevronRight className="h-5 w-5 shrink-0 text-gray-300" />
                    </button>
                  </li>
                ))}
              </ul>}
        </section>
      </main>

      {(aberta || carregando) && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center sm:p-4" onClick={() => setAberta(null)}>
          <div className="max-h-[85vh] w-full max-w-lg overflow-auto rounded-t-[28px] bg-white p-6 shadow-xl sm:rounded-[28px]" onClick={e => e.stopPropagation()}>
            {carregando ? <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-verde-agua" /></div> : aberta && (
              <>
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-serif text-xl text-[#5A5350]">{aberta.title || 'Receita'}</h3>
                    <p className="text-sm text-gray-500">{d(aberta.occurredAt)}</p>
                  </div>
                  <button type="button" onClick={() => setAberta(null)} className={secondaryButton}>Fechar</button>
                </div>
                <pre className="whitespace-pre-wrap break-words font-sans text-sm leading-relaxed text-[#5A5350]">{receitaTexto(aberta.payload) || 'Conteúdo indisponível para exibição aqui.'}</pre>
                <p className="mt-4 rounded-xl bg-seda px-4 py-3 text-xs leading-relaxed text-gray-500">Esta é uma via informativa. O documento oficial, com papel timbrado e assinatura, é fornecido pela clínica.</p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function PatientApp() {
  const [state, setState] = useState<State>({ status: 'loading' });
  async function load() {
    const token = new URLSearchParams(window.location.search).get('convite');
    if (token) history.replaceState(null, '', '/conta'); // tira o token da URL/histórico
    try {
      if (token) {
        try {
          const r = await api<{ name: string }>('conta/invite?token=' + encodeURIComponent(token));
          setState({ status: 'invite', token, name: r.name });
          return;
        } catch (e) {
          if (!(e instanceof ApiError && (e.status === 404 || e.status === 400))) throw e;
          // convite inválido/expirado → cai no fluxo normal (login)
        }
      }
      const r = await api<{ user: Me | null }>('conta/state');
      setState(r.user ? { status: 'ready', user: r.user } : { status: 'login' });
    } catch (e) {
      setState({ status: 'offline', message: e instanceof ApiError ? e.message : 'O site não respondeu.' });
    }
  }
  useEffect(() => { document.title = 'Minha área · Dra. Patrícia Carvalho'; load(); }, []);

  if (state.status === 'loading') return <div className="flex min-h-screen items-center justify-center bg-seda"><Loader2 className="h-6 w-6 animate-spin text-verde-agua" /></div>;
  if (state.status === 'offline') return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-seda px-4 text-center">
      <h1 className="font-serif text-2xl text-[#5A5350]">Área indisponível</h1>
      <p className="max-w-md text-gray-600">{state.message}</p>
      <button type="button" onClick={load} className={secondaryButton}>Tentar novamente</button>
    </div>
  );
  if (state.status === 'invite') return <InviteForm token={state.token} name={state.name} onDone={user => setState({ status: 'ready', user })} />;
  if (state.status === 'ready') return <Dashboard user={state.user} onLogout={() => setState({ status: 'login' })} />;
  return <LoginForm onDone={user => setState({ status: 'ready', user })} />;
}
