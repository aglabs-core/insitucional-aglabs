/**
 * Imagens dos posts servidas pelo próprio site.
 *
 * Baixa a imagem original de cada post (a `cover_image` do Supabase, que hoje
 * aponta para Unsplash, Pexels ou o storage do Supabase) e gera, com sharp, os
 * WebP no tamanho de exibição, recortados em 1200×630 pelo centro, como o
 * object-cover já fazia na página (para outro recorte, grave `photo.position`
 * no blog-meta.json: "top", "bottom", "left", "right" ou "attention"):
 *   public/img/blog/<slug>-1200.webp   topo do post, destaque do índice
 *   public/img/blog/<slug>-600.webp    cards e "Leia também"
 * Depois grava em src/content/blog-meta.json, no post, `photo.source` (a URL
 * baixada). É esse campo que faz o app e o pré-render usarem a imagem local;
 * sem ele, a página continua com a URL original. Nada muda no Supabase.
 *
 * De onde vem a URL original, nesta ordem:
 *   1. --url <endereço> (com um único --slug): foto escolhida à mão;
 *   2. `photo.source` já gravado no blog-meta.json;
 *   3. Supabase, se VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY estiverem no ambiente;
 *   4. a página publicada (https://aglabs.ia.br/blog/<slug>), no JSON-LD do post.
 *
 * Uso (dentro de artifacts/ai-agency):
 *   node scripts/blog-images.mjs                  # posts do blog-meta.json sem imagem local
 *   node scripts/blog-images.mjs --slug a,b       # só esses (sempre regera)
 *   node scripts/blog-images.mjs --force          # regera todos
 *   node scripts/blog-images.mjs --slug x --url https://images.pexels.com/photos/...  # troca a foto
 * Opcional: --credit "Nome — Pexels" grava o crédito junto da fonte.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const META_PATH = resolve(ROOT, "src/content/blog-meta.json");
const OUT = resolve(ROOT, "public/img/blog");
const SITE_URL = "https://aglabs.ia.br";
const SIZES = [
  { suffix: "1200", width: 1200, height: 630, quality: 78, maxBytes: 120 * 1024 },
  { suffix: "600", width: 600, height: 315, quality: 74, maxBytes: 40 * 1024 },
];

/**
 * Pede ao CDN uma versão maior que a de exibição (1600 px), sem o recorte da
 * URL original, para o WebP de 1200 não sair ampliado. Outros hosts: como estão.
 */
export function downloadUrl(source) {
  let u;
  try {
    u = new URL(source);
  } catch {
    return source;
  }
  if (u.hostname === "images.unsplash.com") {
    for (const k of ["h", "fit", "crop"]) u.searchParams.delete(k);
    u.searchParams.set("w", "1600");
    u.searchParams.set("q", "85");
    u.searchParams.set("fm", "jpg");
  } else if (u.hostname === "images.pexels.com") {
    for (const k of ["h", "dpr", "fit"]) u.searchParams.delete(k);
    u.searchParams.set("auto", "compress");
    u.searchParams.set("cs", "tinysrgb");
    u.searchParams.set("w", "1600");
  }
  return u.toString();
}

async function sourcesFromSupabase() {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  const { createClient } = await import("@supabase/supabase-js");
  const { data, error } = await createClient(url, key).from("blog_posts").select("slug,cover_image");
  if (error) {
    console.warn("[blog-images] Supabase:", error.message);
    return null;
  }
  return Object.fromEntries((data ?? []).filter((r) => r.cover_image).map((r) => [r.slug, r.cover_image]));
}

/** Primeira imagem do BlogPosting na página publicada que não seja do próprio site. */
async function sourceFromSite(slug) {
  const res = await fetch(`${SITE_URL}/blog/${slug}`);
  if (!res.ok) return null;
  const html = await res.text();
  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try {
      const ld = JSON.parse(m[1]);
      if (ld["@type"] !== "BlogPosting") continue;
      const list = (Array.isArray(ld.image) ? ld.image : [ld.image]).map((i) => (typeof i === "string" ? i : i?.url));
      return list.find((u) => u && !u.startsWith(`${SITE_URL}/img/blog/`)) ?? null;
    } catch {
      /* JSON-LD inválido: ignora */
    }
  }
  return null;
}

