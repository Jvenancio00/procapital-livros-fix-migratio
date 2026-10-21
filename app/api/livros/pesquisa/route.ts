import { NextResponse } from "next/server";
import {
  filterAndSortBooks,
  getAllCatalogBooks,
  getBookAvailableStock,
  getBookPriceForMarket,
} from "@/lib/catalog";
import type { Currency, MarketCode } from "@/lib/enums";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const query = searchParams.get("q") ?? searchParams.get("busca") ?? "";
  const category = searchParams.get("categoria") ?? undefined;
  const editora = searchParams.get("editora") ?? undefined;
  const country = (searchParams.get("pais") ?? "ALL") as MarketCode | "ALL";
  const includeOtherMarkets = searchParams.get("outrosMercados") === "1";
  const educationLevel = searchParams.get("nivel") ?? undefined;
  const schoolGrade = searchParams.get("classe") ?? undefined;
  const subject = searchParams.get("disciplina") ?? undefined;
  const academicYear = searchParams.get("ano")
    ? Number(searchParams.get("ano"))
    : undefined;
  const availability = (searchParams.get("disponibilidade") ?? "all") as
    | "all"
    | "in_stock"
    | "quote";
  const minPrice = searchParams.get("precoMin")
    ? Number(searchParams.get("precoMin"))
    : undefined;
  const maxPrice = searchParams.get("precoMax")
    ? Number(searchParams.get("precoMax"))
    : undefined;
  const currency = (searchParams.get("moeda") ?? undefined) as Currency | undefined;
  const sort = (searchParams.get("ordem") ?? "relevance") as
    | "relevance"
    | "title_asc"
    | "price_asc"
    | "price_desc"
    | "newest"
    | "stock_desc";

  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const pageSize = Math.min(48, Math.max(1, Number(searchParams.get("pageSize") ?? 12)));

  const allBooks = await getAllCatalogBooks();
  const { items, effectiveMarket, effectiveCurrency, isbnPriorityApplied } =
    filterAndSortBooks(allBooks, {
      query,
      category,
      editora,
      country,
      includeOtherMarkets,
      educationLevel,
      schoolGrade,
      subject,
      academicYear,
      availability,
      minPrice,
      maxPrice,
      currency,
      sort,
    });

  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;

  const paginated = items.slice(start, start + pageSize).map((book) => ({
    ...book,
    displayPrice: getBookPriceForMarket(book, effectiveCurrency),
    displayCurrency: effectiveCurrency,
    availableStock: getBookAvailableStock(book, effectiveMarket),
  }));

  return NextResponse.json({
    total,
    page: safePage,
    pageSize,
    totalPages,
    market: effectiveMarket,
    currency: effectiveCurrency,
    isbnPriorityApplied,
    items: paginated,
  });
}
