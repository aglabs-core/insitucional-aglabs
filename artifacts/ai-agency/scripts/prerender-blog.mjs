/**
 * Pré-renderização do blog (SSG) — roda DEPOIS do `vite build`.
 *
 * Por que existe: o site é um SPA (Vite) cujo conteúdo dos posts vem do Supabase
 * no cliente. Crawlers de IA que NÃO executam JS (GPTBot/ClaudeBot/PerplexityBot)
 * veriam o blog vazio. Este script busca os posts publicados no Supabase e gera:
 *   dist/blog/<slug>.html  — cada post com texto, imagem, CTA do produto, "Leia
 *                            também" e JSON-LD BlogPosting + BreadcrumbList;
 *   dist/blog.html         — índice /blog com a lista completa de posts por pilar;
 *   dist/blog/rss.xml      — feed RSS;
 *   dist/sitemap.xml       — home, /blog e todos os posts com lastmod.
 * O Cloudflare Pages serve esses arquivos direto (antes do fallback SPA); quando
 * o usuário (com JS) carrega, o React assume.
 *
 * Pilar, título/description de SEO e capa vêm de src/content/blog-meta.json
 * (guia em BLOG.md), o mesmo arquivo que o app usa.
 *
 * Falhas de configuração, consulta ou renderização interrompem o build para
 * impedir deploy de HTML incompleto. Usa as mesmas libs de markdown do app.
 *
 * Requer no ambiente de build: VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.
 * Teste local sem credenciais: BLOG_FIXTURE=<arquivo.json> com as linhas da
 * tabela blog_posts (mesmas colunas do select abaixo).
 * Blog intencionalmente vazio: BLOG_ALLOW_EMPTY=1 (não ignora erro de consulta).
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import { createClient } from "@supabase/supabase-js";

const SITE_URL = "https://aglabs.ia.br";
const DEFAULT_IMAGE = `${SITE_URL}/opengraph.jpg`;
const LOGO = { "@type": "ImageObject", url: `${SITE_URL}/android-chrome-512x512.png`, width: 512, height: 512 };

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const DIST = resolve(ROOT, "dist");
const META = JSON.parse(readFileSync(resolve(ROOT, "src/content/blog-meta.json"), "utf8"));
/** Mesmo plugin de src/lib/post-render.ts (rehypeTrimTables). */
const TABLE_PARTS = new Set(["table", "thead", "tbody", "tfoot", "tr"]);
function rehypeTrimTables() {
  const walk = (node) => {
    if (!node.children) return;
    if (node.type === "element" && TABLE_PARTS.has(node.tagName)) {
      node.children = node.children.filter((c) => !(c.type === "text" && !c.value.trim()));
    }
    node.children.forEach(walk);
  };
  return (tree) => walk(tree);
}
/** Mesma regra de src/lib/post-render.ts (hasHtml): o post guarda HTML, não só markdown. */
const hasHtml = (content) =>
  /<\/?(h[1-6]|p|ul|ol|li|strong|em|b|i|a|blockquote|table|br|img|div|span|pre|code)\b[^>]*>/i.test(content);
/** Allowlist do HTML dos posts — a mesma do app (src/lib/post-render.ts). */
const POST_HTML_SCHEMA = JSON.parse(readFileSync(resolve(ROOT, "src/content/post-html-schema.json"), "utf8"));

const esc = (s = "") =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const isoDate = (v) => {
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? new Date().toISOString().slice(0, 10) : d.toISOString().slice(0, 10);
};
const brDate = (v) =>
  new Date(v).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric", timeZone: "America/Sao_Paulo" });
/** JSON dentro de <script>: impede que um "</script>" no texto feche a tag. */
const ldScript = (obj) => `<script type="application/ld+json">${JSON.stringify(obj).replace(/</g, "\\u003c")}</script>`;

