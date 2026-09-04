"use client";

import { Quote } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function Testimonials() {
  const { dict } = useLanguage();

  return (
    <section className="border-b border-line bg-cream-deep/60">
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
        <div className="max-w-2xl">
          <span className="text-xs font-semibold uppercase tracking-widest text-brand">
            {dict.testimonials.eyebrow}
          </span>
          <h2 className="mt-3 font-serif text-2xl font-semibold text-ink sm:text-3xl">
            {dict.testimonials.title}
          </h2>
          <p className="mt-3 text-foreground/70">
            {dict.testimonials.description}
          </p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {dict.testimonials.items.map((t) => (
            <figure
              key={t.name}
              className="flex flex-col rounded-2xl border border-line bg-cream p-6"
            >
              <Quote size={22} className="text-accent" strokeWidth={1.5} />
              <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-foreground/80">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-5 border-t border-line pt-4">
                <span className="block text-sm font-semibold text-ink">
                  {t.name}
                </span>
                <span className="block text-xs text-foreground/55">
                  {t.role}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
