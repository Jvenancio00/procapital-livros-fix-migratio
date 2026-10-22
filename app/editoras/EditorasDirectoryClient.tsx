"use client";

import { useState } from "react";
import EditoraCard from "@/components/EditoraCard";
import type { Editora, RepresentationGroup } from "@/data/editoras";

export interface PublisherWithCount extends Editora {
  resolvedCount: number;
}

const SECTIONS: Array<{
  key: RepresentationGroup;
  eyebrow: string;
  title: string;
  description: string;
}> = [
  {
    key: "EXCLUSIVO",
    eyebrow: "Distribuição Exclusiva",
    title: "Título Exclusivo",
    description:
      "Chancelas com representação e comercialização exclusiva pela Pro Capital.",
  },
  {
    key: "NAO_EXCLUSIVO",
    eyebrow: "Distribuição Partilhada & Rede CPLP",
    title: "Não Exclusivo",
    description:
      "Editoras e fundações literárias comercializadas em regime não exclusivo pela Pro Capital.",
  },
  {
    key: "AUTOR",
    eyebrow: "Edições & Obras de Autor",
    title: "Autores",
    description:
      "Autores representados diretamente no circuito comercial, escolar e institucional da Pro Capital.",
  },
];

export default function EditorasDirectoryClient({
  items,
}: {
  items: PublisherWithCount[];
}) {
  const [selectedGroup, setSelectedGroup] = useState<RepresentationGroup | "ALL">("ALL");

  const countForGroup = (key: RepresentationGroup) =>
    items.filter((item) => (item.representationGroup ?? "NAO_EXCLUSIVO") === key).length;

  const visibleSections = SECTIONS.filter(
    (s) =>
      (selectedGroup === "ALL" || selectedGroup === s.key) &&
      countForGroup(s.key) > 0,
  );

  return (
    <div className="space-y-14">
      <div
        role="tablist"
        aria-label="Filtrar por modalidade de representação"
        className="flex flex-wrap items-center gap-2.5"
      >
        <button
          type="button"
          onClick={() => setSelectedGroup("ALL")}
          className={`rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
            selectedGroup === "ALL"
              ? "bg-ink text-white"
              : "border border-line bg-white text-ink/75 hover:border-brand/40 hover:text-brand"
          }`}
        >
          Todos ({items.length})
        </button>

        {SECTIONS.map((section) => {
          const total = countForGroup(section.key);
          if (total === 0) return null;
          const active = selectedGroup === section.key;
          return (
            <button
              key={section.key}
              type="button"
              onClick={() => setSelectedGroup(section.key)}
              className={`rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
                active
                  ? "bg-brand text-white"
                  : "border border-line bg-white text-ink/75 hover:border-brand/40 hover:text-brand"
              }`}
            >
              {section.title} ({total})
            </button>
          );
        })}
      </div>

      {visibleSections.map((section) => {
        const groupItems = items.filter(
          (item) => (item.representationGroup ?? "NAO_EXCLUSIVO") === section.key,
        );

        return (
          <div key={section.key} id={section.key.toLowerCase()} className="space-y-6">
            <div className="flex flex-col justify-between gap-2 border-b border-line/80 pb-4 sm:flex-row sm:items-end">
              <div>
                <div className="inline-flex items-center gap-2">
                  <span className="h-0.5 w-6 bg-accent" aria-hidden="true" />
                  <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand">
                    {section.eyebrow}
                  </span>
                </div>
                <h2 className="mt-1.5 font-serif text-2xl font-semibold text-ink sm:text-3xl">
                  {section.title}
                </h2>
                <p className="mt-1 max-w-2xl text-xs leading-relaxed text-ink/65 sm:text-sm">
                  {section.description}
                </p>
              </div>
              <span className="text-xs font-semibold text-ink/55">
                {groupItems.length}{" "}
                {groupItems.length === 1
                  ? section.key === "AUTOR"
                    ? "autor representado"
                    : "chancela"
                  : section.key === "AUTOR"
                  ? "autores representados"
                  : "chancelas"}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {groupItems.map((editora) => (
                <EditoraCard
                  key={editora.slug}
                  editora={editora}
                  bookCount={editora.resolvedCount}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
