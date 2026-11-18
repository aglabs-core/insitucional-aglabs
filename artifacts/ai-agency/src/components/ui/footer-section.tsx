"use client";
import React from "react";
import { useLocation } from "wouter";
import type { ComponentProps, ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { FacebookIcon, InstagramIcon, LinkedinIcon } from "lucide-react";

function XIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.258 5.63L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
    </svg>
  );
}

function smoothScrollTo(href: string) {
  if (!href.startsWith("#") || href === "#") return;
  const target = document.querySelector(href);
  if (target) {
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

interface FooterLink {
  title: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  external?: boolean;
}

interface FooterSection {
  label: string;
  links: FooterLink[];
}

const footerLinks: FooterSection[] = [
  {
    label: "Navegação",
    links: [
      { title: "Início", href: "#" },
      { title: "Sobre Nós", href: "#sobre-nos" },
      { title: "Soluções", href: "#services" },
      { title: "Produtos", href: "#marcas-proprias" },
    ],
  },
  {
    label: "Soluções",
    links: [
      {
        title: "Corporate Agent",
        href: "https://rag.aglabs.ia.br/",
        external: true,
      },
      {
        title: "Websites que Vendem",
        href: "https://lp.aglabs.ia.br/",
        external: true,
      },
      {
        title: "Software Performance",
        href: "https://templates.aglabs.ia.br/",
        external: true,
      },
      { title: "Workflows Inteligence", href: "https://wf.aglabs.ia.br/" },
    ],
  },
  {
    label: "Empresa",
    links: [
      { title: "Sobre a AG LABS", href: "#sobre-nos" },
      { title: "Política de Privacidade", href: "/politica-de-privacidade" },
      { title: "Termos de Uso", href: "/termos-de-uso" },
      { title: "Blog", href: "/blog" },
    ],
  },
  {
    label: "Nossos apps",
    links: [
      { title: "AG Labs App", href: "https://aglabs.app.br/", external: true },
      { title: "MeCard", href: "https://mecard.com.br/", external: true },
      { title: "Viajeki", href: "https://viajeki.com.br/", external: true },
      { title: "Members", href: "https://members.ia.br/", external: true },
      { title: "Barberias", href: "https://barberias.com.br/", external: true },
      {
        title: "Orquestra",
        href: "https://github.com/aglabsrv-sys/orquestra",
        external: true,
      },
    ],
  },
  {
    label: "Redes Sociais",
    links: [
      {
        title: "Facebook",
        href: "https://www.facebook.com/profile.php?id=61573483665476",
        icon: FacebookIcon,
        external: true,
      },
      {
        title: "Instagram",
        href: "https://www.instagram.com/ag_labs",
        icon: InstagramIcon,
        external: true,
      },
      {
        title: "X (Twitter)",
        href: "https://x.com/aglabsrv",
        icon: XIcon,
        external: true,
      },
      {
        title: "LinkedIn",
        href: "https://www.linkedin.com/company/ag-labs",
        icon: LinkedinIcon,
        external: true,
      },
    ],
  },
];

function FooterLink({ link }: { link: FooterLink }) {
  const [pathname] = useLocation();
  const isHome = pathname === "/";
  const isHash = link.href.startsWith("#");
  const isExternal = link.external || link.href.startsWith("http");

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (isHash && isHome) {
      e.preventDefault();
      if (link.href === "#") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        smoothScrollTo(link.href);
      }
    }
  };

  return (
    <a
      href={isHash && !isHome ? `/${link.href}` : link.href}
      onClick={handleClick}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
      className="hover:text-white inline-flex items-center gap-1.5 transition-all duration-300"
    >
      {link.icon && <link.icon className="size-4 flex-shrink-0" />}
      {link.title}
    </a>
  );
}

export function Footer() {
  return (
    <footer className="site-footer bg-[#050505] text-white relative w-full border-t border-border/30 bg-[radial-gradient(35%_128px_at_50%_0%,theme(backgroundColor.white/5%),transparent)] px-6 py-12 lg:py-16">
      <div className="bg-foreground/20 absolute top-0 right-1/2 left-1/2 h-px w-1/3 -translate-x-1/2 -translate-y-px rounded-full blur" />

      <div className="mx-auto max-w-7xl grid w-full gap-10 lg:grid-cols-[240px_1fr]">
        <AnimatedContainer className="space-y-4">
          <span className="text-xl font-bold tracking-widest text-white">
            AG LABS
          </span>
          <p className="text-muted-foreground mt-4 text-sm leading-relaxed max-w-xs">
            Agentes autônomos, sistemas inteligentes e interfaces de alto
            desempenho para o crescimento do seu negócio.
          </p>
          <p className="text-muted-foreground text-xs pt-2">
            © {new Date().getFullYear()} AG LABS. Todos os direitos reservados.
          </p>
        </AnimatedContainer>

        <div className="mt-4 grid grid-cols-2 gap-7 sm:grid-cols-3 lg:grid-cols-5 lg:mt-0">
          {footerLinks.map((section, index) => (
            <AnimatedContainer key={section.label} delay={0.1 + index * 0.1}>
              <div className="mb-10 md:mb-0">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-white/60">
                  {section.label}
                </h3>
                <ul className="text-muted-foreground mt-4 space-y-2 text-sm">
                  {section.links.map((link) => (
                    <li key={link.title}>
                      <FooterLink link={link} />
                    </li>
                  ))}
                </ul>
              </div>
            </AnimatedContainer>
          ))}
        </div>
      </div>
    </footer>
  );
}

type ViewAnimationProps = {
  delay?: number;
  className?: ComponentProps<typeof motion.div>["className"];
  children: ReactNode;
};

function AnimatedContainer({
  className,
  delay = 0.1,
  children,
}: ViewAnimationProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={false}
      whileInView={{ filter: "blur(0px)", translateY: 0, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.8 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