/* ---- Metadados editoriais (espelho de src/lib/blog-meta.ts) ---- */
function pillarFromCategory(category = "") {
  const c = category.toLowerCase();
  if (c.includes("curios")) return "curiosidades";
  if (c.includes("site")) return "sites";
  if (c.includes("conversacional") || c.includes("atendimento")) return "atendimento";
  if (c.includes("automa")) return "automacao";
  if (c.includes("desenvolv") || c.includes("marketing")) return "criar-com-ia";
  return "estrategia";
}
const pillarOf = (p) => META.posts[p.slug]?.pillar ?? pillarFromCategory(p.category);
const productOf = (p) => {
  const key = META.posts[p.slug]?.product;
  return (key && META.products[key]) || META.pillars[pillarOf(p)].product;
};
const seoTitleOf = (p) => {
  const base = META.posts[p.slug]?.seoTitle ?? p.title;
  const branded = `${base} | AG LABS`;
  return branded.length <= 60 ? branded : base;
};
const descriptionOf = (p) => META.posts[p.slug]?.description ?? p.excerpt;
/**
 * Capa gerada (com o título) — só para compartilhamento: og:image,
 * twitter:image, JSON-LD e RSS. Não aparece na página.
 */
function ogCoverOf(p) {
  if (META.posts[p.slug] && existsSync(resolve(ROOT, "public/img/blog/og", `${p.slug}.jpg`))) {
    return { url: `${SITE_URL}/img/blog/og/${p.slug}.jpg`, type: "image/jpeg", width: 1200, height: 630 };
  }
  return null;
}
/** Foto do post em WebP servida pelo site (scripts/blog-images.mjs), se já gerada. */
function localPhotoOf(p) {
  const base = `/img/blog/${p.slug}`;
  return META.posts[p.slug]?.photo && existsSync(resolve(ROOT, "public", `${base.slice(1)}-1200.webp`)) ? base : null;
}
/**
 * Imagem mostrada na página: a foto local; senão a URL original do post
 * (Supabase); sem nenhuma, a capa gerada como reserva. Espelho de postImage
 * em src/lib/blog-meta.ts.
 */
