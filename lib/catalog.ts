import { BOOKS, CATEGORIES, type Book } from "@/data/books";
import {
  EDITORAS,
  type Editora,
  type RepresentationGroup,
} from "@/data/editoras";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import {
  cleanIsbnInput,
  looksLikeFullIsbnQuery,
  normalizeIsbnForLookup,
} from "@/lib/isbn";
import {
  currencyForMarket,
  marketForCurrency,
  MARKETS,
} from "@/lib/markets";
import type { Currency, MarketCode } from "@/lib/enums";

function mapDbRecordToBook(
  record: {
    id: string;
    slug: string;
    title: string;
    author: string;
    editora: string;
    description: string | null;
    isbn: string | null;
    isbnNormalized: string | null;
    coverUrl: string | null;
    pdfUrl: string | null;
    pages: number | null;
    year: number | null;
    free: boolean;
    featured: boolean;
    educationLevel: string | null;
    schoolGrade: string | null;
    subject: string | null;
    academicYear: number | null;
    countryOrigin: string | null;
    allowPreorder: boolean;
    allowQuote: boolean;
    active: boolean;
    category: { name: string };
    editoraRef: { name: string } | null;
    prices: { currency: Currency; amount: unknown; marketActive: boolean }[];
    stockItems: { quantity: number; reserved: number; warehouse: { countryCode: MarketCode; active: boolean } }[];
    reviews: { rating: number }[];
  },
  bestsellerSet: Set<string>
): Book {
  const staticFallback = BOOKS.find((b) => b.slug === record.slug);

  const getPrice = (currency: Currency, fallbackVal = 0) => {
    const row = record.prices.find((p) => p.currency === currency);
    if (!row) return fallbackVal;
    return Number(row.amount);
  };

  const stockByMarket: Partial<Record<MarketCode, number>> = {
    AO: 0,
    MZ: 0,
    PT: 0,
    BR: 0,
  };
  for (const s of record.stockItems) {
    if (!s.warehouse.active) continue;
    const avail = Math.max(0, s.quantity - s.reserved);
    stockByMarket[s.warehouse.countryCode] =
      (stockByMarket[s.warehouse.countryCode] ?? 0) + avail;
  }

  const activeMarkets: MarketCode[] = [];
  for (const m of ["AO", "MZ", "PT", "BR"] as MarketCode[]) {
    const cur = currencyForMarket(m);
    const p = record.prices.find((row) => row.currency === cur);
    if (record.free || (p && p.marketActive && Number(p.amount) > 0)) {
      activeMarkets.push(m);
    }
  }

  const reviewCount = record.reviews.length;
  const rating =
    reviewCount > 0
      ? Math.round(
          (record.reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount) * 10
        ) / 10
      : undefined;

  const catName = (CATEGORIES as readonly string[]).includes(record.category.name)
    ? (record.category.name as Book["category"])
    : (staticFallback?.category ?? "Não-ficção");

  return {
    id: record.id,
    slug: record.slug,
    title: record.title,
    author: record.author,
    editora: record.editoraRef?.name ?? record.editora,
    category: catName,
    price: getPrice("MT", staticFallback?.price ?? 0),
    priceKZ: getPrice("KZ", staticFallback?.priceKZ ?? 0),
    priceEUR: getPrice("EUR", staticFallback?.priceEUR ?? 0),
    priceBRL: getPrice("BRL", staticFallback?.priceBRL ?? 0),
    featured: record.featured,
    bestseller: bestsellerSet.has(record.id) || staticFallback?.bestseller,
    isbn: record.isbn ?? undefined,
    isbnNormalized: record.isbnNormalized,
    description: record.description ?? undefined,
    rating,
    reviewCount: reviewCount > 0 ? reviewCount : undefined,
    pages: record.pages ?? undefined,
    year: record.year ?? undefined,
    free: record.free,
    downloadUrl: record.pdfUrl ?? undefined,
    coverUrl: record.coverUrl?.trim() || staticFallback?.coverUrl,
    educationLevel: (record.educationLevel as Book["educationLevel"]) ?? staticFallback?.educationLevel,
    schoolGrade: record.schoolGrade ?? staticFallback?.schoolGrade,
    subject: record.subject ?? staticFallback?.subject,
    academicYear: record.academicYear ?? staticFallback?.academicYear,
    countryOrigin: record.countryOrigin ?? staticFallback?.countryOrigin,
    allowPreorder: record.allowPreorder,
    allowQuote: record.allowQuote,
    active: record.active,
    stockByMarket,
    activeMarkets,
  };
}

