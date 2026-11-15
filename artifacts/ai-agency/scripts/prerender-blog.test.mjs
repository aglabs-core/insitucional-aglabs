import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, copyFile, writeFile, readFile, symlink, rm, readdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { createServer } from 'node:http';

const exec = promisify(execFile);
const source = new URL('../', import.meta.url);
const shell = '<html><head><title>Shell</title></head><body><div id="root"></div></body></html>';
const post = { slug: 'prova-blog', title: 'Prova editorial', content: 'Texto **renderizado**.', category: 'sites', excerpt: 'Resumo', created_at: '2026-11-15T12:00:00Z' };

async function sandbox(t, { rows = [post], html = shell } = {}) {
  const root = await mkdtemp(join(tmpdir(), 'prerender-review-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  for (const dir of ['scripts', 'src/content', 'dist']) await mkdir(join(root, dir), { recursive: true });
  await copyFile(new URL('scripts/prerender-blog.mjs', source), join(root, 'scripts/prerender-blog.mjs'));
  for (const name of ['blog-meta.json', 'post-html-schema.json']) {
    await copyFile(new URL(`src/content/${name}`, source), join(root, 'src/content', name));
  }
  await symlink(new URL('node_modules', source).pathname, join(root, 'node_modules'), 'dir');
  await writeFile(join(root, 'rows.json'), JSON.stringify(rows));
  if (html !== null) await writeFile(join(root, 'dist/index.html'), html);
  return root;
}

async function run(root, overrides = {}) {
  const env = { ...process.env };
  for (const name of ['BLOG_FIXTURE', 'BLOG_ALLOW_EMPTY', 'VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY']) delete env[name];
  Object.assign(env, { BLOG_FIXTURE: join(root, 'rows.json') }, overrides);
  for (const name of Object.keys(env)) if (env[name] === undefined) delete env[name];
  try {
    const result = await exec(process.execPath, [join(root, 'scripts/prerender-blog.mjs')], { env, timeout: 15000 });
    return { code: 0, ...result };
  } catch (error) {
    if (error.killed || typeof error.code !== 'number') throw error;
    return { code: error.code, stdout: error.stdout, stderr: error.stderr };
  }
}

async function cms(t, status, body) {
  const requests = [];
  const server = createServer((req, res) => {
    requests.push(req.url);
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(body));
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  return { url: `http://127.0.0.1:${server.address().port}`, requests };
}

test('fixture válida gera artigo, índice, RSS e sitemap reais', async t => {
  const root = await sandbox(t);
  assert.equal((await run(root)).code, 0);
  const article = await readFile(join(root, 'dist/blog/prova-blog.html'), 'utf8');
  assert.match(article, /<h1>Prova editorial<\/h1>/);
  assert.match(article, /<strong>renderizado<\/strong>/);
  assert.match(article, /rel="canonical" href="https:\/\/aglabs.ia.br\/blog\/prova-blog"/);
  assert.match(article, /BlogPosting/);
  for (const name of ['blog.html', 'sitemap.xml', 'blog/rss.xml']) {
    assert.match(await readFile(join(root, 'dist', name), 'utf8'), /prova-blog/);
  }
});

test('env ausente falha sem gerar artefatos de blog', async t => {
  const root = await sandbox(t);
  const result = await run(root, { BLOG_FIXTURE: undefined });
  assert.equal(result.code, 1);
  assert.match(result.stderr, /URL\/ANON_KEY ausentes/);
  assert.deepEqual(await readdir(join(root, 'dist')), ['index.html']);
});

test('erro CMS não é aceito nem com autorização de vazio', async t => {
  const root = await sandbox(t);
  const stub = await cms(t, 403, { message: 'consulta negada', code: '42501' });
  const result = await run(root, { BLOG_FIXTURE: undefined, VITE_SUPABASE_URL: stub.url, VITE_SUPABASE_ANON_KEY: 'local-test-only', BLOG_ALLOW_EMPTY: '1' });
  assert.equal(result.code, 1);
  assert.match(result.stderr, /Erro ao buscar posts/);
  assert.equal(stub.requests.length, 1);
  assert.match(stub.requests[0], /published=eq.true/);
});

test('consulta 200 vazia exige decisão explícita e gera sitemap válido quando autorizada', async t => {
  const root = await sandbox(t);
  const stub = await cms(t, 200, []);
  const env = { BLOG_FIXTURE: undefined, VITE_SUPABASE_URL: stub.url, VITE_SUPABASE_ANON_KEY: 'local-test-only' };
  const denied = await run(root, env);
  assert.equal(denied.code, 1);
  assert.match(denied.stderr, /BLOG_ALLOW_EMPTY=1/);
  assert.equal((await run(root, { ...env, BLOG_ALLOW_EMPTY: '1' })).code, 0);
  const sitemap = await readFile(join(root, 'dist/sitemap.xml'), 'utf8');
  assert.doesNotMatch(sitemap, /0000-00-00/);
  assert.equal((sitemap.match(/<url>/g) ?? []).length, 2);
  assert.match(await readFile(join(root, 'dist/blog.html'), 'utf8'), /<h1>Blog da AG LABS<\/h1>/);
  assert.doesNotMatch(await readFile(join(root, 'dist/blog/rss.xml'), 'utf8'), /<item>/);
});

test('resposta nula ou malformada não vira blog vazio', async t => {
  for (const rows of [null, {}, 'inválido']) {
    const root = await sandbox(t, { rows });
    const result = await run(root, { BLOG_ALLOW_EMPTY: '1' });
    assert.equal(result.code, 1);
    assert.match(result.stderr, /Resposta de posts inválida/);
  }
});

test('shell ausente ou sem marcadores impede sucesso silencioso', async t => {
  for (const html of [null, '<html><head></head><body>sem root</body></html>', '<div id="root"></div>']) {
    const root = await sandbox(t, { html });
    assert.equal((await run(root)).code, 1);
  }
});

test('linha sem slug ou com caminho inválido não é descartada silenciosamente', async t => {
  for (const slug of [undefined, '', '../escape', 'barra/final', 'MAIUSCULO']) {
    const root = await sandbox(t, { rows: [{ ...post, slug }] });
    const result = await run(root);
    assert.equal(result.code, 1);
    assert.match(result.stderr, /Post sem slug válido/);
  }
});
