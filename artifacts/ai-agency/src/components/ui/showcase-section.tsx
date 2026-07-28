import { ArrowUpRight } from "lucide-react";

export default function ShowcaseSection() {
  return (
    <div className="relative mx-auto max-w-5xl px-6 py-16">
      <div className="absolute -z-10 size-[400px] -top-10 -left-20 aspect-square rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />

      <p className="text-white text-lg text-left max-w-3xl leading-relaxed">
        A AG LABS transforma sua visão digital em produtos de alto desempenho —
        agentes de IA, automações inteligentes e interfaces que realmente
        convertem.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 mt-10 gap-10 items-start">
        <div className="md:col-span-2">
          {/* Ver a nota em feature-sections.tsx: as imagens saíram do hotlink
              para raw.githubusercontent.com e passaram a ser servidas daqui,
              em WebP (750 KB -> 59 KB). */}
          <img
            alt="AG LABS - plataforma de IA"
            src="/img/image-4.webp"
            width={1017}
            height={678}
            loading="lazy"
            decoding="async"
            className="rounded-2xl w-full"
          />
        </div>

        <div className="md:col-span-1 flex flex-col">
          <img
            alt="AG LABS - resultados"
            src="/img/image-3.webp"
            width={969}
            height={669}
            loading="lazy"
            decoding="async"
            className="rounded-2xl hover:-translate-y-0.5 transition duration-300"
          />
          <h3 className="text-2xl text-white font-medium mt-6 leading-snug">
            Inteligência aplicada para crescimento evolutivo e resultados reais.
          </h3>
          <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
            Unimos IA, design e estratégia para que o seu negócio evolua com
            eficiência, escala e identidade.
          </p>
          <a
            href="#services"
            onClick={(e) => {
              e.preventDefault();
              document
                .querySelector("#services")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
            className="group flex items-center gap-2 mt-5 text-blue-400 hover:text-blue-300 transition text-sm font-medium"
          >
            Conheça nossas soluções
            <ArrowUpRight className="size-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition duration-300" />
          </a>
        </div>
      </div>
    </div>
  );
}
