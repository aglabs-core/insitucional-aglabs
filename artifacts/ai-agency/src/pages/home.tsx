import React from "react";
import {
  Facebook,
  Instagram,
  Linkedin,
  Bot,
  Globe,
  Zap,
  Database,
  Code2,
  Brain,
  Network,
  Cpu,
} from "lucide-react";

import { MinimalistHero } from "@/components/ui/minimalist-hero";
import AboutSection from "@/components/ui/about-section";
import { FeatureCarousel } from "@/components/ui/feature-carousel";
import ElegantCarousel from "@/components/ui/elegant-carousel";
import TechMarquee from "@/components/ui/tech-marquee";
import { Footer } from "@/components/ui/footer-section";
import { Radar, IconContainer } from "@/components/ui/radar-effect";
import FeatureSections from "@/components/ui/feature-sections";
import ShowcaseSection from "@/components/ui/showcase-section";
import { Cta4 } from "@/components/ui/cta-4";
import { CtaCard } from "@/components/ui/cta-card";
import { CtaEmailCard } from "@/components/ui/call-to-action-cta";
import { PerspectiveMarqueePlayer } from "@/components/ui/perspective-marquee";
import { CtaCustomProject } from "@/components/ui/cta-custom-project";
import { FaqSection, institutionalFaq } from "@/components/ui/faq-section";
import { ProductLogoCloud } from "@/components/ui/product-logo-cloud";
import { supabase } from "@/lib/supabase";
import { Seo } from "@/components/seo";

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

const handleEmailSubmit = async (email: string) => {
  const { error } = await supabase
    .from("leads_institucional")
    .insert([{ email, created_at: new Date().toISOString() }]);
  if (error) throw new Error(error.message);
};

