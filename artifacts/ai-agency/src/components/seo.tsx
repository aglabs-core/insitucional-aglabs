import { useEffect } from "react";

/**
 * SEO / head manager sem dependências externas.
 *
 * Atualiza <title>, meta description, canonical, Open Graph, Twitter Card e,
 * opcionalmente, injeta um bloco JSON-LD por página (ex.: BlogPosting).
 *
 * Observação importante (GEO): isto roda no cliente, então beneficia o Google/
 * Gemini (que renderizam JS) e a navegação SPA. Crawlers de IA que NÃO executam
 * JavaScript (GPTBot/ClaudeBot/PerplexityBot) só leem o que está no HTML cru —
 * por isso o Schema base fica também no index.html e o conteúdo precisa de
 * pré-renderização para ser lido por esses robôs.
 */

export const SITE_URL = "https://aglabs.ia.br";
// Absoluta de propósito: og:image precisa de URL completa, senão as prévias
// de link não resolvem. O arquivo já existia em public/ sem ninguém usar,
// enquanto as tags apontavam para um bucket de terceiro.
const DEFAULT_IMAGE = `${SITE_URL}/opengraph.jpg`;

type JsonLd = Record<string, unknown> | Record<string, unknown>[];

interface SeoProps {
  title: string;
  description?: string;
  /** Caminho da rota, ex.: "/blog" ou "/blog/meu-post". Default: "/". */
  path?: string;
  image?: string;
  type?: "website" | "article";
  noindex?: boolean;
  jsonLd?: JsonLd;
}

function setMeta(attr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

export function Seo({
  title,
  description,
  path = "/",
  image = DEFAULT_IMAGE,
  type = "website",
  noindex = false,
  jsonLd,
}: SeoProps) {
  const ld = jsonLd ? JSON.stringify(jsonLd) : null;

  useEffect(() => {
    const url = SITE_URL + path;

    document.title = title;
    if (description) setMeta("name", "description", description);
    setMeta("name", "robots", noindex ? "noindex, nofollow" : "index, follow");
    setLink("canonical", url);

    setMeta("property", "og:title", title);
    if (description) setMeta("property", "og:description", description);
    setMeta("property", "og:url", url);
    setMeta("property", "og:image", image);
    setMeta("property", "og:type", type);

    setMeta("name", "twitter:title", title);
    if (description) setMeta("name", "twitter:description", description);
    setMeta("name", "twitter:image", image);

    let script: HTMLScriptElement | null = null;
    if (ld) {
      script = document.createElement("script");
      script.type = "application/ld+json";
      script.setAttribute("data-seo", "page");
      script.textContent = ld;
      document.head.appendChild(script);
    }

    return () => {
      if (script) script.remove();
    };
  }, [title, description, path, image, type, noindex, ld]);

  return null;
}
