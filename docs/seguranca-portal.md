# Endurecimento de segurança — Portal do Paciente

Melhorias aplicadas após o lançamento do Portal do Paciente (`/conta`), que já trata dados reais.
Nada aqui remove as barreiras existentes: continuam valendo as checagens de sessão/dono, o escopo por
`integration_id` no `consulFetch`, o id do paciente vindo **sempre** da sessão e a reconferência de
`patient_id` em `/receitas/:id`.

## 1. Trilha de auditoria (LGPD)

- Tabela nova **`access_log`** (migração aditiva `migrations/0003_trilha_auditoria.sql`). Sem chave
  estrangeira para `patient_users` de propósito: o registro precisa **sobreviver** à revogação (DELETE)
  do acesso do paciente.
- Gravação **no servidor** (`logAccess`), sempre com `patient_user_id`/`remote_patient_id`, ação,
  timestamp, IP e User-Agent. É **best-effort**: uma falha ao gravar o log nunca derruba a requisição.
- Eventos registrados:
  - `staff.access.create` / `staff.access.reinvite` — equipe cria/reemite acesso de paciente.
  - `staff.access.revoke` — equipe revoga acesso.
  - `patient.invite.accept` — paciente aceita o convite e define senha.
  - `patient.consultas.read` — leitura de `/api/conta/consultas`.
  - `patient.receitas.list` — leitura de `/api/conta/receitas`.
  - `patient.receita.read` — leitura de `/api/conta/receitas/:id` (guarda o id da receita em `resource_id`).
  - `patient.receita.denied` — tentativa barrada em `/receitas/:id` (registro de outro paciente ou não-receita).
- Leitura pela equipe (opcional no v1): `GET /api/settings/auditoria?limit=N` (máx. 500), protegida pela
  sessão de admin. Ainda **sem tela** no `/admin`; o endpoint já devolve os eventos para uma futura UI.
- **Retenção:** o `access_log` **não** é expurgado pelo cron (ao contrário das sessões). Definir uma
  política de retenção (ex.: 2 anos) é uma decisão futura.

## 2. Expurgo de sessões e tentativas (Cron Trigger)

Antes, `patient_sessions`, `admin_sessions` e `login_attempts` só cresciam. Agora:

- `wrangler.jsonc` → `"triggers": { "crons": ["0 4 * * *"] }` (diário, 04:00 UTC = 01:00 em Marabá).
- Handler `scheduled` no Worker chama `purgeExpired`, que apaga:
  - `patient_sessions` / `admin_sessions` vencidas por tempo de vida **ou** por inatividade (`last_seen`).
  - `login_attempts` vencidas.
- O `access_log` **não** entra no expurgo (ver retenção acima).
- Cron Triggers funcionam em qualquer plano; só passam a rodar **após o deploy** com o trigger.

## 3. PBKDF2 (`worker/crypto.ts`): fixo em 100k (teto do Cloudflare Workers)

- **`ITERATIONS` fica em 100.000 — e tem que ficar.** O Cloudflare Workers **limita o PBKDF2 a 100.000
  iterações**: acima disso, `crypto.subtle.deriveBits` lança **`NotSupportedError`** e o login retorna 503.
  Foi tentado 600k (plano original, alvo OWASP) e depois 200k, e **os dois quebraram TODOS os logins em
  produção** (`site api failure NotSupportedError` no `wrangler tail`) — revertido por hotfix. Conclusão:
  o "reforço do PBKDF2" pedido na tarefa **não é possível nesta plataforma**; 100k é o teto.
- **Sem oráculo de tempo:** como todas as contas usam o mesmo custo (100k), o caminho de usuário
  inexistente custa igual ao de um usuário real — logo o oráculo de existência por tempo que a auditoria
  apontou (quando havia mistura 100k/600k) **não existe** com tudo em 100k.
- **Compatibilidade:** cada hash guarda as próprias iterações (`pbkdf2$<iter>$<salt>$<hash>`); mudar este
  número não invalida senhas. `needsRehash` só regravaria hashes abaixo de 100k (não há).
- **Se um dia hashing mais forte virar prioridade:** passaria por outra abordagem fora do limite nativo do
  Workers (ex.: um serviço/Durable Object dedicado ao KDF). Fora de escopo — hoje o modelo de ameaça (D1
  server-side, tokens guardados só como hash) torna 100k aceitável.

## 4. Limites de tentativa e token de instalação

- **Rate limit:** login da equipe e do paciente usam **10 por (e-mail+IP)** e **50/IP** por 15 min;
  `conta-dados` 300/sessão; `conta-invite` 20/IP; `setup` 10/IP. A chave do limite por e-mail inclui o
  **IP** (ajuste da auditoria): assim um terceiro não trava o login da vítima a partir de outros IPs
  (lockout direcionado), e o teto por IP segue cobrindo força bruta de uma origem. Chaves são
  `sha256(identidade)` (sem PII em claro).
- **Token de instalação em tempo constante:** `/api/auth/setup` passou a comparar o `ADMIN_SETUP_TOKEN`
  com `constantTimeEqual` (sem curto-circuito), em vez de `!==`.

## Publicar (somente no TERMINAL DO APP e com "pode publicar" do usuário)

Conta Cloudflare própria da Patrícia (`patriciapereiracarvalhokids@gmail.com`, account
`7b09fe212e823ce7786f3e0ad3dcb830`). Conferir `npx wrangler whoami` antes.

```bash
npx wrangler d1 migrations apply site-patricia-carvalho --remote   # aplica só a 0003
npm run deploy                                                      # vite build && wrangler deploy (ativa o cron)
```

No terminal do app, `$env:CI = 'true'` pula as confirmações do wrangler com o OAuth cacheado. Depois do
deploy, conferir o **CPU Time** de um login (item 3) e expurgo/auditoria nos logs.
