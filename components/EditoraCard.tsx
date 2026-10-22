"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, FileDown } from "lucide-react";
import type { Editora } from "@/data/editoras";
import EditoraMark from "./EditoraMark";
import { useLanguage } from "@/context/LanguageContext";
import { useCurrency } from "@/context/CurrencyContext";

export default function EditoraCard({
  editora,
  bookCount,
}: {
  editora: Editora;
  bookCount: number;
}) {
  const { dict } = useLanguage();
  const { market } = useCurrency();

  return (
    <article className="group flex h-full flex-col justify-between rounded-2xl border border-line/90 bg-white p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-ink/25 hover:shadow-md motion-reduce:transform-none">
      <div>
        <div className="flex h-20 items-center justify-center rounded-xl border border-line/70 bg-cream/60 px-4">
          {editora.logo ? (
            <Image
              src={editora.logo}
              alt={`Logótipo da editora ${editora.name}`}
              width={200}
              height={80}
              sizes="(max-width: 639px) 80vw, (max-width: 1023px) 40vw, 22vw"
              className="max-h-14 w-auto object-contain"
            />
          ) : (
            <EditoraMark name={editora.name} country={editora.country} />
          )}
        </div>

        <div className="mt-5 flex items-center justify-between gap-2 text-[11px] font-semibold uppercase tracking-wider text-ink/50">
          <span>{editora.country ?? "Lusofonia"}</span>
        </div>

        <Link href={`/editoras/${editora.slug}`} className="mt-1.5 block">
          <h3 className="font-serif text-xl font-semibold text-ink transition-colors group-hover:text-brand">
            {editora.name}
          </h3>
        </Link>

        {editora.address && (
          <p className="mt-2.5 line-clamp-2 text-xs leading-relaxed text-ink/65">
            {editora.address}
          </p>
        )}
      </div>

      <div className="mt-6 flex items-center justify-between gap-2 border-t border-line/80 pt-4 text-xs font-semibold">
        <span className="text-ink/60">
          {bookCount > 0
            ? `${bookCount} ${bookCount === 1 ? "título" : "títulos"} em catálogo`
            : "Em integração no catálogo"}
        </span>

        <div className="flex items-center gap-2">
          {bookCount > 0 && (
            <a
              href={`/api/catalogo/pdf?editora=${encodeURIComponent(editora.name)}&pais=${market}`}
              target="_blank"
              rel="noreferrer"
              title={`Baixar catálogo PDF de ${editora.name}`}
              className="inline-flex items-center gap-1 rounded-full border border-line px-2.5 py-1 text-[11px] text-ink/75 transition-colors hover:border-brand/40 hover:text-brand"
            >
              <FileDown size={12} aria-hidden="true" />
              <span>PDF</span>
            </a>
          )}
          <Link
            href={`/editoras/${editora.slug}`}
            className="inline-flex items-center gap-1 text-brand transition-colors hover:text-brand-dark"
          >
            <span>Ver editora</span>
            <ArrowUpRight size={14} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
}
