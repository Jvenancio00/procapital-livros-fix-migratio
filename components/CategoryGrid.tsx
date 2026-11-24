import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export interface CategorySummaryItem {
  name: string;
  slug: string;
  description: string;
  count: number;
}

const EDUCATION_LEVEL_CARDS = [
  {
    code: "ENSINO_PRIMARIO",
    title: "Ensino Primário",
    subtitle: "1.ª à 6.ª Classe · Alfabetização, Matemática, Língua Portuguesa e Ciências",
  },
  {
    code: "ENSINO_SECUNDARIO",
    title: "Ensino Secundário",
    subtitle: "7.ª à 12.ª Classe · Física, Química, Biologia, História e Geografia",
  },
  {
    code: "TECNICO_PROFISSIONAL",
    title: "Técnico-Profissional",
    subtitle: "Gestão, contabilidade, tecnologias e formação aplicada",
  },
  {
    code: "ENSINO_SUPERIOR",
    title: "Ensino Superior & Académico",
    subtitle: "Economia, direito, história, ensaio e investigação lusófona",
  },
];

export default function CategoryGrid({
  categories,
}: {
  categories: CategorySummaryItem[];
}) {
  return (
    <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h2 className="mt-2 font-serif text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            Categorias e níveis de ensino
          </h2>
        </div>

        <Link
          href="/livros-escolares"
          className="text-sm font-semibold text-brand transition-colors hover:text-brand-dark"
        >
          Explorar área escolar por classe e disciplina →
        </Link>
      </div>

      {/* Categorias e níveis em listas editoriais, preservando os destinos. */}
      <div className="mt-9 grid gap-x-12 md:grid-cols-2">
        {categories.map((cat, index) => (
          <Link key={cat.slug} href={`/categoria/${cat.slug}`} className="group grid grid-cols-[2.5rem_1fr_auto] gap-3 border-t border-line py-6 transition-colors hover:text-brand">
            <span aria-hidden="true" className="font-serif text-sm text-brand">{String(index + 1).padStart(2, "0")}</span>
            <div>
              <h3 className="font-serif text-xl font-semibold">{cat.name}</h3>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-ink/70">{cat.description}</p>
              <p className="mt-3 text-xs text-ink/60">{cat.count} {cat.count === 1 ? "título" : "títulos"}</p>
            </div>
            <ArrowUpRight size={17} aria-hidden="true" />
          </Link>
        ))}
      </div>
      <div className="mt-8 grid gap-x-12 md:grid-cols-2">
        {EDUCATION_LEVEL_CARDS.map((level) => (
          <Link key={level.code} href={`/livros-escolares?nivelEnsino=${level.code}`} className="group flex items-start justify-between gap-3 border-t border-line py-5 transition-colors hover:text-brand">
            <div>
              <p className="font-serif text-lg font-semibold">{level.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-ink/70">{level.subtitle}</p>
            </div>
            <ArrowUpRight size={15} className="mt-1 shrink-0" aria-hidden="true" />
          </Link>
        ))}
      </div>
    </section>
  );
}
