import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { build } from "vite";

test("blog and articles deliver the actual layout and sanitized readable content before JS", async t => {
  const root = fileURLToPath(new URL("../", import.meta.url));
  const outDir = await mkdtemp(join(tmpdir(), "ag-blog-shell-"));
  t.after(() => rm(outDir, { recursive: true, force: true }));
  const result = await build({
    configFile: resolve(root, "vite.config.ts"),
    logLevel: "silent", publicDir: false, ssr: { noExternal: true },
    build: { ssr: resolve(root, "src/blog-shell.tsx"), outDir, emptyOutDir: true,
      rollupOptions: { output: { manualChunks: undefined, entryFileNames: "[name].mjs" } } },
  });
  const entry = (Array.isArray(result) ? result : [result]).flatMap(o => o.output)
    .find(o => o.type === "chunk" && o.isEntry);
  const { renderBlogShell } = await import(pathToFileURL(join(outDir, entry.fileName)).href);
  const posts = Array.from({ length: 7 }, (_, i) => ({
    id: `post-${i}`, slug: `artigo-${i}`, title: `Título ${i}`, excerpt: "Resumo legível",
    published: true, category: "sites", created_at: "2026-11-17T12:00:00Z", read_time: 5,
  }));
  const index = renderBlogShell({ list: posts });
  assert.match(index, /class="journal-header"/);
  assert.match(index, /class="journal-highlights"/);
  assert.match(index, /class="journal-video-grid"/);
  assert.doesNotMatch(index, /blog-static-shell/);
  // The three slides and the two side stories must be separate editorial slots.
  assert.match(index, /Manchete 3: Título 2/);
  assert.match(index, /aria-label="Título 3"/);
  assert.match(index, /aria-label="Título 4"/);
  assert.match(index, /aria-label="Próxima manchete"[^>]*><svg/);
  const post = { ...posts[0], content: '<h2>Texto pronto</h2><p>Conteúdo <strong>legível</strong>.</p><script>alert(1)</script><a href="javascript:alert(1)">link</a><img src="x" onerror="alert(2)">' };
  const article = renderBlogShell({ list: posts, post });
  assert.match(article, /data-blog-article-content/);
  assert.match(article, /<h2[^>]*>Texto pronto<\/h2>/);
  assert.match(article, /<strong[^>]*>legível<\/strong>/);
  assert.match(article, /journal-article/);
  assert.doesNotMatch(article, /<script|javascript:|onerror=|&lt;h2/);
  const markdown = renderBlogShell({ list: posts, post: { ...posts[0], content: '## Em Markdown\n\nTexto **formatado**.' } });
  assert.match(markdown, /<h2[^>]*>Em Markdown<\/h2>/);
  assert.match(markdown, /<strong[^>]*>formatado<\/strong>/);
});
