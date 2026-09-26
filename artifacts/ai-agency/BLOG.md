# Guia editorial do blog da AG LABS

Regras para pautar, escrever, ilustrar e publicar posts em https://aglabs.ia.br/blog.

O texto dos posts fica no Supabase (tabela `blog_posts`, editada pelo `/admin`). O que é
editorial e precisa ser revisado em PR fica no repositório, em
[`src/content/blog-meta.json`](src/content/blog-meta.json): pilar, título e description de
SEO, kicker e título da capa. O app e o pré-render (`scripts/prerender-blog.mjs`) leem esse
mesmo arquivo.

## 1. Para quem escrevemos

Donos de pequenos negócios e profissionais liberais (clínicas, salões, barbearias,
escritórios, lojas, academias, prestadores de serviço) que querem usar IA e automação no dia
a dia, sem equipe de TI. Em segundo plano, criadores e devs que constroem software com IA
(vibecoders).

O leitor chega pelo Google ou por uma resposta de IA com uma dúvida concreta ("atendente de
IA no WhatsApp vale a pena para a minha clínica?"). Ele quer a resposta rápida, depois o
passo a passo, e só então uma oferta.

## 2. Pilares

Todo post pertence a um pilar. O pilar define o produto do CTA, os posts do "Leia também" e
a variação da capa.

| Pilar (`id`) | Assunto | Produto do CTA | Capa |
|---|---|---|---|
| Atendimento com IA (`atendimento`) | Atendente de IA no WhatsApp por segmento, RAG, agendamento, ROI do atendimento | Atendente de IA — https://rag.aglabs.ia.br/ | `bone` |
| Automação de processos (`automacao`) | n8n na prática, cobrança, propostas, follow-up, agentes de vendas, operação | Serviços de Automação — https://wf.aglabs.ia.br/ | `news` |
| Sites e presença digital (`sites`) | Site profissional por profissão, Google, captação local | Criação de sites — https://lp.aglabs.ia.br/ | `bone` |
| Criar com IA (`criar-com-ia`) | Vibecoding, ferramentas internas, apps, conteúdo e mídia com IA | VibeKit — https://templates.aglabs.ia.br/ (ou AG LABS App — https://lp.aglabs.app.br/ para imagem, vídeo e áudio) | `ambar` |
| IA na estratégia (`estrategia`) | Decisão, dados, custo de não usar IA, notícias de modelos explicadas para o negócio | Diagnóstico de automação — https://wf.aglabs.ia.br/ | `ambar` |

Produtos de nicho entram como CTA do post quando a pauta é do público deles (campo `product`
no `blog-meta.json`):

- **Barberias** (https://barberias.com.br/) — pautas de barbearia: agenda, faltas, equipe, comissão. Pilar `atendimento`.
- **Members** (https://members.ia.br/) — pautas de quem vende curso ou conteúdo digital. Pilar `criar-com-ia`.
- **Viajeki** (https://viajeki.com.br/) — pautas de planejamento de viagem com IA. Pilar `criar-com-ia`.
- **AG LABS App** (https://lp.aglabs.app.br/) — pautas de imagem, vídeo, áudio e marketing com IA. Pilar `criar-com-ia`.

"LocalSite" é nome interno: no texto público o serviço é "criação de sites" da AG LABS.

## 3. Como escolher a pauta

Antes de escrever, preencha a ficha (pode ir na descrição do PR ou no rascunho):

```
Pilar:                 atendimento | automacao | sites | criar-com-ia | estrategia
Pergunta do leitor:    a pergunta que o post responde, com as palavras dele
Intenção de busca:     informacional (como/o que é) | comparação (vale a pena/X ou Y) | transacional (contratar/preço)
Palavra-chave principal: 1 termo, 2 a 5 palavras (ex.: "automatizar cobrança n8n")
Secundárias:           3 a 5 variações e termos relacionados (ex.: "régua de cobrança", "lembrete de pagamento")
Produto do CTA:        do pilar ou um de nicho
Posts para linkar:     2 a 3 do mesmo pilar
Prova disponível:      o que podemos mostrar (print, fluxo, caso real autorizado, fonte pública)
```

Regras:

- Uma pergunta por post. Se a pauta responde duas, são dois posts.
- Prefira intenção com problema de negócio concreto e um segmento ("para academias",
  "para contabilidade"): é onde o leitor está perto de agir e a concorrência é menor.
- Antes de criar, procure no blog se já existe post com a mesma palavra-chave. Existindo,
  atualize o antigo em vez de competir com ele.
- Notícia de IA só entra no pilar `estrategia` e sempre com a seção "o que muda para o seu
  negócio". Notícia pura envelhece rápido e não leva a nenhum produto.

## 4. Estrutura padrão do post

```markdown
(sem "# Título" no início: o título do post já é o H1 da página)

Lide: 2 frases que respondem a pergunta do leitor de forma direta. Quem ler só isso
já sai com a resposta.

> **Resumo rápido**
> - Resposta em uma linha.
> - Para quem serve e para quem não serve.
> - O que é preciso para começar (ferramenta, tempo, custo quando conhecido).

## O que é X e por que importa para o seu negócio?
## Como fazer X passo a passo?
1. Passo com verbo no imperativo.
2. ...
## Quanto tempo (ou quanto custa) para implementar?
## Quais erros evitar?
## Perguntas frequentes
### Pergunta real do cliente?
Resposta em 2 a 4 frases.
(3 a 5 perguntas)

## Próximo passo
Um parágrafo que liga o problema ao produto do pilar, com o link da página do produto.
```

- **Título (campo `title`, vira o H1):** até 60 caracteres sempre que der, com a palavra-chave
  principal no começo. O `<title>` da página usa o `seoTitle` do `blog-meta.json`, que precisa
  ter até 60 caracteres; o " | AG LABS" só entra quando couber.
- **Lide:** as 2 primeiras frases respondem a pergunta. Nada de "Neste artigo você vai ver".
- **H2 em forma de pergunta**, na linguagem do leitor. H3 para os passos e as perguntas do FAQ.
- **Passos numerados** para qualquer procedimento.
- **Resumo rápido:** bloco citável por IA (Google, ChatGPT, Perplexity). Frases completas que
  se sustentam fora do contexto, sem "como vimos acima".
- **FAQ:** perguntas que clientes fazem de verdade no WhatsApp e nas reuniões.
- **CTA:** o bloco do produto do pilar entra automaticamente no fim do post; no texto, um
  link para a página do produto no "Próximo passo" basta. Um CTA só, sem empurrar três
  produtos.
- **Links internos:** 2 a 3 links no corpo para posts do mesmo pilar (texto do link descreve
  o destino, nunca "clique aqui") e 1 para a página do produto. O bloco "Leia também" é
  automático e não substitui os links no texto.
- **Tamanho:** o necessário para responder bem. Guia passo a passo: 1.200 a 2.000 palavras.
  "Vale a pena para X": 900 a 1.400.
- **Formato do texto:** escreva em markdown. HTML cru também é aceito (alguns posts antigos
  estão assim), mas passa por uma allowlist (`src/content/post-html-schema.json`): títulos,
  parágrafos, listas, negrito/itálico, links http(s)/mailto/tel, citação, código, imagem e
  tabela. Qualquer outra tag vira só texto; `script`, `style`, `iframe`, formulários e
  atributos como `onclick`/`style` são removidos. O pré-render e o app usam a mesma regra.

## 5. Tom de voz

Alinhado ao guia de copy dos carrosséis (`_sistema/03-COPY.md` do repositório de marketing;
se houver divergência, ele prevalece).

- **Direto e prático.** Frases curtas, voz ativa, "você". Um exemplo concreto vale mais que
  três adjetivos.
- **Do problema para a solução.** Abra com a dor que o dono do negócio reconhece ("o WhatsApp
  fica sem resposta depois das 18h"), não com a tecnologia.
- **Headlines que funcionam:** pergunta que o leitor faria ("Vale a pena para academias?"),
  "Como fazer X com Y", número concreto ("5 erros ao..."), consequência ("Quanto custa não
  ter IA").
- **Sem jargão sem explicação.** RAG, agente, webhook: explique na primeira vez em meia frase.
- **Sem hype.** Nada de "revolucionário", "nunca mais", "enquanto você dorme", "fórmula secreta".
- **Nada que não possamos provar.** Percentual, ganho de receita, "empresas crescem 3x",
  caso de cliente: só com fonte pública linkada ou dado próprio que possamos mostrar. Sem
  fonte, reescreva como possibilidade ("pode reduzir o tempo de resposta") ou corte. Não
  invente depoimento, cliente ou número.
- **Sem preço e sem condição comercial no texto.** Preço, plano e prazo mudam e pertencem às
  páginas dos produtos. O post leva para a página.
- Português do Brasil com acentuação completa (há posts antigos sem acento: corrigir ao editar).

## 6. Imagem do post e capa de compartilhamento

São duas imagens com papéis diferentes:

- **Imagem do post** (`cover_image` no `/admin`): a foto que aparece no card do índice, no
  topo do post e no "Leia também". É ela que dá vida ao blog: foto real e ligada ao assunto,
  sem texto por cima (o título já aparece ao lado). Horizontal, pelo menos 1200 px de largura.
  Só de banco com licença que permite uso comercial (Unsplash, Pexels) ou foto própria.
  O site não carrega a foto do Unsplash/Pexels: ela é baixada e servida pelo próprio site
  em WebP (ver "Foto do post" abaixo).
- **Capa de compartilhamento** (gerada): a arte com o título, no padrão visual dos carrosséis
  (três variações: `news` preto, `bone` osso com laranja, `ambar` preto com âmbar). Só vai no
  `og:image`/`twitter:image` (prévia do link no WhatsApp, LinkedIn etc.) e no JSON-LD; não
  aparece na página. Se o post ficar sem imagem própria, ela entra como reserva na página.

Campos de capa no `blog-meta.json`:

- `kicker`: 1 a 3 palavras, o segmento ou o recorte ("Academias", "n8n na prática").
- `cover`: o título da capa, curto (até ~55 caracteres), com a palavra-chave entre
  `*asteriscos*` para receber a cor de destaque. Pode ser mais curto que o título do post.
- `variant` (opcional): força outra variação que não a do pilar.

Gerar (dentro de `artifacts/ai-agency`, precisa do Chrome instalado ou `CHROME_PATH`):

```bash
node scripts/blog-cover.mjs --slug meu-novo-post   # um post
node scripts/blog-cover.mjs                        # todos os que ainda não têm capa
node scripts/blog-cover.mjs --force                # regera tudo (mudou o template)
```

Saída em `public/img/blog/og/`: `<slug>.jpg` (og:image, ≤ 300 KB) e `<slug>.webp` (1200×630,
reserva na página para post sem foto). Confira o arquivo gerado antes de commitar: título em
no máximo 3 linhas, sem corte.

Post sem entrada no `blog-meta.json` continua funcionando: usa a `cover_image` do Supabase e o
pilar deduzido da categoria, e o build avisa no log.

### Foto do post (obrigatório em post novo)

`scripts/blog-images.mjs` baixa a `cover_image` do post e gera, com sharp, os WebP no tamanho
de exibição, recortados em 1200×630 pelo centro: `public/img/blog/<slug>-1200.webp` (topo do
post, destaque) e `<slug>-600.webp` (cards, "Leia também"). Ele grava a URL baixada em
`photo.source` no `blog-meta.json`; é esse campo que liga a imagem local. Sem ele, a página
usa a URL original do Supabase (funciona, mas mais pesada e de fora do site).

```bash
node scripts/blog-images.mjs --slug meu-novo-post      # pega a cover_image do Supabase (com as
                                                       # variáveis VITE_SUPABASE_*) ou da página publicada
node scripts/blog-images.mjs --slug meu-novo-post --url "https://images.pexels.com/photos/..."   --credit "Autor — Pexels (link da foto), licença Pexels"   # foto escolhida à mão
node scripts/blog-images.mjs                           # todos os posts do JSON que ainda não têm
```

Recorte ruim (rosto cortado, assunto fora do quadro)? Grave `"position": "top"` (ou `bottom`,
`left`, `right`, `attention`) em `photo` e rode de novo com `--slug`. Trocou a `cover_image`
no `/admin`? Rode com `--slug x --url <nova URL>`.

Fotos de banco escolhidas pela AG LABS (não vieram do Supabase), com fonte e licença:

| Post | Foto | Licença |
|---|---|---|
| `como-criar-site-profissional-para-personal-trainers` | "Woman Doing Exercise", Pixabay no Pexels — https://www.pexels.com/photo/woman-doing-exercise-414029/ | Licença Pexels: uso comercial permitido, atribuição não obrigatória |

## 7. Publicar

1. Escreva o post no `/admin` como rascunho (não publicado), com `slug` definitivo em
   minúsculas e hífens, com a palavra-chave. **Slug não muda depois de publicado.**
2. Adicione a entrada do post em `src/content/blog-meta.json` (`pillar`, `kicker`, `cover`,
   `seoTitle`, `description`), gere a capa (`blog-cover.mjs`) e a foto
   (`blog-images.mjs --slug <slug>`). Commite as imagens de `public/img/blog/` junto.
3. Abra o PR com a ficha da pauta. O CI e a prévia do Cloudflare Pages precisam passar.
4. Depois do merge, publique o post no `/admin`. O webhook do Supabase dispara o rebuild e o
   pré-render gera a página estática, o sitemap e o RSS.

## 8. Checklist antes de publicar

SEO:

- [ ] `seoTitle` com até 60 caracteres e a palavra-chave principal no começo.
- [ ] `description` com 120 a 160 caracteres, única no blog, dizendo o que o leitor leva.
- [ ] Slug curto, com a palavra-chave, sem data (a não ser em notícia).
- [ ] Nenhum `# ` (H1) no corpo; H2 em forma de pergunta.
- [ ] 2 a 3 links internos para posts do mesmo pilar e 1 para a página do produto (URL final,
      sem redirecionamento).
- [ ] Imagem do post (`cover_image`) horizontal, sem texto, ligada ao assunto.
- [ ] Capa de compartilhamento gerada (`og/<slug>.jpg` ≤ 300 KB e `og/<slug>.webp`) e entrada
      no `blog-meta.json`.
- [ ] Foto do post gerada (`<slug>-1200.webp` e `<slug>-600.webp`, `photo.source` gravado) e
      recorte conferido.
- [ ] Imagens dentro do texto em WebP, no tamanho em que aparecem, com `alt` descritivo.

Qualidade:

- [ ] O lide responde a pergunta em 2 frases.
- [ ] Tem "Resumo rápido", passos numerados e FAQ.
- [ ] Todo número e todo caso têm fonte linkada ou prova própria. Sem preço no texto.
- [ ] CTA para um produto só, o do pilar (ou o de nicho indicado).
- [ ] Revisão de português (acentos, concordância) e leitura em voz alta do lide.
- [ ] Depois de publicado: abrir a URL, ver o HTML cru (`curl`) com título e texto, e testar
      a prévia do link no WhatsApp.

## 9. O que o build garante sozinho

`scripts/prerender-blog.mjs` gera, para cada post publicado: HTML estático com o texto,
`<title>`, description, canônica, Open Graph (com `og:url` e imagem 1200×630), Twitter Card,
JSON-LD `BlogPosting` (headline, datas, autor, imagem, publisher com logo) e
`BreadcrumbList`, bloco do produto e "Leia também" (3 posts do mesmo pilar, em roda, para que
todo post receba links). Gera também o índice `/blog` com a lista completa por pilar, o
`/blog/rss.xml` e o `sitemap.xml` com `lastmod` de cada post.
