# Pré-renderização do blog (SSG) — `prerender-blog.mjs`

## O problema que resolve
O site é um **SPA (Vite)** e os posts do blog vêm do **Supabase no cliente**. Crawlers
de IA que **não executam JavaScript** (GPTBot/ChatGPT, ClaudeBot, PerplexityBot…) recebem
o HTML cru — que está **vazio** — e não enxergam o conteúdo dos artigos. Google/Gemini
renderizam JS, mas com atraso/limite. Resultado: o blog ficava **invisível para GEO/AEO**.

## Como funciona
Roda **depois** do `vite build`:
1. Busca os posts publicados no Supabase (`blog_posts`, `published = true`).
2. Renderiza o markdown de cada post com as **mesmas libs do app** (`react-markdown` +
   `remark-gfm`) via `renderToStaticMarkup` — HTML idêntico ao do site.
3. Gera `dist/blog/<slug>.html` com o **texto do artigo, capa, bloco do produto, "Leia também"
   e JSON-LD `BlogPosting` + `BreadcrumbList`** embutidos no HTML, reaproveitando o shell
   `dist/index.html` (mantém os mesmos assets/bundles). Pilar, título/description de SEO e
   capa vêm de `src/content/blog-meta.json` (ver `BLOG.md`).
4. Gera `dist/blog.html` (índice `/blog` com a lista completa de posts por pilar),
   `dist/blog/rss.xml` e reescreve `dist/sitemap.xml` com home + /blog + todos os posts
   (`lastmod` = `updated_at` de cada post).

Como o `main.tsx` usa `createRoot` (não `hydrate`), quando o JS carrega o React
**substitui** o conteúdo pré-renderizado pelo app normal — sem hydration mismatch.
O Cloudflare Pages serve `dist/blog/<slug>.html` em `/blog/<slug>` diretamente (antes do fallback SPA).

## Requisitos (variáveis de ambiente no build)
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

(São as mesmas que o app já usa. No Cloudflare Pages, configure-as em
Settings → Environment variables, escopo **Production** e **Preview**.)

## Segurança / não-fatal
O passo é **não-fatal**: qualquer erro (Supabase indisponível, env ausente, etc.) só
emite warning e **não quebra o build/deploy**. Sem env, ele apenas pula.

## Como testar (recomendado, antes de mesclar)
Esta mudança está na branch **`feat/blog-prerender`**.
1. `git push` da branch → o Cloudflare Pages cria um **deploy de preview**.
2. No preview, abra um post e veja o **código-fonte** (Ctrl+U) ou:
   `curl -s https://<preview>/blog/<slug> | grep -i "<h1\|BlogPosting"`
   → deve conter o título/HTML do artigo e o JSON-LD **sem precisar de JS**.
3. Confirme que a navegação normal (com JS) continua igual.
4. Se ok, **merge na `main`**.

## Atualizar conteúdo ao publicar (rebuild-on-publish)
O HTML é gerado **no build** → ao **publicar/editar/despublicar** um post é preciso
disparar um **rebuild** para o conteúdo aparecer no HTML estático.

### Opção A — manual
Cloudflare Pages → **Deployments** → *Retry deployment* / *Create deployment*.

### Opção B — automático (recomendado)
1. **Deploy Hook (Cloudflare Pages):** projeto → *Settings* → *Builds & deployments* →
   *Deploy hooks* → *Add deploy hook* → nome `rebuild-blog`, branch `main` → **Create**.
   Copie a URL gerada (um endpoint que, via `POST`, dispara um build de produção).
2. **Database Webhook (Supabase):** Dashboard → *Database* → *Webhooks* →
   *Create a new hook*:
   - Tabela: `blog_posts`
   - Eventos: `INSERT`, `UPDATE`, `DELETE`
   - Tipo: **HTTP Request** → método **POST** → **URL = a URL do Deploy Hook** (passo 1)
   - (não precisa de corpo nem headers)
3. Salvar. Agora publicar/editar um post chama o webhook → o Pages rebuilda →
   o `prerender-blog.mjs` regenera o HTML automaticamente.

> Dica: várias edições seguidas geram vários builds. Para reduzir, dispare o webhook
> apenas quando `published` mudar (condição no Supabase) ou aceite o pequeno atraso do build.

## Capas (`blog-cover.mjs`)
Gera as capas 1200×630 dos posts a partir do `blog-meta.json` com o Chrome instalado
(puppeteer-core). Não roda no build: as imagens geradas são commitadas em `public/img/blog/`.
Uso e regras em `BLOG.md`, seção 6.

## Rodar localmente
```bash
# após um build:
VITE_SUPABASE_URL=... VITE_SUPABASE_ANON_KEY=... pnpm --filter @workspace/ai-agency run prerender
# sem credenciais, com as linhas da tabela num JSON:
BLOG_FIXTURE=posts.json node scripts/prerender-blog.mjs
```
