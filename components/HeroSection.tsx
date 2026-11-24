"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { HERO_POSTER_SRC, HERO_POSTER_WEBP_SRC, HERO_POSTER_DIMENSIONS, HERO_EFFECTS } from "@/lib/hero";
import { ArrowRight } from "lucide-react";
import type { Book } from "@/data/books";
import BookCover from "./BookCover";
import { useLanguage } from "@/context/LanguageContext";

export interface HeroStats {
  totalBooks: number;
  totalPublishers: number;
  schoolBooks: number;
  activeMarkets: number;
}

export default function HeroSection({ featuredBooks, stats }: { featuredBooks: Book[]; stats: HeroStats }) {
  const { dict } = useLanguage();
  const showcase = featuredBooks.slice(0, 3);
  const heroRef = useRef<HTMLElement>(null);
  const posterRef = useRef<HTMLImageElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const [visible, setVisible] = useState(false);
  const [pageVisible, setPageVisible] = useState(false);
  const [posterPainted, setPosterPainted] = useState(false);

  useEffect(() => {
    const hero = heroRef.current;
    const poster = posterRef.current;
    if (!hero || !poster) return;
    let firstFrame = 0;
    let secondFrame = 0;
    const onLoad = () => {
      firstFrame = requestAnimationFrame(() => {
        secondFrame = requestAnimationFrame(() => setPosterPainted(true));
      });
    };
    if (poster.complete && poster.naturalWidth > 0) onLoad();
    else poster.addEventListener("load", onLoad, { once: true });
    const observer = new IntersectionObserver(([entry]) => setVisible(Boolean(entry?.isIntersecting)), { threshold: 0.05 });
    observer.observe(hero);
    const onVisibility = () => setPageVisible(document.visibilityState === "visible");
    onVisibility();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      poster.removeEventListener("load", onLoad);
      cancelAnimationFrame(firstFrame);
      cancelAnimationFrame(secondFrame);
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);
  const running = posterPainted && visible && pageVisible && !reducedMotion;
  const effects = [HERO_EFFECTS.posterZoom && "hero-zoom", HERO_EFFECTS.coverFloat && "hero-float", HERO_EFFECTS.interactions && "hero-interactions"].filter(Boolean).join(" ");

  return (
    <section ref={heroRef} data-running={running} data-enter={posterPainted && !reducedMotion && HERO_EFFECTS.entrance} className={`hero-banner relative isolate overflow-hidden bg-ink text-white ${effects}`}>
      <picture className="hero-poster absolute inset-0 -z-20">
        {HERO_POSTER_WEBP_SRC && <source srcSet={HERO_POSTER_WEBP_SRC} type="image/webp" />}
        {/* Native picture preserves the existing local WebP/JPEG fallback and dimensions. */}
        <img ref={posterRef} src={HERO_POSTER_SRC} width={HERO_POSTER_DIMENSIONS.width} height={HERO_POSTER_DIMENSIONS.height} alt="" fetchPriority="high" className="h-full w-full object-cover object-right" />
      </picture>
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-ink/90" />
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:py-24">
        <div className="grid gap-14 lg:grid-cols-12 lg:items-center lg:gap-16">
          <div className="lg:col-span-7">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">{dict.hero.badge}</p>
            <h1 className="hero-heading mt-6 max-w-3xl font-serif text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl xl:text-6xl">{dict.hero.title}</h1>
            <p className="hero-tagline mt-6 font-serif text-xl text-white sm:text-2xl">{dict.hero.tagline}</p>
            <p className="hero-description mt-4 max-w-xl text-base leading-relaxed text-white/75 sm:text-lg">{dict.hero.subtitle}</p>
            <div className="hero-actions mt-8 flex flex-wrap items-center gap-x-7 gap-y-3 text-sm font-semibold">
              <Link href="/livros-escolares" className="inline-flex min-h-11 items-center gap-2 bg-brand px-5 text-white hover:bg-brand-dark">{dict.hero.ctaSchool}<ArrowRight size={16} aria-hidden="true" /></Link>
              <Link href="/catalogo" className="inline-flex min-h-11 items-center border-b border-white/40 hover:border-accent">{dict.hero.ctaCatalog}</Link>
              <Link href="/contactos?motivo=PARCERIA" className="inline-flex min-h-11 items-center text-white/80 hover:text-white">{dict.hero.ctaPartnership}</Link>
            </div>
            <dl className="hero-stats mt-12 grid grid-cols-2 gap-6 border-t border-white/20 pt-6 sm:grid-cols-4">
              {[[stats.totalBooks, 'Títulos em catálogo'], [stats.totalPublishers, 'Editoras representadas'], [stats.schoolBooks, 'Manuais escolares'], [stats.activeMarkets, 'Mercados lusófonos']].map(([value, label]) => (
                <div key={label}><dt className="text-xs leading-relaxed text-white/65">{label}</dt><dd className="mt-1 font-serif text-2xl font-semibold">{value}</dd></div>
              ))}
            </dl>
          </div>
          {showcase.length > 0 && <div className="hero-showcase min-w-0 rounded-2xl border border-white/15 bg-ink/55 p-4 sm:p-6 lg:col-span-5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/20 pb-3 text-xs"><span className="font-semibold uppercase tracking-[0.16em] text-accent">{dict.hero.highlightsLabel}</span><span className="text-white/65">{dict.hero.deliveryNote}</span></div>
            <div className="mt-6 grid grid-cols-3 items-start gap-3 sm:gap-5">
              {showcase.map((book, index) => <Link key={book.slug} href={`/livro/${book.slug}`} className={`hero-cover group min-w-0 rounded-xl ${index === 1 ? 'mt-6 sm:mt-8' : ''}`}>
                <BookCover book={book} preload={index === 0} showCategory={false} sizes="(max-width: 1024px) 30vw, 14vw" className="hero-book-cover rounded-lg" />
                <p className="mt-3 line-clamp-2 break-words text-xs font-medium leading-relaxed text-white group-hover:text-accent group-focus-visible:text-accent">{book.title}</p><p className="mt-1 line-clamp-1 text-xs text-white/75">{book.editora}</p>
              </Link>)}
            </div>
          </div>}
        </div>

      </div>
    </section>
  );
}