export async function getAllCatalogBooks(options?: { includeInactive?: boolean }): Promise<Book[]> {
  if (!isDatabaseConfigured()) {
    return BOOKS;
  }

  try {
    const [records, paidRanking] = await Promise.all([
      prisma.book.findMany({
        where: options?.includeInactive ? undefined : { active: true },
        include: {
          category: { select: { name: true } },
          editoraRef: { select: { name: true } },
          prices: { select: { currency: true, amount: true, marketActive: true } },
          stockItems: {
            select: {
              quantity: true,
              reserved: true,
              warehouse: { select: { countryCode: true, active: true } },
            },
          },
          reviews: { select: { rating: true } },
        },
        orderBy: [{ featured: "desc" }, { title: "asc" }],
      }),
      prisma.orderItem
        .groupBy({
          by: ["bookId"],
          where: { order: { status: { in: ["PAID", "PROCESSING", "SHIPPED", "COMPLETED"] } } },
          _sum: { quantity: true },
          orderBy: { _sum: { quantity: "desc" } },
          take: 8,
        })
        .catch(() => []),
    ]);

    if (records.length === 0) return BOOKS;

    const bestsellerSet = new Set(paidRanking.map((r) => r.bookId));
    return records.map((r) => mapDbRecordToBook(r, bestsellerSet));
  } catch {
    return BOOKS;
  }
}

export async function getCatalogBookBySlug(slug: string): Promise<Book | undefined> {
  const all = await getAllCatalogBooks();
  const found = all.find((b) => b.slug === slug);
  if (found) return found;

  const staticBook = BOOKS.find((b) => b.slug === slug);
  if (!staticBook) return undefined;

  if (isDatabaseConfigured()) {
    try {
      const dbRow = await prisma.book.findUnique({
        where: { slug },
        select: { active: true },
      });
      if (dbRow && !dbRow.active) return undefined;
    } catch {
      // Se a BD estiver temporariamente indisponível, usa o catálogo estático
    }
  }

  return staticBook;
}

export function bookMatchesPublisherEntry(
  book: Pick<Book, "editora" | "author">,
  targetName: string,
  representationGroup?: RepresentationGroup | null,
): boolean {
  const needle = targetName.trim().toLowerCase();
  if (!needle) return true;
  if (book.editora.trim().toLowerCase() === needle) return true;
  if (representationGroup === "AUTOR" && book.author.toLowerCase().includes(needle)) {
    return true;
  }
  return false;
}

export async function getAllPublishers(): Promise<(Editora & { id?: string; bookCount?: number })[]> {
  if (!isDatabaseConfigured()) {
    return EDITORAS;
  }
  try {
    const rows = await prisma.editora.findMany({
      include: { _count: { select: { books: true } } },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });
    if (rows.length === 0) return EDITORAS;
    return rows.map((e) => ({
      id: e.id,
      slug: e.slug,
      name: e.name,
      representationGroup: e.representationGroup as RepresentationGroup,
      sortOrder: e.sortOrder,
      country: e.country ?? undefined,
      logo: e.logo ?? undefined,
      phone: e.phone ?? undefined,
      email: e.email ?? undefined,
      address: e.address ?? undefined,
      website: e.website ?? undefined,
      description: e.description ?? undefined,
      bookCount: e._count.books,
    }));
  } catch {
    return EDITORAS;
  }
}

export async function getActiveMarketConfigs() {
  const fallback = Object.values(MARKETS).map((m) => ({
    code: m.code,
    name: m.name,
    currency: m.currency,
    isoCurrency: m.isoCurrency,
    taxRatePercent: m.defaultTaxRatePercent,
    shippingFlatFee: m.defaultShippingFlatFee,
    freeShippingThreshold: m.defaultFreeShippingThreshold,
    estimatedDeliveryDays: m.estimatedDeliveryDays,
    bankTransferEnabled: true,
    bankAccountDetails: m.defaultBankDetails,
    localMethodName: m.localMethodName,
    localMethodEnabled: false,
    cardGatewayEnabled: Boolean(process.env.STRIPE_SECRET_KEY?.trim()),
    quoteEnabled: true,
    active: true,
  }));

  if (!isDatabaseConfigured()) return fallback;
  try {
    const rows = await prisma.marketConfig.findMany({ orderBy: { name: "asc" } });
    if (rows.length === 0) return fallback;
    return rows.map((r) => ({
      code: r.code,
      name: r.name,
      currency: r.currency,
      isoCurrency: r.isoCurrency,
      taxRatePercent: Number(r.taxRatePercent),
      shippingFlatFee: Number(r.shippingFlatFee),
      freeShippingThreshold:
        r.freeShippingThreshold != null ? Number(r.freeShippingThreshold) : null,
      estimatedDeliveryDays: r.estimatedDeliveryDays,
      bankTransferEnabled: r.bankTransferEnabled,
      bankAccountDetails: r.bankAccountDetails ?? "",
      localMethodName: r.localMethodName ?? "",
      localMethodEnabled:
        r.localMethodEnabled && Boolean(process.env.MPESA_API_KEY?.trim()),
      cardGatewayEnabled:
        r.cardGatewayEnabled && Boolean(process.env.STRIPE_SECRET_KEY?.trim()),
      quoteEnabled: r.quoteEnabled,
      active: r.active,
    }));
  } catch {
    return fallback;
  }
}

