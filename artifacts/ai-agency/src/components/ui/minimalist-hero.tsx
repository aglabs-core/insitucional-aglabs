import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface MinimalistHeroProps {
  logoText: string;
  navLinks: { label: string; href: string }[];
  mainText: string;
  readMoreLink: string;
  imageSrc: string;
  /** Variantes da imagem para o navegador escolher pelo tamanho da tela. */
  imageSrcSet?: string;
  imageSizes?: string;
  imageAlt: string;
  overlayText: {
    part1: string;
    part2: string;
  };
  socialLinks: { icon: React.ComponentType<{ className?: string }>; href: string }[];
  locationText: string;
  className?: string;
}

function smoothScrollTo(href: string) {
  if (!href.startsWith('#') || href === '#') return;
  const target = document.querySelector(href);
  if (target) {
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <a
    href={href}
    onClick={(e) => {
      if (href.startsWith('#')) {
        e.preventDefault();
        smoothScrollTo(href);
      }
    }}
    className="text-sm font-medium tracking-widest text-foreground/60 transition-colors hover:text-foreground"
  >
    {children}
  </a>
);

const SocialIcon = ({ href, icon: Icon }: { href: string; icon: React.ComponentType<{ className?: string }> }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" className="text-foreground/60 transition-colors hover:text-foreground">
    <Icon className="h-5 w-5" />
  </a>
);

export const MinimalistHero = ({
  logoText,
  navLinks,
  mainText,
  readMoreLink,
  imageSrc,
  imageSrcSet,
  imageSizes,
  imageAlt,
  overlayText,
  socialLinks,
  locationText,
  className,
}: MinimalistHeroProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isMenuOpen]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  const handleNavClick = (href: string) => {
    setIsMenuOpen(false);
    if (href.startsWith('#') && href !== '#') {
      setTimeout(() => smoothScrollTo(href), 100);
    }
  };

  return (
    <div
      className={cn(
        'relative flex h-screen w-full flex-col items-center justify-between overflow-hidden bg-background px-6 py-6 font-sans md:px-12 md:py-8',
        className
      )}
    >
      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            ref={menuRef}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed right-0 top-0 z-50 h-full w-72 bg-background border-l border-border/40 flex flex-col md:hidden shadow-2xl"
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-6 py-6 border-b border-border/30">
              <span className="text-lg font-bold tracking-wider">{logoText}</span>
              <button
                onClick={() => setIsMenuOpen(false)}
                aria-label="Fechar menu"
                className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-foreground/10 transition-colors"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5 text-foreground" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Nav Links */}
            <nav className="flex flex-col gap-1 px-4 py-6 flex-1">
              {navLinks.map((link, i) => (
                <motion.a
                  key={link.label}
                  href={link.href}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 + 0.1 }}
                  onClick={(e) => {
                    if (link.href.startsWith('#')) e.preventDefault();
                    handleNavClick(link.href);
                  }}
                  className="flex items-center rounded-lg px-4 py-3 text-sm font-semibold tracking-widest text-foreground/70 hover:bg-foreground/8 hover:text-foreground transition-colors"
                >
                  {link.label}
                </motion.a>
              ))}
            </nav>

            {/* Social Icons in drawer */}
            <div className="flex items-center gap-4 px-8 py-6 border-t border-border/30">
              {socialLinks.map((link, index) => (
                <SocialIcon key={index} href={link.href} icon={link.icon} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="z-30 flex w-full max-w-7xl items-center justify-between">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          style={{ willChange: 'transform, opacity' }}
          className="text-xl font-bold tracking-wider"
        >
          {logoText}
        </motion.div>
        <div className="hidden items-center space-x-8 md:flex">
          {navLinks.map((link) => (
            <NavLink key={link.label} href={link.href}>
              {link.label}
            </NavLink>
          ))}
        </div>
        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          style={{ willChange: 'transform, opacity' }}
          onClick={() => setIsMenuOpen((prev) => !prev)}
          className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 rounded-lg hover:bg-foreground/10 transition-colors md:hidden"
          aria-label={isMenuOpen ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={isMenuOpen}
        >
          <motion.span
            animate={isMenuOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
            transition={{ duration: 0.25 }}
            className="block h-0.5 w-6 origin-center bg-foreground"
          />
          <motion.span
            animate={isMenuOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
            transition={{ duration: 0.2 }}
            className="block h-0.5 w-6 bg-foreground"
          />
          <motion.span
            animate={isMenuOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
            transition={{ duration: 0.25 }}
            className="block h-0.5 w-5 origin-center bg-foreground"
          />
        </motion.button>
      </header>

      {/* Main Content */}
      <div className="relative flex w-full max-w-7xl flex-grow flex-col items-center justify-center gap-8 md:grid md:grid-cols-3 md:items-center md:gap-0">

        {/* Left: description text — desktop only */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          style={{ willChange: 'transform, opacity' }}
          className="z-20 hidden md:block md:order-1 text-left self-center"
        >
          <p className="max-w-[220px] text-sm leading-relaxed text-foreground/70">{mainText}</p>
          <a
            href={readMoreLink}
            onClick={(e) => {
              if (readMoreLink.startsWith('#')) {
                e.preventDefault();
                smoothScrollTo(readMoreLink);
              }
            }}
            className="mt-4 inline-block text-sm font-medium text-foreground underline decoration-from-font"
          >
            Saiba Mais
          </a>
        </motion.div>

        {/* Center: image + circle */}
        <div className="relative order-1 md:order-2 flex justify-center items-center w-full h-full">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
            style={{ willChange: 'transform, opacity' }}
            className="absolute z-0 h-[310px] w-[310px] rounded-full bg-blue-600/90 sm:h-[360px] sm:w-[360px] md:h-[410px] md:w-[410px] lg:h-[456px] lg:w-[456px]"
          />
          <motion.img
            src={imageSrc}
            srcSet={imageSrcSet}
            sizes={imageSizes}
            alt={imageAlt}
            className="relative z-10 w-56 object-contain md:w-64 lg:w-72 scale-[1.5] md:scale-[1.7] lg:scale-[2.1]"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            style={{ willChange: 'transform, opacity' }}
            loading="eager"
            fetchPriority="high"
            decoding="async"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.onerror = null;
              target.src = `https://placehold.co/400x500/2563eb/ffffff?text=AG+LABS`;
            }}
          />
        </div>

        {/* Right: headline */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          style={{ willChange: 'transform, opacity' }}
          className="z-20 order-2 md:order-3 flex flex-col items-center text-center md:items-start md:text-left gap-4 self-center"
        >
          <h1 className="text-5xl font-extrabold leading-tight text-foreground sm:text-6xl md:text-5xl lg:text-6xl xl:text-7xl">
            <span className="sr-only">
              AG LABS — Agência de Inteligência Artificial e Automação para Negócios.{" "}
            </span>
            <span aria-hidden="true">
              {overlayText.part1}
              <br />
              {overlayText.part2}
            </span>
          </h1>

          {/* Mobile-only description */}
          <div className="md:hidden">
            <p className="max-w-xs text-sm leading-relaxed text-foreground/70">{mainText}</p>
            <a
              href={readMoreLink}
              onClick={(e) => {
                if (readMoreLink.startsWith('#')) {
                  e.preventDefault();
                  smoothScrollTo(readMoreLink);
                }
              }}
              className="mt-3 inline-block text-sm font-medium text-foreground underline decoration-from-font"
            >
              Saiba Mais
            </a>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="z-30 flex w-full max-w-7xl items-center justify-between pt-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          style={{ willChange: 'transform, opacity' }}
          className="flex items-center space-x-4"
        >
          {socialLinks.map((link, index) => (
            <SocialIcon key={index} href={link.href} icon={link.icon} />
          ))}
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          style={{ willChange: 'transform, opacity' }}
          className="text-sm font-medium text-foreground/70"
        >
          {locationText}
        </motion.div>
      </footer>
    </div>
  );
};
