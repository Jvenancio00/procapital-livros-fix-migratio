"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Film, Pause, Play } from "lucide-react";
import { HERO_VIDEO_ENABLED, HERO_VIDEO_URL } from "@/lib/hero";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";

/**
 * Camada de vídeo do banner (opcional — só existe se NEXT_PUBLIC_HERO_VIDEO_URL
 * estiver definido; ver `lib/hero.ts`).
 *
 * Regras de produto/performance que explicam o desenho:
 *  - `preload="none"`: o MP4 nunca compete com o LCP do cartaz; só é pedido
 *    quando o utilizador manda tocar.
 *  - entra em fade por cima do cartaz quando há `canplay`, para não mostrar um
 *    frame preto a meio do carregamento; o cartaz fica sempre por baixo.
 *  - pausa quando o hero sai do ecrã (poupa bateria/CPU em mobile).
 *  - `prefers-reduced-motion` → nem camada de vídeo nem controlo: o banner
 *    continua a existir, simplesmente sem movimento.
 */
export default function HeroFilmLayer({
  labels,
}: {
  labels: { play: string; pause: string };
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  const enabled = HERO_VIDEO_ENABLED && !reducedMotion;

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !enabled) return;

    const onPlaying = () => setPlaying(true);
    const onPaused = () => setPlaying(false);
    const onCanPlay = () => setReady(true);
    video.addEventListener("playing", onPlaying);
    video.addEventListener("pause", onPaused);
    video.addEventListener("canplay", onCanPlay);

    // Pausa quando sai do viewport — não há razão para continuar a descodificar.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting && !video.paused) video.pause();
      },
      { threshold: 0.15 }
    );
    observer.observe(video);

    return () => {
      video.removeEventListener("playing", onPlaying);
      video.removeEventListener("pause", onPaused);
      video.removeEventListener("canplay", onCanPlay);
      observer.disconnect();
    };
  }, [enabled]);

  const toggle = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      // `muted` tem de estar definido na propriedade (não só no JSX) para o
      // play() ser aceite de forma fiável — React não repete o atributo.
      video.muted = true;
      video.play().catch(() => {
        // reprodução bloqueada pelo navegador — o cartaz mantém-se visível
      });
    } else {
      video.pause();
    }
  }, []);

  if (!enabled) return null;

  return (
    <>
      <video
        ref={videoRef}
        className={`pointer-events-none absolute inset-0 -z-20 h-full w-full object-cover transition-opacity duration-700 ${
          ready && playing ? "opacity-100" : "opacity-0"
        }`}
        src={HERO_VIDEO_URL}
        loop
        muted
        playsInline
        preload="none"
        tabIndex={-1}
        aria-hidden="true"
      />
      <button
        type="button"
        onClick={toggle}
        className="absolute bottom-5 right-4 z-20 inline-flex items-center gap-2 rounded-full border border-cream/25 bg-ink-dark/45 px-3.5 py-2 text-[10px] font-medium uppercase tracking-[0.18em] text-cream/80 backdrop-blur-sm transition-colors hover:border-cream/50 hover:text-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:right-6"
      >
        {playing ? <Pause size={13} /> : <Play size={13} />}
        <span className="flex items-center gap-1.5">
          <Film size={11} className="hidden sm:block opacity-70" />
          {playing ? labels.pause : labels.play}
        </span>
      </button>
    </>
  );
}
