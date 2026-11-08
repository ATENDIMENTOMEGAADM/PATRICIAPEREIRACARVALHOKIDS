import React, { useEffect, useState } from 'react';
import { Search, Loader2, UserPlus, Copy, Check, Trash2 } from 'lucide-react';
import { api, ApiError } from './api';
import { inputClass, primaryButton, secondaryButton, ErrorText } from './ui';

interface RemotePatient { id: string; name: string; cpf: string; birthDate: string }
interface Access { id: string; name: string; email: string; status: string; createdAt: string }
const when = (v: string) => new Date(v).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit', year: 'numeric' });

export default function PatientAccess({ onUnauthorized }: { onUnauthorized: () => void }) {
  const [list, setList] = useState<Access[] | null>(null);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');
  const [results, setResults] = useState<RemotePatient[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [chosen, setChosen] = useState<RemotePatient | null>(null);
  const [busy, setBusy] = useState(false);
  const [invite, setInvite] = useState<{ name: string; url: string } | null>(null);
  const [copied, setCopied] = useState(false);

  function handle(e: unknown) { if (e instanceof ApiError && e.status === 401) return onUnauthorized(); setError((e as Error).message); }
  async function loadList() { try { const r = await api<{ items: Access[] }>('settings/pacientes'); setList(r.items); } catch (e) { handle(e); } }
  useEffect(() => { loadList(); }, []);

  async function buscar(e: React.FormEvent) {
    e.preventDefault(); setSearching(true); setError(''); setResults(null); setChosen(null);
    try { const r = await api<{ items: RemotePatient[] }>('settings/pacientes/buscar?q=' + encodeURIComponent(q.trim())); setResults(r.items); }
    catch (err) { handle(err); } finally { setSearching(false); }
  }
  async function criar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); if (!chosen) return; setBusy(true); setError('');
    const values = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    try {
      const r = await api<{ inviteUrl: string; name: string }>('settings/pacientes/acesso', { remotePatientId: chosen.id, email: values.email });
      setInvite({ name: r.name, url: r.inviteUrl }); setChosen(null); setResults(null); setQ(''); loadList();
    } catch (err) { handle(err); } finally { setBusy(false); }
  }
  async function revogar(id: string) {
    if (!confirm('Remover o acesso deste paciente? Ele não conseguirá mais entrar.')) return;
    try { await api('settings/pacientes/' + id + '/revogar', {}); loadList(); } catch (e) { handle(e); }
  }
  async function copiar(url: string) {
    try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000); }
    catch { setError('Não foi possível copiar — selecione o link e copie manualmente.'); }
  }

  return (
    <div className="mt-8 grid gap-6">
      <div>
        <h2 className="text-xl font-semibold text-[#5A5350]">Acessos de pacientes</h2>
        <p className="mt-1 text-sm leading-relaxed text-gray-600">Dê ao paciente acesso à área dele. Busque o paciente no Consul+, gere o link de convite e envie a ele (ex.: WhatsApp). O paciente define a senha e passa a ver as próprias consultas e receitas.</p>
      </div>
      <ErrorText message={error} />

      {invite && (
        <div className="rounded-2xl border border-verde-agua/40 bg-verde-agua/5 p-5">
          <p className="text-sm font-semibold text-[#3f7d72]">Convite criado para {invite.name}</p>
          <p className="mt-1 text-sm text-gray-600">Envie este link ao paciente. Vale por 7 dias e só pode ser usado uma vez.</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <input readOnly value={invite.url} onFocus={e => e.currentTarget.select()} className={`${inputClass} flex-1 min-w-0 font-mono text-xs`} />
            <button type="button" onClick={() => copiar(invite.url)} className={secondaryButton}>{copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}{copied ? 'Copiado' : 'Copiar'}</button>
          </div>
          <button type="button" onClick={() => setInvite(null)} className="mt-3 text-sm text-gray-500 hover:text-verde-agua">Criar outro acesso</button>
        </div>
      )}

      {!invite && (
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <form onSubmit={buscar} className="flex flex-wrap items-end gap-2">
            <label className="grid flex-1 gap-2 text-sm font-medium text-[#5A5350]">Buscar paciente no Consul+
              <input value={q} onChange={e => setQ(e.target.value)} required minLength={2} maxLength={80} placeholder="Nome ou CPF" className={inputClass} />
            </label>
            <button type="submit" disabled={searching} className={primaryButton}>{searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}Buscar</button>
          </form>

          {results && (
            <ul className="mt-4 grid gap-2">
              {results.length === 0 && <li className="text-sm text-gray-500">Nenhum paciente encontrado.</li>}
              {results.map(p => (
                <li key={p.id} className="rounded-xl border border-gray-100 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-medium text-[#5A5350]">{p.name}</p>
                      <p className="text-xs text-gray-500">{p.cpf ? 'CPF ' + p.cpf : 'sem CPF'}{p.birthDate ? ' · nasc. ' + when(p.birthDate) : ''}</p>
                    </div>
                    {chosen?.id === p.id ? <span className="text-xs font-medium text-verde-agua">selecionado</span>
                      : <button type="button" onClick={() => setChosen(p)} className={secondaryButton}><UserPlus className="h-4 w-4" /> Criar acesso</button>}
                  </div>
                  {chosen?.id === p.id && (
                    <form onSubmit={criar} className="mt-3 flex flex-wrap items-end gap-2 border-t border-gray-100 pt-3">
                      <label className="grid flex-1 gap-2 text-sm font-medium text-[#5A5350]">E-mail do paciente (para ele entrar depois)
                        <input name="email" type="email" required maxLength={180} placeholder="email@exemplo.com" className={inputClass} />
                      </label>
                      <button type="submit" disabled={busy} className={primaryButton}>{busy && <Loader2 className="h-4 w-4 animate-spin" />}Gerar convite</button>
                    </form>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">Acessos criados</h3>
        {list === null ? <Loader2 className="mt-3 h-5 w-5 animate-spin text-verde-agua" />
          : list.length === 0 ? <p className="mt-3 text-sm text-gray-500">Nenhum acesso criado ainda.</p>
          : <ul className="mt-3 grid gap-2">
              {list.map(a => (
                <li key={a.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-gray-100 bg-white p-4">
                  <div>
                    <p className="font-medium text-[#5A5350]">{a.name}</p>
                    <p className="text-xs text-gray-500">{a.email} · {a.status === 'active' ? 'ativo' : 'convite pendente'} · criado em {when(a.createdAt)}</p>
                  </div>
                  <button type="button" onClick={() => revogar(a.id)} className={`${secondaryButton} hover:!border-red-300 hover:!text-red-600`}><Trash2 className="h-4 w-4" /> Remover</button>
                </li>
              ))}
            </ul>}
      </div>
    </div>
  );
}
