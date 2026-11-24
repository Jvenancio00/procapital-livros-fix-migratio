"use client";

import Link from "next/link";
import { HERO_POSTER_SRC, HERO_POSTER_WEBP_SRC, HERO_POSTER_DIMENSIONS } from "@/lib/hero";
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

  return (
    <section className="hero-banner relative isolate overflow-hidden bg-ink text-white">
      <picture aria-hidden="true" className="hero-poster absolute inset-0 -z-20">
        {HERO_POSTER_WEBP_SRC && <source srcSet={HERO_POSTER_WEBP_SRC} type="image/webp" />}
        {/* Native picture preserves the existing local WebP/JPEG fallback and dimensions. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={HERO_POSTER_SRC} width={HERO_POSTER_DIMENSIONS.width} height={HERO_POSTER_DIMENSIONS.height} alt="" fetchPriority="high" className="h-full w-full object-cover object-right" />
      </picture>
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-ink/90" />
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:py-24">
        <div className="grid gap-14 lg:grid-cols-12 lg:items-center lg:gap-16">
          <div className="lg:col-span-7">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">{dict.hero.badge}</p>
            <h1 className="mt-6 max-w-3xl font-serif text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl xl:text-6xl">{dict.hero.title}</h1>
            <p className="mt-6 font-serif text-xl text-white sm:text-2xl">{dict.hero.tagline}</p>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-white/75 sm:text-lg">{dict.hero.subtitle}</p>
            <div className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-3 text-sm font-semibold">
              <Link href="/livros-escolares" className="inline-flex min-h-11 items-center gap-2 bg-brand px-5 text-white hover:bg-brand-dark">{dict.hero.ctaSchool}<ArrowRight size={16} aria-hidden="true" /></Link>
              <Link href="/catalogo" className="inline-flex min-h-11 items-center border-b border-white/40 hover:border-accent">{dict.hero.ctaCatalog}</Link>
              <Link href="/contactos?motivo=PARCERIA" className="inline-flex min-h-11 items-center text-white/80 hover:text-white">{dict.hero.ctaPartnership}</Link>
            </div>
            <dl className="mt-12 grid grid-cols-2 gap-6 border-t border-white/20 pt-6 sm:grid-cols-4">
              {[[stats.totalBooks, 'Títulos em catálogo'], [stats.totalPublishers, 'Editoras representadas'], [stats.schoolBooks, 'Manuais escolares'], [stats.activeMarkets, 'Mercados lusófonos']].map(([value, label]) => (
                <div key={label}><dt className="text-xs leading-relaxed text-white/65">{label}</dt><dd className="mt-1 font-serif text-2xl font-semibold">{value}</dd></div>
              ))}
            </dl>
          </div>
          {showcase.length > 0 && <div className="lg:col-span-5">
            <div className="flex items-center justify-between border-b border-white/20 pb-3 text-xs"><span className="font-semibold uppercase tracking-[0.16em] text-accent">{dict.hero.highlightsLabel}</span><span className="text-white/65">{dict.hero.deliveryNote}</span></div>
            <div className="mt-6 grid grid-cols-3 items-start gap-3 sm:gap-5">
              {showcase.map((book, index) => <Link key={book.slug} href={`/livro/${book.slug}`} className={index === 1 ? 'mt-8 group' : 'group'}>
                <BookCover book={book} preload={index === 0} showCategory={false} sizes="(max-width: 1024px) 30vw, 14vw" />
                <p className="mt-3 line-clamp-2 text-xs font-medium leading-relaxed text-white group-hover:text-accent">{book.title}</p><p className="mt-1 line-clamp-1 text-xs text-white/60">{book.editora}</p>
              </Link>)}
            </div>
          </div>}
        </div>
      </div>
    </section>
  );
}
