import { BOOKS, type Book } from "@/data/books";

/**
 * Corrige "Problema 2 – Não existe lógica comercial" da secção Carrinho:
 * desconto por quantidade (o mesmo livro em maior volume) — um ponto de
 * partida simples para a lógica de negócio que faltava, sem ainda cobrir
 * preços por cliente (isso já existe parcialmente em ClientProfile.discountPercent,
 * usado na Área de Cliente) nem campanhas por editora.
 */
export function quantityDiscountRate(quantity: number): number {
  if (quantity >= 10) return 0.1;
  if (quantity >= 5) return 0.05;
  return 0;
}

export interface CartLike {
  book: Book;
  quantity: number;
}

export function crossSellSuggestions(items: CartLike[], limit = 4): Book[] {
  const inCartSlugs = new Set(items.map((i) => i.book.slug));
  const categories = new Set(items.map((i) => i.book.category));
  const authors = new Set(items.map((i) => i.book.author));

  return BOOKS.filter((book) => !inCartSlugs.has(book.slug))
    .filter((book) => categories.has(book.category) || authors.has(book.author))
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
    .slice(0, limit);
}
