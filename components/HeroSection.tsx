"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import BookCover from "@/components/BookCover";
import { BOOKS } from "@/data/books";
import {
  HERO_POSTER_DIMENSIONS,
  HERO_POSTER_LQIP,
  HERO_POSTER_SRC,
  HERO_POSTER_WEBP_SRC,
  HERO_VIDEO_ENABLED,
  HERO_VIDEO_URL,
} from "@/lib/hero";

// Colagem de capas do cartaz. A ordem de preferência é explícita para o banner
// não mostrar um bloco de texto no lugar de uma capa: primeiro os títulos com
// capa local (asset em /public/covers, que vai sempre no deploy), depois os que
// têm ISBN (capa remota via OpenLibrary/Google Books) e só no fim os que não têm
// nenhuma das duas.
const FEATURED_BOOKS = BOOKS.filter((book) => book.featured);
const HERO_BOOKS = [
  ...FEATURED_BOOKS.filter((book) => book.coverUrl),
  ...FEATURED_BOOKS.filter((book) => !book.coverUrl && book.isbn),
  ...FEATURED_BOOKS.filter((book) => !book.coverUrl && !book.isbn),
].slice(0, 3);

// O cartaz e o vídeo vivem em `lib/hero.ts`, que decide os URLs uma única vez
// (next/image não é usado aqui: o cartaz é um full-bleed com `<picture>`, para
// poder servir o WebP com o JPEG como fallback). Sem
// NEXT_PUBLIC_HERO_VIDEO_URL definido não há camada de vídeo — o banner fica
// só com a imagem, em vez de descarregar um MP4 de 2,5 MB em autoplay.

// Cada capa do cartaz tem deslocamento vertical fixo (no link, para o hover
// continuar a funcionar), inclinação e atraso próprios (no wrapper animado,
// ver `.hero-float-item` em globals.css). Assim as três capas nunca flutuam em
// sincronia e o conjunto parece uma colagem viva, não uma imagem parada.
const COVER_POSITIONS = [
  "translate-y-2",
  "z-10 -translate-y-3 sm:-translate-y-5",
  "translate-y-2",
];
const COVER_FLOAT = [
  { tilt: "-5deg", delay: "0s" },
  { tilt: "1.5deg", delay: "1.4s" },
  { tilt: "5deg", delay: "2.6s" },
];

export default function HeroSection() {
  const { dict } = useLanguage();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoFailed, setVideoFailed] = useState(false);
  const [posterFailed, setPosterFailed] = useState(false);

  const showVideo = HERO_VIDEO_ENABLED && !videoFailed;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Setting the property explicitly helps autoplay work consistently across browsers.
    video.muted = true;
    const playPromise = video.play();
    if (playPromise) {
      playPromise.catch(() => {
        // If autoplay is blocked, the poster remains visible as the fallback.
      });
    }
  }, [showVideo]);

  return (
    <section
      className="relative isolate overflow-hidden bg-ink"
      // LQIP (data URI de ~0,5 KB, definido em `lib/hero.ts`) como fundo do
      // contentor: a mancha de cor aparece no primeiro frame, por isso o
      // utilizador não vê um bloco preto enquanto o cartaz descarrega.
      style={{
        backgroundImage: `url(${HERO_POSTER_LQIP})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {!posterFailed && (
        <picture>
          {HERO_POSTER_WEBP_SRC ? (
            <source srcSet={HERO_POSTER_WEBP_SRC} type="image/webp" />
          ) : null}
          <img
            src={HERO_POSTER_SRC}
            alt=""
            aria-hidden="true"
            width={HERO_POSTER_DIMENSIONS.width}
            height={HERO_POSTER_DIMENSIONS.height}
            // É a maior imagem acima da dobra: `fetchPriority="high"` trata do
            // LCP e as dimensões explícitas evitam layout shift.
            fetchPriority="high"
            decoding="async"
            className="absolute inset-0 z-0 h-full w-full object-cover"
            onError={() => setPosterFailed(true)}
          />
        </picture>
      )}

      {showVideo && (
        <video
          ref={videoRef}
          className="absolute inset-0 z-[1] h-full w-full object-cover motion-reduce:hidden"
          src={HERO_VIDEO_URL}
          poster={HERO_POSTER_SRC}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          aria-hidden="true"
          onError={() => setVideoFailed(true)}
        />
      )}

      <div className="absolute inset-0 z-[2] bg-gradient-to-b from-ink-dark/90 via-ink-dark/75 to-ink-dark/85 sm:bg-gradient-to-r sm:from-ink-dark/95 sm:via-ink-dark/80 sm:to-ink-dark/55" />

      <div className="relative z-10 mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-12 lg:py-12">
        <div className="grid items-center gap-10 lg:min-h-[28rem] lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] lg:gap-12">
          <div className="max-w-2xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-brand/40 bg-brand/15 px-3.5 py-1.5">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-brand" aria-hidden="true" />
              <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-cream">
                {dict.hero.badge}
              </span>
            </div>

            <h1 className="max-w-[15ch] font-serif text-4xl font-semibold leading-[1.04] tracking-tight text-white sm:text-5xl lg:text-6xl">
              {dict.hero.title}
            </h1>

            <p className="mt-5 max-w-xl text-sm leading-relaxed text-cream/85 sm:text-base lg:text-lg">
              {dict.hero.subtitle}
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/catalogo"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cream"
              >
                {dict.hero.ctaCatalog}
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/sobre"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-cream/40 px-6 py-3 text-sm font-semibold text-cream transition-colors hover:bg-cream/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cream"
              >
                {dict.hero.ctaAbout}
              </Link>
            </div>

            <Link
              href="/contactos"
              className="mt-5 inline-flex min-h-8 items-center gap-1.5 text-xs font-medium text-cream/70 underline-offset-4 transition-colors hover:text-cream hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cream"
            >
              {dict.hero.ctaPartnership}
              <ArrowRight size={12} />
            </Link>

            <p className="mt-5 text-[10px] font-medium uppercase tracking-[0.16em] text-cream/55">
              {dict.hero.deliveryNote}
            </p>
          </div>

          <div className="mx-auto w-full max-w-[34rem] px-1 sm:px-2 lg:px-0">
            <div className="grid grid-cols-3 items-center justify-items-center gap-2 sm:gap-4">
              {HERO_BOOKS.map((book, index) => (
                <Link
                  key={book.slug}
                  href={`/livro/${book.slug}`}
                  aria-label={`Ver ${book.title}`}
                  className={`group w-full max-w-[7.5rem] transition-transform duration-300 ease-out hover:z-20 hover:-translate-y-2 hover:rotate-0 hover:scale-[1.04] focus-visible:z-20 focus-visible:rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cream sm:max-w-[9rem] lg:max-w-[10rem] ${COVER_POSITIONS[index]}`}
                >
                  <div
                    className="hero-float-item"
                    style={
                      {
                        "--hero-tilt": COVER_FLOAT[index].tilt,
                        "--hero-delay": COVER_FLOAT[index].delay,
                      } as React.CSSProperties
                    }
                  >
                    <BookCover
                      book={book}
                      preload={index === 0}
                      showCategory={false}
                      sizes="(max-width: 639px) 28vw, (max-width: 1023px) 20vw, 15vw"
                      className="rounded-lg shadow-2xl ring-1 ring-cream/20 sm:rounded-xl"
                    />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
