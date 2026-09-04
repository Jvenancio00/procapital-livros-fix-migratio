import { prisma } from "@/lib/prisma";
import { getBestsellers } from "@/lib/bestsellers";

/**
 * Corrige a secção "Destaques": em vez de uma lista escolhida apenas por
 * quem edita o código, os destaques resultam da combinação de duas
 * regras automáticas com uma opção manual:
 *  1. Lançamento novo -> fica em destaque durante 15 dias após a criação.
 *  2. Mais de SALES_THRESHOLD unidades vendidas nos últimos 30 dias ->
 *     entra automaticamente nos destaques.
 *  3. Override manual: featured=true com featuredFrom/featuredTo define
 *     uma janela de destaque comercial (ex.: uma editora "paga" para
 *     aparecer nesse período) — resolve também o "Problema comercial"
 *     apontado no relatório, ainda que a parte de cobrança em si (gateway
 *     de pagamento) não esteja implementada aqui.
 */

const NEW_RELEASE_DAYS = 15;
const SALES_THRESHOLD = 100;

export async function getFeaturedBooks(limit = 8) {
  const now = new Date();
  const fifteenDaysAgo = new Date(now.getTime() - NEW_RELEASE_DAYS * 24 * 60 * 60 * 1000);

  const [manualOverrides, newReleases, bestsellers] = await Promise.all([
    prisma.book.findMany({
      where: {
        featured: true,
        OR: [
          { featuredFrom: null, featuredTo: null },
          { featuredFrom: { lte: now }, featuredTo: { gte: now } },
        ],
      },
      take: limit,
    }),
    prisma.book.findMany({
      where: { createdAt: { gte: fifteenDaysAgo } },
      take: limit,
    }),
    getBestsellers({ range: "30d", limit }),
  ]);

  const bestsellerIds = new Set(bestsellers.filter((b) => b.unitsSold > SALES_THRESHOLD).map((b) => b.bookId));

  const byId = new Map<string, (typeof manualOverrides)[number]>();
  for (const book of [...manualOverrides, ...newReleases]) {
    byId.set(book.id, book);
  }

  const highSalesBooks = await prisma.book.findMany({
    where: { id: { in: [...bestsellerIds] } },
  });
  for (const book of highSalesBooks) {
    byId.set(book.id, book);
  }

  return [...byId.values()].slice(0, limit);
}
