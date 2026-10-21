"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Check,
  FileDown,
  FileSpreadsheet,
  GraduationCap,
  Layers,
  Search,
  ShoppingCart,
} from "lucide-react";
import type { Book } from "@/data/books";
import PageHeader from "@/components/PageHeader";
import BookCard from "@/components/BookCard";
import { useCurrency } from "@/context/CurrencyContext";
import { useCart } from "@/context/CartContext";
import { formatMoney, getPriceInCurrency } from "@/lib/currency";
import { EDUCATION_LEVEL_LABELS, type EducationLevelCode, type MarketCode } from "@/lib/enums";
import { MARKET_LIST, MARKETS } from "@/lib/markets";
import { parseIsbn } from "@/lib/isbn";

export default function SchoolCatalogClient({
  books,
  publishers,
}: {
  books: Book[];
  publishers: Array<{ slug: string; name: string }>;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { market, currency, setMarket } = useCurrency();
  const { addItem } = useCart();

  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [level, setLevel] = useState(searchParams.get("nivelEnsino") ?? "");
  const [grade, setGrade] = useState(searchParams.get("classe") ?? "");
  const [subject, setSubject] = useState(searchParams.get("disciplina") ?? "");
  const [publisher, setPublisher] = useState(searchParams.get("editora") ?? "");
  const [schoolYear, setSchoolYear] = useState(searchParams.get("anoEscolar") ?? "");
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkQuantities, setBulkQuantities] = useState<Record<string, number>>({});
  const [bulkFeedback, setBulkFeedback] = useState("");

  const availableGrades = useMemo(() => {
    const set = new Set<string>();
    for (const b of books) {
      if (b.schoolGrade) set.add(b.schoolGrade);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, "pt", { numeric: true }));
  }, [books]);

  const availableSubjects = useMemo(() => {
    const set = new Set<string>();
    for (const b of books) {
      if (b.subject) set.add(b.subject);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, "pt"));
  }, [books]);

  const availableYears = useMemo(() => {
    const set = new Set<string>();
    for (const b of books) {
      if (b.academicYear) set.add(String(b.academicYear));
    }
    return Array.from(set).sort();
  }, [books]);

  const filteredBooks = useMemo(() => {
    const isbn = parseIsbn(query);
    const needle = query.trim().toLowerCase();
    const selectedPub = publishers.find(
      (p) => p.slug === publisher || p.name.toLowerCase() === publisher.toLowerCase(),
    );

    return books.filter((book) => {
      if (level && book.educationLevel !== level) return false;
      if (grade && book.schoolGrade !== grade) return false;
      if (subject && book.subject !== subject) return false;
      if (
        publisher &&
        book.editora.toLowerCase() !== (selectedPub?.name ?? publisher).toLowerCase()
      )
        return false;
      if (schoolYear && String(book.academicYear ?? "") !== schoolYear) return false;

      if (needle) {
        if (isbn.isCompleteLength) {
          const bookIsbn = parseIsbn(book.isbn ?? "");
          return (
            bookIsbn.clean === isbn.clean ||
            (Boolean(isbn.isbn13) && bookIsbn.isbn13 === isbn.isbn13)
          );
        }
        const hay = [
          book.title,
          book.author,
          book.editora,
          book.isbn,
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
  }, [books, query, level, grade, subject, publisher, schoolYear]);

  const pdfHref = useMemo(() => {
    const p = new URLSearchParams({
      categoria: "Escolar",
      pais: market,
    });
    if (level) p.set("nivelEnsino", level);
    if (grade) p.set("classe", grade);
    if (subject) p.set("disciplina", subject);
    if (publisher) p.set("editora", publisher);
    if (query.trim()) p.set("q", query.trim());
    return `/api/catalogo/pdf?${p.toString()}`;
  }, [market, level, grade, subject, publisher, query]);

  const selectedBulkEntries = Object.entries(bulkQuantities).filter(
    ([, qty]) => qty > 0,
  );
  const totalBulkUnits = selectedBulkEntries.reduce((sum, [, qty]) => sum + qty, 0);

  function updateBulkQty(slug: string, value: number) {
    setBulkQuantities((prev) => ({
      ...prev,
      [slug]: Math.max(0, Math.min(5000, Math.floor(value || 0))),
    }));
  }

  function handleAddBulkToCart() {
    let addedCount = 0;
    for (const [slug, qty] of selectedBulkEntries) {
      const book = books.find((b) => b.slug === slug);
      if (!book) continue;
      const stock = book.stockByMarket?.[market] ?? 0;
      if (stock > 0 || book.allowPreorder) {
        addItem(book, Math.min(qty, stock > 0 ? stock : qty));
        addedCount += 1;
      }
    }
    if (addedCount > 0) {
      setBulkFeedback(`${addedCount} título(s) adicionados ao carrinho comercial.`);
      setTimeout(() => setBulkFeedback(""), 3500);
    }
  }

  function handleSendBulkToQuote() {
    const payload = selectedBulkEntries
      .map(([slug, qty]) => `${slug}:${qty}`)
      .join(",");
    router.push(
      `/cotacoes?perfil=ESCOLA&pais=${market}&itens=${encodeURIComponent(payload)}`,
    );
  }

  return (
    <div className="pb-20">
      <PageHeader
        eyebrow="Área Prioritária · Ensino & Formação"
        title="Livros Escolares, Técnicos e Universitários"
        description="Consulte manuais curriculares, gramáticas e obras de referência por país, nível de ensino, classe, disciplina e editora. Encomende online ou solicite cotação institucional em quantidade."
        breadcrumbs={[
          { label: "Início", href: "/" },
          { label: "Livros Escolares" },
        ]}
        actions={
          <>
            <button
              type="button"
              onClick={() => setBulkMode((v) => !v)}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-xs font-semibold transition-colors ${
                bulkMode
                  ? "border-ink bg-ink text-white"
                  : "border-line bg-white text-ink hover:border-ink/40"
              }`}
            >
              <Layers size={14} aria-hidden="true" />
              <span>
                {bulkMode
                  ? "Vista Individual (Cartões)"
                  : "Encomenda em Quantidade (Lista Escolar)"}
              </span>
            </button>

            <a
              href={pdfHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2.5 text-xs font-semibold text-ink transition-colors hover:border-brand/40 hover:text-brand"
            >
              <FileDown size={14} aria-hidden="true" />
              <span>Exportar PDF Escolar</span>
            </a>

            <Link
              href={`/cotacoes?perfil=ESCOLA&pais=${market}`}
              className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-brand-dark"
            >
              <FileSpreadsheet size={14} aria-hidden="true" />
              <span>Pedir Cotação Escolar</span>
            </Link>
          </>
        }
      />

      {/* Painel de Filtros Escolares Estruturados */}
      <section className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="rounded-2xl border border-line bg-white p-5 shadow-2xs">
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-6">
            <div className="relative lg:col-span-2">
              <Search
                size={16}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/45"
                aria-hidden="true"
              />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="ISBN, título, disciplina ou autor..."
                aria-label="Pesquisar livro escolar"
                className="w-full rounded-xl border border-line bg-cream/50 py-2.5 pl-9 pr-3 text-sm text-ink focus:border-brand focus:outline-none"
              />
            </div>

            <div>
              <select
                aria-label="País de comercialização"
                value={market}
                onChange={(e) => setMarket(e.target.value as MarketCode)}
                className="w-full rounded-xl border border-line bg-cream/50 px-3 py-2.5 text-xs font-semibold text-ink focus:border-brand focus:outline-none"
              >
                {MARKET_LIST.map((m) => (
                  <option key={m.code} value={m.code}>
                    País: {m.name} ({m.currency})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <select
                aria-label="Nível de ensino"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full rounded-xl border border-line bg-cream/50 px-3 py-2.5 text-xs font-medium text-ink focus:border-brand focus:outline-none"
              >
                <option value="">Todos os níveis de ensino</option>
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
              <select
                aria-label="Classe ou ano curricular"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full rounded-xl border border-line bg-cream/50 px-3 py-2.5 text-xs font-medium text-ink focus:border-brand focus:outline-none"
              >
                <option value="">Todas as classes</option>
                {availableGrades.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <select
                aria-label="Disciplina"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full rounded-xl border border-line bg-cream/50 px-3 py-2.5 text-xs font-medium text-ink focus:border-brand focus:outline-none"
              >
                <option value="">Todas as disciplinas</option>
                {availableSubjects.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-line/70 pt-3 text-xs">
            <div className="flex flex-wrap items-center gap-3">
              <select
                aria-label="Editora"
                value={publisher}
                onChange={(e) => setPublisher(e.target.value)}
                className="rounded-xl border border-line bg-cream/50 px-3 py-1.5 text-xs font-medium text-ink"
              >
                <option value="">Todas as editoras</option>
                {publishers.map((p) => (
                  <option key={p.slug} value={p.slug}>
                    {p.name}
                  </option>
                ))}
              </select>

              {availableYears.length > 0 && (
                <select
                  aria-label="Ano escolar"
                  value={schoolYear}
                  onChange={(e) => setSchoolYear(e.target.value)}
                  className="rounded-xl border border-line bg-cream/50 px-3 py-1.5 text-xs font-medium text-ink"
                >
                  <option value="">Todos os anos letivos</option>
                  {availableYears.map((y) => (
                    <option key={y} value={y}>
                      Ano letivo {y}
                    </option>
                  ))}
                </select>
              )}

              {(query || level || grade || subject || publisher || schoolYear) && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setLevel("");
                    setGrade("");
                    setSubject("");
                    setPublisher("");
                    setSchoolYear("");
                  }}
                  className="font-semibold text-brand hover:underline"
                >
                  Limpar filtros
                </button>
              )}
            </div>

            <p className="text-ink/65">
              <strong>{filteredBooks.length}</strong>{" "}
              {filteredBooks.length === 1
                ? "manual encontrado"
                : "manuais encontrados"}{" "}
              para <strong>{MARKETS[market].name}</strong>
            </p>
          </div>
        </div>
      </section>

      {/* Barra Flutuante de Encomenda em Quantidade */}
      {bulkMode && (
        <section className="mx-auto mt-6 max-w-7xl px-5 sm:px-8">
          <div className="flex flex-col justify-between gap-4 rounded-2xl bg-ink p-5 text-white sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <GraduationCap size={22} className="shrink-0 text-accent" />
              <div>
                <p className="text-sm font-semibold">
                  Modo Lista Escolar em Quantidade ({totalBulkUnits} exemplares
                  selecionados em {selectedBulkEntries.length} título(s))
                </p>
                <p className="text-xs text-white/70">
                  Indique as quantidades por classe/disciplina para adicionar ao
                  carrinho ou gerar um pedido de cotação formal.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {bulkFeedback && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold">
                  <Check size={13} />
                  {bulkFeedback}
                </span>
              )}
              <button
                type="button"
                disabled={selectedBulkEntries.length === 0}
                onClick={handleAddBulkToCart}
                className="inline-flex items-center gap-1.5 rounded-full bg-brand px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-brand-dark disabled:opacity-45"
              >
                <ShoppingCart size={14} />
                Adicionar disponíveis ao carrinho
              </button>
              <button
                type="button"
                disabled={selectedBulkEntries.length === 0}
                onClick={handleSendBulkToQuote}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/25 px-4 py-2 text-xs font-semibold text-white hover:border-accent disabled:opacity-45"
              >
                <FileSpreadsheet size={14} />
                Enviar lista para cotação B2B
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Resultados: Tabela de Volume Escolar OU Grelha de Cartões */}
      <section className="mx-auto mt-8 max-w-7xl px-5 sm:px-8">
        {filteredBooks.length === 0 ? (
          <div className="rounded-2xl border border-line bg-white p-12 text-center">
            <h2 className="font-serif text-2xl font-semibold text-ink">
              Nenhum manual corresponde aos filtros selecionados
            </h2>
            <p className="mx-auto mt-2 max-w-lg text-sm text-ink/65">
              Caso procure um manual específico por ISBN ou adote uma lista
              curricular completa para a sua escola ou livraria, solicite cotação à
              nossa equipa editorial.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Link
                href={`/cotacoes?perfil=ESCOLA&pais=${market}`}
                className="rounded-full bg-brand px-6 py-2.5 text-xs font-semibold text-white hover:bg-brand-dark"
              >
                Solicitar cotação por lista ISBN
              </Link>
            </div>
          </div>
        ) : bulkMode ? (
          <div className="overflow-x-auto rounded-2xl border border-line bg-white">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-line bg-cream/80 text-xs uppercase tracking-wider text-ink/60">
                <tr>
                  <th className="px-4 py-3.5">Manual / ISBN</th>
                  <th className="px-4 py-3.5">Nível / Classe</th>
                  <th className="px-4 py-3.5">Disciplina</th>
                  <th className="px-4 py-3.5">Editora</th>
                  <th className="px-4 py-3.5">Stock ({market})</th>
                  <th className="px-4 py-3.5">Preço Unit.</th>
                  <th className="px-4 py-3.5 text-right">Quantidade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/70">
                {filteredBooks.map((book) => {
                  const unitPrice = getPriceInCurrency(book, currency);
                  const stock = book.stockByMarket?.[market] ?? 0;
                  const qty = bulkQuantities[book.slug] ?? 0;
                  return (
                    <tr key={book.slug} className="hover:bg-cream/40">
                      <td className="px-4 py-3.5">
                        <Link
                          href={`/livro/${book.slug}`}
                          className="font-serif font-semibold text-ink hover:text-brand"
                        >
                          {book.title}
                        </Link>
                        <p className="text-xs text-ink/55">
                          {book.author}
                          {book.isbn ? ` · ISBN ${book.isbn}` : ""}
                        </p>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-ink/75">
                        {book.schoolGrade ?? "—"}
                      </td>
                      <td className="px-4 py-3.5 text-xs text-ink/75">
                        {book.subject ?? "—"}
                      </td>
                      <td className="px-4 py-3.5 text-xs font-medium text-brand">
                        {book.editora}
                      </td>
                      <td className="px-4 py-3.5 text-xs">
                        {stock > 0 ? (
                          <span className="font-semibold text-emerald-700">
                            {stock} un.
                          </span>
                        ) : (
                          <span className="text-amber-700">Sob cotação</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 font-serif font-semibold text-ink">
                        {unitPrice > 0
                          ? formatMoney(unitPrice, currency)
                          : "Sob consulta"}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <input
                          type="number"
                          min={0}
                          max={5000}
                          aria-label={`Quantidade para ${book.title}`}
                          value={qty || ""}
                          placeholder="0"
                          onChange={(e) =>
                            updateBulkQty(book.slug, Number(e.target.value))
                          }
                          className="w-24 rounded-lg border border-line px-2.5 py-1.5 text-right text-sm font-semibold text-ink focus:border-brand focus:outline-none"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filteredBooks.map((book, idx) => (
              <BookCard key={book.slug} book={book} index={idx} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
