import { BOOKS, CATEGORIES, type Book as StaticBook } from "@/data/books";
import type { BookWithPrices } from "@/lib/types";

export function toCatalogBook(
  book: BookWithPrices,
  categoryName?: string | null,
): StaticBook {
  const fallback = BOOKS.find((candidate) => candidate.slug === book.slug);

  const price = (currency: "MT" | "KZ" | "EUR" | "BRL", staticPrice?: number) => {
    const fromDb = Number(
      book.prices.find((p) => p.currency === currency)?.amount ?? 0,
    );
    return fromDb > 0 ? fromDb : (staticPrice ?? 0);
  };

  const category =
    categoryName && (CATEGORIES as readonly string[]).includes(categoryName)
      ? (categoryName as StaticBook["category"])
      : (fallback?.category ?? "Não-ficção");

  return {
    id: book.id,
    slug: book.slug,
    title: book.title,
    author: book.author ?? fallback?.author ?? "",
    editora: book.editoraRef?.name ?? book.editora ?? fallback?.editora ?? "",
    category,
    price: price("MT", fallback?.price),
    priceKZ: price("KZ", fallback?.priceKZ),
    priceEUR: price("EUR", fallback?.priceEUR),
    priceBRL: price("BRL", fallback?.priceBRL),
    featured: book.featured ?? fallback?.featured,
    isbn: book.isbn ?? fallback?.isbn,
    coverUrl: book.coverUrl?.trim() || fallback?.coverUrl,
    description: book.description ?? fallback?.description,
    pages: book.pages ?? fallback?.pages,
    year: book.year ?? fallback?.year,
    free: book.free ?? fallback?.free,
    downloadUrl: book.pdfUrl ?? fallback?.downloadUrl,
    educationLevel: fallback?.educationLevel,
    schoolGrade: fallback?.schoolGrade,
    subject: fallback?.subject,
    academicYear: fallback?.academicYear,
    countryOrigin: fallback?.countryOrigin,
  };
}

export const bookWithPricesToView = toCatalogBook;
