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

## 3. PBKDF2 (`worker/crypto.ts`): 100k → 600k

- `ITERATIONS` subiu de 100.000 para **600.000** (alvo OWASP 2023 para PBKDF2-HMAC-SHA256).
- **Compatibilidade:** cada hash guarda as próprias iterações (`pbkdf2$<iter>$<salt>$<hash>`). Hashes
  antigos (100k) continuam válidos e são **regravados no próximo login** (`needsRehash` → re-hash em
  `/api/auth/login` e `/api/conta/login`). `setup` e aceite de convite já gravam em 600k.
- **Medição (proxy):** WebCrypto nativo do Node (OpenSSL) nesta máquina — **não** representa o CPU do
  edge (BoringSSL costuma ser mais rápido). O que é confiável é a **escala linear**:

  | iterações | ms/hash (proxy) | ×100k |
  |-----------|-----------------|-------|
  | 100.000   | ~74             | 1,0   |
  | 300.000   | ~224            | 3,0   |
  | 600.000   | ~445            | 6,0   |

  Ou seja: 600k custa **6× o 100k que já roda em produção hoje**.
- **Limite de CPU do Worker (AÇÃO NO DEPLOY):** não dá para medir o CPU real do edge sem publicar.
  A produção roda 100k sem erro, então 600k = 6× esse custo. Medir de verdade **após o deploy**:
  Cloudflare → Workers → *site-patricia-carvalho* → Metrics → **CPU Time** (observability já está ligada).
  Fazer **um login** e conferir. No plano gratuito (limite de 10 ms de CPU/req) 600k pode estourar; no
  pago (padrão 30 s) sobra folga.
- **Rollback (sem migração, sem invalidar senhas):** se um login estourar o CPU (resposta 503) ou ficar
  lento demais, basta **reduzir** `ITERATIONS` (ex.: 300000 ou 200000) e reimplantar. Hashes já gravados
  continuam válidos (as iterações ficam no próprio hash); sessões já abertas não fazem PBKDF2.

## 4. Limites de tentativa e token de instalação

- **Rate limit (revisado, mantido):** login da equipe e do paciente seguem **10/e-mail** e **50/IP** por
  15 min; `conta-dados` 300/sessão; `conta-invite` 20/IP; `setup` 10/IP. O limite por e-mail já é o
  lockout pedido; o de IP cobre força bruta sem travar NAT compartilhado. Chaves de limite são
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
