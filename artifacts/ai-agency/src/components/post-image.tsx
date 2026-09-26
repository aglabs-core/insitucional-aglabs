import type { BlogPost } from "@/lib/blog-store";
import { postImage } from "@/lib/blog-meta";

interface PostImageProps {
  post: Pick<BlogPost, "slug" | "coverImage">;
  /** Largura em que a imagem aparece, para o navegador escolher 600 ou 1200. */
  sizes: string;
  className?: string;
  alt?: string;
  /** Imagem principal da página (acima da dobra): carrega já, com prioridade. */
  priority?: boolean;
  /** Acima da dobra, mas sem ser a principal: carrega já, sem prioridade. */
  eager?: boolean;
}

/** Foto do post com srcset/sizes e dimensões (ver postImage em blog-meta.ts). */
export function PostImage({ post, sizes, className, alt = "", priority = false, eager = false }: PostImageProps) {
  const img = postImage(post);
  if (!img) return null;
  return (
    <img
      src={img.src}
      srcSet={img.srcSet}
      sizes={img.srcSet ? sizes : undefined}
      width={img.width}
      height={img.height}
      alt={alt}
      loading={priority || eager ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      decoding="async"
      className={className}
    />
  );
}
