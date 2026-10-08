import { BOOKS, CATEGORIES, type Book as StaticBook } from "@/data/books";
import type { BookWithPrices } from "@/lib/types";

/**
 * Converte um livro da base de dados no formato que os cartões do catálogo
 * usam, completando com o catálogo estático (`data/books.ts`) o que a base de
 * dados ainda não tiver.
 *
 * Porque é que isto existe: as páginas `/categoria/[slug]` e
 * `/editoras/[slug]` leem da base de dados, mas a base de dados guarda apenas
 * uma parte do catálogo — não guarda a capa normalizada, nem avaliações, e os
 * preços podem não estar semeados. Sem este cruzamento, a mesma coleção
 * aparecia com capas e preços diferentes conforme a página, e livros com capa
 * em `/public/covers` ficavam com o bloco de cor por a base de dados não ter
 * `coverUrl`. O catálogo estático continua a ser a fonte de verdade para a
 * apresentação; a base de dados, para os dados que são geridos por lá.
 */
export function toCatalogBook(
  book: BookWithPrices,
  categoryName?: string | null
): StaticBook {
  const fallback = BOOKS.find((candidate) => candidate.slug === book.slug);

  const price = (currency: "MT" | "KZ" | "EUR" | "BRL", staticPrice?: number) => {
    const fromDb = Number(
      book.prices.find((p) => p.currency === currency)?.amount ?? 0
    );
    return fromDb > 0 ? fromDb : (staticPrice ?? 0);
  };

  const category =
    categoryName && (CATEGORIES as readonly string[]).includes(categoryName)
      ? (categoryName as StaticBook["category"])
      : (fallback?.category ?? "Não-ficção");

  return {
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
    rating: fallback?.rating,
    reviewCount: fallback?.reviewCount,
    pages: book.pages ?? fallback?.pages,
    year: book.year ?? fallback?.year,
    free: book.free ?? fallback?.free,
    downloadUrl: book.pdfUrl ?? fallback?.downloadUrl,
  };
}
