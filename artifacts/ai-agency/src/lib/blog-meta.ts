/**
 * Metadados editoriais do blog que moram no repositório (e não no Supabase):
 * pilar, produto do CTA, título/description de SEO e a capa gerada por
 * scripts/blog-cover.mjs. Mesmo arquivo usado pelo pré-render
 * (scripts/prerender-blog.mjs), para o HTML estático e o app dizerem o mesmo.
 * Guia: BLOG.md.
 */
import meta from "@/content/blog-meta.json";
import type { BlogPost } from "./blog-store";

export interface Product {
  name: string;
  url: string;
  cta: string;
  pitch: string;
}
export interface Pillar {
  name: string;
  variant: string;
  product: Product;
}
interface PostMeta {
  pillar: string;
  product?: string;
  kicker: string;
  cover: string;
  seoTitle?: string;
  description?: string;
  variant?: string;
  /** Foto do post baixada por scripts/blog-images.mjs (servida pelo site). */
  photo?: { source: string; position?: string; credit?: string };
}

const PILLARS = meta.pillars as Record<string, Pillar>;
const PRODUCTS = meta.products as Record<string, Product>;
const POSTS = meta.posts as Record<string, PostMeta>;

/** Título e description do índice /blog. */
export const blogInfo = meta.blog;

export const pillarIds = Object.keys(PILLARS);
export const pillarName = (id: string) => PILLARS[id]?.name ?? id;

/** Pilar de posts ainda sem entrada no JSON, deduzido da categoria do Supabase. */
function pillarFromCategory(category: string): string {
  const c = category.toLowerCase();
  if (c.includes("site")) return "sites";
  if (c.includes("conversacional") || c.includes("atendimento")) return "atendimento";
  if (c.includes("automa")) return "automacao";
  if (c.includes("desenvolv") || c.includes("marketing")) return "criar-com-ia";
  return "estrategia";
}

export function postPillar(post: Pick<BlogPost, "slug" | "category">): string {
  return POSTS[post.slug]?.pillar ?? pillarFromCategory(post.category ?? "");
}

export function postProduct(post: Pick<BlogPost, "slug" | "category">): Product {
  const m = POSTS[post.slug];
  if (m?.product && PRODUCTS[m.product]) return PRODUCTS[m.product];
  return PILLARS[postPillar(post)].product;
}

/** Título do <title>/og:title: o de SEO (≤ 60) quando existe, com a marca se couber. */
export function seoTitle(post: Pick<BlogPost, "slug" | "title">): string {
  const base = POSTS[post.slug]?.seoTitle ?? post.title;
  const branded = `${base} | AG LABS`;
  return branded.length <= 60 ? branded : base;
}

export function seoDescription(post: Pick<BlogPost, "slug" | "excerpt">): string {
  return POSTS[post.slug]?.description ?? post.excerpt;
}

export interface PostImage {
  src: string;
  /** Presente nas imagens servidas pelo site (600 e 1200 de largura). */
  srcSet?: string;
  width?: number;
  height?: number;
}

/**
 * Imagem mostrada na página (cards, topo do post, "Leia também"): a foto do
 * post em WebP servida pelo site (scripts/blog-images.mjs); se ela ainda não
 * foi gerada, a URL original do Supabase; sem nenhuma das duas, a capa gerada
 * (scripts/blog-cover.mjs) como reserva.
 */
export function postImage(post: Pick<BlogPost, "slug" | "coverImage">): PostImage | null {
  if (POSTS[post.slug]?.photo) {
    const base = `/img/blog/${post.slug}`;
    return { src: `${base}-1200.webp`, srcSet: `${base}-600.webp 600w, ${base}-1200.webp 1200w`, width: 1200, height: 630 };
  }
  if (post.coverImage) return { src: post.coverImage };
  if (POSTS[post.slug]) return { src: `/img/blog/og/${post.slug}.webp`, width: 1200, height: 630 };
  return null;
}

export interface OgImage {
  url: string;
  width?: number;
  height?: number;
}

/**
 * Imagem de compartilhamento (og:image, twitter:image): a capa gerada com o
 * título, 1200×630, que só aparece na prévia do link — nunca na página.
 * Sem capa gerada, cai para a imagem original.
 */
export function postOgImage(post: Pick<BlogPost, "slug" | "coverImage">): OgImage | null {
  if (POSTS[post.slug]) {
    return { url: `https://aglabs.ia.br/img/blog/og/${post.slug}.jpg`, width: 1200, height: 630 };
  }
  return post.coverImage ? { url: post.coverImage } : null;
}

/**
 * "Leia também": os `n` posts seguintes do mesmo pilar, em roda, na ordem
 * recebida (a lista vem do mais novo para o mais antigo). Em roda para que
 * cada post receba links de outros, e não só os mais recentes. Completa com
 * outros pilares se o pilar tiver poucos posts. Mesma regra do pré-render.
 */
export function relatedPosts<T extends Pick<BlogPost, "slug" | "category">>(post: T, all: T[], n = 3): T[] {
  const pillar = postPillar(post);
  const same = all.filter((p) => postPillar(p) === pillar);
  const i = same.findIndex((p) => p.slug === post.slug);
  const ring = i < 0 ? same : [...same.slice(i + 1), ...same.slice(0, i)];
  const rest = all.filter((p) => p.slug !== post.slug && postPillar(p) !== pillar);
  return [...ring, ...rest].slice(0, n);
}

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

/**
 * Vários posts começam o markdown com "# <título>", repetindo o título da
 * página num segundo <h1>. Remove esse primeiro heading quando ele é o próprio
 * título. Mesma regra do pré-render.
 */
export function stripLeadingTitle(content: string, title: string): string {
  const m = content.match(/^\s*#\s+(.+)\n?/);
  return m && norm(m[1]) === norm(title) ? content.slice(m[0].length) : content;
}
