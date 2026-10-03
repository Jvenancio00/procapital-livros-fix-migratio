"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Building2 } from "lucide-react";
import { EDITORAS } from "@/data/editoras";
import { useLanguage } from "@/context/LanguageContext";

// Mostra exatamente 10 editoras parceiras reais (nunca inventadas). As que já
// têm logótipo real em /public/editoras mostram-no; as restantes mostram as
// iniciais do nome — nunca um placeholder de empresa fictícia.
const PARTNERS = EDITORAS.slice(0, 10);

function initials(name: string) {
  return name
    .replace(/\(.*\)/g, "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

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
          {PARTNERS.map((editora) => (
            <div
              key={editora.slug}
              className="flex h-24 flex-col items-center justify-center gap-2 rounded-2xl border border-line bg-cream-deep/40 px-3 text-center transition-colors hover:border-brand/30"
            >
              {editora.logo ? (
                <Image
                  src={editora.logo}
                  alt={editora.name}
                  width={90}
                  height={32}
                  className="max-h-8 w-auto object-contain"
                />
              ) : (
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ink/5 text-xs font-semibold text-ink">
                  {initials(editora.name)}
                </span>
              )}
              <span className="line-clamp-1 text-[11px] font-medium text-foreground/60">
                {editora.name.replace(/\s*\(.*\)/, "")}
              </span>
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
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-medium text-cream transition-colors hover:bg-brand-dark"
          >
            {dict.partners.ctaBecome}
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </section>
  );
}
