"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Barcode, BookOpen, CheckCircle2, Search, X } from "lucide-react";
import { parseIsbn } from "@/lib/isbn";
import { useCurrency } from "@/context/CurrencyContext";
import { EDUCATION_LEVEL_LABELS, type EducationLevelCode } from "@/lib/enums";
import { MARKET_LIST } from "@/lib/markets";

interface SuggestionItem {
  slug: string;
  title: string;
  author: string;
  editora: string;
  isbn: string | null;
  category: string;
  schoolGrade: string | null;
}

export default function AdvancedSearchBar({
  categories = ["Escolar", "Infantil", "Ficção", "Não-ficção"],
  compact = false,
}: {
  categories?: string[];
  compact?: boolean;
}) {
  const router = useRouter();
  const { market } = useCurrency();
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [educationLevel, setEducationLevel] = useState<string>("");
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const isbnCheck = parseIsbn(query);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setSuggestions([]);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({
          q: trimmed,
          pais: market,
          porPagina: "6",
        });
        if (selectedCategory) params.set("categoria", selectedCategory);
        if (educationLevel) params.set("nivelEnsino", educationLevel);

        const res = await fetch(`/api/livros/pesquisa?${params.toString()}`, {
          signal: controller.signal,
        });
        if (!res.ok) return;
        const json = await res.json();
        setSuggestions(Array.isArray(json.suggestions) ? json.suggestions : []);
        setOpen(true);
      } catch {
        // pedido abortado ao digitar
      } finally {
        setLoading(false);
      }
    }, 220);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, market, selectedCategory, educationLevel]);

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setOpen(false);
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (selectedCategory) params.set("categoria", selectedCategory);
    if (educationLevel) params.set("nivelEnsino", educationLevel);
    params.set("pais", market);
    router.push(`/catalogo?${params.toString()}`);
  }

  return (
    <div ref={containerRef} className="relative mx-auto w-full max-w-5xl">
      <form
        onSubmit={handleSubmit}
        role="search"
        aria-label="Pesquisa avançada de livros"
        className={`rounded-2xl border border-line bg-white p-3 shadow-sm ${
          compact ? "" : "sm:p-4"
        }`}
      >
        <div className="grid gap-2.5 lg:grid-cols-12">
          {/* Campo Principal: ISBN / Título / Autor / Editora / Disciplina */}
          <div className="relative flex items-center lg:col-span-5">
            <Search
              size={18}
              className="pointer-events-none ml-3 shrink-0 text-ink/45"
              aria-hidden="true"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setOpen(true);
              }}
              onFocus={() => suggestions.length > 0 && setOpen(true)}
              placeholder="ISBN, título, autor, editora, classe ou disciplina..."
              className="w-full bg-transparent px-3 py-2.5 text-sm text-ink placeholder:text-ink/45 focus:outline-none"
            />
            {query && (
              <button
                type="button"
                aria-label="Limpar pesquisa"
                onClick={() => {
                  setQuery("");
                  setSuggestions([]);
                }}
                className="mr-1 rounded-full p-1 text-ink/40 hover:text-ink"
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* Filtro Rápido de Categoria */}
          <div className="lg:col-span-2">
            <label className="sr-only" htmlFor="adv-cat">
              Categoria
            </label>
            <select
              id="adv-cat"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="h-full w-full rounded-xl border border-line/90 bg-cream/60 px-3 py-2.5 text-xs font-medium text-ink focus:border-brand focus:outline-none"
            >
              <option value="">Todas as categorias</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro Rápido de Nível de Ensino */}
          <div className="lg:col-span-3">
            <label className="sr-only" htmlFor="adv-level">
              Nível de ensino
            </label>
            <select
              id="adv-level"
              value={educationLevel}
              onChange={(e) => setEducationLevel(e.target.value)}
              className="h-full w-full rounded-xl border border-line/90 bg-cream/60 px-3 py-2.5 text-xs font-medium text-ink focus:border-brand focus:outline-none"
            >
              <option value="">Todos os níveis de ensino</option>
              {(Object.keys(EDUCATION_LEVEL_LABELS) as EducationLevelCode[]).map(
                (lvl) => (
                  <option key={lvl} value={lvl}>
                    {EDUCATION_LEVEL_LABELS[lvl]}
                  </option>
                ),
              )}
            </select>
          </div>

          {/* Botão Pesquisar */}
          <div className="lg:col-span-2">
            <button
              type="submit"
              className="flex h-full min-h-10.5 w-full items-center justify-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
            >
              <Search size={15} aria-hidden="true" />
              <span>Pesquisar</span>
            </button>
          </div>
        </div>

        {/* Barra contextual de prioridade ISBN e atalhos */}
        <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 border-t border-line/60 pt-2 text-xs text-ink/60">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 font-medium text-ink/70">
              <Barcode size={14} className="text-brand" aria-hidden="true" />
              Prioridade automática de pesquisa por ISBN-10 / ISBN-13
            </span>

            {isbnCheck.isCompleteLength && (
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                  isbnCheck.valid
                    ? "bg-emerald-50 text-emerald-800"
                    : "bg-amber-50 text-amber-800"
                }`}
              >
                <CheckCircle2 size={12} aria-hidden="true" />
                {isbnCheck.valid
                  ? `ISBN válido detetado (${isbnCheck.isbn13})`
                  : "Dígito de controlo ISBN inválido — pesquisa textual ativa"}
              </span>
            )}
          </div>

          <div className="hidden items-center gap-2 sm:flex">
            <span>
              Mercado ativo:{" "}
              <strong className="text-ink">
                {MARKET_LIST.find((m) => m.code === market)?.name ?? market}
              </strong>
            </span>
          </div>
        </div>
      </form>

      {/* Autocomplete Instantâneo */}
      {open && (loading || suggestions.length > 0) && (
        <div className="absolute left-0 right-0 z-40 mt-2 overflow-hidden rounded-2xl border border-line bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-line/70 bg-cream/70 px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-ink/55">
            <span>
              {loading ? "A consultar catálogo..." : "Sugestões imediatas do catálogo"}
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-ink/50 hover:text-ink"
            >
              Fechar
            </button>
          </div>

          <ul className="divide-y divide-line/60">
            {suggestions.map((item) => (
              <li key={item.slug}>
                <Link
                  href={`/livro/${item.slug}`}
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between gap-4 px-4 py-3 transition-colors hover:bg-cream"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cream-deep text-ink">
                      <BookOpen size={15} aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-serif text-sm font-semibold text-ink">
                        {item.title}
                      </p>
                      <p className="truncate text-xs text-ink/60">
                        {item.author} · <span className="text-brand">{item.editora}</span>
                        {item.isbn ? ` · ISBN ${item.isbn}` : ""}
                      </p>
                    </div>
                  </div>

                  <span className="shrink-0 rounded-full border border-line bg-cream/70 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-ink/75">
                    {item.schoolGrade
                      ? `${item.category} · ${item.schoolGrade}`
                      : item.category}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