const HomePage = () => {
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
    <>
      <Seo
        title="AG LABS Intelligence | IA estratégica para negócios em escala"
        description="Agentes de IA, automação de processos e websites de alto desempenho para escalar o seu negócio — inteligência artificial aplicada, do atendimento à operação."
        path="/"
      />
      <MinimalistHero
        logoText="AG LABS"
        navLinks={navLinks}
        mainText="Agentes autônomos, sistemas inteligentes e interfaces de alto desempenho para o crescimento do seu negócio."
        readMoreLink="#services"
        imageSrc="/img/hero-home.webp"
        imageAlt="AG LABS - Agência de Inteligência Artificial"
        overlayText={{
          part1: "Simples e",
          part2: "Inteligente.",
        }}
        socialLinks={socialLinks}
        locationText="Brasil"
      />
      <TechMarquee />
      <AboutSection />
      <section
        id="services"
        className="w-full bg-background py-8 md:py-16 lg:py-24"
      >
        <div className="mx-auto max-w-7xl px-6 mb-10 md:mb-14">
          <h2 className="text-4xl md:text-5xl font-semibold text-white">
            Soluções Personalizadas
          </h2>
          <p className="mt-3 text-muted-foreground max-w-xl">
            Projetos sob medida para impulsionar o seu negócio com inteligência
            artificial.
          </p>
        </div>
        <FeatureCarousel />
      </section>
      <div id="cases">
        <ElegantCarousel />
      </div>
      {/* Logo depois de #cases, que é para onde o menu "PRODUTOS" aponta: o
          carrossel acima mostra o que a agência sabe fazer, esta faixa mostra
          os produtos que ela fez e opera. Como última seção da página ficaria
          depois do bloco de CTAs, disputando atenção com a conversão. */}
      <ProductLogoCloud />
      {/* CTA Radar Section */}
      <section
        id="radar"
        className="relative w-full bg-background py-16 md:py-24 overflow-hidden border-t border-border/30"
      >
        <div className="mx-auto max-w-4xl px-6 text-center mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-500 mb-4">
            IA + WebDesign
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">
            Coloque seu negócio no radar
            <br className="hidden md:block" /> dos seus clientes
          </h2>
          <p className="mt-5 text-muted-foreground max-w-xl mx-auto">
            Combine agentes de IA, automações e interfaces de alto desempenho
            para que o seu negócio evolua, seja encontrado, lembrado e
            escolhido.
          </p>
        </div>

        <div className="relative flex h-[420px] w-full max-w-3xl mx-auto flex-col items-center justify-center space-y-4 overflow-hidden px-4">
          {/* Row 1 */}
          <div className="mx-auto w-full max-w-3xl">
            <div className="flex w-full items-center justify-center space-x-10 md:justify-between md:space-x-0">
              <IconContainer
                text="Agentes de IA"
                delay={0.2}
                icon={<Bot className="h-6 w-6 text-blue-400" />}
              />
              <IconContainer
                text="Presença Digital"
                delay={0.4}
                icon={<Globe className="h-6 w-6 text-blue-400" />}
              />
              <IconContainer
                text="Automações"
                delay={0.3}
                icon={<Zap className="h-6 w-6 text-blue-400" />}
              />
            </div>
          </div>
          {/* Row 2 */}
          <div className="mx-auto w-full max-w-md">
            <div className="flex w-full items-center justify-center space-x-10 md:justify-between md:space-x-0">
              <IconContainer
                text="Dados & Analytics"
                delay={0.5}
                icon={<Database className="h-6 w-6 text-blue-400" />}
              />
              <IconContainer
                text="Redes Neurais"
                delay={0.8}
                icon={<Brain className="h-6 w-6 text-blue-400" />}
              />
            </div>
          </div>
          {/* Row 3 */}
          <div className="mx-auto w-full max-w-3xl">
            <div className="flex w-full items-center justify-center space-x-10 md:justify-between md:space-x-0">
              <IconContainer
                text="Integrações"
                delay={0.6}
                icon={<Network className="h-6 w-6 text-blue-400" />}
              />
              <IconContainer
                text="Software"
                delay={0.7}
                icon={<Code2 className="h-6 w-6 text-blue-400" />}
              />
            </div>
          </div>

          <Radar className="absolute -bottom-12" />
          <div className="absolute bottom-0 z-[41] h-px w-full bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
        </div>
      </section>

      <FeatureSections />
      <ShowcaseSection />

      {/* CTAs Block */}
      <section className="pt-14 md:pt-20 bg-background">
        <div className="mx-auto max-w-5xl px-6 flex flex-col gap-6 pb-14 md:pb-20">
          <Cta4 />
          <CtaCard
            title="Websites que Convertem"
            subtitle={
              <>
                Seu negócio merece uma presença digital{" "}
                <span className="text-blue-500">que vende.</span>
              </>
            }
            description="Criamos Websites de alto desempenho com design profissional, copywriting estratégico e integração com IA, prontas para atrair, engajar e converter seus clientes."
            buttonText="Criar minha Landing Page"
            buttonUrl="https://lp.aglabs.ia.br/"
            imageSrc="/img/cta-websites.webp"
            imageAlt="AG LABS - Landing Pages"
          />
        </div>
        <PerspectiveMarqueePlayer />
        <CtaCustomProject />
        <div className="w-full bg-[#050505] py-14 md:py-20">
          <div className="mx-auto max-w-5xl px-6">
            <CtaEmailCard
              title="Fique ligado!"
              description="Receba conteúdos exclusivos, automações e novidades com exclusividade."
              buttonText="Quero receber"
              inputPlaceholder="Seu melhor e-mail"
              imageSrc="/img/cta-email-bg.webp"
              onSubmit={handleEmailSubmit}
            />
          </div>
        </div>
      </section>

      <FaqSection
        items={institutionalFaq}
        eyebrow="Perguntas frequentes"
        title="Dúvidas sobre IA para o seu negócio"
        subtitle="Agentes de IA, automação de processos e atendimento inteligente — respostas rápidas sobre como a AG LABS ajuda a sua empresa."
      />

      <Footer />
    </>
  );
};

export default HomePage;
