"use client";

import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";

/**
 * Extrai a parte numérica inicial de um valor como "1000+" ou "10" para
 * animar a contagem; valores sem número (ex.: "CPLP") ficam estáticos.
 */
function parseValue(raw: string): { number: number | null; suffix: string } {
  const match = raw.match(/^(\d+)(.*)$/);
  if (!match) return { number: null, suffix: raw };
  return { number: Number(match[1]), suffix: match[2] };
}

function Counter({ value }: { value: string }) {
  const { number, suffix } = parseValue(value);
  const [display, setDisplay] = useState(number === null ? value : 0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    if (number === null || started.current) return;
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || started.current) return;
        started.current = true;
        const duration = 900;
        const start = performance.now();
        const step = (now: number) => {
          const progress = Math.min((now - start) / duration, 1);
          setDisplay(Math.round(progress * number));
          if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
        observer.disconnect();
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [number]);

  return (
    <span ref={ref}>
      {number === null ? value : display}
      {number !== null ? suffix : ""}
    </span>
  );
}

export default function Metrics() {
  const { dict } = useLanguage();

  return (
    <section className="border-b border-line bg-ink">
      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-12">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <span className="text-xs font-semibold uppercase tracking-widest text-cream/50">
            {dict.metrics.eyebrow}
          </span>
          <h2 className="font-serif text-lg font-semibold text-cream sm:text-xl">
            {dict.metrics.title}
          </h2>
        </div>

        <div className="mt-7 grid grid-cols-2 gap-6 sm:grid-cols-4 sm:gap-8">
          {dict.metrics.items.map(({ value, label }, index) => (
            <div
              key={label}
              className={`border-l pl-4 ${
                index === 0 ? "border-brand" : "border-cream/15"
              }`}
            >
              <div
                className={`font-serif text-3xl font-bold tabular-nums sm:text-4xl ${
                  index === 0 ? "text-brand" : "text-cream"
                }`}
              >
                <Counter value={value} />
              </div>
              <p className="mt-1 text-xs text-cream/60 sm:text-sm">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
