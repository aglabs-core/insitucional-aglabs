"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";

interface SlideData {
  title: string;
  subtitle: string;
  description: string;
  accent: string;
  imageUrl: string;
  link?: string;
}

const slides: SlideData[] = [
  {
    title: "Websites que vendem",
    subtitle: "Infraestrutura digital",
    description:
      "Construímos a base digital do seu negócio — páginas, sistemas e automações conectadas — para transformar operações em máquinas previsíveis de aquisição e crescimento.",
    accent: "#C4956A",
    imageUrl:
      "/img/case-1.webp",
    link: "https://lp.aglabs.ia.br/",
  },
  {
    title: "Corporate Agent",
    subtitle: "Agentes Autônomos",
    description:
      "Desenvolvemos funcionários digitais de IA que aprendem e otimizam o seu negócio — reduzindo o tempo de análises, processos e treinamentos com 99,2% de precisão.",
    accent: "#8BA7B8",
    imageUrl:
      "/img/case-2.webp",
    link: "https://rag.aglabs.api.br/",
  },
  {
    title: "Software Performance",
    subtitle: "Produto / Interface",
    description:
      "Construímos ou redesenhamos o seu produto digital — otimizado para reduzir churns e aumentar o NPS logo após o lançamento.",
    accent: "#7A9E7E",
    imageUrl:
      "/img/case-3.webp",
    link: "https://templates.aglabs.ia.br/",
  },
  {
    title: "Workflows Inteligence",
    subtitle: "Dados / Sistema Inteligente",
    description:
      "Automatize tarefas rotineiras como pesquisas, envios de mensagens, criação de mídias, textos, leads, e insights automáticos — economizando horas mensais de trabalho.",
    accent: "#A78BFA",
    imageUrl:
      "/img/case-4.webp",
    link: "https://wf.aglabs.ia.br/",
  },
];

export default function ElegantCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const SLIDE_DURATION = 6000;
  const TRANSITION_DURATION = 800;

  const goToSlide = useCallback(
    (index: number, dir?: "next" | "prev") => {
      if (isTransitioning || index === currentIndex) return;
      setDirection(dir || (index > currentIndex ? "next" : "prev"));
      setIsTransitioning(true);
      setProgress(0);

      setTimeout(() => {
        setCurrentIndex(index);
        setTimeout(() => {
          setIsTransitioning(false);
        }, 50);
      }, TRANSITION_DURATION / 2);
    },
    [isTransitioning, currentIndex],
  );

  const goNext = useCallback(() => {
    const nextIndex = (currentIndex + 1) % slides.length;
    goToSlide(nextIndex, "next");
  }, [currentIndex, goToSlide]);

  const goPrev = useCallback(() => {
    const prevIndex = (currentIndex - 1 + slides.length) % slides.length;
    goToSlide(prevIndex, "prev");
  }, [currentIndex, goToSlide]);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      { threshold: 0.4 },
    );
    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (isPaused || !isInView) return;

    progressRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 100;
        return prev + 100 / (SLIDE_DURATION / 50);
      });
    }, 50);

    intervalRef.current = setInterval(() => {
      goNext();
    }, SLIDE_DURATION);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (progressRef.current) clearInterval(progressRef.current);
    };
  }, [currentIndex, isPaused, isInView, goNext]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 60) {
      if (diff > 0) goNext();
      else goPrev();
    }
  };

  const currentSlide = slides[currentIndex];

  return (
    <div
      ref={wrapperRef}
      className="carousel-wrapper"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background accent wash */}
      <div
        className="carousel-bg-wash"
        style={{
          background: `radial-gradient(ellipse at 70% 50%, ${currentSlide.accent}18 0%, transparent 70%)`,
        }}
      />

      <div className="carousel-inner">
        {/* Left: Text Content */}
        <div className="carousel-content">
          <div className="carousel-content-inner">
            {/* Collection number */}
            <div
              className={`carousel-collection-num ${isTransitioning ? "transitioning" : "visible"}`}
            >
              <span className="carousel-num-line" />
              <span className="carousel-num-text">
                {String(currentIndex + 1).padStart(2, "0")} /{" "}
                {String(slides.length).padStart(2, "0")}
              </span>
            </div>

            {/* Title */}
            <h2
              className={`carousel-title ${isTransitioning ? "transitioning" : "visible"}`}
            >
              {currentSlide.link ? (
                <a
                  href={currentSlide.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:opacity-80 transition-opacity"
                >
                  {currentSlide.title}
                </a>
              ) : (
                currentSlide.title
              )}
            </h2>

            {/* Subtitle */}
            <p
              className={`carousel-subtitle ${isTransitioning ? "transitioning" : "visible"}`}
              style={{ color: currentSlide.accent }}
            >
              {currentSlide.subtitle}
            </p>

            {/* Description */}
            <p
              className={`carousel-description ${isTransitioning ? "transitioning" : "visible"}`}
            >
              {currentSlide.description}
            </p>

            {/* Navigation Arrows */}
            <div className="carousel-nav-arrows">
              <button
                onClick={goPrev}
                className="carousel-arrow-btn"
                aria-label="Anterior"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={goNext}
                className="carousel-arrow-btn"
                aria-label="Próximo"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Right: Image */}
        <div className="carousel-image-container">
          <div
            className={`carousel-image-frame ${isTransitioning ? "transitioning" : "visible"}`}
          >
            {currentSlide.link ? (
              <a
                href={currentSlide.link}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full h-full"
              >
                <img
                  src={currentSlide.imageUrl}
                  alt={currentSlide.title}
                  className="carousel-image hover:opacity-90 transition-opacity cursor-pointer"
                />
              </a>
            ) : (
              <img
                src={currentSlide.imageUrl}
                alt={currentSlide.title}
                className="carousel-image"
              />
            )}
            <div
              className="carousel-image-overlay"
              style={{
                background: `linear-gradient(135deg, ${currentSlide.accent}22 0%, transparent 50%)`,
              }}
            />
          </div>

          <div
            className="carousel-frame-corner carousel-frame-corner--tl"
            style={{ borderColor: currentSlide.accent }}
          />
          <div
            className="carousel-frame-corner carousel-frame-corner--br"
            style={{ borderColor: currentSlide.accent }}
          />
        </div>
      </div>

      {/* Progress Indicators */}
      <div className="carousel-progress-bar">
        {slides.map((slide, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`carousel-progress-item ${index === currentIndex ? "active" : ""}`}
            aria-label={`Ir para slide ${index + 1}`}
          >
            <div className="carousel-progress-track">
              <div
                className="carousel-progress-fill"
                style={{
                  width:
                    index === currentIndex
                      ? `${progress}%`
                      : index < currentIndex
                        ? "100%"
                        : "0%",
                  backgroundColor:
                    index === currentIndex ? currentSlide.accent : undefined,
                }}
              />
            </div>
            <span className="carousel-progress-label">{slide.title}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
