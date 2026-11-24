import type { Book } from "@/data/books";
import type { MarketCode } from "@/lib/enums";

/** Missing inventory is unknown, never an invented positive quantity. */
export function knownMarketStock(book: Pick<Book, "stockByMarket">, market: MarketCode): number | null {
  const quantity = book.stockByMarket?.[market];
  return typeof quantity === "number" && Number.isFinite(quantity) ? Math.max(0, quantity) : null;
}
