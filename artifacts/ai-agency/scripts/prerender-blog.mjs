/**
 * Pré-renderização do blog (SSG) — roda DEPOIS do `vite build`.
 *
 * Por que existe: o site é um SPA (Vite) cujo conteúdo dos posts vem do Supabase
 * no cliente. Crawlers de IA que NÃO executam JS (GPTBot/ClaudeBot/PerplexityBot)
 * veriam o blog vazio. Este script busca os posts publicados no Supabase e gera
 * um HTML estático por post (com o texto do artigo + JSON-LD BlogPosting embutidos)
 * em dist/blog/<slug>.html. O Cloudflare Pages serve esse arquivo direto
 * (antes do fallback SPA); quando o usuário (com JS) carrega, o React assume.
 *
 * É NÃO-FATAL: qualquer erro aqui só emite warning e sai com código 0, para nunca
 * quebrar o deploy. Usa as MESMAS libs de markdown do app (render idêntico).
 *
 * Requer no ambiente de build: VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { createClient } from "@supabase/supabase-js";

const SITE_URL = "https://aglabs.ia.br";
const DEFAULT_IMAGE =
  "https://udcsokdtdqqdnoqozbxh.supabase.co/storage/v1/object/public/heros-lp/aglabs/2.png";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = resolve(__dirname, "..", "dist");

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

/** Substitui (ou ignora se não existir) uma tag única no shell. */
function replaceTag(html, regex, replacement) {
  return regex.test(html) ? html.replace(regex, replacement) : html;
}

function buildPage(shell, post, articleHtml) {
  const url = `${SITE_URL}/blog/${post.slug}`;
  const pageTitle = `${post.title} | AG LABS Intelligence`;
  const image = post.cover || DEFAULT_IMAGE;

  let html = shell;
  html = replaceTag(html, /<title>[\s\S]*?<\/title>/, `<title>${esc(pageTitle)}</title>`);
  html = replaceTag(html, /<meta\s+name="description"[^>]*>/, `<meta name="description" content="${esc(post.excerpt)}" />`);
  html = replaceTag(html, /<link\s+rel="canonical"[^>]*>/, `<link rel="canonical" href="${url}" />`);
  html = replaceTag(html, /<meta\s+property="og:title"[^>]*>/, `<meta property="og:title" content="${esc(pageTitle)}" />`);
  html = replaceTag(html, /<meta\s+property="og:description"[^>]*>/, `<meta property="og:description" content="${esc(post.excerpt)}" />`);
  html = replaceTag(html, /<meta\s+property="og:image"[^>]*>/, `<meta property="og:image" content="${esc(image)}" />`);
  html = replaceTag(html, /<meta\s+property="og:type"[^>]*>/, `<meta property="og:type" content="article" />`);
  html = replaceTag(html, /<meta\s+name="twitter:title"[^>]*>/, `<meta name="twitter:title" content="${esc(pageTitle)}" />`);
  html = replaceTag(html, /<meta\s+name="twitter:description"[^>]*>/, `<meta name="twitter:description" content="${esc(post.excerpt)}" />`);
  html = replaceTag(html, /<meta\s+name="twitter:image"[^>]*>/, `<meta name="twitter:image" content="${esc(image)}" />`);

  const blogPosting = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    image: image,
    datePublished: post.created,
    dateModified: post.updated,
    author: { "@type": "Person", name: post.author },
    publisher: {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "AG LABS Intelligence",
      logo: { "@type": "ImageObject", url: `${SITE_URL}/android-chrome-512x512.png` },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    articleSection: post.category,
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
  const ld =
    `\n    <script type="application/ld+json">${JSON.stringify(blogPosting)}</script>` +
    `\n    <script type="application/ld+json">${JSON.stringify(breadcrumb)}</script>\n  `;
  html = html.replace("</head>", `${ld}</head>`);

  // Conteúdo legível por crawlers (substituído pelo React quando o JS carrega).
  const article =
    `<main><article>` +
    `<p>${esc(post.category)}</p>` +
    `<h1>${esc(post.title)}</h1>` +
    `<p>${esc(post.author)} · ${isoDate(post.created)} · ${post.readTime} min</p>` +
    `<p>${esc(post.excerpt)}</p>` +
    articleHtml +
    `</article></main>`;
  html = html.replace('<div id="root"></div>', `<div id="root">${article}</div>`);

  return html;
}

function buildSitemap(posts) {
  const today = new Date().toISOString().slice(0, 10);
  const urls = [
    { loc: `${SITE_URL}/`, lastmod: today, priority: "1.0" },
    { loc: `${SITE_URL}/blog`, lastmod: today, priority: "0.8" },
    ...posts.map((p) => ({
      loc: `${SITE_URL}/blog/${p.slug}`,
      lastmod: isoDate(p.updated || p.created),
      priority: "0.7",
    })),
  ];
  return (
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls
      .map(
        (u) =>
          `  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${u.lastmod}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`,
      )
      .join("\n") +
    `\n</urlset>\n`
  );
}

async function main() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) {
    console.warn("[prerender] VITE_SUPABASE_URL/ANON_KEY ausentes — prerender pulado (não-fatal).");
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const { data, error } = await supabase
    .from("blog_posts")
    .select("title,slug,excerpt,content,category,cover_image,author,created_at,updated_at,read_time")
    .eq("published", true);

  if (error) {
    console.warn("[prerender] Erro ao buscar posts no Supabase (não-fatal):", error.message);
    return;
  }
  const rows = data ?? [];

  let shell;
  try {
    shell = readFileSync(resolve(DIST, "index.html"), "utf8");
  } catch (e) {
    console.warn("[prerender] dist/index.html não encontrado (não-fatal):", e?.message ?? e);
    return;
  }

  let count = 0;
  for (const row of rows) {
    if (!row.slug) continue;
    const post = {
      title: row.title ?? "",
      slug: row.slug,
      excerpt: row.excerpt ?? "",
      content: row.content ?? "",
      category: row.category ?? "",
      cover: row.cover_image ?? "",
      author: row.author ?? "AG LABS",
      created: row.created_at,
      updated: row.updated_at ?? row.created_at,
      readTime: row.read_time ?? 5,
    };
    let articleHtml = "";
    try {
      articleHtml = renderToStaticMarkup(
        React.createElement(ReactMarkdown, { remarkPlugins: [remarkGfm] }, post.content),
      );
    } catch (e) {
      console.warn(`[prerender] Markdown falhou para "${post.slug}" (usando excerpt):`, e?.message ?? e);
      articleHtml = `<p>${esc(post.excerpt)}</p>`;
    }
    const page = buildPage(shell, post, articleHtml);
    // <slug>.html (e não <slug>/index.html): o Cloudflare Pages serve
    // /blog/<slug> direto, sem redirecionar para a versão com barra final,
    // que divergia da canônica e do sitemap.
    const dir = resolve(DIST, "blog");
    mkdirSync(dir, { recursive: true });
    writeFileSync(resolve(dir, `${post.slug}.html`), page, "utf8");
    count++;
  }

  try {
    writeFileSync(resolve(DIST, "sitemap.xml"), buildSitemap(rows), "utf8");
  } catch (e) {
    console.warn("[prerender] Falha ao escrever sitemap (não-fatal):", e?.message ?? e);
  }

  console.log(`[prerender] OK — ${count} post(s) pré-renderizado(s) + sitemap atualizado.`);
}

main().catch((e) => {
  // NUNCA quebrar o build por causa do prerender.
  console.warn("[prerender] Exceção não-fatal:", e?.message ?? e);
});
