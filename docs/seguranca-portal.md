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

## 3. PBKDF2 (`worker/crypto.ts`): 100k → 200k

- `ITERATIONS` subiu de 100.000 para **200.000**. A proposta inicial era 600k (alvo OWASP 2023), mas a
  **auditoria interna** apontou dois problemas nesse salto: (a) 6× criava um **oráculo de existência de
  conta por tempo** no login — hashes antigos (100k) respondem ~6× mais rápido que o caminho de usuário
  inexistente, que deriva em 600k; e (b) risco de estourar o limite de CPU do Worker. **200k** resolve os
  dois: é ~2× o 100k que já roda hoje (margem de CPU folgada) e o gap de tempo fica perto do ruído de
  rede, convergindo a zero conforme os hashes antigos são regravados.
- **Compatibilidade:** cada hash guarda as próprias iterações (`pbkdf2$<iter>$<salt>$<hash>`). Hashes
  antigos (100k) continuam válidos e são **regravados no próximo login bem-sucedido** (`needsRehash` →
  re-hash em `/api/auth/login` e `/api/conta/login`); `setup` e aceite de convite já gravam em 200k.
  O re-hash só roda em login **bem-sucedido**, então a convergência depende de o usuário logar — para
  drenar contas dormentes na hora seria preciso um reset de senha (não feito).
- **Medição (proxy):** WebCrypto nativo do Node (OpenSSL) — não representa o CPU do edge, mas a escala é
  **linear**: ~74 ms (100k), ~150 ms (200k), ~445 ms (600k) nesta máquina. 200k ≈ 2× um valor conhecido.
- **No deploy:** conferir o **CPU Time** de um login em Workers → Metrics (observability ligada); com 200k
  o risco é baixo. Mudar `ITERATIONS` e reimplantar **não invalida senhas** (as iterações ficam no próprio
  hash) — sem migração.

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
