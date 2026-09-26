/**
 * Topo da home no HTML — roda por último no build.
 *
 * O site é um SPA: sem isto, "/" chega com o #root vazio e nada aparece até o
 * JavaScript rodar. Aqui o topo (HomeHero) é renderizado com
 * renderToStaticMarkup e gravado no dist/index.html. As outras rotas do app
 * recebem uma cópia do HTML vazio (<rota>.html, que o Cloudflare Pages serve
 * sem a extensão) para não mostrarem o topo da home antes de montar.
 *
 * Roda depois do prerender-blog, que usa o dist/index.html vazio como base.
 */
import { build } from "vite";
import { readFileSync, writeFileSync, existsSync, rmSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const DIST = resolve(ROOT, "dist");
const SSR_DIR = resolve(ROOT, "dist-ssr");
const APP_ROUTES = ["blog", "politica-de-privacidade", "termos-de-uso", "admin"];
const EMPTY_ROOT = '<div id="root"></div>';

const result = await build({
  configFile: resolve(ROOT, "vite.config.ts"),
  logLevel: "warn",
  publicDir: false,
  // Tudo no mesmo bundle: com parte das dependências externa, o React do
  // react-dom/server e o dos componentes viram duas cópias e os hooks quebram.
  ssr: { noExternal: true },
  build: {
    ssr: resolve(ROOT, "src/home-shell.tsx"),
    outDir: SSR_DIR,
    emptyOutDir: true,
    rollupOptions: { output: { manualChunks: undefined } },
  },
});
const outputs = Array.isArray(result) ? result : [result];
const entry = outputs.flatMap((o) => o.output).find((c) => c.type === "chunk" && c.isEntry);
if (!entry) throw new Error("[home-shell] build sem arquivo de entrada");

const { renderHomeShell } = await import(pathToFileURL(resolve(SSR_DIR, entry.fileName)).href);
const shell = renderHomeShell();
if (!shell.includes("<h1")) throw new Error("[home-shell] topo sem <h1>");

const indexPath = resolve(DIST, "index.html");
const index = readFileSync(indexPath, "utf8");
if (!index.includes(EMPTY_ROOT)) throw new Error(`[home-shell] index.html sem ${EMPTY_ROOT}`);

for (const route of APP_ROUTES) {
  const file = resolve(DIST, `${route}.html`);
  if (!existsSync(file)) writeFileSync(file, index, "utf8");
}
writeFileSync(
  indexPath,
  index.replace(EMPTY_ROOT, () => `<div id="root" data-home-shell="1">${shell}</div>`),
  "utf8",
);
rmSync(SSR_DIR, { recursive: true, force: true });
console.log("[home-shell] topo da home gravado no index.html");
