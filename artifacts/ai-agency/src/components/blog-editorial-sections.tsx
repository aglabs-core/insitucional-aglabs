import { useRef } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import videoFeed from "@/content/blog-videos.json";
import { Link } from "wouter";
import type { BlogPost } from "@/lib/blog-store";
import { pillarIds, pillarName, postPillar } from "@/lib/blog-meta";
import { PostImage } from "@/components/post-image";
import { usePopularBlogPosts } from "@/lib/blog-metrics";

const apps = [
  {
    name: "Members",
    image: "members",
    url: "https://members.ia.br/",
    text: "Cursos e conteúdos com área de membros.",
  },
  {
    name: "MeCard",
    image: "mecard",
    url: "https://mecard.com.br/",
    text: "Sua apresentação em um cartão digital.",
  },
  {
    name: "Viajeki",
    image: "viajeki",
    url: "https://viajeki.com.br/",
    text: "Planejamento de viagens em grupo.",
  },
  {
    name: "AG Labs App",
    image: "app-aglabs",
    url: "https://aglabs.app.br/",
    text: "Criação com IA em um só lugar.",
  },
  {
    name: "Barberias",
    image: "barberias",
    url: "https://barberias.com.br/",
    text: "Gestão e agendamento para barbearias.",
  },
];
export function EcosystemSection() {
  const gallery = useRef<HTMLDivElement>(null);
  return (
    <section className="journal-ecosystem" aria-labelledby="ecosystem-title">
      <div className="journal-ecosystem-heading">
        <div>
          <span className="journal-kicker">FEITO PELA AG LABS</span>
          <h2 id="ecosystem-title">Ideias que já viraram ferramentas.</h2>
          <p>Conheça nossos apps e um novo jeito de organizar o que importa.</p>
        </div>
        <a
          href="https://github.com/aglabsrv-sys/orquestra"
          target="_blank"
          rel="noopener noreferrer"
        >
          Explore o Orquestra <ArrowUpRight size={14} aria-hidden="true" />
        </a>
      </div>
      <div className="journal-products-layout">
        <div className="journal-product-showcase">
          <div className="journal-gallery-heading">
            <h3>
              Nossos apps <span>5 PRODUTOS</span>
            </h3>
            <div>
              <button
                type="button"
                aria-label="Apps anteriores"
                onClick={() =>
                  gallery.current?.scrollBy({
                    left: -gallery.current.clientWidth,
                    behavior: matchMedia("(prefers-reduced-motion: reduce)")
                      .matches
                      ? "instant"
                      : "smooth",
                  })
                }
              >
                <ArrowLeft size={16} aria-hidden="true" />
              </button>
              <button
                type="button"
                aria-label="Próximos apps"
                onClick={() =>
                  gallery.current?.scrollBy({
                    left: gallery.current.clientWidth,
                    behavior: matchMedia("(prefers-reduced-motion: reduce)")
                      .matches
                      ? "instant"
                      : "smooth",
                  })
                }
              >
                <ArrowRight size={16} aria-hidden="true" />
              </button>
            </div>
          </div>
          <div className="journal-apps" ref={gallery}>
            {apps.map((app) => (
              <a
                href={app.url}
                key={app.name}
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src={`/img/apps/${app.image}-og.webp`}
                  alt={`Capa oficial do ${app.name}`}
                  width="1200"
                  height="630"
                  loading="lazy"
                />
                <div>
                  <h3>
                    {app.name} <span aria-hidden="true"><ArrowUpRight size={16} /></span>
                  </h3>
                  <p>{app.text}</p>
                </div>
              </a>
            ))}
          </div>
          <p className="journal-gallery-note">
            Ferramentas para criar, vender e organizar o próximo passo.
          </p>
        </div>
        <a
          className="journal-orquestra"
          href="https://github.com/aglabsrv-sys/orquestra"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className="journal-release-label">
            EM DESTAQUE · OPEN SOURCE
          </span>
          <img
            src="/img/orquestra/inicio.webp"
            alt="Painel do Orquestra com dados de demonstração"
            width="1000"
            height="630"
            loading="lazy"
          />
          <div>
            <h3>Orquestra</h3>
            <p>Suas notas, projetos e agenda. No seu computador.</p>
            <small>Markdown, organização e liberdade. Licença MIT.</small>
            <span className="journal-release-link">Conheça no GitHub <ArrowUpRight size={14} aria-hidden="true" /></span>
          </div>
        </a>
      </div>
    </section>
  );
}
export function MostRead({ posts }: { posts: BlogPost[] }) {
  const popular = usePopularBlogPosts();
  const ranked = popular
    .map((s) => posts.find((p) => p.id === s.post_id))
    .filter((p): p is BlogPost => Boolean(p));
  if (!ranked.length) return null;
  return (
    <section className="journal-most-read">
      <span className="journal-kicker">O QUE DESPERTA INTERESSE</span>
      <h2>Mais lidas do mês</h2>
      <ol>
        {ranked.map((post, i) => (
          <li key={post.id}>
            <span>0{i + 1}</span>
            <Link href={`/blog/${post.slug}`}>
              <small>{pillarName(postPillar(post))}</small>
              <h3>{post.title}</h3>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
export function CategorySections({
  posts,
  onCategory,
}: {
  posts: BlogPost[];
  onCategory: (id: string) => void;
}) {
  return (
    <div className="journal-category-sections">
      {pillarIds
        .filter((id) => id !== "curiosidades")
        .map((id) => {
          const list = posts.filter((p) => postPillar(p) === id).slice(0, 4);
          if (!list.length) return null;
          return (
            <section key={id} className="journal-category-section">
              <div className="journal-category-heading">
                <h2>{pillarName(id)}</h2>
                <button onClick={() => onCategory(id)}>Ver todos <ArrowUpRight size={14} aria-hidden="true" /></button>
              </div>
              <div className="journal-category-layout">
                <Link
                  href={`/blog/${list[0].slug}`}
                  className="journal-category-lead"
                >
                  <PostImage
                    post={list[0]}
                    sizes="(min-width:800px) 600px, 100vw"
                  />
                  <div>
                    <h3>{list[0].title}</h3>
                    <p>{list[0].excerpt}</p>
                  </div>
                </Link>
                <ol>
                  {list.slice(1).map((post, i) => (
                    <li key={post.id}>
                      <span>0{i + 1}</span>
                      <Link href={`/blog/${post.slug}`}>
                        <h3>{post.title}</h3>
                        <small>{post.readTime} min de leitura</small>
                      </Link>
                    </li>
                  ))}
                </ol>
              </div>
            </section>
          );
        })}
    </div>
  );
}
export function Curiosities({
  posts,
  onCategory,
}: {
  posts: BlogPost[];
  onCategory: (id: string) => void;
}) {
  const list = posts
    .filter((p) => postPillar(p) === "curiosidades")
    .slice(0, 6);
  if (!list.length) return null;
  return (
    <section className="journal-curiosities">
      <div className="journal-category-heading">
        <div>
          <span className="journal-kicker">UM OUTRO OLHAR</span>
          <h2>Você sabia?</h2>
        </div>
        <button onClick={() => onCategory("curiosidades")}>
          Mais curiosidades <ArrowUpRight size={14} aria-hidden="true" />
        </button>
      </div>
      <div className="journal-curiosity-grid">
        {list.map((post) => (
          <Link href={`/blog/${post.slug}`} key={post.id}>
            <PostImage
              post={post}
              sizes="(min-width:1100px) 200px, (min-width:580px) 30vw, 45vw"
            />
            <h3>{post.title}</h3>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function VideosSection() {
  const gallery = useRef<HTMLDivElement>(null);
  const scrollVideos = (direction: number) => {
    const row = gallery.current;
    if (!row) return;
    row.scrollBy({
      left: direction * row.clientWidth,
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
    });
  };
  return (
    <section className="journal-videos">
      <div className="journal-category-heading">
        <div>
          <span className="journal-kicker">NA PRÁTICA, EM MOVIMENTO</span>
          <h2>Vídeos e Shorts</h2>
        </div>
        <a href={videoFeed.channel} target="_blank" rel="noopener noreferrer">
          Ver canal <ArrowUpRight size={14} aria-hidden="true" />
        </a>
      </div>
      <div className="journal-video-controls" aria-label="Navegação dos vídeos">
        <button type="button" aria-label="Vídeos anteriores" onClick={() => scrollVideos(-1)}>
          <ArrowLeft size={16} aria-hidden="true" />
        </button>
        <button type="button" aria-label="Próximos vídeos" onClick={() => scrollVideos(1)}>
          <ArrowRight size={16} aria-hidden="true" />
        </button>
      </div>
      <div className="journal-video-grid" ref={gallery}>
        {videoFeed.videos.map((video) => (
          <a
            key={video.id}
            href={video.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src={video.thumbnail}
              width="480"
              height="360"
              loading="lazy"
              alt=""
            />
            <span className="journal-kicker">YOUTUBE · AG LABS</span>
            <h3>{video.title}</h3>
            <small>Assistir no YouTube <ArrowUpRight size={12} aria-hidden="true" /></small>
          </a>
        ))}
      </div>
    </section>
  );
}
