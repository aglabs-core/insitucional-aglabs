"use client";

import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

export default function AboutSection() {
  return (
    <div id="sobre-nos" className="flex flex-col">
      {/* ---------------- HERO SECTION ---------------- */}
      <section className="pt-0 pb-16 md:pb-28 bg-background">
        <div className="mx-auto max-w-6xl space-y-2 px-6">
          <img
            className="rounded-xl object-cover w-full h-[240px] md:h-[460px]"
            src="/img/about-equipe.webp"
            alt="AG LABS - Inteligência Artificial"
          />

          <div className="grid gap-6 md:grid-cols-2 md:gap-12 pt-6">
            <h2 className="text-3xl md:text-4xl font-semibold text-white leading-snug">
              O ecossistema <span className="text-blue-500">AG LABS</span>{" "}
              <span className="text-gray-400">
                une agentes, produtos e plataformas.
              </span>
            </h2>
            <div className="space-y-6 text-muted-foreground">
              <p>
                A AG LABS vai além dos modelos. Construímos um ecossistema
                completo — de agentes a APIs e plataformas que ajudam empresas a
                inovar com inteligência artificial.
              </p>
              <Button
                asChild
                variant="secondary"
                size="sm"
                className="gap-1 pr-1.5"
              >
                <a href="#services">
                  <span>Saiba Mais</span>
                  <ChevronRight className="size-4" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- ABOUT SECTION ---------------- */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-6xl space-y-16 px-6">
          {/* Header */}
          <div className="grid gap-6 text-center md:grid-cols-2 md:gap-12 md:text-left">
            <h2 className="text-4xl md:text-5xl font-semibold text-white">
              Transformando Negócios
            </h2>
            <p className="text-muted-foreground">
              Fundada por Antônio Garcia, a AG LABS conta com uma equipe
              especializada em criar soluções inovadoras que capacitam negócios
              a prosperar na era digital com inteligência artificial.
            </p>
          </div>

          {/* ---------------- THREE CARDS LAYOUT ---------------- */}
          <div className="flex flex-col md:flex-row gap-6 mt-16">
            {/* LEFT BIG IMAGE */}
            <div className="md:flex-1">
              <img
                src="/img/about-founder.webp"
                alt="AG LABS"
                className="rounded-xl object-cover object-top md:object-center w-full h-[300px] sm:h-[360px] md:h-full"
              />
            </div>

            {/* RIGHT TWO CARDS */}
            <div className="flex flex-col gap-6 md:flex-1">
              {/* FIRST CARD */}
              <motion.div
                whileHover={{ scale: 1.03 }}
                transition={{ type: "spring", stiffness: 250, damping: 20 }}
                className="group relative overflow-hidden rounded-xl bg-black text-white shadow-lg"
              >
                <div className="relative h-60 sm:h-64 md:h-48 w-full overflow-hidden">
                  <img
                    src="/img/about-card-1.webp"
                    alt="Acelere o crescimento"
                    className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                  />
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black via-black/70 to-transparent" />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold">Acelere o Crescimento</h3>
                  <p className="mt-2 text-sm text-gray-300">
                    Nossas soluções e agentes impulsionam inovação, eficiência e
                    resultados mensuráveis para empresas.
                  </p>
                  <Button
                    asChild
                    variant="outline"
                    className="mt-4 border-white text-white hover:bg-white hover:text-black"
                  >
                    <a href="#radar">Saiba Mais</a>
                  </Button>
                </div>
              </motion.div>

              {/* SECOND CARD */}
              <motion.div
                whileHover={{ scale: 1.03 }}
                transition={{ type: "spring", stiffness: 250, damping: 20 }}
                className="relative overflow-hidden rounded-xl bg-muted shadow-lg"
              >
                <img
                  src="/img/about-card-2.webp"
                  alt="Design de Alto Desempenho"
                  className="h-full w-full object-cover min-h-[220px] sm:min-h-[240px] md:min-h-[220px]"
                />
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/70 to-transparent text-white">
                  <h3 className="text-xl font-bold">
                    Design Pronto para o Futuro
                  </h3>
                  <p className="mt-2 text-sm text-gray-200">
                    Interfaces intuitivas e escaláveis para negócios modernos
                    combinando estética e funcionalidade.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