async function render(slug, source, position = "centre") {
  const res = await fetch(downloadUrl(source), { headers: { "User-Agent": "Mozilla/5.0 (AG LABS blog-images)" } });
  if (!res.ok) throw new Error(`download ${res.status} ${source}`);
  const input = Buffer.from(await res.arrayBuffer());
  const meta = await sharp(input).metadata();
  const out = [];
  for (const s of SIZES) {
    const file = join(OUT, `${slug}-${s.suffix}.webp`);
    const pipeline = sharp(input)
      .rotate()
      .resize(s.width, s.height, {
        fit: "cover",
        position: position === "attention" ? sharp.strategy.attention : position,
      });
    // Foto com muito detalhe pesa mais: baixa a qualidade até caber no teto.
    for (const quality of [s.quality, s.quality - 8, s.quality - 16]) {
      await pipeline.clone().webp({ quality, effort: 6 }).toFile(file);
      if (statSync(file).size <= s.maxBytes) break;
    }
    out.push(`${s.suffix}: ${Math.round(statSync(file).size / 1024)} KB`);
  }
  const warn = meta.width < 1200 ? ` (original com ${meta.width}px: ampliada)` : "";
  console.log(`[blog-images] ${slug} ← ${meta.width}×${meta.height} · ${out.join(" · ")}${warn}`);
}

async function main() {
  const args = process.argv.slice(2);
  const arg = (name) => {
    const i = args.indexOf(name);
    return i >= 0 ? args[i + 1] : undefined;
  };
  const meta = JSON.parse(readFileSync(META_PATH, "utf8"));
  const only = arg("--slug")?.split(",").map((s) => s.trim()).filter(Boolean);
  const manualUrl = arg("--url");
  const credit = arg("--credit");
  if (manualUrl && only?.length !== 1) throw new Error("--url precisa de exatamente um --slug");

  const slugs = only ?? Object.keys(meta.posts);
  for (const s of slugs) if (!meta.posts[s]) throw new Error(`Post sem entrada em blog-meta.json: ${s}`);
  const hasLocal = (s) => SIZES.every((z) => existsSync(join(OUT, `${s}-${z.suffix}.webp`)));
  const todo = slugs.filter((s) => only || args.includes("--force") || !meta.posts[s].photo || !hasLocal(s));
  if (!todo.length) {
    console.log("[blog-images] nada a gerar (use --force para regerar).");
    return;
  }

  mkdirSync(OUT, { recursive: true });
  const supa = todo.some((s) => !meta.posts[s].photo?.source) && !manualUrl ? await sourcesFromSupabase() : null;
  let failed = 0;
  for (const slug of todo) {
    const post = meta.posts[slug];
    const source = manualUrl ?? post.photo?.source ?? supa?.[slug] ?? (await sourceFromSite(slug));
    if (!source) {
      console.warn(`[blog-images] ${slug}: sem imagem original (use --url para escolher uma).`);
      failed++;
      continue;
    }
    try {
      const same = post.photo?.source === source;
      await render(slug, source, same ? post.photo?.position : undefined);
      post.photo = {
        source,
        ...(same && post.photo?.position ? { position: post.photo.position } : {}),
        ...(credit ? { credit } : same && post.photo?.credit ? { credit: post.photo.credit } : {}),
      };
    } catch (e) {
      console.warn(`[blog-images] ${slug}: ${e?.message ?? e}`);
      failed++;
    }
  }
  writeFileSync(META_PATH, JSON.stringify(meta, null, 2) + "\n");
  if (failed) {
    console.error(`[blog-images] ${failed} post(s) sem imagem local; a página usa a URL original.`);
    process.exitCode = 1;
  }
}

main().catch((e) => {
  console.error("[blog-images]", e?.message ?? e);
  process.exit(1);
});
