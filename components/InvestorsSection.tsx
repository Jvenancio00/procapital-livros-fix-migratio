"use client";

import Link from "next/link";
import { ArrowRight, Globe2, Network, TrendingUp } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const ICONS = [TrendingUp, Globe2, Network];

export default function InvestorsSection() {
  const { dict } = useLanguage();

  return (
    <section className="border-b border-line bg-ink">
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
        <div className="grid gap-10 sm:grid-cols-[1fr_1.4fr] sm:items-center">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-cream/50">
              {dict.home.investors.eyebrow}
            </span>
            <h2 className="mt-3 font-serif text-2xl font-semibold text-cream sm:text-3xl">
              {dict.home.investors.title}
            </h2>
            <Link
              href="/contactos"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-cream px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-cream/90"
            >
              {dict.home.investors.cta}
              <ArrowRight size={15} />
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {dict.home.investors.items.map(({ title, description }, index) => {
              const Icon = ICONS[index];
              return (
                <div
                  key={title}
                  className="rounded-2xl border border-cream/10 bg-cream/[0.04] p-5"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-cream/10 text-cream">
                    <Icon size={17} strokeWidth={1.75} />
                  </span>
                  <h3 className="mt-3 font-serif text-sm font-semibold text-cream">
                    {title}
                  </h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-cream/60">
                    {description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
