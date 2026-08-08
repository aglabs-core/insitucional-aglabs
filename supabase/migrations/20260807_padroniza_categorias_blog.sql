-- Padroniza as categorias do blog.
--
-- As categorias foram cadastradas em dois formatos, provavelmente em épocas
-- diferentes: quatro em slug minúsculo (automacao, ia-conversacional,
-- desenvolvimento, sites) e quatro em nome próprio. Duas delas eram o mesmo
-- assunto dividido em dois chips, cada um filtrando só parte dos posts —
-- quem clicava em "Automação" não via os artigos marcados como "automacao".
--
-- Depois disto: Automação (10), Inteligência Artificial (10), Estratégia (5),
-- Sites (2), Desenvolvimento (2), Marketing (1). Seis categorias, e os chips
-- passam a caber numa linha só no desktop.
--
-- Idempotente: rodar de novo não muda nada.

UPDATE blog_posts SET category = 'Automação'               WHERE category = 'automacao';
UPDATE blog_posts SET category = 'Inteligência Artificial' WHERE category = 'ia-conversacional';
UPDATE blog_posts SET category = 'Desenvolvimento'         WHERE category = 'desenvolvimento';
UPDATE blog_posts SET category = 'Sites'                   WHERE category = 'sites';

-- Confere o resultado:
-- SELECT category, count(*) FROM blog_posts GROUP BY category ORDER BY category;
