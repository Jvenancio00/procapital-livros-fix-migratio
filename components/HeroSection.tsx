"use client";

import { useCallback, useRef } from "react";
import Link from "next/link";
import { ArrowRight, Globe2 } from "lucide-react";
import { BOOKS } from "@/data/books";
import BookCover from "@/components/BookCover";
import HeroFilmLayer from "@/components/HeroFilmLayer";
import { useLanguage } from "@/context/LanguageContext";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import {
  HERO_POSTER_DIMENSIONS,
  HERO_POSTER_LQIP,
  HERO_POSTER_SRC,
  HERO_POSTER_WEBP_SRC,
} from "@/lib/hero";

// "Colagem" de capas em destaque: um grid de 3 colunas com deslocamento
// vertical, inclinação e flutuação por item (ver .hero-collage-item em
// globals.css). Deliberadamente grid e não position:absolute — com absolute as
// capas saíam da coluna e as legendas ficavam por cima da capa vizinha.
const COLLAGE = [
  { tilt: "-5deg", offset: "0.75rem", delay: "0s" },
  { tilt: "2.5deg", offset: "3.25rem", delay: "1.1s" },
  { tilt: "-1.5deg", offset: "1.5rem", delay: "2.2s" },
];

/**
 * Banner cinematográfico da homepage.
 *
 * Como é composto (por camadas, de trás para a frente):
 *  1. LQIP (data URI ~0,5 KB) como fundo do contentor — a mancha de cor
 *    aparece no primeiro frame, antes de o cartaz descarregar;
 *  2. cartaz WebP/JPEG com Ken Burns lento + parallax de rato;
 *  3. camada de vídeo opcional (`HeroFilmLayer`);
 *  4. scrim lateral (legibilidade do texto), vinheta, varrimento de luz e grão
 *     de película — tudo em CSS, no GPU, zero bytes de rede;
 *  5. conteúdo: selo, título, subtítulo, CTAs, indicadores e colagem de capas.
 *
 * Acessibilidade/performace: `prefers-reduced-motion` desliga todas as
 * animações (o banner fica um still), `fetchPriority="high"` no cartaz trata do
 * LCP, e as dimensões explícitas evitam layout shift.
 */
