import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

declare global {
  interface Window {
    __homeShell?: string;
    __blogShell?: string;
    __blogShellPath?: string;
    __blogArticle?: { slug: string; html: string };
  }
}

document.documentElement.classList.add("dark");

const root = document.getElementById("root")!;
// Topo da home gerado no build: guardado para o carregamento da página
// mostrar o mesmo conteúdo em vez do spinner (ver PageLoader em App.tsx).
if (root.dataset.homeShell === "1" && window.location.pathname === "/") {
  window.__homeShell = root.innerHTML;
}

if (window.location.pathname.startsWith("/blog") && root.innerHTML.trim()) {
  window.__blogShell = root.innerHTML;
  window.__blogShellPath = window.location.pathname;
  const article = root.querySelector("[data-blog-article-content]");
  const seed = document.getElementById("blog-seed")?.textContent;
  if (article && seed) {
    try {
      const slug = JSON.parse(seed).post?.slug;
      if (typeof slug === "string") window.__blogArticle = { slug, html: article.innerHTML };
    } catch { /* No bootstrap: the normal article loader still works. */ }
  }
}

createRoot(root).render(<App />);
