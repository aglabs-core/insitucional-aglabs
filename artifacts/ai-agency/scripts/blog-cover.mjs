/**
 * Gerador de capas do blog (1200×630).
 *
 * Lê src/content/blog-meta.json (pilar, kicker e título de capa de cada post) e
 * renderiza cada capa em HTML no Chrome instalado na máquina (puppeteer-core,
 * sem baixar navegador). Saídas, em public/img/blog/:
 *   og/<slug>.jpg     1200×630, ≤ 300 KB — og:image / twitter:image / JSON-LD
 *   og/<slug>.webp    1200×630 — reserva na página para post sem foto
 * A foto que aparece na página é outra: ver scripts/blog-images.mjs.
 *
 * Uso (dentro de artifacts/ai-agency):
 *   node scripts/blog-cover.mjs                 # gera só as capas que faltam
 *   node scripts/blog-cover.mjs --force         # regera todas
 *   node scripts/blog-cover.mjs --slug a,b      # só esses posts (sempre regera)
 *   node scripts/blog-cover.mjs --html out/     # também grava o HTML de cada capa (depuração)
 * Chrome: detectado nos caminhos padrão; para outro, defina CHROME_PATH.
 *
 * Três variações, tiradas dos formatos de carrossel que funcionaram no Instagram
 * (a variação vem do pilar; um post pode forçar outra com "variant"):
 *   news  — news card preto (F09): fundo preto, destaque azul da marca.
 *   bone  — bone + laranja (F12): fundo osso, faixa e destaque laranja.
 *   ambar — preto + âmbar (F14): fundo preto, título serifado, destaque âmbar.
 * No título de capa, o trecho entre *asteriscos* recebe a cor de destaque.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const META = JSON.parse(readFileSync(resolve(ROOT, "src/content/blog-meta.json"), "utf8"));
const OUT = resolve(ROOT, "public/img/blog");
const OG_MAX_BYTES = 300 * 1024;

/* Tokens das capas — um lugar só. Valores alinhados à identidade da AG LABS
   (preto #050505 e azul do site) e às paletas dos formatos de carrossel. */
export const TOKENS = {
  news: { bg: "#070707", ink: "#F5F5F2", muted: "#8A8A86", accent: "#3B82F6", rule: "#1F1F1F", chip: "#101826" },
  bone: { bg: "#EDE8DE", ink: "#111111", muted: "#6B665D", accent: "#FF5A1F", rule: "#D6CFC2", chip: "#111111" },
  ambar: { bg: "#0B0A08", ink: "#F3EEE4", muted: "#8C8578", accent: "#F2A93B", rule: "#26221B", chip: "#1C1710" },
};

const FONTS =
  "https://fonts.googleapis.com/css2?family=Poppins:wght@600;700;800&family=Inter:wght@500;600;700&family=Fraunces:ital,opsz,wght@0,9..144,600;1,9..144,600&display=block";

const esc = (s = "") => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const accentize = (s) => esc(s).replace(/\*([^*]+)\*/g, '<em class="hl">$1</em>');

