import React, { useState, useMemo, useEffect, memo } from "react";
import { Link } from "wouter";
import { ArrowLeft, ArrowUpRight, Clock, Search } from "lucide-react";
import { MeshGradient, Dithering } from "@paper-design/shaders-react";
import { blogStore, type BlogPost } from "@/lib/blog-store";
import BlogsLatest from "@/components/ui/blogs";
import { FaqSection, blogFaq, faqJsonLd } from "@/components/ui/faq-section";
import { Seo } from "@/components/seo";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const PostCard = memo(function PostCard({ post, index }: { post: BlogPost; index: number }) {
  const isWide = index % 5 === 0;

  return (
    <Link href={`/blog/${post.slug}`}>
      <article
        className={`group cursor-pointer relative overflow-hidden bg-[#0a0a0a] border border-white/8 hover:border-blue-500/40 transition-colors duration-300 h-56 sm:h-64 ${
          isWide ? "sm:col-span-2 md:col-span-2" : ""
        }`}
      >
        {post.coverImage ? (
          <img
            src={post.coverImage}
            alt={post.title}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-55 transition-opacity duration-500"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-blue-950/30 to-transparent" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/65 to-transparent" />

        <div className="absolute top-4 right-4">
          <ArrowUpRight className="w-4 h-4 text-white/0 group-hover:text-blue-400 transition-colors duration-300" />
        </div>

        <div className="absolute inset-x-0 bottom-0 p-5 md:p-6">
          <span className="block text-blue-400 text-[10px] font-semibold uppercase tracking-widest mb-2">
            {post.category}
          </span>
          <h2
            className={`font-bold text-white leading-snug mb-2.5 group-hover:text-blue-50 transition-colors line-clamp-2 ${
              isWide ? "text-lg md:text-xl" : "text-base md:text-lg"
            }`}
          >
            {post.title}
          </h2>
          <div className="flex items-center gap-3 text-xs text-white/30">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {post.readTime} min
            </span>
            <span>{formatDate(post.createdAt)}</span>
          </div>
        </div>
      </article>
    </Link>
  );
});

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-white/5 ${className ?? ""}`} />;
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  useEffect(() => {
    setFetchError(false);
    blogStore
      .getPublished()
      .then((data) => {
        setPosts(data);
        setLoading(false);
      })
      .catch(() => {
        setFetchError(true);
        setLoading(false);
      });
  }, []);

  const categories = useMemo(() => {
    const cats = new Set(posts.map((p) => p.category));
    return Array.from(cats);
  }, [posts]);

  const filtered = useMemo(() => {
    return posts.filter((p) => {
      const matchSearch =
        !search ||
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.excerpt.toLowerCase().includes(search.toLowerCase());
      const matchCategory = !activeCategory || p.category === activeCategory;
      return matchSearch && matchCategory;
    });
  }, [posts, search, activeCategory]);

  const latestIds = useMemo(
    () => new Set(posts.slice(0, 3).map((p) => p.id)),
    [posts]
  );

  const feedPosts = useMemo(
    () => filtered.filter((p) => !latestIds.has(p.id)),
    [filtered, latestIds]
  );

  const featured = feedPosts[0];
  const rest = feedPosts.slice(1);

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <Seo
        title="Blog | AG LABS Intelligence — IA, Automação e Estratégia"
        description="Insights sobre inteligência artificial, automação de processos e tecnologia aplicada para escalar o seu negócio."
        path="/blog"
        jsonLd={faqJsonLd(blogFaq)}
      />
      {/* Top bar */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center px-6 md:px-12 h-14 border-b border-white/5 bg-[#050505]/80 backdrop-blur-md">
        <Link href="/">
          <span className="flex items-center gap-2 text-white/40 hover:text-white text-sm transition-colors cursor-pointer">
            <ArrowLeft className="w-4 h-4" />
            AG LABS
          </span>
        </Link>
      </div>

      <main className="pt-14">
        {/* Hero */}
        <div className="relative border-b border-white/8 overflow-hidden">
          {/* Shader — z-0, cores apagadas para não brigar com o texto */}
          <MeshGradient
            colors={["#040a18", "#071a5e", "#030820", "#04194a"]}
            swirl={0.3}
            distortion={0.5}
            speed={0.025}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 0 }}
          />
          {/* O Dithering é de duas cores (colorBack/colorFront), não de uma
              lista como o MeshGradient acima. Vinha recebendo `colors` e
              `intensity`, que a lib ignora — então o shader rodava com o
              preset padrão, de frente azul (#00b2ff), e não com o quase-preto
              que o código pedia. */}
          <Dithering
            colorBack="#06060f"
            colorFront="#05051a"
            shape="simplex"
            speed={0.025}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 1 }}
          />
          {/* Overlay escuro para legibilidade — z-10 */}
          <div className="absolute inset-0 bg-black/60 z-10" />
          {/* Fade de saída para baixo — z-10 */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-[#050505] z-10" />

          {/* Texto — z-20, sempre acima de tudo */}
          <div className="relative z-20 max-w-6xl mx-auto px-6 md:px-12 py-20 md:py-28">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-400 mb-6">
              Blog — AG LABS
            </p>
            <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-none text-white mb-6 max-w-3xl">
              Inteligência<br />
              <span className="text-gray-400">que move</span>{" "}
              <span className="text-blue-400">negócios.</span>
            </h1>
            <p className="text-white/50 text-lg max-w-md">
              Insights sobre IA, automação e tecnologia aplicada para escalar sua operação.
            </p>
          </div>
        </div>

        {/* Search + filters */}
        <div className="max-w-6xl mx-auto px-6 md:px-12 py-8 flex flex-col sm:flex-row gap-4 items-start sm:items-center border-b border-white/5">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25" />
            <input
              type="text"
              placeholder="Buscar artigos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/8 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-blue-500/50 transition"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setActiveCategory(null)}
              className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider border transition ${
                !activeCategory
                  ? "border-blue-500 text-blue-400 bg-blue-500/10"
                  : "border-white/10 text-white/30 hover:border-white/20 hover:text-white/50"
              }`}
            >
              Todos
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
                className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider border transition ${
                  activeCategory === cat
                    ? "border-blue-500 text-blue-400 bg-blue-500/10"
                    : "border-white/10 text-white/30 hover:border-white/20 hover:text-white/50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Novidades — últimos lançamentos */}
        {!loading && posts.length > 0 && <BlogsLatest posts={posts} />}

        {/* Content */}
        <div className="max-w-6xl mx-auto px-6 md:px-12 py-12">
          {loading && (
            <div className="space-y-3">
              <Skeleton className="w-full h-56 sm:h-64" />
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                <Skeleton className="h-56 sm:h-64" />
                <Skeleton className="h-56 sm:h-64" />
                <Skeleton className="h-56 sm:h-64" />
              </div>
            </div>
          )}

          {fetchError && (
            <div className="py-32 text-center flex flex-col items-center gap-4">
              <p className="text-white/30 text-lg">Não foi possível carregar os artigos.</p>
              <button
                onClick={() => {
                  setLoading(true);
                  setFetchError(false);
                  blogStore
                    .getPublished()
                    .then((data) => { setPosts(data); setLoading(false); })
                    .catch(() => { setFetchError(true); setLoading(false); });
                }}
                className="px-4 py-2 text-xs font-semibold uppercase tracking-wider border border-white/10 text-white/40 hover:border-blue-500/50 hover:text-blue-400 transition"
              >
                Tentar novamente
              </button>
            </div>
          )}

          {!loading && !fetchError && feedPosts.length === 0 && (
            <div className="py-32 text-center text-white/20">
              <p className="text-lg">Nenhum artigo encontrado.</p>
            </div>
          )}

          {!loading && featured && (
            <Link href={`/blog/${featured.slug}`}>
              <article className="group cursor-pointer relative overflow-hidden mb-3 h-72 sm:h-80 md:h-96 border border-white/8 hover:border-blue-500/40 transition-colors duration-300">
                {featured.coverImage && (
                  <img
                    src={featured.coverImage}
                    alt={featured.title}
                    loading="eager"
                    decoding="async"
                    className="absolute inset-0 w-full h-full object-cover opacity-35 group-hover:opacity-50 transition-opacity duration-500"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />

                {/* "Ler artigo" no canto superior direito */}
                <div className="absolute top-6 right-6 flex items-center gap-1.5 text-xs font-semibold text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  Ler artigo <ArrowUpRight className="w-3.5 h-3.5" />
                </div>

                <div className="absolute inset-0 p-6 sm:p-8 md:p-14 flex flex-col justify-end max-w-3xl">
                  <span className="inline-block text-blue-400 text-xs font-semibold uppercase tracking-[0.2em] mb-4">
                    {featured.category} — Destaque
                  </span>
                  <h2 className="text-2xl md:text-4xl font-black text-white leading-tight mb-4 group-hover:text-blue-50 transition-colors line-clamp-2">
                    {featured.title}
                  </h2>
                  <p className="text-white/50 text-sm leading-relaxed mb-6 max-w-xl hidden md:block line-clamp-2">
                    {featured.excerpt}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-white/30">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3 h-3" /> {featured.readTime} min de leitura
                    </span>
                    <span>{formatDate(featured.createdAt)}</span>
                  </div>
                </div>
              </article>
            </Link>
          )}

          {!loading && rest.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mt-3">
              {rest.map((post, i) => (
                <PostCard key={post.id} post={post} index={i} />
              ))}
            </div>
          )}
        </div>

        <FaqSection
          items={blogFaq}
          eyebrow="FAQ"
          title="Perguntas frequentes sobre o blog"
          className="w-full py-16 md:py-24 border-t border-white/8"
        />
      </main>

      <footer className="border-t border-white/5 py-8 text-center text-xs text-white/15 mt-12">
        © {new Date().getFullYear()} AG LABS — Inteligência Artificial aplicada
      </footer>
    </div>
  );
}
