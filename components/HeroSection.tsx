"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Building2, Handshake, Store, Users } from "lucide-react";
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
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoFailed, setVideoFailed] = useState(false);
  const [posterFailed, setPosterFailed] = useState(false);

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
      {/* Vídeo de fundo — se o ficheiro não existir/falhar, esconde-se sozinho
          (onError) em vez de ficar num estado quebrado indefinidamente. */}
      {!videoFailed && (
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
          onError={() => setVideoFailed(true)}
        />
      )}
      {/* Imagem de reserva por baixo do vídeo — se também falhar, esconde-se
          e fica só o fundo escuro liso (nunca um ícone de imagem partida). */}
      {!posterFailed && (
        <img
          src={HERO_POSTER_URL}
          alt="Livraria profissional com prateleiras de livros"
          className="absolute inset-0 -z-20 h-full w-full object-cover"
          onError={() => setPosterFailed(true)}
        />
      )}
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
                href="/sobre"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-cream/40 px-6 py-3 text-sm font-semibold text-cream transition-colors hover:bg-cream/10"
              >
                {dict.hero.ctaAbout}
              </Link>
            </div>

            <Link
              href="/contactos"
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-cream/60 underline-offset-4 transition-colors hover:text-cream hover:underline"
            >
              {dict.hero.ctaPartnership}
              <ArrowRight size={12} />
            </Link>

            <p className="mt-5 text-[10px] font-medium uppercase tracking-wide text-cream/50">
              {dict.hero.deliveryNote}
            </p>
          </div>

          {/* Composição institucional: fluxo editoras → Pro Capital → livrarias/escolas
              → leitores, em vez de imagens de stock genéricas. */}
          <div className="hidden sm:block">
            <div className="flex flex-col gap-2.5">
              <FlowNode icon={Building2} label={dict.hero.flowLabels.publishers} />
              <FlowArrow />
              <FlowNode icon={Handshake} label={dict.hero.flowLabels.procapital} emphasis />
              <FlowArrow />
              <FlowNode icon={Store} label={dict.hero.flowLabels.network} />
              <FlowArrow />
              <FlowNode icon={Users} label={dict.hero.flowLabels.readers} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FlowNode({
  icon: Icon,
  label,
  emphasis = false,
}: {
  icon: typeof Building2;
  label: string;
  emphasis?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-2xl border px-4 py-3 backdrop-blur-sm ${
        emphasis
          ? "border-brand/50 bg-brand/20"
          : "border-cream/15 bg-cream/[0.06]"
      }`}
    >
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
          emphasis ? "bg-brand text-white" : "bg-cream/10 text-cream"
        }`}
      >
        <Icon size={16} strokeWidth={1.75} />
      </span>
      <span
        className={`text-sm font-medium ${emphasis ? "text-white" : "text-cream/85"}`}
      >
        {label}
      </span>
    </div>
  );
}

function FlowArrow() {
  return (
    <div className="ml-[1.15rem] h-3 w-px bg-cream/20" aria-hidden="true" />
  );
}
