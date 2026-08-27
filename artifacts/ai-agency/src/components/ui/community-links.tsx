import { FaWhatsapp, FaDiscord } from "react-icons/fa";

/**
 * Convite para a comunidade, logo depois da captura de e-mail.
 *
 * Mesmos dois destinos do modal "Comunidade" da bio (bio.aglabs.ia.br) — se um
 * link mudar lá, muda aqui também.
 *
 * Aqui não há modal: a bio precisa dele porque é uma lista de cards onde cada
 * item tem um destino só. Nesta página o bloco já é uma seção própria, então
 * os dois ícones cabem lado a lado e um passo a menos até o grupo.
 */

const CANAIS = [
  {
    nome: "WhatsApp",
    rotulo: "Entrar no grupo do WhatsApp",
    href: "https://chat.whatsapp.com/KL7qvbpS6KLHP092emJmjb",
    Icone: FaWhatsapp,
  },
  {
    nome: "Discord",
    rotulo: "Entrar no servidor do Discord",
    href: "https://discord.gg/4dyFnQP9fy",
    Icone: FaDiscord,
  },
];

export function CommunityLinks() {
  return (
    <section className="relative w-full bg-[#050505] pt-20 pb-24 md:pt-24 md:pb-28">
      <div className="mx-auto max-w-5xl px-6 text-center">
        {/* Convite, não manchete: um título do tamanho dos das outras seções
            competiria com o CTA de e-mail logo acima. */}
        <h2 className="text-sm font-medium uppercase tracking-[0.2em] text-blue-500 md:text-base">
          Entre para nossa comunidade
        </h2>

        <div className="mt-6 flex items-center justify-center gap-8">
          {CANAIS.map(({ nome, rotulo, href, Icone }) => (
            <a
              key={nome}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={rotulo}
              className="text-blue-500 transition-colors duration-300 hover:text-blue-400"
            >
              <Icone className="h-7 w-7 md:h-8 md:w-8" aria-hidden="true" />
            </a>
          ))}
        </div>
      </div>

      {/* Saída em degradê para a cor da seção seguinte: sem isto o preto desta
          seção encontrava o cinza do FAQ numa linha reta atravessando a tela. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-b from-transparent to-background"
      />
    </section>
  );
}
