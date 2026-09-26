import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

const isReplit = process.env.REPL_ID !== undefined;
const isDev = process.env.NODE_ENV !== "production";

const port = Number(process.env.PORT) || 3000;
const basePath = process.env.BASE_PATH || "/";

export default defineConfig({
  base: basePath,
  plugins: [
    react(),
    tailwindcss(),
    ...(isDev && isReplit
      ? [
          (await import("@replit/vite-plugin-runtime-error-modal")).default(),
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer({
              root: path.resolve(import.meta.dirname, ".."),
            }),
          ),
          await import("@replit/vite-plugin-dev-banner").then((m) =>
            m.devBanner(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
    },
    dedupe: ["react", "react-dom"],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist"),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("react-dom") || id.includes("react/")) return "vendor";
            if (id.includes("framer-motion")) return "motion";
            if (id.includes("@supabase")) return "supabase";
            // Parser de HTML dos posts guardados em HTML: chunk próprio, baixado sob demanda.
            if (id.includes("rehype-raw") || id.includes("hast-util-raw") || id.includes("parse5") || id.includes("hast-util-from-parse5") || id.includes("hast-util-to-parse5")) return "html-raw";
            if (id.includes("react-markdown") || id.includes("remark") || id.includes("rehype") || id.includes("mdast") || id.includes("micromark") || id.includes("unified")) return "markdown";
            if (id.includes("@paper-design/shaders")) return "shaders";
            if (id.includes("lucide-react")) return "icons";
          }
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
  server: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
  preview: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
  },
});
