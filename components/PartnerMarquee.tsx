"use client";

import Image from "next/image";
import { EDITORAS } from "@/data/editoras";
import { useLanguage } from "@/context/LanguageContext";

export default function PartnerMarquee() {
  const { dict } = useLanguage();
  const comLogo = EDITORAS.filter((editora) => editora.logo);

  if (comLogo.length === 0) return null;

  const items = [...comLogo, ...comLogo];

  return (
    <section className="overflow-hidden border-y border-line bg-cream-deep/40 py-6">
      <p className="mb-4 text-center text-xs font-medium uppercase tracking-wide text-foreground/50">
        {dict.partnerMarquee.trustText}
      </p>
      <div className="relative flex w-max animate-marquee items-center gap-16 hover:[animation-play-state:paused]">
        {items.map((editora, index) => (
          <span key={`${editora.slug}-${index}`} className="flex shrink-0 items-center">
            <Image
              src={editora.logo!}
              alt={editora.name}
              width={120}
              height={40}
              className="max-h-9 w-auto object-contain opacity-80"
            />
          </span>
        ))}
      </div>
    </section>
  );
}
