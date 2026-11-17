import { Footer } from "@/components/ui/footer-section";
import {
  VideosSection,
  EcosystemSection,
  MostRead,
  CategorySections,
  Curiosities,
} from "@/components/blog-editorial-sections";
import { useState, useMemo, useEffect, memo } from "react";
import { Link } from "wouter";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Clock,
  Search,
  X,
  Sparkles,
  Workflow,
  MessageSquare,
  Layers,
} from "lucide-react";
import { MeshGradient, Dithering } from "@paper-design/shaders-react";
import { useReducedMotion } from "framer-motion";
import { blogStore, initialBlogPosts, type BlogPost } from "@/lib/blog-store";
import { blogFaq, faqJsonLd } from "@/components/ui/faq-section";
import { Seo } from "@/components/seo";
import { blogInfo, pillarIds, pillarName, postPillar } from "@/lib/blog-meta";
import { PostImage } from "@/components/post-image";
import "./blog.css";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function PostMeta({ post }: { post: BlogPost }) {
  return (
    <div className="journal-meta">
      <time dateTime={post.createdAt}>{formatDate(post.createdAt)}</time>
      <span aria-hidden="true">·</span>
      <span>
        <Clock size={12} aria-hidden="true" /> {post.readTime} min de leitura
      </span>
    </div>
  );
}

const FeatureCard = memo(function FeatureCard({
  post,
  lead = false,
}: {
  post: BlogPost;
  lead?: boolean;
}) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      aria-label={post.title}
      className={`journal-feature ${lead ? "journal-feature-lead" : ""}`}
    >
      <article>
        <PostImage
          post={post}
          alt=""
          priority={lead}
          eager={!lead}
          sizes={
            lead
              ? "(min-width: 1280px) 830px, (min-width: 768px) 65vw, 100vw"
              : "(min-width: 768px) 410px, 100vw"
          }
          className="journal-feature-image"
        />
        <div className="journal-feature-shade" />
        <div className="journal-feature-copy">
          <span className="journal-tag">{pillarName(postPillar(post))}</span>
          <h2>{post.title}</h2>
          {lead && <p>{post.excerpt}</p>}
          {lead && <PostMeta post={post} />}
        </div>
        <span className="journal-feature-arrow" aria-hidden="true">
          <ArrowUpRight size={19} />
        </span>
      </article>
    </Link>
  );
});

const FeedCard = memo(function FeedCard({ post }: { post: BlogPost }) {
  return (
    <Link
      className="journal-story"
      href={`/blog/${post.slug}`}
      aria-label={post.title}
    >
      <article>
        <div className="journal-story-image">
          <PostImage
            post={post}
            alt=""
            sizes="(min-width: 768px) 260px, (min-width: 480px) 180px, 115px"
          />
        </div>
        <div className="journal-story-copy">
          <span className="journal-kicker">{pillarName(postPillar(post))}</span>
          <h3>{post.title}</h3>
          <p>{post.excerpt}</p>
          <PostMeta post={post} />
        </div>
      </article>
    </Link>
  );
});

