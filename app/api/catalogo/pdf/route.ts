import { NextResponse } from "next/server";
import { filterAndSortBooks, getAllCatalogBooks } from "@/lib/catalog";
import { generateCatalogPdfBuffer } from "@/lib/pdf-catalog";
import { getAuthenticatedActor } from "@/lib/admin-auth";
import type { Currency, MarketCode } from "@/lib/enums";
import { currencyForMarket } from "@/lib/markets";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const market = (searchParams.get("pais") ?? "MZ") as MarketCode | "ALL";
  const currency =
    (searchParams.get("moeda") as Currency | null) ??
    (market !== "ALL" ? currencyForMarket(market) : "MT");
  const publisherFilter = searchParams.get("editora") ?? undefined;
  const categoryFilter = searchParams.get("categoria") ?? undefined;
  const educationLevelFilter =
    searchParams.get("nivelEnsino") ?? searchParams.get("nivel") ?? undefined;
  const rawAvail = (searchParams.get("disponibilidade") ?? "all").toUpperCase();
  const availability: "all" | "in_stock" | "quote" =
    rawAvail === "DISPONIVEL" || rawAvail === "IN_STOCK"
      ? "in_stock"
      : rawAvail === "COTACAO" || rawAvail === "QUOTE"
      ? "quote"
      : "all";
  const textQuery = searchParams.get("q") ?? undefined;
  const minPrice = searchParams.get("precoMin")
    ? Number(searchParams.get("precoMin"))
    : undefined;
  const maxPrice = searchParams.get("precoMax")
    ? Number(searchParams.get("precoMax"))
    : undefined;

  const actor = await getAuthenticatedActor();
  const includeFullStockNumbers =
    searchParams.get("includeStock") === "1" && actor?.role === "ADMIN";

  const allBooks = await getAllCatalogBooks();
  const { items } = filterAndSortBooks(allBooks, {
    query: textQuery,
    country: market,
    includeOtherMarkets: market === "ALL",
    editora: publisherFilter,
    category: categoryFilter,
    educationLevel: educationLevelFilter,
    availability,
    minPrice,
    maxPrice,
    currency,
    sort: "title_asc",
  });

  const pdfBuffer = generateCatalogPdfBuffer({
    books: items,
    market,
    currency,
    publisherFilter,
    categoryFilter,
    educationLevelFilter,
    availabilityFilter: availability,
    minPrice,
    maxPrice,
    includeFullStockNumbers,
    generatedBy: actor?.email,
  });

  const slugPart = (publisherFilter || market)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-");
  const filename = `catalogo-procapital-${slugPart}-${new Date().toISOString().slice(0, 10)}.pdf`;

  return new NextResponse(new Uint8Array(pdfBuffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
