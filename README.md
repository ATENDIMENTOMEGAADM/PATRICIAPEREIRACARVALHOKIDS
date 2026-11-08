# Site da Dra. Patrícia Pereira Carvalho

Site público da clínica (pediatria e gastropediatria em Marabá-PA) com área restrita `/admin` e API própria, publicado em **Cloudflare Workers + D1**.

## Rodar localmente

```bash
npm install
cp .dev.vars.example .dev.vars   # ajuste os valores
npm run dev:full                 # http://127.0.0.1:8787/admin
```

## Publicar (Cloudflare Workers)

Passo a passo em [`docs/area-restrita.md`](docs/area-restrita.md): criar o banco D1, aplicar as migrações, definir os segredos (`ADMIN_SETUP_TOKEN`, `INTEGRATIONS_SECRET`) e `npm run deploy`. O deploy é via `wrangler` — não há mais publicação no GitHub Pages.

## Integração com o Consul+

A área restrita conecta o site ao Consul+ (sistema de receitas) por uma chave de API gerada no Consul+ em **Minha conta → Integrações (API)**. Detalhes em [`docs/area-restrita.md`](docs/area-restrita.md).
