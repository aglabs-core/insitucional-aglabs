/**
 * Como o conteúdo de um post vira HTML — no app e, com a mesma configuração,
 * no pré-render (scripts/prerender-blog.mjs).
 *
 * O campo `content` do Supabase é markdown na maioria dos posts, mas alguns
 * guardam HTML cru. O rehype-raw interpreta esse HTML (antes ele aparecia como
 * texto, "<h2>…</h2><p>…") e o rehype-sanitize limpa tudo pela allowlist de
 * src/content/post-html-schema.json: só tags de texto, links http(s)/mailto/tel,
 * imagens http(s); sem script, style, iframe nem atributos de evento. O
 * markdown passa pelo mesmo caminho e sai igual.
 *
 * No app, o rehype-raw (que traz o parser de HTML, ~55 KB gzip) só é baixado
 * quando o post tem HTML (`hasHtml`): os posts em markdown não pagam por ele.
 */
import type { Components, Options } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize, { type Options as SanitizeSchema } from "rehype-sanitize";
import schema from "@/content/post-html-schema.json";

const TABLE_PARTS = new Set(["table", "thead", "tbody", "tfoot", "tr"]);
type HastNode = { type: string; tagName?: string; value?: string; children?: HastNode[] };

/**
 * Tira as quebras de linha que o markdown deixa entre as partes de uma tabela.
 * Sem isto, o rehype-raw as move para antes da tabela e o HTML do markdown
 * deixaria de sair idêntico ao de antes. Mesmo código no pré-render.
 */
export function rehypeTrimTables() {
  const walk = (node: HastNode) => {
    if (!node.children) return;
    if (node.type === "element" && TABLE_PARTS.has(node.tagName ?? "")) {
      node.children = node.children.filter((c) => !(c.type === "text" && !(c.value ?? "").trim()));
    }
    node.children.forEach(walk);
  };
  return (tree: HastNode) => walk(tree);
}

export const postRemarkPlugins: Options["remarkPlugins"] = [remarkGfm];
// O JSON tem um comentário ("//") que o sanitize ignora; por isso o cast via unknown.
type Plugins = NonNullable<Options["rehypePlugins"]>;

/** Conteúdo com tags HTML de bloco ou de texto (e não só markdown). */
export function hasHtml(content: string): boolean {
  return /<\/?(h[1-6]|p|ul|ol|li|strong|em|b|i|a|blockquote|table|br|img|div|span|pre|code)\b[^>]*>/i.test(content);
}

/** Plugins rehype do post; `rehypeRaw` vem de import dinâmico quando `hasHtml`. */
export function postRehypePlugins(rehypeRaw?: Plugins[number]): Plugins {
  return [rehypeTrimTables, ...(rehypeRaw ? [rehypeRaw] : []), [rehypeSanitize, schema as unknown as SanitizeSchema]];
}

/** Carrega o rehype-raw sob demanda (chunk separado). */
export const loadRehypeRaw = () => import("rehype-raw").then((m) => m.default);;
/** h1 do conteúdo vira h2: a página já tem o título como único h1. */
export const postComponents: Components = { h1: "h2" };
