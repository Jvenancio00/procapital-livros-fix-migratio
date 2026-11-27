import type { Book } from "@/data/books";

/** Temporary catalogue-only phase. Change only after commercial validation. */
export const DEMO_MODE = true;

/** Do not send unverified amounts to public catalogue clients. */
export function publicCatalogBook(book: Book): Book {
  return DEMO_MODE ? { ...book, price: 0, priceKZ: 0, priceEUR: 0, priceBRL: 0 } : book;
}
