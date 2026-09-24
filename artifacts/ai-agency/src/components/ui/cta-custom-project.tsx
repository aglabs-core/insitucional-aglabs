"use client";

import { ChevronRight } from "lucide-react";
import { HoverButton } from "@/components/ui/hover-button";

const WHATSAPP_URL =
  "https://wa.me/5564993259857?text=Olá!%20Tenho%20interesse%20em%20um%20projeto%20personalizado%20com%20a%20AG%20LABS.";

export function CtaCustomProject() {
  return (
    <section
      id="projetos-personalizados"
      className="relative w-full pt-20 px-6 text-center md:px-8 
      min-h-[calc(100vh-40px)] overflow-hidden 
      bg-[linear-gradient(to_bottom,#fff,#ffffff_50%,#e8e8e8_88%)]  
      dark:bg-[linear-gradient(to_bottom,#050505,#050505_50%,#0d1a3a_78%,#050505_99%)]"
    >
      {/* Grid BG */}
      <div
        className="absolute z-0 inset-0 opacity-60 h-[600px] w-full 
        bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] 
        dark:bg-[linear-gradient(to_right,#1e3a5f_1px,transparent_1px),linear-gradient(to_bottom,#1e3a5f_1px,transparent_1px)]
        bg-[size:6rem_5rem] 
        [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]"
      />

      {/* Radial Accent */}
      <div
        className="absolute z-0 left-1/2 top-[calc(100%-90px)] lg:top-[calc(100%-150px)] 
        h-[500px] w-[700px] md:h-[500px] md:w-[1100px] lg:h-[750px] lg:w-[140%] 
        -translate-x-1/2 rounded-[100%] border border-blue-500/40
        bg-[radial-gradient(closest-side,#fff_82%,#3b82f6)] 
        dark:bg-[radial-gradient(closest-side,#050505_82%,#3b82f6)] 
        animate-fade-up"
      />

      {/* Content */}
      <div className="relative z-10">
        {/* Eyebrow */}
        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="group"
        >
          <span
            className="text-sm text-gray-600 dark:text-gray-400 font-geist mx-auto px-5 py-2 
            bg-gradient-to-tr from-zinc-300/5 via-gray-400/5 to-transparent  
            border-[2px] border-gray-300/20 dark:border-white/5 
            rounded-3xl w-fit tracking-tight uppercase flex items-center justify-center"
          >
            Soluções Personalizadas
            <ChevronRight className="inline w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
          </span>
        </a>

        {/* Title — h2: a página já tem o h1 do hero */}
        <h2
          className="animate-fade-in -translate-y-4 text-balance 
          bg-gradient-to-br from-black from-30% to-black/40 
          bg-clip-text py-6 text-5xl font-semibold leading-none tracking-tighter 
          text-transparent opacity-0 sm:text-6xl md:text-7xl lg:text-8xl 
          dark:from-white dark:to-white/40"
        >
          Precisa de um projeto personalizado?
        </h2>

        {/* Subtitle */}
        <p
          className="animate-fade-in mb-12 -translate-y-4 text-balance 
          text-lg tracking-tight text-gray-600 dark:text-gray-400 
          opacity-0 md:text-xl"
        >
          Desenvolvemos soluções sob medida para o seu negócio, agentes de IA,
          automações e interfaces feitas 100% personalizadas para a otimização
          de processos, do zero até a entrega.
        </p>

        {/* CTA */}
        <div className="flex justify-center">
          <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
            <HoverButton className="mt-[-20px] font-geist tracking-tighter text-center text-lg">
              Falar no WhatsApp
            </HoverButton>
          </a>
        </div>
      </div>

      {/* Bottom Fade */}
      <div
        className="animate-fade-up relative z-10 mt-32 opacity-0 [perspective:2000px] 
        after:absolute after:inset-0 after:z-50 
        after:[background:linear-gradient(to_top,hsl(var(--background))_10%,transparent)]"
      />
    </section>
  );
}
