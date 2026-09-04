"use client";

import { Globe2, ShieldCheck, Sparkle, Headset } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const ICONS = [Globe2, ShieldCheck, Sparkle, Headset];

export default function TrustBar() {
  const { dict } = useLanguage();

  return (
    <section className="border-b border-line bg-cream">
      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-12">
        <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-4 sm:gap-x-8">
          {dict.trustBar.items.map(({ title, description }, index) => {
            const Icon = ICONS[index];
            return (
              <div key={title} className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink/5 text-ink">
                  <Icon size={18} strokeWidth={1.75} />
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-ink">{title}</h3>
                  <p className="mt-0.5 text-xs leading-relaxed text-foreground/60">
                    {description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
