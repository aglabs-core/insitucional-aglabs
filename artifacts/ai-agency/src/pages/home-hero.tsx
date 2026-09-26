import { Facebook, Instagram, Linkedin } from "lucide-react";
import { MinimalistHero } from "@/components/ui/minimalist-hero";

// Topo da home. Fica separado da página para o build gerar o mesmo HTML
// (scripts/home-shell.mjs) sem carregar o resto da home.
const XIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

export function HomeHero() {
  const navLinks = [
    { label: "HOME", href: "#" },
    { label: "SOBRE NÓS", href: "#sobre-nos" },
    { label: "SOLUÇÕES", href: "#services" },
    { label: "PRODUTOS", href: "#cases" },
    { label: "BLOG", href: "/blog" },
  ];

  const socialLinks = [
    {
      icon: Facebook,
      href: "https://www.facebook.com/profile.php?id=61573483665476",
    },
    { icon: Instagram, href: "https://www.instagram.com/ag_labs" },
    { icon: XIcon, href: "https://x.com/aglabsrv" },
    { icon: Linkedin, href: "https://www.linkedin.com/company/ag-labs" },
  ];

  return (
    <MinimalistHero
      logoText="AG LABS"
      navLinks={navLinks}
      mainText="Agentes autônomos, sistemas inteligentes e interfaces de alto desempenho para o crescimento do seu negócio."
      readMoreLink="#services"
      imageSrc="/img/hero-home.webp"
      imageSrcSet="/img/hero-home-640.webp 640w, /img/hero-home.webp 1024w"
      imageSizes="(min-width: 1024px) 605px, (min-width: 768px) 435px, 336px"
      imageAlt="AG LABS - Agência de Inteligência Artificial"
      overlayText={{
        part1: "Simples e",
        part2: "Inteligente.",
      }}
      socialLinks={socialLinks}
      locationText="Brasil"
    />
  );
}
