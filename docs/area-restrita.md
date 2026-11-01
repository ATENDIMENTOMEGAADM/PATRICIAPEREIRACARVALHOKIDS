# Área restrita e integrações por API

O site é independente do Consul+ (sistema de receitas). Ele tem seu próprio login, banco e servidor, e se conecta ao Consul+ apenas com uma chave de API.

- `/admin`: login da equipe do site (não é para pacientes).
- `/admin/configuracoes/api`: **Configurações → API**, onde as integrações são cadastradas.
- `worker/`: servidor do site (Cloudflare Workers). `worker/connectors.ts` define os conectores; para criar outra integração, adicione uma entrada lá.
- `migrations/`: banco D1 próprio do site (`admin_users`, `admin_sessions`, `login_attempts`, `integrations`).

## Segurança

- Senhas com PBKDF2-SHA256 (100 mil iterações). Sessão em cookie `__Host-` HttpOnly, SameSite=Strict, 12 h (expira após 2 h sem uso).
- O primeiro administrador só pode ser criado com o código `ADMIN_SETUP_TOKEN` do servidor, e somente enquanto não houver nenhum.
- Login limitado a 10 tentativas por e-mail e 50 por IP a cada 15 minutos.
- A chave do Consul+ é verificada (`GET /api/v1/me`) antes de salvar. Fica cifrada com AES-GCM (`INTEGRATIONS_SECRET`) e nunca volta para o navegador; a tela mostra só o prefixo.
- Remover a integração no site não revoga a chave: revogue também no Consul+.

## Testar localmente

```bash
npm install
cp .dev.vars.example .dev.vars   # troque os valores
npm run dev:full                 # http://127.0.0.1:8787/admin
```

## Publicar (Cloudflare Workers)

O GitHub Pages só serve arquivos estáticos e não roda o login. Para a área restrita funcionar, o site precisa ser publicado no Cloudflare Workers:

1. `npx wrangler login` (feito pela pessoa responsável pela conta Cloudflare).
2. `npx wrangler d1 create site-patricia-carvalho` e copie o `database_id` para `wrangler.jsonc`.
3. `npm run db:migrate`
4. `npx wrangler secret put ADMIN_SETUP_TOKEN` e `npx wrangler secret put INTEGRATIONS_SECRET` (valores longos e aleatórios). **Não** configure `ALLOW_LOCAL_INTEGRATIONS` em produção.
5. `npm run deploy`
6. Em Workers → Domínios, ligue `patriciagastroped.com`. Isso exige que o DNS do domínio esteja na Cloudflare. Só depois desative o GitHub Pages (Settings → Pages) e remova `public/CNAME`.
7. Acesse `/admin`, crie o primeiro acesso com o código de instalação e conecte o Consul+ em Configurações → API.

Se `INTEGRATIONS_SECRET` for trocado, as chaves salvas deixam de abrir: remova e cadastre de novo as integrações.