export function coverHtml({ cover, kicker, pillarName, variant }) {
  const t = TOKENS[variant] ?? TOKENS.news;
  const serif = variant === "ambar";
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">
<link rel="stylesheet" href="${FONTS}">
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  html,body{width:1200px;height:630px;overflow:hidden;background:${t.bg}}
  body{color:${t.ink};font-family:Inter,system-ui,sans-serif;-webkit-font-smoothing:antialiased}
  .c{position:relative;width:1200px;height:630px;padding:56px 72px 52px;display:flex;flex-direction:column}
  .top{display:flex;align-items:center;justify-content:space-between;font:600 17px/1 Inter,sans-serif;letter-spacing:.18em;text-transform:uppercase}
  .brand{display:flex;align-items:center;gap:12px;font:800 22px/1 Poppins,sans-serif;letter-spacing:.14em}
  .brand i{display:block;width:14px;height:14px;background:${t.accent}}
  .pillar{color:${t.muted}}
  .mid{flex:1;display:flex;flex-direction:column;justify-content:center;max-width:1000px}
  .kicker{display:inline-flex;align-self:flex-start;align-items:center;gap:10px;margin-bottom:26px;font:700 18px/1 Inter,sans-serif;letter-spacing:.2em;text-transform:uppercase;color:${t.accent}}
  .kicker:before{content:"";width:34px;height:3px;background:${t.accent}}
  h1{font-family:${serif ? "Fraunces,Georgia,serif" : "Poppins,sans-serif"};font-weight:${serif ? 600 : 800};font-size:78px;line-height:${serif ? 1.04 : 1.02};letter-spacing:${serif ? "-.015em" : "-.03em"};max-height:330px;overflow:hidden;text-wrap:balance}
  .hl{font-style:${serif ? "italic" : "normal"};color:${t.accent}}
  .bot{display:flex;align-items:center;justify-content:space-between;padding-top:22px;border-top:2px solid ${t.rule};font:600 18px/1 Inter,sans-serif;color:${t.muted};letter-spacing:.04em}
  .bot b{color:${t.ink};font-weight:700}
  /* bone: faixa lateral laranja, como no formato de carrossel */
  .bone .c{padding-left:96px}
  .bone .bar{position:absolute;left:0;top:0;bottom:0;width:24px;background:${t.accent}}
  .bone .hl{color:${t.ink};background:linear-gradient(transparent 62%, ${t.accent}66 62%)}
  /* news: grade sutil de fundo */
  .news .grid{position:absolute;inset:0;background-image:linear-gradient(${t.rule} 1px,transparent 1px),linear-gradient(90deg,${t.rule} 1px,transparent 1px);background-size:60px 60px;opacity:.55;mask-image:linear-gradient(90deg,transparent 35%,#000)}
  /* ambar: brilho quente no canto */
  .ambar .glow{position:absolute;right:-220px;top:-260px;width:720px;height:720px;border-radius:50%;background:radial-gradient(circle,${t.accent}33,transparent 65%)}
</style></head>
<body class="${variant}"><div class="bar"></div><div class="grid"></div><div class="glow"></div>
<div class="c">
  <div class="top"><div class="brand"><i></i>AG LABS</div><div class="pillar">${esc(pillarName)}</div></div>
  <div class="mid"><div class="kicker">${esc(kicker)}</div><h1 id="t">${accentize(cover)}</h1></div>
  <div class="bot"><span><b>Blog</b> · aglabs.ia.br/blog</span><span>IA e automação para negócios</span></div>
</div>
<script>
  // Ajusta o corpo do título até caber em no máximo 3 linhas.
  window.fit = () => {
    const h = document.getElementById("t");
    let size = 78;
    const lines = () => Math.round(h.scrollHeight / (parseFloat(getComputedStyle(h).lineHeight)));
    while ((lines() > 3 || h.scrollWidth > h.clientWidth) && size > 44) { size -= 2; h.style.fontSize = size + "px"; }
    return size;
  };
</script></body></html>`;
}

function findChrome() {
  const candidates = [
    process.env.CHROME_PATH,
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
  ].filter(Boolean);
  const found = candidates.find((p) => existsSync(p));
  if (!found) throw new Error("Chrome não encontrado. Defina CHROME_PATH com o caminho do executável.");
  return found;
}

export function postCoverInput(slug) {
  const post = META.posts[slug];
  if (!post) throw new Error(`Post sem entrada em blog-meta.json: ${slug}`);
  const pillar = META.pillars[post.pillar];
  if (!pillar) throw new Error(`Pilar desconhecido "${post.pillar}" em ${slug}`);
  return { cover: post.cover, kicker: post.kicker, pillarName: pillar.name, variant: post.variant ?? pillar.variant };
}

async function main() {
  const args = process.argv.slice(2);
  const arg = (name) => {
    const i = args.indexOf(name);
    return i >= 0 ? args[i + 1] : undefined;
  };
  const force = args.includes("--force");
  const only = arg("--slug")?.split(",").map((s) => s.trim()).filter(Boolean);
  const htmlDir = arg("--html");
  const slugs = only ?? Object.keys(META.posts);
  const todo = slugs.filter(
    (s) => only || force || !existsSync(join(OUT, "og", `${s}.webp`)) || !existsSync(join(OUT, "og", `${s}.jpg`)),
  );
  if (todo.length === 0) {
    console.log("[blog-cover] nada a gerar (use --force para regerar).");
    return;
  }
  mkdirSync(join(OUT, "og"), { recursive: true });
  if (htmlDir) mkdirSync(htmlDir, { recursive: true });

  const browser = await puppeteer.launch({ executablePath: findChrome(), headless: true, args: ["--hide-scrollbars"] });
  try {
    const page = await browser.newPage();
    for (const slug of todo) {
      const html = coverHtml(postCoverInput(slug));
      if (htmlDir) writeFileSync(join(htmlDir, `${slug}.html`), html);

      await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 });
      await page.setContent(html, { waitUntil: "load", timeout: 60000 });
      await page.evaluate(() => document.fonts.ready);
      const size = await page.evaluate(() => window.fit());
      await page.screenshot({ path: join(OUT, "og", `${slug}.webp`), type: "webp", quality: 82 });

      // og:image em JPEG, reduzindo a qualidade até caber em 300 KB.
      const ogPath = join(OUT, "og", `${slug}.jpg`);
      for (const quality of [86, 80, 72, 64]) {
        await page.screenshot({ path: ogPath, type: "jpeg", quality });
        if (statSync(ogPath).size <= OG_MAX_BYTES) break;
      }

      const kb = (p) => Math.round(statSync(p).size / 1024);
      console.log(`[blog-cover] ${slug} (título ${size}px) webp ${kb(join(OUT, "og", `${slug}.webp`))} KB · og ${kb(ogPath)} KB`);
    }
  } finally {
    await browser.close();
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((e) => {
    console.error("[blog-cover]", e?.message ?? e);
    process.exit(1);
  });
}