function imageOf(p) {
  const local = localPhotoOf(p);
  if (local) return `${local}-1200.webp`;
  if (p.cover) return p.cover;
  if (ogCoverOf(p)) return `/img/blog/og/${p.slug}.webp`;
  return null;
}
const absolute = (u) => (u.startsWith("/") ? `${SITE_URL}${u}` : u);
/** Mesma regra de src/lib/blog-meta.ts (relatedPosts): em roda dentro do pilar. */
function relatedOf(post, all, n = 3) {
  const pillar = pillarOf(post);
  const same = all.filter((p) => pillarOf(p) === pillar);
  const i = same.findIndex((p) => p.slug === post.slug);
  const ring = i < 0 ? same : [...same.slice(i + 1), ...same.slice(0, i)];
  const rest = all.filter((p) => p.slug !== post.slug && pillarOf(p) !== pillar);
  return [...ring, ...rest].slice(0, n);
}
const norm = (s) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, " ").trim();
function stripLeadingTitle(content, title) {
  const m = content.match(/^\s*#\s+(.+)\n?/) ?? content.match(/^\s*<h1[^>]*>([\s\S]*?)<\/h1>\s*/i);
  return m && norm(m[1].replace(/<[^>]+>/g, "")) === norm(title) ? content.slice(m[0].length) : content;
}

/* ---- Cabeçalho ---- */

/** Substitui a tag se existir; senão a insere antes de </head>. */
function upsertTag(html, regex, tag) {
  return regex.test(html) ? html.replace(regex, () => tag) : html.replace("</head>", () => `    ${tag}\n  </head>`);
}

/**
 * Ajusta o shell (dist/index.html, que é o da home) para outra página: troca
 * as metas, tira do @graph o FAQPage e o ProfessionalService da home (não
 * descrevem esta página) e o <noscript> com o texto da home.
 */
function pageHead(shell, { title, description, url, image, imageType, imageWidth, imageHeight, type, extra = "" }) {
  let html = shell;
  html = upsertTag(html, /<title>[\s\S]*?<\/title>/, `<title>${esc(title)}</title>`);
  html = upsertTag(html, /<meta\s+name="description"[^>]*>/, `<meta name="description" content="${esc(description)}" />`);
  html = upsertTag(html, /<link\s+rel="canonical"[^>]*>/, `<link rel="canonical" href="${url}" />`);
  html = upsertTag(html, /<meta\s+property="og:type"[^>]*>/, `<meta property="og:type" content="${type}" />`);
  html = upsertTag(html, /<meta\s+property="og:title"[^>]*>/, `<meta property="og:title" content="${esc(title)}" />`);
  html = upsertTag(html, /<meta\s+property="og:description"[^>]*>/, `<meta property="og:description" content="${esc(description)}" />`);
  html = upsertTag(html, /<meta\s+property="og:url"[^>]*>/, `<meta property="og:url" content="${url}" />`);
  html = upsertTag(html, /<meta\s+property="og:image"[^>]*>/, `<meta property="og:image" content="${esc(image)}" />`);
  // Largura/altura só quando conhecidas (capa gerada ou imagem padrão).
  html = html.replace(/\s*<meta\s+property="og:image:(?:width|height|type)"[^>]*>/g, "");
  if (imageWidth) {
    html = html.replace(
      /(<meta\s+property="og:image"[^>]*>)/,
      (m) =>
        `${m}\n    <meta property="og:image:width" content="${imageWidth}" />\n    <meta property="og:image:height" content="${imageHeight}" />` +
        (imageType ? `\n    <meta property="og:image:type" content="${imageType}" />` : ""),
    );
  }
  html = upsertTag(html, /<meta\s+name="twitter:card"[^>]*>/, `<meta name="twitter:card" content="summary_large_image" />`);
  html = upsertTag(html, /<meta\s+name="twitter:title"[^>]*>/, `<meta name="twitter:title" content="${esc(title)}" />`);
  html = upsertTag(html, /<meta\s+name="twitter:description"[^>]*>/, `<meta name="twitter:description" content="${esc(description)}" />`);
  html = upsertTag(html, /<meta\s+name="twitter:image"[^>]*>/, `<meta name="twitter:image" content="${esc(image)}" />`);

  html = html.replace(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/, (whole, json) => {
    try {
      const data = JSON.parse(json);
      if (Array.isArray(data["@graph"])) {
        data["@graph"] = data["@graph"].filter((n) => n["@type"] !== "FAQPage" && n["@type"] !== "ProfessionalService");
      }
      return ldScript(data);
    } catch {
      return whole;
    }
  });
  html = html.replace(/\s*<!--[^>]*?crawlers[\s\S]*?-->\s*<noscript>[\s\S]*?<\/noscript>/, "");
  html = html.replace(/\s*<noscript>\s*<main>[\s\S]*?<\/main>\s*<\/noscript>/, "");

  const readingStyle = `<style id="blog-first-paint">
body{margin:0;background:#f5f6f8;color:#172234;font:16px/1.75 system-ui,sans-serif}.blog-static-shell{max-width:780px;margin:auto;padding:32px 24px}.blog-static-shell nav{font-size:13px;margin-bottom:24px}.blog-static-shell h1{font-size:clamp(30px,5vw,46px);line-height:1.15;letter-spacing:-1px}.blog-static-shell h2{font-size:25px;line-height:1.3;margin-top:36px}.blog-static-shell a{color:#245fc9}.blog-static-shell img{max-width:100%;height:auto;border-radius:8px}.blog-static-shell pre{overflow:auto;background:#e6edf8;padding:20px;border-radius:7px}.blog-static-shell blockquote{border-left:3px solid #2563eb;padding-left:20px;color:#526176}.blog-static-shell table{display:block;overflow:auto}.blog-static-shell li{margin:12px 0}.blog-static-shell time{color:#69778b;font-size:12px}.blog-static-shell>p{color:#526176}
</style>`;
  html=html.replace('</head>',readingStyle+'</head>');
  const rss = `<link rel="alternate" type="application/rss+xml" title="Blog da AG LABS" href="${SITE_URL}/blog/rss.xml" />`;
  return html.replace("</head>", () => `    ${rss}\n${extra}  </head>`);
}

/* ---- Páginas ---- */

function renderMarkdown(post) {
  try {
    return renderToStaticMarkup(
      React.createElement(
        ReactMarkdown,
        {
          // Mesma configuração do app (src/lib/post-render.ts): markdown ou HTML sanitizado.
          remarkPlugins: [remarkGfm],
          rehypePlugins: [rehypeTrimTables, ...(hasHtml(post.content) ? [rehypeRaw] : []), [rehypeSanitize, POST_HTML_SCHEMA]],
          components: { h1: "h2" },
        },
        stripLeadingTitle(post.content, post.title),
      ),
    );
  } catch (e) {
    console.warn(`[prerender] Markdown falhou para "${post.slug}" (usando excerpt):`, e?.message ?? e);
    return `<p>${esc(post.excerpt)}</p>`;
  }
}

function buildPostPage(shell, post, all) {
  const url = `${SITE_URL}/blog/${post.slug}`;
  const og = ogCoverOf(post);
  const image = imageOf(post);
  const pillar = META.pillars[pillarOf(post)];
  const product = productOf(post);
  const description = descriptionOf(post);
  const related = relatedOf(post, all);

  const blogPosting = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description,
    // Imagem do post e capa de compartilhamento 1200×630.
    image: [
      ...(image ? [absolute(image)] : []),
      ...(og ? [{ "@type": "ImageObject", url: og.url, width: og.width, height: og.height }] : []),
    ].concat(image || og ? [] : [DEFAULT_IMAGE]),
    datePublished: post.created,
    dateModified: post.updated,
    author: { "@type": "Person", name: post.author },
    publisher: { "@type": "Organization", "@id": `${SITE_URL}/#organization`, name: "AG LABS Intelligence", logo: LOGO },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    isPartOf: { "@type": "Blog", "@id": `${SITE_URL}/blog#blog` },
    articleSection: pillar.name,
    inLanguage: "pt-BR",
  };
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}/blog` },
      { "@type": "ListItem", position: 3, name: post.title, item: url },
    ],
  };
  const extra =
    `    <meta property="article:published_time" content="${esc(post.created)}" />\n` +
    `    <meta property="article:modified_time" content="${esc(post.updated)}" />\n` +
    `    <meta property="article:section" content="${esc(pillar.name)}" />\n` +
    `    ${ldScript(blogPosting)}\n    ${ldScript(breadcrumb)}\n`;

  let html = pageHead(shell, {
    title: seoTitleOf(post),
    description,
    url,
    image: og?.url ?? (image ? absolute(image) : DEFAULT_IMAGE),
    imageType: og?.type,
    imageWidth: og?.width,
    imageHeight: og?.height,
    type: "article",
    extra,
  });

  // Conteúdo legível por crawlers (substituído pelo React quando o JS carrega).
  const local = localPhotoOf(post);
  const coverImg = local
    ? `<img src="${local}-1200.webp" srcset="${local}-600.webp 600w, ${local}-1200.webp 1200w" sizes="100vw" width="1200" height="630" fetchpriority="high" alt="${esc(post.title)}" />`
    : image
      ? `<img src="${esc(image)}" alt="${esc(post.title)}" />`
      : "";
  const relatedHtml = related.length
    ? `<section><h2>Leia também</h2><ul>` +
      related
        .map((r) => `<li><a href="/blog/${r.slug}">${esc(r.title)}</a> — ${esc(descriptionOf(r))}</li>`)
        .join("") +
      `</ul></section>`
    : "";
  const article =
    `<main class="blog-static-shell"><nav aria-label="Trilha"><a href="/">Home</a> › <a href="/blog">Blog</a> › <span>${esc(pillar.name)}</span></nav>` +
    `<article>` +
    `<p>${esc(pillar.name)}</p>` +
    `<h1>${esc(post.title)}</h1>` +
    `<p>${esc(post.author)} · <time datetime="${isoDate(post.created)}">${brDate(post.created)}</time> · ${post.readTime} min de leitura</p>` +
    coverImg +
    `<p>${esc(post.excerpt)}</p>` +
    renderMarkdown(post) +
    `<aside><h2>${esc(product.name)}</h2><p>${esc(product.pitch)}</p><p><a href="${product.url}">${esc(product.cta)}</a></p></aside>` +
    `</article>` +
    relatedHtml +
    `</main>`;
  return html.replace('<div id="root"></div>', () => `<div id="root">${article}</div>`);
}

function buildIndexPage(shell, posts) {
  const url = `${SITE_URL}/blog`;
  const blog = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "@id": `${SITE_URL}/blog#blog`,
    name: "Blog da AG LABS",
    url,
    description: META.blog.description,
    inLanguage: "pt-BR",
    publisher: { "@id": `${SITE_URL}/#organization` },
    blogPost: posts.map((p) => ({
      "@type": "BlogPosting",
      headline: p.title,
      url: `${SITE_URL}/blog/${p.slug}`,
      datePublished: p.created,
      dateModified: p.updated,
    })),
  };
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Blog", item: url },
    ],
  };
  let html = pageHead(shell, {
    title: META.blog.title,
    description: META.blog.description,
    url,
    image: DEFAULT_IMAGE,
    type: "website",
    extra: `    ${ldScript(blog)}\n    ${ldScript(breadcrumb)}\n`,
  });

  // Lista completa e rastreável, agrupada por pilar.
  const sections = Object.entries(META.pillars)
    .map(([id, pillar]) => {
      const list = posts.filter((p) => pillarOf(p) === id);
      if (!list.length) return "";
      return (
        `<section><h2>${esc(pillar.name)}</h2><ul>` +
        list
          .map(
            (p) =>
              `<li><a href="/blog/${p.slug}">${esc(p.title)}</a> <time datetime="${isoDate(p.created)}">${brDate(p.created)}</time><p>${esc(descriptionOf(p))}</p></li>`,
          )
          .join("") +
        `</ul></section>`
      );
    })
    .join("");
  const main =
    `<main class="blog-static-shell"><nav aria-label="Trilha"><a href="/">Home</a> › <span>Blog</span></nav>` +
    `<h1>Blog da AG LABS</h1><p>${esc(META.blog.description)}</p>${sections}</main>`;
  return html.replace('<div id="root"></div>', () => `<div id="root">${main}</div>`);
}

