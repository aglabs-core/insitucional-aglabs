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
  {
    name: "MeCard",
    logo: "/logos/mecard.png",
    href: "https://mecard.com.br/",
  },
];

// No mobile, duas linhas (três em cima, dois centrados embaixo): com os
// cinco lado a lado as células ficavam estreitas e os logos, espremidos.
// A malha tem seis colunas e cada célula ocupa duas; a partir de `sm` volta
// a ser uma linha de cinco.
const CELL = [
  "col-span-2 border-b border-r sm:col-span-1 sm:border-b-0 bg-white/[0.03]",
  "col-span-2 border-b border-r sm:col-span-1 sm:border-b-0",
  "col-span-2 border-b sm:col-span-1 sm:border-b-0 sm:border-r bg-white/[0.03]",
  "col-span-2 col-start-2 border-l border-r sm:col-span-1 sm:col-start-auto sm:border-l-0",
  "col-span-2 border-r sm:col-span-1 sm:border-r-0 bg-white/[0.03]",
];

export function ProductLogoCloud() {
  return (
    <section
      id="marcas-proprias"
      className="w-full bg-background py-16 md:py-24"
    >
      <div className="mx-auto max-w-4xl px-6 text-center mb-10 md:mb-14">
        <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">
          Produtos AG LABS
        </h2>
      </div>

      {/* As linhas de cima e de baixo atravessam a página inteira; a malha
          fica centralizada e fechada dos lados, para os logos respirarem
          juntos em vez de se espalharem pela largura toda. */}
      <div className="relative w-full border-y border-white/10">
        <div className="mx-auto grid w-full max-w-2xl grid-cols-6 sm:grid-cols-5 border-x border-white/10">
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
              {i < 4 && (
                <Plus
                  strokeWidth={1}
                  aria-hidden="true"
                  className={`pointer-events-none absolute -bottom-[12.5px] -right-[12.5px] z-10 h-6 w-6 text-white/25 ${i === 2 ? "hidden sm:block" : ""}`}
                />
              )}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
