import { useRef } from "react";
import videoFeed from "@/content/blog-videos.json";
import { Link } from "wouter";
import type { BlogPost } from "@/lib/blog-store";
import { pillarIds, pillarName, postPillar } from "@/lib/blog-meta";
import { PostImage } from "@/components/post-image";
import { useBlogStats } from "@/lib/blog-metrics";

const apps = [
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
  {
    name: "Members",
    image: "members",
    url: "https://members.ia.br/",
    text: "Cursos e conteúdos com área de membros.",
  },
  {
    name: "Viajeki",
    image: "viajeki",
    url: "https://viajeki.com.br/",
    text: "Planejamento de viagens em grupo.",
  },
  {
    name: "MeCard",
    image: "mecard",
    url: "https://mecard.com.br/",
    text: "Sua apresentação em um cartão digital.",
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
          Explore o Orquestra ↗
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
                ←
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
                →
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
                  src={`/img/apps/${app.image}.webp`}
                  alt={`Prévia pública do ${app.name}`}
                  width="900"
                  height="450"
                  loading="lazy"
                />
                <div>
                  <h3>
                    {app.name} <span aria-hidden="true">↗</span>
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
            <span className="journal-release-link">Conheça no GitHub ↗</span>
          </div>
        </a>
      </div>
    </section>
  );
}
export function MostRead({ posts }: { posts: BlogPost[] }) {
  const stats = useBlogStats();
  const ranked = stats
    .filter((s) => s.month_reads > 0)
    .sort(
      (a, b) =>
        b.month_reads - a.month_reads || a.post_id.localeCompare(b.post_id),
    )
    .map((s) => ({ stats: s, post: posts.find((p) => p.id === s.post_id) }))
    .filter((x) => x.post)
    .slice(0, 6);
  return (
    <section className="journal-most-read">
      <span className="journal-kicker">O QUE DESPERTA INTERESSE</span>
      <h2>Mais lidas do mês</h2>
      <p>
        Leituras registradas neste mês. A contagem começou em 17 de novembro de
        2026.
      </p>
      {ranked.length ? (
        <ol>
          {ranked.map(({ post, stats }, i) => (
            <li key={post!.id}>
              <span>0{i + 1}</span>
              <Link href={`/blog/${post!.slug}`}>
                <small>{pillarName(postPillar(post!))}</small>
                <h3>{post!.title}</h3>
                <p>
                  {stats.month_reads}{" "}
                  {stats.month_reads === 1
                    ? "leitura registrada"
                    : "leituras registradas"}{" "}
                  · {stats.comments}{" "}
                  {stats.comments === 1 ? "comentário" : "comentários"}
                </p>
              </Link>
            </li>
          ))}
        </ol>
      ) : (
        <div className="journal-metrics-empty">
          As primeiras leituras estão chegando. Os artigos aparecem aqui
          conforme forem acessados.
        </div>
      )}
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
                <button onClick={() => onCategory(id)}>Ver todos ↗</button>
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
          Mais curiosidades ↗
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
  return (
    <section className="journal-videos">
      <div className="journal-category-heading">
        <div>
          <span className="journal-kicker">NA PRÁTICA, EM MOVIMENTO</span>
          <h2>Vídeos e Shorts</h2>
        </div>
        <a href={videoFeed.channel} target="_blank" rel="noopener noreferrer">
          Ver canal ↗
        </a>
      </div>
      <div className="journal-video-grid">
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
            <small>Assistir no YouTube ↗</small>
          </a>
        ))}
      </div>
    </section>
  );
}