function buildSitemap(posts) {
  const today = new Date().toISOString().slice(0, 10);
  const newest = posts.length ? posts.reduce((max, p) => (isoDate(p.updated) > max ? isoDate(p.updated) : max), "0000-00-00") : today;
  const urls = [
    { loc: `${SITE_URL}/`, lastmod: today, changefreq: "weekly", priority: "1.0" },
    { loc: `${SITE_URL}/blog`, lastmod: newest, changefreq: "daily", priority: "0.8" },
    ...posts.map((p) => ({
      loc: `${SITE_URL}/blog/${p.slug}`,
      lastmod: isoDate(p.updated),
      changefreq: "monthly",
      priority: "0.7",
      image: imageOf(p) ? absolute(imageOf(p)) : undefined,
    })),
  ];
  return (
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n` +
    urls
      .map(
        (u) =>
          `  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${u.lastmod}</lastmod>\n    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority}</priority>\n` +
          (u.image ? `    <image:image><image:loc>${esc(u.image)}</image:loc></image:image>\n` : "") +
          `  </url>`,
      )
      .join("\n") +
    `\n</urlset>\n`
  );
}

function buildRss(posts) {
  const items = posts
    .map((p) => {
      const og = ogCoverOf(p);
      return (
        `    <item>\n      <title>${esc(p.title)}</title>\n      <link>${SITE_URL}/blog/${p.slug}</link>\n` +
        `      <guid isPermaLink="true">${SITE_URL}/blog/${p.slug}</guid>\n` +
        `      <pubDate>${new Date(p.created).toUTCString()}</pubDate>\n` +
        `      <category>${esc(META.pillars[pillarOf(p)].name)}</category>\n` +
        `      <description>${esc(descriptionOf(p))}</description>\n` +
        (og ? `      <enclosure url="${esc(og.url)}" type="image/jpeg" length="0" />\n` : "") +
        `    </item>`
      );
    })
    .join("\n");
  return (
    `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n  <channel>\n` +
    `    <title>Blog da AG LABS</title>\n    <link>${SITE_URL}/blog</link>\n` +
    `    <atom:link href="${SITE_URL}/blog/rss.xml" rel="self" type="application/rss+xml" />\n` +
    `    <description>${esc(META.blog.description)}</description>\n    <language>pt-BR</language>\n` +
    `    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>\n${items}\n  </channel>\n</rss>\n`
  );
}

async function loadRows() {
  if (process.env.BLOG_FIXTURE) {
    return JSON.parse(readFileSync(resolve(process.env.BLOG_FIXTURE), "utf8"));
  }
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("[prerender] VITE_SUPABASE_URL/ANON_KEY ausentes");
  }
  const supabase = createClient(supabaseUrl, supabaseKey);
  const { data, error } = await supabase
    .from("blog_posts")
    .select("id,title,slug,excerpt,content,category,cover_image,published,author,created_at,updated_at,read_time")
    .eq("published", true);
  if (error) {
    throw new Error(`[prerender] Erro ao buscar posts no Supabase: ${error.message}`);
  }
  return data;
}

async function main() {
  const rows = await loadRows();
  if (!Array.isArray(rows)) throw new Error("[prerender] Resposta de posts inválida; esperado um array");
  // Uma consulta vazia não prova indisponibilidade: pode ser despublicação intencional.
  if (!rows.length && process.env.BLOG_ALLOW_EMPTY !== "1") {
    throw new Error("[prerender] Consulta sem posts publicados; confirme BLOG_ALLOW_EMPTY=1 para um blog intencionalmente vazio");
  }
  if (rows.some((row) => !row || typeof row.slug !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(row.slug))) {
    throw new Error("[prerender] Post sem slug válido; geração interrompida");
  }

  let shell;
  try {
    shell = readFileSync(resolve(DIST, "index.html"), "utf8");
  } catch (e) {
    throw new Error("[prerender] dist/index.html não encontrado", { cause: e });
  }
  if (!shell.includes('<div id="root"></div>') || !shell.includes("</head>")) {
    throw new Error("[prerender] Shell sem marcadores de conteúdo/head");
  }

  // Public-only bootstrap removes a second CMS round trip on direct landings.
  const scriptJson = value => JSON.stringify(value).replace(/</g, "\\u003c");
  const listSeed=rows.map(({content,...row})=>row).sort((a,b)=>String(b.created_at).localeCompare(String(a.created_at)) || a.slug.localeCompare(b.slug));
  const withSeed=(html,data)=>html.replace('</head>',`<script id="blog-seed" type="application/json">${scriptJson(data)}</script></head>`);
  const posts = rows
    .map((row) => ({
      title: row.title ?? "",
      slug: row.slug,
      excerpt: row.excerpt ?? "",
      content: row.content ?? "",
      category: row.category ?? "",
      cover: row.cover_image ?? "",
      author: row.author || "AG LABS",
      created: row.created_at,
      updated: row.updated_at ?? row.created_at,
      readTime: row.read_time ?? 5,
    }))
    .sort((a, b) => String(b.created).localeCompare(String(a.created)) || a.slug.localeCompare(b.slug));

  const missing = posts.filter((p) => !META.posts[p.slug]).map((p) => p.slug);
  if (missing.length) {
    console.warn(`[prerender] ${missing.length} post(s) sem entrada em blog-meta.json (sem capa padronizada): ${missing.join(", ")}`);
  }

  const dir = resolve(DIST, "blog");
  mkdirSync(dir, { recursive: true });
  let count = 0;
  for (const post of posts) {
    // <slug>.html (e não <slug>/index.html): o Cloudflare Pages serve
    // /blog/<slug> direto, sem redirecionar para a versão com barra final,
    // que divergia da canônica e do sitemap.
    writeFileSync(resolve(dir, `${post.slug}.html`), withSeed(buildPostPage(shell, post, posts), {list:listSeed,post:rows.find(row=>row.slug===post.slug)}), "utf8");
    count++;
  }

  // dist/blog.html: o home-shell só cria a cópia vazia se este arquivo não existir.
  writeFileSync(resolve(DIST, "blog.html"), withSeed(buildIndexPage(shell, posts), {list:listSeed}), "utf8");
  writeFileSync(resolve(dir, "rss.xml"), buildRss(posts), "utf8");
  writeFileSync(resolve(DIST, "sitemap.xml"), buildSitemap(posts), "utf8");

  console.log(`[prerender] OK — ${count} post(s) + índice /blog + RSS + sitemap.`);
}

main().catch((e) => {
  console.error("[prerender] Falha:", e?.message ?? e);
  process.exitCode = 1;
});
