import { supabase } from "./supabase";

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  coverImage: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  author: string;
  readTime: number;
}

function fromRow(row: Record<string, unknown>): BlogPost {
  return {
    id: row.id as string,
    title: row.title as string,
    slug: row.slug as string,
    // Os campos de texto caem para string vazia quando a coluna vem nula.
    // O tipo promete string, então sem isto um post sem resumo derrubava a
    // busca do blog no primeiro `excerpt.toLowerCase()`.
    excerpt: (row.excerpt as string) ?? "",
    content: (row.content as string) ?? "",
    category: (row.category as string) ?? "",
    coverImage: (row.cover_image as string) ?? "",
    published: row.published as boolean,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
    author: (row.author as string) ?? "",
    readTime: (row.read_time as number) ?? 5,
  };
}

// Columns needed for listing (excludes heavy `content` field)
const LIST_COLUMNS =
  "id, title, slug, excerpt, category, cover_image, published, created_at, updated_at, author, read_time";

const LIST_CACHE_TTL = 5 * 60_000; // 5 minutes
const SLUG_CACHE_TTL = 10 * 60_000; // 10 minutes

let listCache: { data: BlogPost[]; at: number } | null = null;
const slugCache = new Map<string, { data: BlogPost; at: number }>();

export function invalidateBlogListCache() {
  listCache = null;
  slugCache.clear();
}

export const blogStore = {
  async getAll(): Promise<BlogPost[]> {
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(fromRow);
  },

  /** Fetches list metadata only (no content). Cached for 5 min. */
  async getPublished(): Promise<BlogPost[]> {
    if (listCache && Date.now() - listCache.at < LIST_CACHE_TTL) {
      return listCache.data;
    }
    const { data, error } = await supabase
      .from("blog_posts")
      .select(LIST_COLUMNS)
      .eq("published", true)
      .order("created_at", { ascending: false });
    if (error) throw error;
    const posts = (data ?? []).map(fromRow);
    listCache = { data: posts, at: Date.now() };
    return posts;
  },

  /** Fetches full post by slug. Cached per-slug for 10 min. */
  async getBySlug(slug: string): Promise<BlogPost | null> {
    const cached = slugCache.get(slug);
    if (cached && Date.now() - cached.at < SLUG_CACHE_TTL) {
      return cached.data;
    }
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    if (error || !data) return null;
    const post = fromRow(data);
    slugCache.set(slug, { data: post, at: Date.now() });
    return post;
  },

  async create(post: Omit<BlogPost, "id" | "createdAt" | "updatedAt">): Promise<BlogPost> {
    const { data, error } = await supabase
      .from("blog_posts")
      .insert({
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: post.content,
        category: post.category,
        cover_image: post.coverImage,
        published: post.published,
        author: post.author,
        read_time: post.readTime,
      })
      .select()
      .single();
    if (error) throw error;
    invalidateBlogListCache();
    return fromRow(data);
  },

  async update(id: string, updates: Partial<BlogPost>): Promise<BlogPost> {
    const db: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (updates.title !== undefined) db.title = updates.title;
    if (updates.slug !== undefined) db.slug = updates.slug;
    if (updates.excerpt !== undefined) db.excerpt = updates.excerpt;
    if (updates.content !== undefined) db.content = updates.content;
    if (updates.category !== undefined) db.category = updates.category;
    if (updates.coverImage !== undefined) db.cover_image = updates.coverImage;
    if (updates.published !== undefined) db.published = updates.published;
    if (updates.author !== undefined) db.author = updates.author;
    if (updates.readTime !== undefined) db.read_time = updates.readTime;

    const { data, error } = await supabase
      .from("blog_posts")
      .update(db)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    invalidateBlogListCache();
    return fromRow(data);
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from("blog_posts").delete().eq("id", id);
    if (error) throw error;
    invalidateBlogListCache();
  },

  /** Derives categories from already-cached published posts — no extra DB call. */
  async getCategories(): Promise<string[]> {
    const posts = await this.getPublished();
    const cats = new Set(posts.map((p) => p.category));
    return Array.from(cats);
  },
};
