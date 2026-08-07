"use client";

import * as React from "react";
import { motion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, CheckCircle, Loader2 } from "lucide-react";

// O onSubmit nativo da div recebe um evento; o daqui recebe o e-mail já
// extraído. As duas assinaturas não convivem, então a nativa sai fora.
interface CtaEmailCardProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSubmit"> {
  imageSrc: string;
  title: string;
  description: string;
  inputPlaceholder?: string;
  buttonText: string;
  onSubmit?: (email: string) => Promise<void>;
}

const CtaEmailCard = React.forwardRef<HTMLDivElement, CtaEmailCardProps>(
  (
    {
      className,
      imageSrc,
      title,
      description,
      inputPlaceholder = "Seu e-mail",
      buttonText,
      onSubmit,
      ...props
    },
    ref
  ) => {
    const [email, setEmail] = React.useState("");
    const [loading, setLoading] = React.useState(false);
    const [success, setSuccess] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!email) return;
      setLoading(true);
      setError(null);
      try {
        if (onSubmit) {
          await onSubmit(email);
        }
        setSuccess(true);
        setEmail("");
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Erro ao cadastrar. Tente novamente.");
      } finally {
        setLoading(false);
      }
    };

    // Anotados como Variants para o "spring" não ser inferido como string
    // solta — o framer-motion espera o literal.
    const containerVariants: Variants = {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: 0.2,
          delayChildren: 0.1,
        },
      },
    };

    const itemVariants: Variants = {
      hidden: { y: 20, opacity: 0 },
      visible: {
        y: 0,
        opacity: 1,
        transition: {
          type: "spring",
          stiffness: 100,
          damping: 12,
        },
      },
    };

    return (
      <div
        ref={ref}
        className={cn(
          "relative w-full overflow-hidden rounded-xl border bg-card text-card-foreground shadow",
          className
        )}
        {...props}
      >
        <img
          src={imageSrc}
          alt="Background"
          className="absolute inset-0 h-full w-full object-cover"
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-black/60" />

        <motion.div
          className="relative z-10 grid h-full grid-cols-1 items-center gap-8 p-8 md:grid-cols-2 md:p-12 lg:p-16"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <div className="flex flex-col items-start text-left text-white">
            <motion.h2
              className="text-3xl font-extrabold tracking-tight md:text-4xl lg:text-5xl"
              variants={itemVariants}
            >
              {title}
            </motion.h2>
            <motion.p
              className="mt-4 max-w-xl text-lg text-neutral-200"
              variants={itemVariants}
            >
              {description}
            </motion.p>
          </div>

          <motion.div
            className="flex w-full max-w-md flex-col items-center justify-center"
            variants={itemVariants}
          >
            {success ? (
              <div className="flex flex-col items-center gap-3 text-white text-center">
                <CheckCircle className="h-10 w-10 text-green-400" />
                <p className="text-lg font-semibold">Obrigado! Entraremos em contato em breve.</p>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="flex w-full flex-col gap-3 sm:flex-row"
              >
                <Input
                  type="email"
                  placeholder={inputPlaceholder}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 flex-grow border-neutral-700 bg-neutral-800/50 text-white placeholder:text-neutral-400"
                  aria-label={inputPlaceholder}
                  required
                  disabled={loading}
                />
                <Button
                  type="submit"
                  size="lg"
                  className="h-12 bg-white text-black hover:bg-neutral-200 whitespace-nowrap"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      {buttonText}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            )}
            {error && (
              <p className="mt-2 text-sm text-red-400">{error}</p>
            )}
          </motion.div>
        </motion.div>
      </div>
    );
  }
);

CtaEmailCard.displayName = "CtaEmailCard";

export { CtaEmailCard };
