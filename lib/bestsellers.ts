import { prisma } from "@/lib/prisma";

/**
 * Corrige a secção "Mais Vendidos": a lista deixa de ser um campo
 * `bestseller: true` escolhido à mão em data/books.ts e passa a ser
 * calculada a partir das vendas reais (OrderItem em encomendas pagas),
 * com janelas de tempo (7 dias / 30 dias / ano / sempre) e a
 * possibilidade de filtrar por categoria — tal como o relatório pedia
 * ("Mais vendidos Educação" vs "Mais vendidos Literatura").
 */

export type BestsellerRange = "7d" | "30d" | "1y" | "all";

function rangeToDate(range: BestsellerRange): Date | undefined {
  const now = new Date();
  switch (range) {
    case "7d":
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case "30d":
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case "1y":
      return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    case "all":
      return undefined;
  }
}

export interface BestsellerEntry {
  bookId: string;
  slug: string;
  title: string;
  unitsSold: number;
}

export async function getBestsellers(options: {
  range?: BestsellerRange;
  categoryId?: string;
  limit?: number;
} = {}): Promise<BestsellerEntry[]> {
  const { range = "30d", categoryId, limit = 8 } = options;
  const since = rangeToDate(range);

  const grouped = await prisma.orderItem.groupBy({
    by: ["bookId"],
    where: {
      order: {
        status: "PAID",
        ...(since ? { createdAt: { gte: since } } : {}),
      },
      ...(categoryId ? { book: { categoryId } } : {}),
    },
    _sum: { quantity: true },
    orderBy: { _sum: { quantity: "desc" } },
    take: limit,
  });

  if (grouped.length === 0) return [];

  const books = await prisma.book.findMany({
    where: { id: { in: grouped.map((g) => g.bookId) } },
    select: { id: true, slug: true, title: true },
  });
  const bookById = new Map(books.map((b) => [b.id, b]));

  return grouped
    .filter((g) => bookById.has(g.bookId))
    .map((g) => ({
      bookId: g.bookId,
      slug: bookById.get(g.bookId)!.slug,
      title: bookById.get(g.bookId)!.title,
      unitsSold: g._sum.quantity ?? 0,
    }));
}
