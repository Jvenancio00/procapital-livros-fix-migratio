"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BOOKS } from "@/data/books";
import BookCover from "@/components/BookCover";
import { useLanguage } from "@/context/LanguageContext";

// Em produção, define NEXT_PUBLIC_HERO_VIDEO_URL / NEXT_PUBLIC_HERO_POSTER_URL
// para servir estes ficheiros a partir de uma CDN (Cloudflare Stream, Bunny,
// Cloudinary, S3+CloudFront, etc.) em vez de os enviar a partir da própria
// aplicação. Sem essas variáveis definidas, usa os ficheiros locais em
// /public — úteis para desenvolvimento, mas não recomendados em produção
// numa plataforma serverless (custo de largura de banda).
const HERO_VIDEO_URL = process.env.NEXT_PUBLIC_HERO_VIDEO_URL || "/hero-video.mp4";
const HERO_POSTER_URL = process.env.NEXT_PUBLIC_HERO_POSTER_URL || "/hero-poster.jpg";

export default function HeroSection() {
  const { dict } = useLanguage();
  const highlights = BOOKS.filter((book) => book.featured).slice(0, 3);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Definir "muted" explicitamente na propriedade (não só no atributo JSX)
    // é necessário para o autoplay funcionar de forma fiável em todos os
    // navegadores — um problema conhecido do React com <video>.
    video.muted = true;
    const playPromise = video.play();
    if (playPromise) {
      playPromise.catch(() => {
        // Autoplay bloqueado pelo navegador — a imagem de reserva mantém-se visível
      });
    }
  }, []);

  return (
    <section className="relative overflow-hidden bg-ink">
      {/* Background video - representa a operação da Pro Capital */}
      <video
        ref={videoRef}
        className="absolute inset-0 -z-10 h-full w-full object-cover motion-reduce:hidden"
        src={HERO_VIDEO_URL}
        poster={HERO_POSTER_URL}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
      />
      <img
        src={HERO_POSTER_URL}
        alt="Livraria profissional com prateleiras de livros"
        className="absolute inset-0 -z-20 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-ink/90 via-ink/80 to-ink/50" />

      <div className="relative z-10 mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
        <div className="grid gap-8 sm:grid-cols-[1.3fr_1fr] sm:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-brand/40 bg-brand/15 px-3.5 py-1.5 mb-4">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-brand" />
              <span className="text-[10px] font-medium uppercase tracking-wide text-cream">
                {dict.hero.badge}
              </span>
            </div>

            <h1 className="font-serif text-2xl font-bold leading-tight text-white sm:text-3xl lg:text-4xl">
              {dict.hero.title}
            </h1>

            <p className="mt-3 max-w-md text-sm text-cream/85 sm:text-base">
              {dict.hero.subtitle}
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/catalogo"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
              >
                {dict.hero.ctaCatalog}
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/cliente/login"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-cream/40 px-6 py-3 text-sm font-semibold text-cream transition-colors hover:bg-cream/10"
              >
                {dict.hero.ctaClientArea}
              </Link>
            </div>

            <p className="mt-4 text-[10px] font-medium uppercase tracking-wide text-cream/50">
              {dict.hero.deliveryNote}
            </p>
          </div>

          {highlights.length > 0 && (
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wide text-cream/60">
                {dict.hero.highlightsLabel}
              </span>
              <div className="mt-2 grid grid-cols-3 gap-3">
                {highlights.map((book, index) => (
                  <Link key={book.slug} href={`/livro/${book.slug}`} className="group">
                    <BookCover
                      book={book}
                      index={index}
                      className="rounded-lg transition-transform group-hover:scale-[1.03]"
                    />
                    <p className="mt-1.5 line-clamp-2 text-[10px] font-medium leading-tight text-cream/85">
                      {book.title}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
