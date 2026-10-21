"use client";

import Image from "next/image";
import Link from "next/link";
import type { Editora } from "@/data/editoras";
import EditoraMark from "./EditoraMark";
import { useLanguage } from "@/context/LanguageContext";

export default function PartnersGrid({
  publishers,
}: {
  publishers?: Editora[];
}) {
  const { dict } = useLanguage();
  const list = publishers ?? [];

  if (list.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">
            Rede Editorial
          </span>
          <h2 className="mt-2 font-serif text-3xl font-semibold text-ink">
            Editoras e parceiros representados
          </h2>
        </div>
        <Link
          href="/editoras"
          className="text-sm font-semibold text-brand hover:underline"
        >
          Ver todas as editoras →
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {list.map((editora) => (
          <Link
            key={editora.slug}
            href={`/editoras/${editora.slug}`}
            className="group flex h-28 flex-col items-center justify-center rounded-2xl border border-line bg-white p-4 text-center transition-all hover:border-ink/30 hover:shadow-sm"
          >
            {editora.logo ? (
              <Image
                src={editora.logo}
                alt={editora.name}
                width={180}
                height={72}
                sizes="(max-width: 639px) 44vw, 180px"
                className="max-h-13 w-auto object-contain"
              />
            ) : (
              <EditoraMark name={editora.name} country={editora.country} />
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}
