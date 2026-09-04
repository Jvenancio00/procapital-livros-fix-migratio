"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { CATEGORIES, type Book, type Category } from "@/data/books";
import BookCard from "@/components/BookCard";
import { useLanguage } from "@/context/LanguageContext";

const PAGE_SIZE = 12;

function isCategory(value: string | null): value is Category {
  return (CATEGORIES as readonly string[]).includes(value ?? "");
}

export default function CatalogGrid({ books }: { books: Book[] }) {
  const { dict } = useLanguage();
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("categoria");
  const initialQuery = searchParams.get("busca") ?? "";
  const [active, setActive] = useState<Category | "Todos">(
    isCategory(initialCategory) ? initialCategory : "Todos"
  );
  const [query, setQuery] = useState(initialQuery);
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const byCategory =
      active === "Todos" ? books : books.filter((book) => book.category === active);

    const term = query.trim().toLowerCase();
    if (!term) return byCategory;

    return byCategory.filter(
      (book) =>
        book.title.toLowerCase().includes(term) ||
        book.author.toLowerCase().includes(term) ||
        book.category.toLowerCase().includes(term)
    );
  }, [books, active, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  // Volta à página 1 sempre que a categoria ou a pesquisa mudam — evita
  // ficar numa página vazia depois de filtrar.
  useEffect(() => {
    setPage(1);
  }, [active, query]);

  // Se o filtro atual tiver menos páginas do que a página guardada, ajusta.
  useEffect(() => {
    setPage((current) => Math.min(current, totalPages));
  }, [totalPages]);

  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  return (
    <div>
      <div className="relative max-w-sm">
        <Search
          size={16}
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground/40"
        />
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={dict.search.placeholder}
          className="w-full rounded-full border border-line bg-cream py-2.5 pl-10 pr-4 text-sm text-ink placeholder:text-foreground/40 focus:border-brand/40 focus:outline-none"
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {(["Todos", ...CATEGORIES] as const).map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => setActive(category)}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
              active === category
                ? "border-brand bg-brand text-cream"
                : "border-line bg-cream text-foreground/70 hover:border-brand/40"
            }`}
          >
            {category === "Todos" ? dict.search.categoryAll : dict.categories[category]}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="mt-10 text-center text-sm text-foreground/55">
          {dict.catalog.noResults}
        </p>
      ) : (
        <>
          <div className="mt-8 grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
            {paginated.map((book, index) => (
              <BookCard key={book.slug} book={book} index={index} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                aria-label={dict.catalog.previous}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink transition-colors hover:border-brand/40 disabled:cursor-not-allowed disabled:opacity-35"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-sm text-foreground/60">
                {dict.catalog.pageOf
                  .replace("{page}", String(page))
                  .replace("{total}", String(totalPages))}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                aria-label={dict.catalog.next}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink transition-colors hover:border-brand/40 disabled:cursor-not-allowed disabled:opacity-35"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
