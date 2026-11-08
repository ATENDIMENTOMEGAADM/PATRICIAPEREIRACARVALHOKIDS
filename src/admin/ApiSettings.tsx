import React, { useEffect, useState } from 'react';
import { Plug, CheckCircle, AlertCircle, RefreshCw, Trash2, Loader2, Plus, KeyRound } from 'lucide-react';
import { api, ApiError, type Integration, type ConnectorInfo } from './api';
import { Field, ErrorText, inputClass, primaryButton, secondaryButton } from './ui';

const SCOPE_LABELS: Record<string, string> = {
  'patients:read': 'Consultar pacientes', 'patients:write': 'Cadastrar pacientes',
  'appointments:read': 'Consultar agenda', 'appointments:write': 'Criar consultas',
  'records:read': 'Consultar receitas', 'records:write': 'Salvar receitas',
};
const when = (value: string | null) => value ? new Date(value).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', dateStyle: 'short', timeStyle: 'short' }) : 'nunca';

function IntegrationCard({ item, connector, onChange, onError }: { item: Integration; connector?: ConnectorInfo; onChange: () => void; onError: (e: unknown) => void }) {
  const [busy, setBusy] = useState<'' | 'test' | 'delete'>('');
  async function run(action: 'test' | 'delete') {
    if (action === 'delete' && !confirm(`Remover a integração "${item.name}"? O site deixará de usar esta chave. Para bloqueá-la de vez, revogue-a também no sistema de origem.`)) return;
    setBusy(action);
    try { await api(`settings/integrations/${item.id}/${action}`, {}); onChange(); } catch (e) { onError(e); } finally { setBusy(''); }
  }
  const ok = item.status === 'connected';
  return (
    <article className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-4">
          {connector?.icon && <img src={connector.icon} alt="" className="h-14 w-14 shrink-0" />}
          <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-ametista">{connector?.label || item.kind}</p>
          <h3 className="mt-1 text-lg font-semibold text-[#5A5350]">{item.name}</h3>
          <p className="text-sm text-gray-500 break-all">{item.baseUrl}</p>
          </div>
        </div>
        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${ok ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
          {ok ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}{ok ? 'Conectado' : 'Com erro'}
        </span>
      </div>
      <dl className="mt-4 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
        <div><dt className="text-gray-500">Conta conectada</dt><dd className="text-[#5A5350] break-all">{item.remoteAccount || '—'}</dd></div>
        <div><dt className="text-gray-500">Chave</dt><dd className="font-mono text-[#5A5350]">{item.keyPrefix}… {item.remoteKeyName && <span className="font-sans text-gray-500">({item.remoteKeyName})</span>}</dd></div>
        <div className="sm:col-span-2"><dt className="text-gray-500">Permissões</dt><dd className="mt-1 flex flex-wrap gap-1.5">{item.scopes.length ? item.scopes.map(s => <span key={s} className="rounded-full bg-lilas/50 px-2.5 py-0.5 text-xs text-[#5A5350]">{SCOPE_LABELS[s] || s}</span>) : '—'}</dd></div>
        <div className="sm:col-span-2"><dt className="text-gray-500">Última verificação</dt><dd className="text-[#5A5350]">{when(item.checkedAt)}{!ok && item.statusMessage && <span className="block text-red-700">{item.statusMessage}</span>}</dd></div>
      </dl>
      <div className="mt-5 flex flex-wrap gap-2">
        <button type="button" onClick={() => run('test')} disabled={!!busy} className={secondaryButton}>{busy === 'test' ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />} Testar conexão</button>
        <button type="button" onClick={() => run('delete')} disabled={!!busy} className={`${secondaryButton} hover:!border-red-300 hover:!text-red-600`}>{busy === 'delete' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />} Remover</button>
      </div>
    </article>
  );
}

function NewIntegration({ connectors, onCreated, onCancel }: { connectors: Record<string, ConnectorInfo>; onCreated: () => void; onCancel?: () => void }) {
  const [kind, setKind] = useState(Object.keys(connectors)[0] || 'receituario');
  const [busy, setBusy] = useState(false), [error, setError] = useState('');
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError('');
    const form = event.currentTarget, values = Object.fromEntries(new FormData(form)) as Record<string, string>;
    try { await api('settings/integrations', { ...values, kind }); form.reset(); onCreated(); }
    catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  }
  return (
    <form onSubmit={submit} className="grid gap-5 rounded-2xl border border-dashed border-verde-agua/60 bg-white p-6">
      <div className="flex items-center gap-3"><span className="rounded-xl bg-verde-agua/15 p-2.5 text-[#3f7d72]"><KeyRound className="h-5 w-5" /></span><h3 className="text-lg font-semibold text-[#5A5350]">Nova integração</h3></div>
      <Field label="Tipo">
        <select value={kind} onChange={e => setKind(e.target.value)} className={inputClass}>
          {Object.entries(connectors).map(([value, c]) => <option key={value} value={value}>{c.label}</option>)}
        </select>
      </Field>
      {connectors[kind] && <div className="-mt-1 flex items-center gap-3 rounded-xl bg-seda p-3">{connectors[kind].icon && <img src={connectors[kind].icon} alt="" className="h-12 w-12 shrink-0" />}<p className="text-sm text-gray-600">{connectors[kind].description}</p></div>}
      <Field label="Nome" hint="Para identificar esta conexão. Exemplo: Receitas — Dra. Patricia."><input name="name" required maxLength={60} className={inputClass} /></Field>
      <Field label="Endereço do sistema" hint="O endereço principal, sem caminhos. Exemplo: https://receitas.exemplo.com.br"><input name="baseUrl" type="url" required maxLength={300} placeholder="https://" className={inputClass} /></Field>
      <Field label="Chave de API" hint="Gerada no sistema conectado (no Consul+, começa com rcp_). Fica guardada cifrada no servidor do site e nunca é exibida de novo."><input name="apiKey" type="password" required maxLength={200} autoComplete="off" spellCheck={false} className={`${inputClass} font-mono`} /></Field>
      <ErrorText message={error} />
      <div className="flex flex-wrap gap-2">
        <button type="submit" disabled={busy} className={primaryButton}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plug className="h-4 w-4" />} Testar e conectar</button>
        {onCancel && <button type="button" onClick={onCancel} className={secondaryButton}>Cancelar</button>}
      </div>
    </form>
  );
}

