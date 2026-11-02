import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
const root = new URL("../", import.meta.url);
for (const file of readdirSync(new URL("src/", root), { recursive: true }).filter(f => /\.(tsx?|json)$/.test(f))) {
  test(`copy pública factual: ${file}`, () => {
    const text = readFileSync(new URL(`src/${file}`, root), "utf8");
    assert.equal(/não erra|sem falhas, sem limites|criptografia ponta a ponta|conformidade\s+(?:com\s+)?(?:a\s+)?LGPD e padrões enterprise/i.test(text), false, file);
    assert.equal(/https?:\/\/(?:www\.)?aglabs\.com\.br\/automacoes\b/i.test(text), false, file);
  });
}

// Os corpos dos posts são dados do Supabase, não arquivos deste repositório.
// Exporte blog_posts publicados para BLOG_FIXTURE ao revisar/editar os dados.
if (process.env.BLOG_FIXTURE) {
  const posts = JSON.parse(readFileSync(process.env.BLOG_FIXTURE, "utf8"));
  assert.ok(posts.length > 0, "snapshot de posts vazio");
  for (const post of posts.filter(p => p.published)) {
    test(`destinos no conteúdo publicado: ${post.slug}`, () => {
      assert.equal(/\baglabs\.com\.br\b/i.test(post.content ?? ""), false, post.slug);
      assert.equal(/wa\.me\/556493259857\b/.test(post.content ?? ""), false, post.slug);
    });
  }
}