export default function HeroSection() {
  const { dict } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const highlights = BOOKS.filter((book) => book.featured).slice(0, 3);

  // Parallax: escreve CSS vars no contentor (não faz re-render por cada
  // movimento do rato) e é ignorado em ecrãs táteis/reduced-motion.
  const onPointerMove = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      const node = sectionRef.current;
      if (!node || reducedMotion || event.pointerType !== "mouse") return;
      const rect = node.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      node.style.setProperty("--hero-x", x.toFixed(4));
      node.style.setProperty("--hero-y", y.toFixed(4));
    },
    [reducedMotion]
  );

  const resetParallax = useCallback(() => {
    const node = sectionRef.current;
    if (!node) return;
    node.style.setProperty("--hero-x", "0");
    node.style.setProperty("--hero-y", "0");
  }, []);

  return (
    <section
      ref={sectionRef}
      onPointerMove={onPointerMove}
      onPointerLeave={resetParallax}
      aria-label={dict.hero.title}
      className="hero relative isolate overflow-hidden bg-ink text-cream"
      style={{
        backgroundImage: `url(${HERO_POSTER_LQIP})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* 2 — cartaz (Ken Burns + parallax) */}
      <div className="hero-plane absolute inset-0 -z-30">
        <picture className="block h-full w-full">
          {HERO_POSTER_WEBP_SRC ? (
            <source srcSet={HERO_POSTER_WEBP_SRC} type="image/webp" />
          ) : null}
          <img
            src={HERO_POSTER_SRC}
            alt={dict.hero.posterAlt}
            width={HERO_POSTER_DIMENSIONS.width}
            height={HERO_POSTER_DIMENSIONS.height}
            fetchPriority="high"
            decoding="async"
            className="hero-poster h-full w-full object-cover"
          />
        </picture>
      </div>

      {/* 3 — vídeo ambiente (opcional, via NEXT_PUBLIC_HERO_VIDEO_URL) */}
      <HeroFilmLayer
        labels={{ play: dict.hero.playFilm, pause: dict.hero.pauseFilm }}
      />

      {/* 4 — luz e sombra */}
      <div className="hero-scrim absolute inset-0 -z-10" aria-hidden="true" />
      <div className="hero-vignette absolute inset-0 -z-10" aria-hidden="true" />
      <div className="hero-sweep absolute inset-0 -z-10" aria-hidden="true" />
      <div className="hero-grain absolute inset-0 -z-10" aria-hidden="true" />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-20 bg-gradient-to-b from-transparent to-cream"
        aria-hidden="true"
      />

      {/* 5 — conteúdo */}
      <div className="relative mx-auto flex min-h-[clamp(38rem,88vh,56rem)] max-w-6xl flex-col justify-center px-5 pb-32 pt-14 sm:px-8 sm:pt-16 lg:pb-36">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-10">
          <div>
            <div
              className="hero-rise inline-flex items-center gap-2 rounded-full border border-brand/45 bg-brand/15 px-3.5 py-1.5 backdrop-blur-sm"
              style={{ "--hero-i": 0 } as React.CSSProperties}
            >
              <span className="hero-pulse inline-block h-1.5 w-1.5 rounded-full bg-brand" />
              <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-cream">
                {dict.hero.badge}
              </span>
            </div>

            <h1
              className="hero-rise mt-5 max-w-[19ch] font-serif text-[clamp(2.05rem,6vw,4.15rem)] font-semibold leading-[1.03] tracking-[-0.02em] text-white [text-shadow:0_2px_28px_rgba(4,16,20,0.45)]"
              style={{ "--hero-i": 1 } as React.CSSProperties}
            >
              {dict.hero.title}
            </h1>

            <p
              className="hero-rise mt-5 max-w-xl text-[0.95rem] leading-relaxed text-cream/85 sm:text-[1.05rem]"
              style={{ "--hero-i": 2 } as React.CSSProperties}
            >
              {dict.hero.subtitle}
            </p>

            <div
              className="hero-rise mt-8 flex flex-col gap-3 sm:flex-row sm:items-center"
              style={{ "--hero-i": 3 } as React.CSSProperties}
            >
              <Link
                href="/catalogo"
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white shadow-[0_10px_30px_-12px_rgba(200,20,47,0.9)] transition-all hover:-translate-y-0.5 hover:bg-brand-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                {dict.hero.ctaCatalog}
                <ArrowRight
                  size={16}
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </Link>
              <Link
                href="/cliente/login"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-cream/35 px-6 py-3 text-sm font-semibold text-cream backdrop-blur-sm transition-colors hover:border-cream/70 hover:bg-cream/10"
              >
                {dict.hero.ctaClientArea}
              </Link>
            </div>

            <dl
              className="hero-rise mt-10 grid max-w-lg grid-cols-3 divide-x divide-cream/15 border-y border-cream/15 py-4"
              style={{ "--hero-i": 4 } as React.CSSProperties}
            >
              {dict.hero.stats.map(({ value, label }) => (
                <div key={label} className="px-3 first:pl-0 last:pr-0">
                  <dt className="sr-only">{label}</dt>
                  <dd>
                    <span className="block font-serif text-2xl font-semibold leading-none text-accent sm:text-3xl">
                      {value}
                    </span>
                    <span className="mt-1.5 block text-[10px] uppercase tracking-[0.14em] text-cream/60 sm:text-[11px]">
                      {label}
                    </span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* colagem de capas em destaque */}
          {highlights.length > 0 ? (
            <div
              className="hero-rise hero-collage grid grid-cols-3 items-start gap-3 sm:gap-4 lg:mx-auto lg:w-full lg:max-w-[28rem]"
              style={{ "--hero-i": 5 } as React.CSSProperties}
            >
              <span
                className="absolute -top-7 left-0 hidden text-[10px] font-semibold uppercase tracking-[0.2em] text-cream/55 lg:block"
                aria-hidden="true"
              >
                {dict.hero.highlightsLabel}
              </span>
              {highlights.map((book, index) => {
                const layout = COLLAGE[index % COLLAGE.length];
                return (
                  <Link
                    key={book.slug}
                    href={`/livro/${book.slug}`}
                    className="hero-collage-item group relative block min-w-0"
                    style={
                      {
                        "--tilt": layout.tilt,
                        "--hero-offset": layout.offset,
                        "--hero-delay": layout.delay,
                      } as React.CSSProperties
                    }
                  >
                    <BookCover
                      book={book}
                      index={index}
                      className="rounded-lg shadow-[0_26px_60px_-24px_rgba(4,16,20,0.95)] ring-1 ring-cream/15 transition-transform duration-500 group-hover:-translate-y-1.5"
                    />
                    <p className="mt-2 line-clamp-2 min-h-[2.4em] text-[10px] font-medium leading-tight text-cream/85 lg:mt-2.5 lg:text-[11px]">
                      <span className="sr-only">{dict.hero.highlightsLabel}: </span>
                      {book.title}
                    </p>
                  </Link>
                );
              })}
            </div>
          ) : null}
        </div>

        {/* rodapé do banner: alcance + indicador de scroll */}
        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 sm:mt-16">
          <p className="inline-flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.16em] text-cream/55">
            <Globe2 size={13} className="text-accent" aria-hidden="true" />
            {dict.hero.deliveryNote}
          </p>
          <a
            href="#catalogo"
            className="group inline-flex items-center gap-3 text-[10px] font-medium uppercase tracking-[0.24em] text-cream/55 transition-colors hover:text-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            {dict.hero.scroll}
            <span
              className="hero-scroll-rail relative block h-8 w-px overflow-hidden bg-cream/25"
              aria-hidden="true"
            />
          </a>
        </div>
      </div>
    </section>
  );
}
