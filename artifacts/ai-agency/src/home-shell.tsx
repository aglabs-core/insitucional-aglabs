import { renderToStaticMarkup } from "react-dom/server";
import { HomeHero } from "@/pages/home-hero";

// Usado só no build (scripts/home-shell.mjs): HTML do topo da home.
export function renderHomeShell(): string {
  return renderToStaticMarkup(<HomeHero />);
}
