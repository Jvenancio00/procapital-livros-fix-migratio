"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, BookOpen, Building2 } from "lucide-react";
import { EDITORAS } from "@/data/editoras";
import { useLanguage } from "@/context/LanguageContext";

export default function PartnersGrid() {
  const { dict } = useLanguage();

  return (
    <section className="border-b border-line bg-cream">
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-brand">
              {dict.partners.eyebrow}
            </span>
            <h2 className="mt-2 font-serif text-2xl font-semibold text-ink sm:text-3xl">
              {dict.partners.title}
            </h2>
            <p className="mt-3 max-w-2xl text-foreground/70">
              {dict.partners.description}
            </p>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-5">
          {EDITORAS.map((editora) => (
            <div
              key={editora.slug}
              className="flex min-h-24 flex-col items-center justify-center gap-2 rounded-2xl border border-line bg-cream-deep/40 px-3 py-3 text-center transition-colors hover:border-brand/30"
            >
              {editora.logo ? (
                <Image
                  src={editora.logo}
                  alt={editora.name}
                  width={120}
                  height={40}
                  className="max-h-8 max-w-full object-contain"
                />
              ) : (
                <span className="flex min-h-8 max-w-full items-center justify-center gap-2 text-foreground/55">
                  <BookOpen size={16} className="shrink-0 text-ink/40" aria-hidden="true" />
                  <span className="line-clamp-2 text-[11px] font-medium leading-tight">
                    {editora.name}
                  </span>
                </span>
              )}
              {editora.logo && (
                <span className="line-clamp-1 max-w-full text-[11px] font-medium text-foreground/65">
                  {editora.name}
                </span>
              )}
              {editora.country && (
                <span className="line-clamp-1 max-w-full text-[9px] uppercase tracking-wide text-foreground/45">
                  {editora.country}
                </span>
              )}
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-cream-deep/40 px-6 py-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand">
              <Building2 size={18} />
            </span>
            <span className="font-serif text-base font-semibold text-ink">
              {dict.partners.becomeTitle}
            </span>
          </div>
          <Link
            href="/contactos"
            className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-medium text-cream transition-colors hover:bg-brand-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            {dict.partners.ctaBecome}
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </section>
  );
}
