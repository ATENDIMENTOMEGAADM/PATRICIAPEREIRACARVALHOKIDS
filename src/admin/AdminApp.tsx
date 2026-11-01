import React, { useEffect, useState } from 'react';
import { Home, Settings, LogOut, Plug, Lock, Loader2, ArrowLeft } from 'lucide-react';
import { api, ApiError, type AdminUser } from './api';
import ApiSettings from './ApiSettings';
import { Field, ErrorText, inputClass, primaryButton, secondaryButton } from './ui';

type State = { status: 'loading' } | { status: 'offline'; message: string } | { status: 'setup' } | { status: 'login' } | { status: 'ready'; user: AdminUser };

function Brand() {
  return (
    <div className="text-center md:text-left">
      <p className="font-serif text-2xl leading-tight text-[#5A5350]">Patricia Carvalho</p>
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-dourado">Pediatra e Gastropediatra</p>
    </div>
  );
}

function AccessForm({ setup, onDone }: { setup: boolean; onDone: (user: AdminUser) => void }) {
  const [busy, setBusy] = useState(false), [error, setError] = useState('');
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError('');
    const values = Object.fromEntries(new FormData(event.currentTarget)) as Record<string, string>;
    try {
      if (setup && values.password !== values.confirm) throw new Error('As senhas precisam ser iguais.');
      const result = await api<{ user: AdminUser }>(setup ? 'auth/setup' : 'auth/login', values);
      onDone(result.user);
    } catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  }
  return (
    <div className="min-h-screen bg-seda bg-polka flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-[28px] bg-white p-8 shadow-xl shadow-verde-agua/10 border border-gray-100">
        <div className="mb-6 flex justify-center"><Brand /></div>
        <div className="mb-2 flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-widest text-verde-agua"><Lock className="h-4 w-4" /> Área restrita</div>
        <h1 className="text-center font-serif text-3xl text-[#5A5350]">{setup ? 'Primeiro acesso' : 'Entrar'}</h1>
        <p className="mt-3 text-center text-sm leading-relaxed text-gray-500">
          {setup ? 'Crie o acesso de administração do site. Use o código de instalação configurado no servidor.' : 'Acesso exclusivo da equipe do site. Os pacientes não precisam entrar aqui.'}
        </p>
        <form onSubmit={submit} className="mt-8 grid gap-5">
          {setup && <Field label="Código de instalação"><input name="setupToken" type="password" required autoComplete="off" className={inputClass} /></Field>}
          {setup && <Field label="Seu nome"><input name="name" required maxLength={80} autoComplete="name" className={inputClass} /></Field>}
          <Field label="E-mail"><input name="email" type="email" required maxLength={180} autoComplete="username" className={inputClass} /></Field>
          <Field label="Senha" hint={setup ? 'De 10 a 128 caracteres. Uma frase com várias palavras é uma boa escolha.' : undefined}>
            <input name="password" type="password" required minLength={setup ? 10 : 1} maxLength={128} autoComplete={setup ? 'new-password' : 'current-password'} className={inputClass} />
          </Field>
          {setup && <Field label="Confirmar senha"><input name="confirm" type="password" required minLength={10} maxLength={128} autoComplete="new-password" className={inputClass} /></Field>}
          <ErrorText message={error} />
          <button type="submit" disabled={busy} className={primaryButton}>{busy && <Loader2 className="h-4 w-4 animate-spin" />}{setup ? 'Criar acesso' : 'Entrar'}</button>
        </form>
        <a href="/" className="mt-6 flex items-center justify-center gap-1 text-sm text-gray-500 hover:text-verde-agua"><ArrowLeft className="h-4 w-4" /> Voltar ao site</a>
      </div>
    </div>
  );
}

