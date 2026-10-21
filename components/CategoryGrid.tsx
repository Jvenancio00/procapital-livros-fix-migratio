import Link from "next/link";
import {
  Baby,
  BookOpen,
  Compass,
  GraduationCap,
  ArrowUpRight,
} from "lucide-react";

const CATEGORY_ICONS = {
  Escolar: GraduationCap,
  Infantil: Baby,
  "Ficção": BookOpen,
  "Não-ficção": Compass,
} as const;

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
          <div className="inline-flex items-center gap-2">
            <span className="h-0.5 w-6 bg-accent" aria-hidden="true" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand">
              Organização Editorial &amp; Curricular
            </span>
          </div>
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

      {/* Categorias Principais com Contagens Reais da Base de Dados */}
      <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {categories.map((cat) => {
          const Icon =
            CATEGORY_ICONS[cat.name as keyof typeof CATEGORY_ICONS] ?? BookOpen;
          return (
            <Link
              key={cat.slug}
              href={`/categoria/${cat.slug}`}
              className="group flex flex-col justify-between rounded-2xl border border-line/90 bg-white p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-ink/25 hover:shadow-md motion-reduce:transform-none"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cream-deep text-ink transition-colors group-hover:bg-ink group-hover:text-accent">
                    <Icon size={20} aria-hidden="true" />
                  </div>
                  <span className="rounded-full bg-cream px-2.5 py-1 text-xs font-semibold text-ink/70">
                    {cat.count} {cat.count === 1 ? "título" : "títulos"}
                  </span>
                </div>

                <h3 className="mt-5 font-serif text-xl font-semibold text-ink group-hover:text-brand">
                  {cat.name}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink/65">
                  {cat.description}
                </p>
              </div>

              <span className="mt-5 inline-flex items-center gap-1 text-xs font-semibold text-brand">
                <span>Ver títulos</span>
                <ArrowUpRight size={14} aria-hidden="true" />
              </span>
            </Link>
          );
        })}
      </div>

      {/* Níveis de Ensino */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {EDUCATION_LEVEL_CARDS.map((level) => (
          <Link
            key={level.code}
            href={`/livros-escolares?nivelEnsino=${level.code}`}
            className="group flex items-start justify-between gap-3 rounded-2xl border border-line/80 bg-cream-deep/40 p-4 transition-colors hover:border-brand/35 hover:bg-white"
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-brand">
                {level.title}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-ink/70">
                {level.subtitle}
              </p>
            </div>
            <ArrowUpRight
              size={15}
              className="mt-0.5 shrink-0 text-ink/40 transition-colors group-hover:text-brand"
              aria-hidden="true"
            />
          </Link>
        ))}
      </div>
    </section>
  );
}
