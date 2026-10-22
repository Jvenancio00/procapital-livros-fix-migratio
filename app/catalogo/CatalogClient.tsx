"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Barcode,
  CheckCircle2,
  FileDown,
  FileSpreadsheet,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import type { Book } from "@/data/books";
import BookCard from "@/components/BookCard";
import PageHeader from "@/components/PageHeader";
import { useCurrency } from "@/context/CurrencyContext";
import { getPriceInCurrency } from "@/lib/currency";
import { parseIsbn } from "@/lib/isbn";
import {
  EDUCATION_LEVEL_LABELS,
  type EducationLevelCode,
  type MarketCode,
} from "@/lib/enums";
import { MARKET_LIST, MARKETS } from "@/lib/markets";

const PAGE_SIZE = 12;

export default function CatalogClient({
  books,
  publishers,
}: {
  books: Book[];
  publishers: Array<{ slug: string; name: string }>;
}) {
  const searchParams = useSearchParams();
  const { market, currency, setMarket } = useCurrency();

  const [query, setQuery] = useState(
    searchParams.get("isbn") ?? searchParams.get("q") ?? "",
  );
  const [category, setCategory] = useState(searchParams.get("categoria") ?? "");
  const [publisher, setPublisher] = useState(searchParams.get("editora") ?? "");
  const [educationLevel, setEducationLevel] = useState(
    searchParams.get("nivelEnsino") ?? "",
  );
  const [availability, setAvailability] = useState(
    searchParams.get("disponibilidade") ?? "",
  );
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("destaque");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const urlPais = searchParams.get("pais")?.toUpperCase();
    if (urlPais && ["AO", "MZ", "PT", "BR"].includes(urlPais) && urlPais !== market) {
      setMarket(urlPais as MarketCode);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const b of books) set.add(b.category);
    return Array.from(set).sort((a, b) => a.localeCompare(b, "pt"));
  }, [books]);

  const isbnCheck = parseIsbn(query);

  const filteredBooks = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const min = minPrice ? Number(minPrice) : undefined;
    const max = maxPrice ? Number(maxPrice) : undefined;

    const list = books.filter((book) => {
      if (category && book.category !== category) return false;
      const selectedPub = publishers.find(
        (p) => p.slug === publisher || p.name.toLowerCase() === publisher.toLowerCase(),
      );
      if (publisher) {
        const target = (selectedPub?.name ?? publisher).toLowerCase();
        if (
          book.editora.toLowerCase() !== target &&
          !book.author.toLowerCase().includes(target)
        ) {
          return false;
        }
      }
      if (educationLevel && book.educationLevel !== educationLevel) return false;

      const stock = book.stockByMarket?.[market] ?? 0;
      const price = getPriceInCurrency(book, currency);
      const isEnabled =
        book.free ||
        (price > 0 && (!book.activeMarkets || book.activeMarkets.includes(market)));

      if (availability === "DISPONIVEL" && (!isEnabled || stock <= 0)) return false;
      if (availability === "COTACAO" && isEnabled && stock > 0) return false;

      if (typeof min === "number" && !Number.isNaN(min) && price < min) return false;
      if (typeof max === "number" && !Number.isNaN(max) && price > max) return false;

      if (needle) {
        // Prioridade máxima para correspondência exata de ISBN-10 / ISBN-13
        if (isbnCheck.isCompleteLength) {
          const bookIsbn = parseIsbn(book.isbn ?? "");
          return (
            bookIsbn.clean === isbnCheck.clean ||
            (Boolean(isbnCheck.isbn13) && bookIsbn.isbn13 === isbnCheck.isbn13)
          );
        }
        const hay = [
          book.title,
          book.author,
          book.editora,
          book.isbn,
          book.category,
          book.subject,
          book.schoolGrade,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!hay.includes(needle)) return false;
      }

      return true;
    });

    const sorted = [...list];
    if (sort === "preco_asc") {
      sorted.sort(
        (a, b) => getPriceInCurrency(a, currency) - getPriceInCurrency(b, currency),
      );
    } else if (sort === "preco_desc") {
      sorted.sort(
        (a, b) => getPriceInCurrency(b, currency) - getPriceInCurrency(a, currency),
      );
    } else if (sort === "titulo_asc") {
      sorted.sort((a, b) => a.title.localeCompare(b.title, "pt"));
    } else if (sort === "autor_asc") {
      sorted.sort((a, b) => a.author.localeCompare(b.author, "pt"));
    } else if (sort === "recentes") {
      sorted.sort((a, b) => (b.year ?? 0) - (a.year ?? 0));
    } else {
      sorted.sort(
        (a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)),
      );
    }
    return sorted;
  }, [
    books,
    query,
    isbnCheck.isCompleteLength,
    isbnCheck.clean,
    isbnCheck.isbn13,
    category,
    publisher,
    educationLevel,
    availability,
    minPrice,
    maxPrice,
    sort,
    market,
    currency,
  ]);

  const totalPages = Math.max(1, Math.ceil(filteredBooks.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginatedBooks = filteredBooks.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  const pdfHref = useMemo(() => {
    const p = new URLSearchParams({ pais: market });
    if (category) p.set("categoria", category);
    if (publisher) p.set("editora", publisher);
    if (educationLevel) p.set("nivelEnsino", educationLevel);
    if (availability) p.set("disponibilidade", availability);
    if (minPrice) p.set("precoMin", minPrice);
    if (maxPrice) p.set("precoMax", maxPrice);
    if (query.trim()) p.set("q", query.trim());
    return `/api/catalogo/pdf?${p.toString()}`;
  }, [
    market,
    category,
    publisher,
    educationLevel,
    availability,
    minPrice,
    maxPrice,
    query,
  ]);

  const hasFilters = Boolean(
    query || category || publisher || educationLevel || availability || minPrice || maxPrice,
  );

  return (
    <div className="pb-20">
      <PageHeader
        eyebrow="Catálogo Editorial Multi-Mercado"
        title={`Catálogo ${MARKETS[market].name} (${MARKETS[market].currency})`}
        description={`Consulte o acervo completo comercializado para ${MARKETS[market].name} com preços oficiais em ${MARKETS[market].isoCurrency}, stock real por armazém e pesquisa prioritária por ISBN.`}
        breadcrumbs={[
          { label: "Início", href: "/" },
          { label: "Catálogo Editorial" },
        ]}
        actions={
          <>
            <a
              href={pdfHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2.5 text-xs font-semibold text-ink transition-colors hover:border-brand/40 hover:text-brand"
            >
              <FileDown size={14} aria-hidden="true" />
              <span>Exportar PDF ({filteredBooks.length})</span>
            </a>

            <Link
              href={`/cotacoes?pais=${market}`}
              className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-brand-dark"
            >
              <FileSpreadsheet size={14} aria-hidden="true" />
              <span>Pedir Cotação</span>
            </Link>
          </>
        }
      />

      <section className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid gap-8 lg:grid-cols-12">
          {/* Coluna Lateral de Filtros Combináveis */}
          <aside className="space-y-5 lg:col-span-3">
            <div className="rounded-2xl border border-line bg-white p-5">
              <div className="flex items-center justify-between">
                <h2 className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-ink">
                  <SlidersHorizontal size={14} className="text-brand" />
                  <span>Filtros Comerciais</span>
                </h2>
                {hasFilters && (
                  <button
                    type="button"
                    onClick={() => {
                      setQuery("");
                      setCategory("");
                      setPublisher("");
                      setEducationLevel("");
                      setAvailability("");
                      setMinPrice("");
                      setMaxPrice("");
                      setPage(1);
                    }}
                    className="text-xs font-semibold text-brand hover:underline"
                  >
                    Limpar
                  </button>
                )}
              </div>

              <div className="mt-4 space-y-4">
                <div>
                  <label
                    htmlFor="cat-market"
                    className="block text-xs font-semibold text-ink/75"
                  >
                    País / Mercado
                  </label>
                  <select
                    id="cat-market"
                    value={market}
                    onChange={(e) => {
                      setMarket(e.target.value as MarketCode);
                      setPage(1);
                    }}
                    className="mt-1.5 w-full rounded-xl border border-line bg-cream/50 px-3 py-2 text-xs font-semibold text-ink"
                  >
                    {MARKET_LIST.map((m) => (
                      <option key={m.code} value={m.code}>
                        {m.name} ({m.currency})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="cat-category"
                    className="block text-xs font-semibold text-ink/75"
                  >
                    Categoria
                  </label>
                  <select
                    id="cat-category"
                    value={category}
                    onChange={(e) => {
                      setCategory(e.target.value);
                      setPage(1);
                    }}
                    className="mt-1.5 w-full rounded-xl border border-line bg-cream/50 px-3 py-2 text-xs text-ink"
                  >
                    <option value="">Todas as categorias</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="cat-publisher"
                    className="block text-xs font-semibold text-ink/75"
                  >
                    Editora
                  </label>
                  <select
                    id="cat-publisher"
                    value={publisher}
                    onChange={(e) => {
                      setPublisher(e.target.value);
                      setPage(1);
                    }}
                    className="mt-1.5 w-full rounded-xl border border-line bg-cream/50 px-3 py-2 text-xs text-ink"
                  >
                    <option value="">Todas as editoras</option>
                    {publishers.map((p) => (
                      <option key={p.slug} value={p.slug}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="cat-level"
                    className="block text-xs font-semibold text-ink/75"
                  >
                    Nível de Ensino
                  </label>
                  <select
                    id="cat-level"
                    value={educationLevel}
                    onChange={(e) => {
                      setEducationLevel(e.target.value);
                      setPage(1);
                    }}
                    className="mt-1.5 w-full rounded-xl border border-line bg-cream/50 px-3 py-2 text-xs text-ink"
                  >
                    <option value="">Todos os níveis</option>
                    {(Object.keys(EDUCATION_LEVEL_LABELS) as EducationLevelCode[]).map(
                      (code) => (
                        <option key={code} value={code}>
                          {EDUCATION_LEVEL_LABELS[code]}
                        </option>
                      ),
                    )}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="cat-avail"
                    className="block text-xs font-semibold text-ink/75"
                  >
                    Disponibilidade em {MARKETS[market].name}
                  </label>
                  <select
                    id="cat-avail"
                    value={availability}
                    onChange={(e) => {
                      setAvailability(e.target.value);
                      setPage(1);
                    }}
                    className="mt-1.5 w-full rounded-xl border border-line bg-cream/50 px-3 py-2 text-xs text-ink"
                  >
                    <option value="">Todos os estados</option>
                    <option value="DISPONIVEL">Em stock imediato</option>
                    <option value="COTACAO">Sob cotação / encomenda</option>
                  </select>
                </div>

                <div>
                  <span className="block text-xs font-semibold text-ink/75">
                    Intervalo de Preço ({currency})
                  </span>
                  <div className="mt-1.5 grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      min={0}
                      placeholder="Mín."
                      value={minPrice}
                      onChange={(e) => {
                        setMinPrice(e.target.value);
                        setPage(1);
                      }}
                      className="w-full rounded-xl border border-line bg-cream/50 px-3 py-2 text-xs text-ink"
                    />
                    <input
                      type="number"
                      min={0}
                      placeholder="Máx."
                      value={maxPrice}
                      onChange={(e) => {
                        setMaxPrice(e.target.value);
                        setPage(1);
                      }}
                      className="w-full rounded-xl border border-line bg-cream/50 px-3 py-2 text-xs text-ink"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Nota transparente de regras logísticas do país ativo */}
            <div className="rounded-2xl border border-line/80 bg-cream-deep/50 p-4 text-xs text-ink/75">
              <p className="font-semibold text-ink">
                Condições logísticas · {MARKETS[market].name}
              </p>
              <p className="mt-1 leading-relaxed">{MARKETS[market].shippingSummary}</p>
            </div>
          </aside>

          {/* Coluna Principal de Pesquisa ISBN + Resultados + Paginação */}
          <div className="lg:col-span-9">
            <div className="rounded-2xl border border-line bg-white p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                  <Search
                    size={17}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/45"
                  />
                  <input
                    type="search"
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setPage(1);
                    }}
                    placeholder="Pesquisar por ISBN-13 / ISBN-10, título, autor, editora ou disciplina..."
                    aria-label="Pesquisar no catálogo"
                    className="w-full rounded-xl border border-line bg-cream/40 py-2.5 pl-10 pr-8 text-sm text-ink focus:border-brand focus:outline-none"
                  />
                  {query && (
                    <button
                      type="button"
                      aria-label="Limpar termo"
                      onClick={() => setQuery("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink/45 hover:text-ink"
                    >
                      <X size={15} />
                    </button>
                  )}
                </div>

                <select
                  aria-label="Ordenar catálogo"
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="rounded-xl border border-line bg-cream/40 px-3.5 py-2.5 text-xs font-semibold text-ink"
                >
                  <option value="destaque">Ordenar: Destaques editoriais</option>
                  <option value="preco_asc">Preço: menor para maior</option>
                  <option value="preco_desc">Preço: maior para menor</option>
                  <option value="titulo_asc">Título: A a Z</option>
                  <option value="autor_asc">Autor: A a Z</option>
                  <option value="recentes">Edições mais recentes</option>
                </select>
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-ink/60">
                <span className="inline-flex items-center gap-1.5">
                  <Barcode size={14} className="text-brand" />
                  {isbnCheck.isCompleteLength ? (
                    <span className="inline-flex items-center gap-1 font-semibold text-emerald-800">
                      <CheckCircle2 size={13} />
                      Modo de correspondência exata ISBN ({isbnCheck.clean})
                    </span>
                  ) : (
                    <span>
                      Mostrando <strong>{paginatedBooks.length}</strong> de{" "}
                      <strong>{filteredBooks.length}</strong> títulos
                    </span>
                  )}
                </span>

                <span>
                  Página {safePage} de {totalPages}
                </span>
              </div>
            </div>

            {paginatedBooks.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-line bg-white p-12 text-center">
                <h3 className="font-serif text-2xl font-semibold text-ink">
                  Nenhum título encontrado para esta combinação
                </h3>
                <p className="mx-auto mt-2 max-w-md text-sm text-ink/65">
                  Limpe algum filtro ou envie um pedido de cotação por ISBN à nossa
                  equipa comercial para encomenda especial junto da editora.
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <Link
                    href={`/cotacoes?pais=${market}`}
                    className="rounded-full bg-brand px-6 py-2.5 text-xs font-semibold text-white hover:bg-brand-dark"
                  >
                    Pedir cotação especial
                  </Link>
                </div>
              </div>
            ) : (
              <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {paginatedBooks.map((book, idx) => (
                  <BookCard key={book.slug} book={book} index={idx} />
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <nav
                aria-label="Paginação do catálogo"
                className="mt-10 flex items-center justify-center gap-2"
              >
                <button
                  type="button"
                  disabled={safePage <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="rounded-full border border-line bg-white px-4 py-2 text-xs font-semibold text-ink disabled:opacity-40"
                >
                  Anterior
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setPage(num)}
                    className={`h-9 min-w-9 rounded-full px-3 text-xs font-semibold transition-colors ${
                      num === safePage
                        ? "bg-ink text-white"
                        : "border border-line bg-white text-ink hover:border-ink/40"
                    }`}
                  >
                    {num}
                  </button>
                ))}
                <button
                  type="button"
                  disabled={safePage >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="rounded-full border border-line bg-white px-4 py-2 text-xs font-semibold text-ink disabled:opacity-40"
                >
                  Seguinte
                </button>
              </nav>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
