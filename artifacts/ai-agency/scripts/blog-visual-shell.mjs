/** Finish SSG with the real React layout and blocking route CSS before paint. */
import { build } from "vite";
import { readFileSync, writeFileSync, readdirSync, rmSync } from "node:fs";
import { resolve, dirname, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = resolve(ROOT, "dist");
const SSR_DIR = resolve(ROOT, "dist-blog-ssr");
const marker = /<!--blog-root:start-->[\s\S]*?<!--blog-root:end-->/;
const seedPattern = /<script id="blog-seed" type="application\/json">([\s\S]*?)<\/script>/;
const styles = readdirSync(resolve(DIST, "assets"))
  .filter(name => /^blog-(?:post-)?[\w-]+\.css$/.test(name));
if (styles.length < 2) throw new Error("[blog-shell] CSS das rotas do blog ausente");
const css = styles.map(name => `<link rel="stylesheet" href="/assets/${name}"/>`).join("");

const result = await build({
  configFile: resolve(ROOT, "vite.config.ts"),
  logLevel: "warn",
  publicDir: false,
  ssr: { noExternal: true },
  build: {
    ssr: resolve(ROOT, "src/blog-shell.tsx"),
    outDir: SSR_DIR,
    emptyOutDir: true,
    rollupOptions: { output: { manualChunks: undefined } },
  },
});
const outputs = Array.isArray(result) ? result : [result];
const entry = outputs.flatMap(o => o.output).find(c => c.type === "chunk" && c.isEntry);
if (!entry) throw new Error("[blog-shell] build sem entrada SSR");
const { renderBlogShell } = await import(pathToFileURL(resolve(SSR_DIR, entry.fileName)).href);
const files = [resolve(DIST, "blog.html"), ...readdirSync(resolve(DIST, "blog"))
  .filter(name => name.endsWith(".html"))
  .map(name => resolve(DIST, "blog", name))];
for (const file of files) {
  let html = readFileSync(file, "utf8");
  const match = html.match(seedPattern);
  if (!match || !marker.test(html)) throw new Error(`[blog-shell] seed/marcador ausente: ${file}`);
  const seed = JSON.parse(match[1]);
  const shell = renderBlogShell(seed);
  const expected = seed.post ? "data-blog-article-content" : "journal-highlights";
  if (!shell.includes("<h1") || (!shell.includes(expected) && seed.list.length)) {
    throw new Error(`[blog-shell] layout incompleto: ${file}`);
  }
  html = html.replace(marker, () => `<div id="root" data-blog-shell="1">${shell}</div>`)
    .replace(/<style id="blog-first-paint">[\s\S]*?<\/style>/, "")
    .replace("</head>", `${css}</head>`);
  writeFileSync(file, html, "utf8");
}
// The temporary output is fixed within this workspace, never a caller path.
if (!SSR_DIR.startsWith(ROOT + sep) || SSR_DIR === ROOT) throw new Error("[blog-shell] diretório SSR inválido");
rmSync(SSR_DIR, { recursive: true, force: true });
console.log(`[blog-shell] ${files.length} páginas com layout completo e CSS no HTML inicial`);