export interface SearchCatalogParams {
  query?: string;
  category?: string;
  editora?: string;
  country?: MarketCode | "ALL";
  includeOtherMarkets?: boolean;
  educationLevel?: string;
  schoolGrade?: string;
  subject?: string;
  academicYear?: number;
  availability?: "all" | "in_stock" | "quote";
  minPrice?: number;
  maxPrice?: number;
  currency?: Currency;
  sort?: "relevance" | "title_asc" | "price_asc" | "price_desc" | "newest" | "stock_desc";
  page?: number;
  pageSize?: number;
}

export function getBookPriceForMarket(book: Book, currency: Currency): number {
  switch (currency) {
    case "KZ":
      return book.priceKZ;
    case "MT":
      return book.price;
    case "EUR":
      return book.priceEUR;
    case "BRL":
      return book.priceBRL;
  }
}

export function getBookAvailableStock(book: Book, market?: MarketCode | "ALL"): number {
  if (!book.stockByMarket) return 20;
  if (!market || market === "ALL") {
    return (
      (book.stockByMarket.AO ?? 0) +
      (book.stockByMarket.MZ ?? 0) +
      (book.stockByMarket.PT ?? 0) +
      (book.stockByMarket.BR ?? 0)
    );
  }
  return book.stockByMarket[market] ?? 0;
}

