"use client";

import Image from "next/image";
import Link from "next/link";
import EditoraMark from "@/components/EditoraMark";
import type { Editora } from "@/data/editoras";
import { useLanguage } from "@/context/LanguageContext";

export default function PublishersCarousel({
  publishers,
}: {
  publishers: Editora[];
}) {
  const { dict } = useLanguage();

  if (publishers.length === 0) return null;

  return (
    <section
      aria-label={dict.partnerMarquee.trustText}
      className="overflow-hidden border-y border-line bg-cream-deep/40 py-6 sm:py-7"
    >
      <p className="mb-5 px-5 text-center text-xs font-medium uppercase tracking-wide text-foreground/55 sm:px-8">
        {dict.partnerMarquee.trustText}
      </p>

      <div className="publishers-marquee-window overflow-hidden">
        <div className="publishers-marquee flex w-max items-center" aria-label="Editoras parceiras">
          {[0, 1].map((copyIndex) => {
            const duplicate = copyIndex === 1;

            return (
              <div
                key={copyIndex}
                className="publishers-marquee__group flex items-center"
                aria-hidden={duplicate || undefined}
              >
                {publishers.map((publisher) => (
                  <Link
                    key={publisher.slug}
                    href={publisher.website ?? `/editoras/${publisher.slug}`}
                    target={publisher.website ? "_blank" : undefined}
                    rel={publisher.website ? "noreferrer noopener" : undefined}
                    tabIndex={duplicate ? -1 : undefined}
                    aria-label={publisher.name}
                    title={publisher.country ? `${publisher.name} — ${publisher.country}` : publisher.name}
                    className="flex h-20 w-36 shrink-0 flex-col items-center justify-center gap-1 rounded-xl border border-line/70 bg-cream px-3 text-center transition-colors hover:border-brand/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand sm:h-24 sm:w-40"
                  >
                    {publisher.logo ? (
                      <Image
                        src={publisher.logo}
                        alt={publisher.name}
                        width={144}
                        height={48}
                        sizes="160px"
                        className="max-h-9 max-w-full object-contain"
                      />
                    ) : (
                      <EditoraMark name={publisher.name} />
                    )}
                    <span className="line-clamp-1 max-w-full text-[11px] font-medium leading-tight text-ink/80">
                      {publisher.name}
                    </span>
                    {publisher.country && (
                      <span className="line-clamp-1 max-w-full text-[9px] uppercase tracking-wide text-foreground/45">
                        {publisher.country}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
