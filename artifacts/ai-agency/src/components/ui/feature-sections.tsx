export default function FeatureSections() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap');
        * {
          font-family: 'Poppins', sans-serif;
        }
      `}</style>

      <div className="mx-auto max-w-6xl w-full px-6 py-10">
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12">
          {/* Servida do próprio site. Antes vinha por hotlink de
              raw.githubusercontent.com — o repositório de um template de
              terceiro: se aquele projeto renomeasse o arquivo, a imagem sumia
              do institucional sem aviso, e o `raw` do GitHub responde sem CDN
              de cache. Convertida para WebP no caminho (1,6 MB -> 573 KB).
              O alt estava vazio, e esta imagem não é decoração. */}
          <img
            className="w-full md:max-w-xl lg:max-w-2xl"
            src="/img/group-image-1.webp"
            width={1338}
            height={1350}
            loading="lazy"
            decoding="async"
            alt="Painel da AG LABS com indicadores de automação e agentes de IA em operação"
          />
          <div className="space-y-10 w-full md:max-w-sm">
            <div className="flex items-start gap-6">
              <div className="p-5 shrink-0 aspect-square bg-violet-100 rounded-full">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 28 28"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M14 18.667V24.5m4.668-8.167V24.5m4.664-12.833V24.5m2.333-21L15.578 13.587a.584.584 0 0 1-.826 0l-3.84-3.84a.583.583 0 0 0-.825 0L2.332 17.5M4.668 21v3.5m4.664-8.167V24.5"
                    stroke="#7F22FE"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="space-y-2">
                <h3 className="text-base font-semibold text-slate-700">
                  Resultados em Tempo Real
                </h3>
                <p className="text-sm text-slate-600">
                  Desempenho e performance acompanhados ao vivo com dashboards
                  alimentados por IA.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-6">
              <div className="p-5 shrink-0 aspect-square bg-green-100 rounded-full">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 28 28"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M14 11.667A2.333 2.333 0 0 0 11.667 14c0 1.19-.117 2.929-.304 4.667m4.972-3.36c0 2.776 0 7.443-1.167 10.36m5.004-1.144c.14-.7.502-2.683.583-3.523M2.332 14a11.667 11.667 0 0 1 21-7m-21 11.667h.01m23.092 0c.233-2.333.152-6.246 0-7"
                    stroke="#00A63E"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M5.832 22.75C6.415 21 6.999 17.5 6.999 14a7 7 0 0 1 .396-2.333m2.695 13.999c.245-.77.525-1.54.665-2.333m-.255-15.4A7 7 0 0 1 21 14v2.333"
                    stroke="#00A63E"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="space-y-2">
                <h3 className="text-base font-semibold text-slate-700">
                  Segurança & Privacidade
                </h3>
                <p className="text-sm text-slate-600">
                  Infraestrutura com criptografia ponta a ponta e conformidade
                  com a LGPD.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-6">
              <div className="p-5 shrink-0 aspect-square bg-orange-100 rounded-full">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 28 28"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M4.668 25.666h16.333a2.333 2.333 0 0 0 2.334-2.333V8.166L17.5 2.333H7a2.333 2.333 0 0 0-2.333 2.333v4.667"
                    stroke="#F54900"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M16.332 2.333V7a2.334 2.334 0 0 0 2.333 2.333h4.667m-21 8.167h11.667M10.5 21l3.5-3.5-3.5-3.5"
                    stroke="#F54900"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="space-y-2">
                <h3 className="text-base font-semibold text-slate-700">
                  Relatórios Personalizados
                </h3>
                <p className="text-sm text-slate-600">
                  Exporte relatórios profissionais de desempenho, ROI e
                  crescimento para qualquer stakeholder.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