export function filterAndSortBooks(
  books: Book[],
  params: SearchCatalogParams & { q?: string; market?: MarketCode | "ALL" },
) {
  const effectiveMarket: MarketCode | "ALL" =
    params.country ??
    params.market ??
    (params.currency ? marketForCurrency(params.currency) : "ALL");
  const effectiveCurrency: Currency =
    params.currency ??
    (effectiveMarket !== "ALL" ? currencyForMarket(effectiveMarket) : "KZ");

  const rawQuery = (params.query ?? params.q ?? "").trim();
  const normalizedIsbnQuery = looksLikeFullIsbnQuery(rawQuery)
    ? normalizeIsbnForLookup(rawQuery) || cleanIsbnInput(rawQuery)
    : null;
  const cleanedDigits = cleanIsbnInput(rawQuery);
  const lowerQuery = rawQuery.toLowerCase();

  let matched = books.filter((book) => {
    // 1. Filtro de mercado comercializável (salvo se o utilizador pedir explicitamente outros mercados)
    if (effectiveMarket !== "ALL" && !params.includeOtherMarkets) {
      if (book.activeMarkets && !book.activeMarkets.includes(effectiveMarket)) {
        return false;
      }
    }

    // 2. Categoria
    if (params.category && params.category !== "Todos") {
      if (book.category.toLowerCase() !== params.category.toLowerCase()) {
        return false;
      }
    }

    // 3. Editora / Autor representado
    if (params.editora && params.editora !== "Todas") {
      const staticMatch = EDITORAS.find(
        (ed) =>
          ed.slug === params.editora!.toLowerCase() ||
          ed.name.toLowerCase() === params.editora!.toLowerCase(),
      );
      const targetName = staticMatch?.name ?? params.editora;
      if (
        book.editora.toLowerCase() !== targetName.toLowerCase() &&
        !book.author.toLowerCase().includes(targetName.toLowerCase())
      ) {
        return false;
      }
    }

    // 4. Nível de ensino
    if (params.educationLevel && params.educationLevel !== "ALL") {
      if (book.educationLevel !== params.educationLevel) {
        return false;
      }
    }

    // 5. Classe
    if (params.schoolGrade && params.schoolGrade !== "ALL") {
      if ((book.schoolGrade ?? "").toLowerCase() !== params.schoolGrade.toLowerCase()) {
        return false;
      }
    }

    // 6. Disciplina
    if (params.subject && params.subject !== "ALL") {
      if (!(book.subject ?? "").toLowerCase().includes(params.subject.toLowerCase())) {
        return false;
      }
    }

    // 7. Ano letivo
    if (params.academicYear) {
      if (book.academicYear !== params.academicYear && book.year !== params.academicYear) {
        return false;
      }
    }

    // 8. Disponibilidade
    const stock = getBookAvailableStock(book, effectiveMarket);
    if (params.availability === "in_stock" && stock <= 0) return false;
    if (params.availability === "quote" && stock > 0) return false;

    // 9. Intervalo de preços na moeda comercial selecionada
    const unitPrice = getBookPriceForMarket(book, effectiveCurrency);
    if (typeof params.minPrice === "number" && !Number.isNaN(params.minPrice)) {
      if (unitPrice < params.minPrice) return false;
    }
    if (typeof params.maxPrice === "number" && !Number.isNaN(params.maxPrice)) {
      if (unitPrice > params.maxPrice) return false;
    }

    // 10. Pesquisa textual ou prioridade ISBN
    if (!rawQuery) return true;

    const bookIsbnNorm = book.isbnNormalized || cleanIsbnInput(book.isbn);
    if (normalizedIsbnQuery) {
      return bookIsbnNorm === normalizedIsbnQuery || cleanIsbnInput(book.isbn) === cleanedDigits;
    }

    if (cleanedDigits.length >= 4 && bookIsbnNorm.includes(cleanedDigits)) {
      return true;
    }

    return (
      book.title.toLowerCase().includes(lowerQuery) ||
      book.author.toLowerCase().includes(lowerQuery) ||
      book.editora.toLowerCase().includes(lowerQuery) ||
      book.category.toLowerCase().includes(lowerQuery) ||
      (book.subject ?? "").toLowerCase().includes(lowerQuery) ||
      (book.schoolGrade ?? "").toLowerCase().includes(lowerQuery) ||
      (book.countryOrigin ?? "").toLowerCase().includes(lowerQuery) ||
      (book.isbn ?? "").toLowerCase().includes(lowerQuery)
    );
  });

  // Se introduziu um ISBN completo que não teve match exato, devolve vazio claro sem falsos positivos
  const sortMode = params.sort ?? "relevance";
  matched = [...matched].sort((a, b) => {
    if (sortMode === "title_asc") return a.title.localeCompare(b.title, "pt");
    if (sortMode === "price_asc") {
      return getBookPriceForMarket(a, effectiveCurrency) - getBookPriceForMarket(b, effectiveCurrency);
    }
    if (sortMode === "price_desc") {
      return getBookPriceForMarket(b, effectiveCurrency) - getBookPriceForMarket(a, effectiveCurrency);
    }
    if (sortMode === "newest") {
      return (b.year ?? 0) - (a.year ?? 0);
    }
    if (sortMode === "stock_desc") {
      return getBookAvailableStock(b, effectiveMarket) - getBookAvailableStock(a, effectiveMarket);
    }

    // Relevância: match exato ISBN > match título no início > livros escolares/em destaque
    if (lowerQuery) {
      const aIsbn = (a.isbnNormalized || cleanIsbnInput(a.isbn)) === cleanedDigits ? 1 : 0;
      const bIsbn = (b.isbnNormalized || cleanIsbnInput(b.isbn)) === cleanedDigits ? 1 : 0;
      if (aIsbn !== bIsbn) return bIsbn - aIsbn;

      const aStarts = a.title.toLowerCase().startsWith(lowerQuery) ? 1 : 0;
      const bStarts = b.title.toLowerCase().startsWith(lowerQuery) ? 1 : 0;
      if (aStarts !== bStarts) return bStarts - aStarts;
    }
    const aFeat = (a.category === "Escolar" ? 2 : 0) + (a.featured ? 1 : 0);
    const bFeat = (b.category === "Escolar" ? 2 : 0) + (b.featured ? 1 : 0);
    if (aFeat !== bFeat) return bFeat - aFeat;
    return a.title.localeCompare(b.title, "pt");
  });

  return {
    items: matched,
    effectiveMarket,
    effectiveCurrency,
    isbnPriorityApplied: Boolean(normalizedIsbnQuery),
  };
}