const shortcuts = [
  {
    id: "atendimento",
    label: "Atendimento com IA",
    description: "Conversas que viram oportunidades.",
    Icon: MessageSquare,
  },
  {
    id: "automacao",
    label: "Automação de processos",
    description: "Menos tarefas. Mais possibilidades.",
    Icon: Workflow,
  },
  {
    id: "criar-com-ia",
    label: "Criar com IA",
    description: "Da ideia ao seu próximo projeto.",
    Icon: Sparkles,
  },
];

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>(initialBlogPosts);
  const [loading, setLoading] = useState(() => initialBlogPosts().length === 0);
  const [fetchError, setFetchError] = useState(false);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(6);
  const [headline, setHeadline] = useState(0);
  const [carouselPaused, setCarouselPaused] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    let cancelled = false;
    if (!posts.length) setLoading(true);
    setFetchError(false);
    blogStore
      .getPublished()
      .then((data) => {
        if (!cancelled) {
          setPosts(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setFetchError(true);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const categories = useMemo(
    () => pillarIds.filter((id) => posts.some((p) => postPillar(p) === id)),
    [posts],
  );
  const isFiltering = Boolean(search.trim() || activeCategory);
  const filtered = useMemo(() => {
    const normalize = (value: string) =>
      value
        .toLocaleLowerCase("pt-BR")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
    const q = normalize(search.trim());
    return posts.filter(
      (p) =>
        (!q ||
          normalize(
            `${p.title} ${p.excerpt} ${pillarName(postPillar(p))}`,
          ).includes(q)) &&
        (!activeCategory || postPillar(p) === activeCategory),
    );
  }, [posts, search, activeCategory]);

  // Os destaques não se repetem no feed. Os filtros alcançam todos os artigos.
  const highlights = posts.slice(0, 3);
  const secondaryHighlights = posts.slice(3, 5);
  const feedPosts = isFiltering ? filtered : posts.slice(5);

  useEffect(() => {
    if (reducedMotion || carouselPaused || isFiltering || posts.length < 2)
      return;
    const timer = window.setInterval(() => {
      if (!document.hidden)
        setHeadline((n) => (n + 1) % Math.min(3, posts.length));
    }, 12000);
    return () => window.clearInterval(timer);
  }, [reducedMotion, carouselPaused, isFiltering, posts.length, headline]);

  function selectCategory(id: string | null) {
    setActiveCategory(id);
    setVisibleCount(6);
  }

  function browseCategory(id: string) {
    selectCategory(id);
    document.getElementById("artigos")?.scrollIntoView({
      behavior: reducedMotion ? "instant" : "smooth",
      block: "start",
    });
  }

  return (
    <div className="ag-journal" id="top">
      <Seo
        title={blogInfo.title}
        description={blogInfo.description}
        path="/blog"
        jsonLd={faqJsonLd(blogFaq)}
      />
      <a href="#artigos" className="journal-skip">
        Pular para os artigos
      </a>
      <header className="journal-header">
        <div className="journal-shader" aria-hidden="true">
          <MeshGradient
            colors={["#040a18", "#071a5e", "#030820", "#04194a"]}
            swirl={0.3}
            distortion={0.5}
            speed={reducedMotion ? 0 : 0.025}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              zIndex: 0,
            }}
          />
          <Dithering
            shape="simplex"
            speed={reducedMotion ? 0 : 0.025}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              zIndex: 1,
            }}
          />
        </div>
        <div className="journal-container journal-header-content">
          <div className="journal-utility">
            <Link href="/">
              <ArrowLeft size={12} /> Conheça a AG Labs
            </Link>
            <span>Inteligência artificial aplicada a negócios</span>
          </div>
          <div className="journal-masthead">
            <Link
              href="/blog"
              className="journal-brand"
              aria-label="AG Labs Blog, início"
            >
              <span>
                AG LABS<span className="journal-brand-dot">.</span>
              </span>
              <span className="journal-brand-label">BLOG</span>
            </Link>
            <p>
              O próximo passo do seu negócio
              <br />
              <strong>começa com uma boa ideia.</strong>
            </p>
            <a
              href="/#projetos-personalizados"
              className="journal-contact"
              aria-label="Conversar com a AG Labs"
            >
              Vamos conversar <ArrowUpRight size={16} />
            </a>
          </div>
          <div className="journal-header-bottom">
            <h1>
              IA, tecnologia e negócios. <span>Na prática.</span>
            </h1>
            <span className="journal-edition">
              <span /> Uma publicação AG Labs
            </span>
          </div>
        </div>
        <nav className="journal-navigation" aria-label="Temas do blog">
          <div className="journal-container journal-nav-inner">
            <div className="journal-nav-topics">
              <button
                type="button"
                onClick={() => selectCategory(null)}
                aria-pressed={!activeCategory}
                className={!activeCategory ? "is-active" : ""}
              >
                Todos os artigos
              </button>
              {categories.map((id) => (
                <button
                  type="button"
                  key={id}
                  onClick={() =>
                    selectCategory(id === activeCategory ? null : id)
                  }
                  aria-pressed={activeCategory === id}
                  className={activeCategory === id ? "is-active" : ""}
                >
                  {pillarName(id)}
                </button>
              ))}
            </div>
            <a
              href="#busca"
              className="journal-search-link"
              aria-label="Ir para a busca de artigos"
              onClick={() => document.getElementById("busca")?.focus()}
            >
              <Search size={18} />
            </a>
          </div>
        </nav>
      </header>

      <main className="journal-container">
        {!loading && !fetchError && !isFiltering && highlights.length > 0 && (
          <section
            className="journal-highlights"
            aria-label="Artigos em destaque"
          >
            <div
              className="journal-carousel"
              role="region"
              aria-label="Manchetes mais recentes"
              aria-roledescription="carrossel"
              onFocusCapture={(e) => {
                // Keyboard focus pauses rotation; a touch or mouse click must
                // not leave autoplay permanently paused after navigation.
                if ((e.target as HTMLElement).matches(":focus-visible"))
                  setCarouselPaused(true);
              }}
              onBlurCapture={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget))
                  setCarouselPaused(false);
              }}
            >
              <FeatureCard
                post={highlights[headline % highlights.length]}
                lead
              />
              <div className="journal-carousel-controls">
                <button
                  type="button"
                  aria-label="Manchete anterior"
                  onClick={() =>
                    setHeadline(
                      (n) => (n - 1 + highlights.length) % highlights.length,
                    )
                  }
                >
                  ←
                </button>
                {highlights.map((post, i) => (
                  <button
                    key={post.id}
                    type="button"
                    aria-label={`Manchete ${i + 1}: ${post.title}`}
                    aria-pressed={headline % highlights.length === i}
                    onClick={() => setHeadline(i)}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  type="button"
                  aria-label="Próxima manchete"
                  onClick={() =>
                    setHeadline((n) => (n + 1) % highlights.length)
                  }
                >
                  →
                </button>
              </div>
            </div>
            {secondaryHighlights.length > 0 && (
              <div className="journal-secondary-features">
                {secondaryHighlights.map((post) => (
                  <FeatureCard key={post.id} post={post} />
                ))}
              </div>
            )}
          </section>
        )}
        {!loading && !fetchError && !isFiltering && categories.length > 0 && (
          <section className="journal-shortcuts" aria-label="Explore os temas">
            {shortcuts
              .filter(({ id }) => categories.includes(id))
              .map(({ id, label, description, Icon }) => (
                <button
                  type="button"
                  key={id}
                  onClick={() => browseCategory(id)}
                >
                  <span className="journal-shortcut-icon">
                    <Icon size={22} />
                  </span>
                  <span>
                    <strong>{label}</strong>
                    <small>{description}</small>
                  </span>
                  <ArrowRight size={17} className="journal-shortcut-arrow" />
                </button>
              ))}
          </section>
        )}

        {!loading && !fetchError && !isFiltering && <EcosystemSection />}
        <div className="journal-content-layout" id="artigos">
          <section
            className="journal-feed"
            aria-labelledby="journal-feed-heading"
            aria-busy={loading}
          >
            <div className="journal-section-heading">
              <div>
                <span className="journal-kicker">PARA LER E APLICAR</span>
                <h2 id="journal-feed-heading">
                  {isFiltering
                    ? activeCategory
                      ? pillarName(activeCategory)
                      : "Resultados da busca"
                    : "Últimos artigos"}
                </h2>
              </div>
              <Layers size={22} aria-hidden="true" />
            </div>
            <div className="journal-search">
              <Search size={17} aria-hidden="true" />
              <input
                id="busca"
                type="search"
                placeholder="O que você quer descobrir?"
                aria-label="Buscar artigos"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setVisibleCount(6);
                }}
              />
              {search && (
                <button
                  type="button"
                  aria-label="Limpar busca"
                  onClick={() => {
                    setSearch("");
                    setVisibleCount(6);
                  }}
                >
                  <X size={16} />
                </button>
              )}
            </div>
            <div className="journal-results-status" role="status">
              {!loading && !fetchError && isFiltering && (
                <>
                  <span>
                    {filtered.length}{" "}
                    {filtered.length === 1
                      ? "artigo encontrado"
                      : "artigos encontrados"}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setSearch("");
                      selectCategory(null);
                    }}
                  >
                    Limpar filtros <X size={12} />
                  </button>
                </>
              )}
            </div>
            {loading && (
              <div className="journal-loading" role="status">
                <span className="journal-sr-only">Carregando artigos…</span>
                {[0, 1, 2].map((n) => (
                  <div key={n} className="journal-skeleton" />
                ))}
              </div>
            )}
            {!loading && fetchError && (
              <div className="journal-empty">
                <h3>Não foi possível carregar os artigos.</h3>
                <p>Tente novamente para continuar a leitura.</p>
                <button
                  type="button"
                  className="journal-load-more"
                  onClick={() => setAttempt((n) => n + 1)}
                >
                  Tentar novamente <ArrowRight size={16} />
                </button>
              </div>
            )}
            {!loading && !fetchError && feedPosts.length === 0 && (
              <div className="journal-empty">
                <h3>
                  {isFiltering
                    ? "Nenhum artigo encontrado."
                    : posts.length
                      ? "Você já está por dentro."
                      : "Novas ideias estão a caminho."}
                </h3>
                <p>
                  {isFiltering
                    ? "Experimente outro termo ou escolha um dos temas do blog."
                    : posts.length
                      ? "Explore os destaques acima ou escolha um tema para continuar."
                      : "Volte em breve para conferir os próximos artigos."}
                </p>
              </div>
            )}
            {!loading &&
              !fetchError &&
              feedPosts
                .slice(0, visibleCount)
                .map((post) => <FeedCard key={post.id} post={post} />)}
            {!loading && !fetchError && feedPosts.length > visibleCount && (
              <button
                type="button"
                className="journal-load-more"
                onClick={() => setVisibleCount((n) => n + 6)}
              >
                Explorar mais artigos <ArrowRight size={16} />
              </button>
            )}
          </section>

          <aside className="journal-sidebar">
            {categories.length > 0 && (
              <section className="journal-topics">
                <span className="journal-kicker">
                  ESCOLHA SEU PRÓXIMO PASSO
                </span>
                <h2>Explore por tema</h2>
                {categories.map((id, i) => (
                  <button
                    type="button"
                    key={id}
                    aria-pressed={activeCategory === id}
                    onClick={() => browseCategory(id)}
                  >
                    <span className="journal-topic-number">0{i + 1}</span>
                    <span>{pillarName(id)}</span>
                    <ArrowUpRight size={15} />
                  </button>
                ))}
              </section>
            )}
            <section className="journal-promo">
              <span className="journal-kicker">DA LEITURA À AÇÃO</span>
              <h2>Boas ideias merecem sair do papel.</h2>
              <p>
                Agentes de IA, automações e sites para o próximo momento do seu
                negócio.
              </p>
              <a href="/#services">
                Conheça as soluções <ArrowUpRight size={17} />
              </a>
              <span className="journal-promo-brand" aria-hidden="true">
                AG LABS.
              </span>
            </section>
            <div className="journal-editorial-note">
              <span className="journal-kicker">NOSSO OLHAR</span>
              <p>
                Tecnologia faz sentido quando resolve um problema real. É sobre
                isso que a gente escreve.
              </p>
            </div>
          </aside>
        </div>
        {!loading && !fetchError && !isFiltering && (
          <>
            <VideosSection />
            <MostRead posts={posts} />
            <CategorySections posts={posts} onCategory={browseCategory} />
            <Curiosities posts={posts} onCategory={browseCategory} />
            <section className="journal-social">
              <span className="journal-kicker">CONTINUE A CONVERSA</span>
              <h2>Ideias também em movimento.</h2>
              <p>
                Projetos, bastidores e ideias para usar tecnologia no dia a dia.
              </p>
              <a
                href="https://www.instagram.com/ag_labs/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Acompanhar @ag_labs ↗
              </a>
              <a
                href="https://www.youtube.com/@aglabs-g2n2h/shorts"
                target="_blank"
                rel="noopener noreferrer"
              >
                Ver nossos Shorts no YouTube ↗
              </a>
            </section>
          </>
        )}
        <section className="journal-faq" aria-labelledby="journal-faq-heading">
          <div>
            <span className="journal-kicker">SOBRE O BLOG</span>
            <h2 id="journal-faq-heading">
              Antes de continuar,
              <br />
              algumas respostas.
            </h2>
          </div>
          <div>
            {blogFaq.map((item) => (
              <details key={item.question}>
                <summary>
                  {item.question}
                  <span aria-hidden="true">+</span>
                </summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
