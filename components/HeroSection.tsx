"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, Building2, Globe2, GraduationCap } from "lucide-react";
import type { Book } from "@/data/books";
import BookCover from "./BookCover";
import { useLanguage } from "@/context/LanguageContext";

const COVER_MOTION = [
  { delay: "0s", tilt: "-1.5deg", offset: "sm:mt-6" },
  { delay: "1.6s", tilt: "0deg", offset: "" },
  { delay: "3.2s", tilt: "1.5deg", offset: "sm:mt-10" },
];

export interface HeroStats {
  totalBooks: number;
  totalPublishers: number;
  schoolBooks: number;
  activeMarkets: number;
}

export default function HeroSection({
  featuredBooks,
  stats,
}: {
  featuredBooks: Book[];
  stats: HeroStats;
}) {
  const { dict } = useLanguage();
  const showcase = featuredBooks.slice(0, 3);

  return (
    <section className="relative overflow-hidden bg-ink text-white">
      {/* Textura editorial subtil sem gradientes berrantes */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-5 pt-14 pb-16 sm:px-8 lg:pt-20 lg:pb-22">
        <div className="grid items-center gap-12 lg:grid-cols-12">
          {/* Coluna Editorial Principal */}
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-white/[0.04] px-3.5 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-200/95">
                {dict.hero.badge}
              </span>
            </div>

            <h1 className="mt-6 font-serif text-4xl font-semibold leading-[1.08] tracking-tight text-white sm:text-5xl xl:text-[3.5rem]">
              {dict.hero.title}
            </h1>

            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/80 sm:text-xl">
              {dict.hero.subtitle}
            </p>

            {/* Botões Principais Exatos */}
            <div className="mt-8 flex flex-wrap items-center gap-3.5">
              <Link
                href="/catalogo"
                className="inline-flex items-center gap-2 rounded-full bg-brand px-7 py-3.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-dark"
              >
                <span>{dict.hero.ctaCatalog}</span>
                <ArrowRight size={16} aria-hidden="true" />
              </Link>

              <Link
                href="/contactos?motivo=PARCERIA"
                className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/[0.04] px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:border-accent hover:bg-white/[0.09]"
              >
                <span>{dict.hero.ctaPartnership}</span>
              </Link>

              <Link
                href="/livros-escolares"
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-accent transition-opacity hover:opacity-85"
              >
                <GraduationCap size={15} aria-hidden="true" />
                <span>Área Escolar Prioritária</span>
              </Link>
            </div>

            {/* Indicadores Reais da Rede Editorial */}
            <dl className="mt-12 grid grid-cols-2 gap-6 border-t border-white/12 pt-7 sm:grid-cols-4">
              <div>
                <dt className="flex items-center gap-1.5 text-xs text-white/60">
                  <BookOpen size={13} className="text-accent" aria-hidden="true" />
                  <span>Títulos em catálogo</span>
                </dt>
                <dd className="mt-1 font-serif text-2xl font-semibold text-white">
                  {stats.totalBooks}
                </dd>
              </div>
              <div>
                <dt className="flex items-center gap-1.5 text-xs text-white/60">
                  <Building2 size={13} className="text-accent" aria-hidden="true" />
                  <span>Editoras representadas</span>
                </dt>
                <dd className="mt-1 font-serif text-2xl font-semibold text-white">
                  {stats.totalPublishers}
                </dd>
              </div>
              <div>
                <dt className="flex items-center gap-1.5 text-xs text-white/60">
                  <GraduationCap size={13} className="text-accent" aria-hidden="true" />
                  <span>Manuais escolares</span>
                </dt>
                <dd className="mt-1 font-serif text-2xl font-semibold text-white">
                  {stats.schoolBooks}
                </dd>
              </div>
              <div>
                <dt className="flex items-center gap-1.5 text-xs text-white/60">
                  <Globe2 size={13} className="text-accent" aria-hidden="true" />
                  <span>Mercados lusófonos</span>
                </dt>
                <dd className="mt-1 font-serif text-2xl font-semibold text-white">
                  {stats.activeMarkets} países
                </dd>
              </div>
            </dl>
          </div>

          {/* Vitrine Editorial com Capas Reais */}
          <div className="lg:col-span-5">
            <div className="rounded-3xl border border-white/12 bg-white/[0.03] p-5 sm:p-6">
              <div className="mb-4 flex items-center justify-between text-xs">
                <span className="font-semibold uppercase tracking-[0.16em] text-accent">
                  {dict.hero.highlightsLabel}
                </span>
                <span className="text-white/60">{dict.hero.deliveryNote}</span>
              </div>

              <div className="grid grid-cols-3 gap-3 sm:gap-4">
                {showcase.map((book, index) => {
                  const motion = COVER_MOTION[index] ?? COVER_MOTION[1];
                  return (
                    <Link
                      key={book.slug}
                      href={`/livro/${book.slug}`}
                      className={`group flex flex-col ${motion.offset}`}
                    >
                      <div
                        className="hero-float-item overflow-hidden rounded-xl border border-white/20 bg-white/5 shadow-xl transition-transform duration-300 group-hover:scale-[1.03]"
                        style={
                          {
                            "--hero-delay": motion.delay,
                            "--hero-tilt": motion.tilt,
                          } as CSSProperties
                        }
                      >
                        <BookCover
                          book={book}
                          preload={index === 1}
                          showCategory={false}
                          sizes="(max-width: 1024px) 30vw, 14vw"
                          className="rounded-xl"
                        />
                      </div>
                      <p className="mt-2.5 line-clamp-1 text-[11px] font-medium text-white/85 group-hover:text-accent">
                        {book.title}
                      </p>
                      <p className="line-clamp-1 text-[10px] text-white/50">
                        {book.editora}
                      </p>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
