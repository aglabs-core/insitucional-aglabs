import React, { useState, useEffect } from "react";
import { Link } from "wouter";
import {
  ArrowLeft, Plus, Pencil, Trash2,
  Eye, EyeOff, X, Save, LogOut, FileText, Globe, ExternalLink,
} from "lucide-react";
import { blogStore, type BlogPost } from "@/lib/blog-store";
import { supabase } from "@/lib/supabase";
import type { Session } from "@supabase/supabase-js";

/* ─── helpers ─── */
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

function slugify(text: string) {
  return text.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-");
}

function calcReadTime(content: string) {
  const words = content.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

const EMPTY_FORM = {
  title: "", slug: "", excerpt: "", content: "",
  category: "", coverImage: "", author: "Antonio Garcia",
  readTime: 5, published: false,
};
type FormData = typeof EMPTY_FORM;

/* ─── Styles ─── */
const inputCls = "w-full px-3 py-2.5 bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500/60 transition";
const labelCls = "block text-xs font-semibold text-white/40 mb-1.5 uppercase tracking-wider";

/* ─── PostForm modal ─── */
function PostForm({ initial, onSave, onCancel, saving }: {
  initial: BlogPost | null;
  onSave: (d: FormData) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [form, setForm] = useState<FormData>(
    initial ? {
      title: initial.title, slug: initial.slug, excerpt: initial.excerpt,
      content: initial.content, category: initial.category, coverImage: initial.coverImage,
      author: initial.author, readTime: initial.readTime, published: initial.published,
    } : EMPTY_FORM
  );

  const set = (field: keyof FormData, value: string | number | boolean) =>
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "title") next.slug = slugify(value as string);
      if (field === "content") next.readTime = calcReadTime(value as string);
      return next;
    });

  const isValid = form.title.trim() && form.excerpt.trim() && form.content.trim() && form.category.trim();

  const save = (published: boolean) => {
    if (!isValid || saving) return;
    onSave({ ...form, published });
  };

  const readTime = calcReadTime(form.content);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-start justify-center overflow-y-auto p-4">
      <div className="w-full max-w-2xl bg-[#0a0a0a] border border-white/10 my-8">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/8">
          <h2 className="text-xs font-semibold text-white/50 uppercase tracking-wider">
            {initial ? "Editar post" : "Novo post"}
          </h2>
          <button onClick={onCancel} className="text-white/25 hover:text-white transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-6">

          {/* Título — campo principal, maior */}
          <div>
            <input
              className="w-full bg-transparent border-0 border-b border-white/10 pb-3 text-xl font-bold text-white placeholder:text-white/15 focus:outline-none focus:border-blue-500/50 transition"
              placeholder="Título do artigo..."
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
            />
            {form.title && (
              <p className="text-xs text-white/20 mt-1.5 font-mono">/blog/{form.slug}</p>
            )}
          </div>

          {/* Categoria + Autor na mesma linha */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Categoria *</label>
              <input className={inputCls} placeholder="Ex: Inteligência Artificial"
                value={form.category} onChange={(e) => set("category", e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Autor</label>
              <input className={inputCls} value={form.author}
                onChange={(e) => set("author", e.target.value)} />
            </div>
          </div>

          {/* Imagem de capa */}
          <div>
            <label className={labelCls}>Imagem de capa (URL)</label>
            <input className={inputCls} placeholder="https://images.unsplash.com/..."
              value={form.coverImage} onChange={(e) => set("coverImage", e.target.value)} />
            {form.coverImage && (
              <div className="mt-2 relative h-32 overflow-hidden border border-white/8">
                <img src={form.coverImage} alt="preview" className="w-full h-full object-cover opacity-70" />
                <button
                  onClick={() => set("coverImage", "")}
                  className="absolute top-2 right-2 w-6 h-6 bg-black/60 hover:bg-black flex items-center justify-center transition"
                >
                  <X className="w-3 h-3 text-white/60" />
                </button>
              </div>
            )}
          </div>

          {/* Resumo */}
          <div>
            <label className={labelCls}>Resumo *</label>
            <textarea rows={2} className={inputCls + " resize-none"}
              placeholder="Descrição curta que aparece nos cards do blog..."
              value={form.excerpt} onChange={(e) => set("excerpt", e.target.value)} />
          </div>

          {/* Conteúdo */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className={labelCls + " mb-0"}>Conteúdo HTML *</label>
              {form.content && (
                <span className="text-xs text-white/20">~{readTime} min de leitura</span>
              )}
            </div>
            <textarea
              rows={14}
              className={inputCls + " resize-y font-mono text-xs leading-relaxed"}
              placeholder={"<h2>Título da seção</h2>\n<p>Parágrafo do conteúdo...</p>\n<ul>\n  <li>Item da lista</li>\n</ul>"}
              value={form.content}
              onChange={(e) => set("content", e.target.value)}
            />
            <p className="text-xs text-white/15 mt-1">
              Tags: &lt;h2&gt; &lt;h3&gt; &lt;p&gt; &lt;ul&gt; &lt;li&gt; &lt;strong&gt; &lt;a href=""&gt;
            </p>
          </div>
        </div>

        {/* Footer — dois botões de ação claros */}
        <div className="px-6 py-4 border-t border-white/8 flex items-center justify-between gap-3">
          <button onClick={onCancel} className="text-xs text-white/25 hover:text-white/60 transition uppercase tracking-wider">
            Cancelar
          </button>

          <div className="flex items-center gap-2">
            {/* Salvar rascunho */}
            <button
              onClick={() => save(false)}
              disabled={!isValid || saving}
              className="flex items-center gap-2 px-4 py-2.5 border border-white/10 hover:border-white/20 text-white/50 hover:text-white text-xs font-semibold uppercase tracking-wider transition disabled:opacity-20 disabled:cursor-not-allowed"
            >
              <Save className="w-3.5 h-3.5" />
              Rascunho
            </button>

            {/* Publicar */}
            <button
              onClick={() => save(true)}
              disabled={!isValid || saving}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold uppercase tracking-wider transition disabled:opacity-20 disabled:cursor-not-allowed"
            >
              {saving
                ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <Globe className="w-3.5 h-3.5" />
              }
              Publicar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Login screen ─── */
function LoginScreen({ onLogin }: { onLogin: (email: string, password: string) => Promise<string | null> }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const err = await onLogin(email, password);
    if (err) setError(err);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute size-[500px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />
      <div className="relative w-full max-w-sm">
        <div className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-400 mb-3">AG LABS</p>
          <h1 className="text-3xl font-black text-white tracking-tight">Painel Admin</h1>
          <p className="text-white/30 text-sm mt-1">Entre com sua conta Supabase</p>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className={labelCls}>E-mail</label>
            <input type="email" autoFocus required value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Senha</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" className={inputCls} />
          </div>
          {error && (
            <p className="text-red-400 text-xs border border-red-500/20 bg-red-500/5 px-3 py-2">{error}</p>
          )}
          <button type="submit" disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2">
            {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            Entrar
          </button>
        </form>
        <div className="mt-8">
          <Link href="/"><span className="flex items-center gap-1.5 text-xs text-white/20 hover:text-white/50 transition cursor-pointer">
            <ArrowLeft className="w-3 h-3" /> Voltar ao site
          </span></Link>
        </div>
      </div>
    </div>
  );
}

/* ─── Unauthorized screen ─── */
function UnauthorizedScreen({ email, onLogout }: { email: string; onLogout: () => void }) {
  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
      <div className="text-center max-w-sm">
        <div className="w-14 h-14 border border-red-500/30 bg-red-500/5 flex items-center justify-center mx-auto mb-6">
          <X className="w-6 h-6 text-red-400" />
        </div>
        <h2 className="text-xl font-black text-white mb-2">Acesso negado</h2>
        <p className="text-white/40 text-sm mb-1">
          <span className="text-white/60">{email}</span> não tem permissão de admin.
        </p>
        <p className="text-white/25 text-xs mb-8">
          Peça ao administrador para adicionar seu usuário na tabela <code className="text-blue-400">admin_users</code>.
        </p>
        <button onClick={onLogout}
          className="flex items-center gap-2 px-5 py-2.5 border border-white/10 hover:border-white/20 text-white/40 hover:text-white text-sm transition mx-auto">
          <LogOut className="w-4 h-4" /> Sair
        </button>
      </div>
    </div>
  );
}

/* ─── Main Admin Page ─── */
type AuthState = "loading" | "unauthenticated" | "unauthorized" | "authorized";

export default function AdminPage() {
  const [authState, setAuthState] = useState<AuthState>("loading");
  const [session, setSession] = useState<Session | null>(null);

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<BlogPost | null | "new">(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  /* check if authenticated user is admin */
  const checkAdmin = async (sess: Session) => {
    const { data } = await supabase
      .from("admin_users")
      .select("id")
      .eq("id", sess.user.id)
      .maybeSingle();
    return !!data;
  };

  /* resolve auth state on mount and on auth changes */
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      const sess = data.session;
      if (!sess) { setAuthState("unauthenticated"); return; }
      setSession(sess);
      const isAdmin = await checkAdmin(sess);
      setAuthState(isAdmin ? "authorized" : "unauthorized");
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, sess) => {
      if (!sess) { setSession(null); setAuthState("unauthenticated"); return; }
      setSession(sess);
      const isAdmin = await checkAdmin(sess);
      setAuthState(isAdmin ? "authorized" : "unauthorized");
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async (email: string, password: string): Promise<string | null> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return error.message;
    return null;
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  /* posts CRUD */
  const refresh = async () => {
    setPostsLoading(true);
    const data = await blogStore.getAll();
    setPosts(data);
    setPostsLoading(false);
  };

  useEffect(() => {
    if (authState === "authorized") refresh();
  }, [authState]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = async (form: FormData) => {
    setSaving(true);
    try {
      if (editing === "new") {
        await blogStore.create(form as Parameters<typeof blogStore.create>[0]);
        showToast("Post criado.");
        // O ramo acima já tratou "new": aqui sobra BlogPost | null, e o
        // truthy check basta. A comparação com "new" nunca podia ser verdade.
      } else if (editing) {
        await blogStore.update(editing.id, form);
        showToast("Post atualizado.");
      }
      await refresh();
      setEditing(null);
    } catch (err) {
      showToast("Erro ao salvar. Verifique o console.");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    await blogStore.delete(id);
    await refresh();
    setDeleteConfirm(null);
    showToast("Post excluído.");
  };

  const togglePublish = async (post: BlogPost) => {
    await blogStore.update(post.id, { published: !post.published });
    await refresh();
    showToast(post.published ? "Despublicado." : "Publicado!");
  };

  /* ── Render states ── */
  if (authState === "loading") {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (authState === "unauthenticated") {
    return <LoginScreen onLogin={handleLogin} />;
  }

  if (authState === "unauthorized") {
    return (
      <UnauthorizedScreen
        email={session?.user.email ?? ""}
        onLogout={handleLogout}
      />
    );
  }

  /* ── Admin panel ── */
  const published = posts.filter((p) => p.published).length;
  const drafts = posts.filter((p) => !p.published).length;

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <header className="sticky top-0 z-40 border-b border-white/5 bg-[#050505]/80 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/"><span className="text-white/30 hover:text-white transition cursor-pointer"><ArrowLeft className="w-4 h-4" /></span></Link>
            <span className="text-xs font-semibold text-white/40 uppercase tracking-wider">Admin</span>
          </div>
          <div className="flex items-center gap-5">
            <span className="text-xs text-white/20 hidden sm:block">{session?.user.email}</span>
            <Link href="/blog">
              <span className="flex items-center gap-1.5 text-xs text-white/30 hover:text-white transition cursor-pointer">
                <Globe className="w-3.5 h-3.5" /> Ver blog
              </span>
            </Link>
            <button onClick={handleLogout} className="flex items-center gap-1.5 text-xs text-white/30 hover:text-white transition">
              <LogOut className="w-3.5 h-3.5" /> Sair
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="grid grid-cols-3 gap-3 mb-10">
          {[
            { label: "Total", value: posts.length, icon: FileText },
            { label: "Publicados", value: published, icon: Globe },
            { label: "Rascunhos", value: drafts, icon: EyeOff },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="border border-white/8 p-5 flex items-center gap-4">
              <Icon className="w-5 h-5 text-blue-400" />
              <div>
                <p className="text-2xl font-black">{value}</p>
                <p className="text-xs text-white/30">{label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between mb-5">
          <h1 className="text-xs font-semibold text-white/40 uppercase tracking-wider">Posts</h1>
          <button onClick={() => setEditing("new")}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold uppercase tracking-wider transition">
            <Plus className="w-4 h-4" /> Novo post
          </button>
        </div>

        {postsLoading && (
          <div className="py-20 flex justify-center">
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!postsLoading && posts.length === 0 && (
          <div className="py-24 text-center border border-dashed border-white/8 text-white/20">
            <FileText className="w-8 h-8 mx-auto mb-3 opacity-30" />
            <p>Nenhum post ainda.</p>
          </div>
        )}

        {!postsLoading && posts.length > 0 && (
          <div className="space-y-px">
            {posts.map((post) => (
              <div key={post.id}
                onClick={() => setEditing(post)}
                className="bg-[#0a0a0a] border border-white/5 hover:border-white/10 p-4 flex items-center gap-4 transition-colors cursor-pointer">
                {post.coverImage && (
                  <img src={post.coverImage} alt={post.title}
                    className="w-14 h-10 object-cover flex-shrink-0 hidden sm:block opacity-70" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs px-2 py-0.5 font-semibold uppercase tracking-wider ${
                      post.published
                        ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                        : "bg-white/5 text-white/30 border border-white/8"
                    }`}>
                      {post.published ? "Publicado" : "Rascunho"}
                    </span>
                    <span className="text-xs text-white/20 border border-white/8 px-2 py-0.5">{post.category}</span>
                  </div>
                  <p className="font-semibold text-sm text-white truncate">{post.title}</p>
                  <p className="text-xs text-white/20 mt-0.5">{formatDate(post.createdAt)} · {post.readTime} min</p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                  <a href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer"
                    title="Ver post" className="p-2 text-white/25 hover:text-white transition">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <button title={post.published ? "Despublicar" : "Publicar"}
                    onClick={() => togglePublish(post)} className="p-2 text-white/25 hover:text-blue-400 transition">
                    {post.published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button title="Editar" onClick={() => setEditing(post)} className="p-2 text-white/25 hover:text-blue-400 transition">
                    <Pencil className="w-4 h-4" />
                  </button>
                  {deleteConfirm === post.id ? (
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleDelete(post.id)}
                        className="px-2 py-1 text-xs bg-red-600 hover:bg-red-500 text-white font-semibold transition">
                        Excluir
                      </button>
                      <button onClick={() => setDeleteConfirm(null)}
                        className="px-2 py-1 text-xs text-white/30 hover:text-white transition">
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <button title="Excluir" onClick={() => setDeleteConfirm(post.id)}
                      className="p-2 text-white/25 hover:text-red-400 transition">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {editing !== null && (
        <PostForm
          initial={editing === "new" ? null : editing}
          onSave={handleSave}
          onCancel={() => setEditing(null)}
          saving={saving}
        />
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 bg-[#111] border border-white/10 text-sm text-white font-medium">
          {toast}
        </div>
      )}
    </div>
  );
}
