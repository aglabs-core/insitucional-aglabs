import { ArrowRight } from "lucide-react";
import { Link } from "wouter";
import type { BlogPost } from "@/lib/blog-store";
import { pillarName, postCover, postPillar } from "@/lib/blog-meta";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

interface BlogsLatestProps {
  posts: BlogPost[];
}

export default function BlogsLatest({ posts }: BlogsLatestProps) {
  const latest = posts.slice(0, 3);
  if (latest.length === 0) return null;

  return (
    <section className="px-6 md:px-12 py-12 border-b border-white/5">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 text-center sm:mb-12">
          <p className="mb-3 font-medium text-blue-400 text-xs uppercase tracking-widest sm:mb-4">
            Lançamentos
          </p>
          <h2 className="font-light text-2xl text-white tracking-tight sm:text-3xl md:text-4xl">
            Novidades
          </h2>
        </div>

        <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
          {latest.map((post, index) => (
            <div
              key={index}
              className="cursor-pointer border border-white/8 bg-[#0a0a0a]/50 backdrop-blur-sm transition-all duration-300 hover:border-blue-500/40 hover:shadow-lg hover:shadow-blue-500/5"
            >
              <div className="relative mb-4 sm:mb-6">
                {postCover(post) ? (
                  <img
                    alt=""
                    className="w-full h-auto aspect-[1200/630] object-cover"
                    src={postCover(post)!.src}
                    srcSet={postCover(post)!.srcSet}
                    sizes="(min-width: 1024px) 360px, (min-width: 768px) 50vw, 100vw"
                    width={1200}
                    height={630}
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <div className="w-full aspect-[1200/630] bg-white/5 flex items-center justify-center">
                    <span className="text-white/20 text-sm">Sem imagem</span>
                  </div>
                )}
                <p className="absolute top-0 left-0 bg-black/80 px-2 py-0.5 font-semibold text-[10px] text-blue-400 uppercase tracking-widest backdrop-blur-sm sm:px-3 sm:py-1 sm:text-xs">
                  #{pillarName(postPillar(post))}
                </p>
              </div>

              <div className="px-4 pb-4 sm:px-5 sm:pb-5">
                <h3 className="mb-2 font-semibold text-base text-white tracking-tight sm:text-lg line-clamp-2">
                  {post.title}
                </h3>
                <p className="mb-5 text-white/45 text-xs leading-relaxed sm:text-sm line-clamp-2">
                  {post.excerpt}
                </p>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <Link
                    href={`/blog/${post.slug}`}
                    className="group relative flex items-center overflow-hidden font-medium text-white/70 text-xs transition-colors hover:text-blue-400 sm:text-sm"
                  >
                    <span className="mr-2 overflow-hidden border border-white/15 p-2 transition-colors duration-300 ease-in group-hover:bg-blue-500 group-hover:border-blue-500 sm:p-3">
                      <ArrowRight className="h-3 w-3 translate-x-0 opacity-100 transition-all duration-500 ease-in group-hover:translate-x-8 group-hover:opacity-0 sm:h-4 sm:w-4" />
                      <ArrowRight className="absolute top-1/2 -left-4 h-3 w-3 -translate-y-1/2 transition-all duration-500 ease-in-out group-hover:left-2 sm:-left-5 sm:h-4 sm:w-4 sm:group-hover:left-3" />
                    </span>
                    Ler mais
                  </Link>
                  <span className="flex items-center gap-2 text-[10px] text-white/25 sm:gap-3 sm:text-xs">
                    {formatDate(post.createdAt)}
                    <span className="w-6 border-white/15 border-t sm:w-12" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
