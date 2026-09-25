import { Check } from "lucide-react";
import { ButtonColorful } from "@/components/ui/button-colorful";

interface Cta4Props {
  title?: string;
  description?: string;
  buttonText?: string;
  buttonUrl?: string;
  items?: string[];
}

export const Cta4 = ({
  title = "Seu funcionário digital, 24h, não falta, não erra...",
  description = "Treinado para operar como parte do seu negócio 24h por dia, sem falhas, sem limites. Um agente que não só atende, opera, decide e executa como parte do seu time",
  buttonText = "Automatizar minha empresa →",
  buttonUrl = "https://rag.aglabs.ia.br/",
  items = [
    "Atendentes de WhatsApp que nunca dormem",
    "Agentes que executam, decidem e reportam",
    "Análise de dados e relatórios no piloto automático",
    "Criação de conteúdo e copy para marketing",
    "Prospecção e qualificação de leads com IA",
  ],
}: Cta4Props) => {
  return (
    <div className="flex flex-col items-start justify-between gap-10 rounded-lg bg-muted px-6 py-10 md:flex-row lg:px-20 lg:py-16">
      <div className="md:w-1/2 space-y-5">
        <h4 className="text-2xl font-bold md:text-3xl leading-snug">
          {title}
        </h4>
        <p className="text-muted-foreground text-sm leading-relaxed">
          {description}
        </p>
        <ButtonColorful
          label={buttonText}
          onClick={() => window.open(buttonUrl, "_blank", "noopener,noreferrer")}
          className="mt-2"
        />
      </div>
      <div className="md:w-5/12">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
          O que os agentes fazem por você
        </p>
        <ul className="flex flex-col space-y-3 text-sm font-medium">
          {items.map((item, idx) => (
            <li className="flex items-start gap-3" key={idx}>
              <Check className="mt-0.5 size-4 flex-shrink-0 text-blue-500" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
