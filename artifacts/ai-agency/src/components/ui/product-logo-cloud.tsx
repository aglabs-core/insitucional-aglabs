import { Plus } from "lucide-react";

type Product = {
  name: string;
  logo: string;
  href: string;
};

// Produtos de marca própria: nome, domínio e entidade próprios, feitos e
// operados pela AG LABS. Entram na home como prova concreta do que a agência
// constrói — o carrossel de #cases fala das capacidades, esta faixa mostra os
// produtos que existem e estão no ar.
const PRODUCTS: Product[] = [
  {
    name: "Barberias",
    logo: "/logos/barberias.png",
    href: "https://barberias.com.br/",
  },
  {
    name: "Members",
    logo: "/logos/members.png",
    href: "https://members.ia.br/",
  },
  {
    name: "Viajeki",
    logo: "/logos/viajeki.png",
    href: "https://viajeki.com.br/",
  },
  {
    name: "AG LABS App",
    // Direto no app. Quem clica um logo aqui quer usar a ferramenta, não ler
    // sobre ela — a página descritiva é a LP, lp.aglabs.app.br.
    logo: "/logos/app-aglabs.png",
    href: "https://aglabs.app.br/",
  },
];

// Quatro colunas em qualquer largura — no mobile a faixa só funciona
// visualmente se os quatro ficarem na mesma linha.
const CELL = [
  "border-r bg-white/[0.03]",
  "border-r",
  "border-r bg-white/[0.03]",
  "",
];

export function ProductLogoCloud() {
  return (
    <section
      id="marcas-proprias"
      className="w-full bg-background py-16 md:py-24 border-t border-border/30"
    >
      <div className="mx-auto max-w-4xl px-6 text-center mb-10 md:mb-14">
        <p className="text-xs font-semibold uppercase tracking-widest text-blue-500 mb-4">
          Marcas próprias
        </p>
        <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">
          Produtos que a AG LABS construiu
        </h2>
        <p className="mt-5 text-muted-foreground max-w-xl mx-auto">
          Plataformas com marca e operação próprias, no ar e em uso. São elas
          que mostram, na prática, o que a agência entrega.
        </p>
      </div>

      {/* As linhas de cima e de baixo atravessam a página inteira; a malha
          fica centralizada e fechada dos lados, para os logos respirarem
          juntos em vez de se espalharem pela largura toda. */}
      <div className="relative w-full border-y border-white/10">
        <div className="mx-auto grid w-full max-w-2xl grid-cols-4 border-x border-white/10">
          {PRODUCTS.map((product, i) => (
            <a
              key={product.name}
              href={product.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`group relative flex flex-col items-center justify-center gap-2 border-white/10 px-1 py-6 transition-colors hover:bg-white/[0.07] sm:gap-3 sm:px-4 sm:py-8 ${CELL[i]}`}
            >
              <img
                src={product.logo}
                alt={product.name}
                width={256}
                height={256}
                loading="lazy"
                decoding="async"
                className="pointer-events-none h-8 w-auto select-none object-contain opacity-90 transition-opacity duration-300 group-hover:opacity-100 sm:h-12"
              />
              <span className="text-center text-[10px] font-medium leading-tight tracking-wide text-white sm:text-sm">
                {product.name}
              </span>

              {/* O "+" marca o encontro dos divisores com as linhas da faixa. */}
              {i < 3 && (
                <Plus
                  strokeWidth={1}
                  aria-hidden="true"
                  className="pointer-events-none absolute -bottom-[12.5px] -right-[12.5px] z-10 h-6 w-6 text-white/25"
                />
              )}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