type Page = 'inicio' | 'configuracoes';
function Panel({ user, onLogout }: { user: AdminUser; onLogout: () => void }) {
  const [page, setPage] = useState<Page>(() => (location.pathname.startsWith('/admin/configuracoes') ? 'configuracoes' : 'inicio'));
  const go = (next: Page) => { setPage(next); history.replaceState(null, '', next === 'inicio' ? '/admin' : '/admin/configuracoes/api'); };
  async function logout() { try { await api('auth/logout', {}); } finally { onLogout(); } }
  const nav = (id: Page, label: string, Icon: typeof Home) => (
    <button type="button" onClick={() => go(id)} aria-current={page === id ? 'page' : undefined}
      className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${page === id ? 'bg-verde-agua/15 text-[#3f7d72]' : 'text-gray-600 hover:bg-gray-50'}`}>
      <Icon className="h-5 w-5" />{label}
    </button>
  );
  return (
    <div className="min-h-screen bg-seda md:flex">
      <aside className="border-b border-gray-100 bg-white md:min-h-screen md:w-64 md:border-b-0 md:border-r flex md:flex-col">
        <div className="hidden md:block p-6"><Brand /></div>
        <nav className="flex flex-1 gap-1 p-3 md:flex-col md:p-4" aria-label="Área restrita">
          {nav('inicio', 'Início', Home)}
          {nav('configuracoes', 'Configurações', Settings)}
        </nav>
        <div className="hidden md:block border-t border-gray-100 p-4 text-sm">
          <p className="font-medium text-[#5A5350] truncate">{user.name}</p>
          <p className="text-xs text-gray-500 truncate">{user.email}</p>
          <button type="button" onClick={logout} className="mt-3 flex items-center gap-2 text-sm text-gray-500 hover:text-red-600"><LogOut className="h-4 w-4" /> Sair</button>
        </div>
      </aside>
      <main className="flex-1 px-4 py-8 md:px-10">
        <div className="mx-auto max-w-4xl">
          <div className="mb-6 flex items-center justify-between md:hidden">
            <p className="text-sm text-gray-500 truncate">{user.email}</p>
            <button type="button" onClick={logout} className="flex items-center gap-1 text-sm text-gray-500"><LogOut className="h-4 w-4" /> Sair</button>
          </div>
          {page === 'inicio' ? (
            <section>
              <h1 className="font-serif text-3xl text-[#5A5350]">Olá, {user.name.split(' ')[0]}</h1>
              <p className="mt-2 text-gray-600">Esta é a área de administração do site da Dra. Patricia Carvalho.</p>
              <button type="button" onClick={() => go('configuracoes')} className="mt-8 flex w-full max-w-md items-start gap-4 rounded-2xl border border-gray-100 bg-white p-6 text-left shadow-sm transition-shadow hover:shadow-md">
                <span className="rounded-xl bg-lilas/50 p-3 text-ametista"><Plug className="h-6 w-6" /></span>
                <span><strong className="block text-[#5A5350]">Configurações → API</strong><span className="text-sm text-gray-500">Conecte o site ao sistema de receitas e a outras integrações.</span></span>
              </button>
            </section>
          ) : (
            <section>
              <h1 className="font-serif text-3xl text-[#5A5350]">Configurações</h1>
              <div className="mt-6 flex gap-2 border-b border-gray-200" role="tablist">
                <span role="tab" aria-selected="true" className="-mb-px border-b-2 border-verde-agua px-4 py-2 text-sm font-semibold text-[#3f7d72]">API</span>
              </div>
              <ApiSettings onUnauthorized={onLogout} />
            </section>
          )}
        </div>
      </main>
    </div>
  );
}

export default function AdminApp() {
  const [state, setState] = useState<State>({ status: 'loading' });
  async function load() {
    try {
      const result = await api<{ setupRequired: boolean; user: AdminUser | null }>('auth/state');
      setState(result.user ? { status: 'ready', user: result.user } : result.setupRequired ? { status: 'setup' } : { status: 'login' });
    } catch (e) {
      setState({ status: 'offline', message: e instanceof ApiError ? e.message : 'O servidor do site não respondeu.' });
    }
  }
  useEffect(() => { document.title = 'Área restrita · Dra. Patricia Carvalho'; load(); }, []);
  if (state.status === 'loading') return <div className="flex min-h-screen items-center justify-center bg-seda"><Loader2 className="h-6 w-6 animate-spin text-verde-agua" /></div>;
  if (state.status === 'offline') return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-seda px-4 text-center">
      <h1 className="font-serif text-2xl text-[#5A5350]">Área restrita indisponível</h1>
      <p className="max-w-md text-gray-600">{state.message}</p>
      <button type="button" onClick={load} className={secondaryButton}>Tentar novamente</button>
    </div>
  );
  if (state.status === 'ready') return <Panel user={state.user} onLogout={() => setState({ status: 'login' })} />;
  return <AccessForm setup={state.status === 'setup'} onDone={user => setState({ status: 'ready', user })} />;
}