export default function ApiSettings({ onUnauthorized }: { onUnauthorized: () => void }) {
  const [items, setItems] = useState<Integration[] | null>(null);
  const [connectors, setConnectors] = useState<Record<string, ConnectorInfo>>({});
  const [adding, setAdding] = useState(false), [error, setError] = useState('');
  function handle(e: unknown) { if (e instanceof ApiError && e.status === 401) return onUnauthorized(); setError((e as Error).message); }
  async function load() {
    try { const r = await api<{ items: Integration[]; connectors: Record<string, ConnectorInfo> }>('settings/integrations'); setItems(r.items); setConnectors(r.connectors); setError(''); }
    catch (e) { handle(e); }
  }
  useEffect(() => { load(); }, []);
  return (
    <div className="mt-8 grid gap-6">
      <div>
        <h2 className="text-xl font-semibold text-[#5A5350]">Integrações por API</h2>
        <p className="mt-1 text-sm leading-relaxed text-gray-600">Conecte o site a outros sistemas usando a chave gerada por eles. A chave é verificada antes de ser salva e fica guardada somente no servidor do site.</p>
      </div>
      <ErrorText message={error} />
      {items === null ? <Loader2 className="h-6 w-6 animate-spin text-verde-agua" /> : (
        <>
          {items.map(item => <React.Fragment key={item.id}><IntegrationCard item={item} connector={connectors[item.kind]} onChange={load} onError={handle} /></React.Fragment>)}
          {items.length === 0 || adding
            ? <NewIntegration connectors={connectors} onCreated={() => { setAdding(false); load(); }} onCancel={items.length ? () => setAdding(false) : undefined} />
            : <button type="button" onClick={() => setAdding(true)} className={`${secondaryButton} justify-self-start`}><Plus className="h-4 w-4" /> Adicionar integração</button>}
        </>
      )}
    </div>
  );
}
