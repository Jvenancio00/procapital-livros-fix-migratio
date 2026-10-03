import { prisma } from "@/lib/prisma";

/**
 * "Quem comprou este livro também comprou" — calculado a partir de
 * encomendas pagas reais (co-ocorrência no mesmo pedido), não uma lista
 * escolhida à mão. Isto é o upsell/cross-sell mais eficaz em livrarias
 * online reais (Amazon, Wook), porque reflete o comportamento genuíno
 * dos clientes em vez de uma suposição editorial.
 */
export interface CrossSellEntry {
  bookId: string;
  slug: string;
  title: string;
  coPurchases: number;
}

export async function getFrequentlyBoughtTogether(
  bookId: string,
  limit = 4
): Promise<CrossSellEntry[]> {
  // 1. Encontra as encomendas pagas que incluíram este livro
  const orderIds = await prisma.orderItem.findMany({
    where: { bookId, order: { status: "PAID" } },
    select: { orderId: true },
  });

  if (orderIds.length === 0) return [];

  // 2. Dentro dessas encomendas, conta que outros livros apareceram
  const coOccurrences = await prisma.orderItem.groupBy({
    by: ["bookId"],
    where: {
      orderId: { in: orderIds.map((o) => o.orderId) },
      bookId: { not: bookId },
    },
    _count: { bookId: true },
    orderBy: { _count: { bookId: "desc" } },
    take: limit,
  });

  if (coOccurrences.length === 0) return [];

  const books = await prisma.book.findMany({
    where: { id: { in: coOccurrences.map((c) => c.bookId) } },
    select: { id: true, slug: true, title: true },
  });
  const bookById = new Map(books.map((b) => [b.id, b]));

  return coOccurrences
    .filter((c) => bookById.has(c.bookId))
    .map((c) => ({
      bookId: c.bookId,
      slug: bookById.get(c.bookId)!.slug,
      title: bookById.get(c.bookId)!.title,
      coPurchases: c._count.bookId,
    }));
}
