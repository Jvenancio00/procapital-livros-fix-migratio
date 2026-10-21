import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { MarketCode } from "@/lib/enums";
import { sendTransactionalEmail } from "@/lib/email";

export const RESERVATION_TTL_MINUTES = 30;

/**
 * Liberta automaticamente reservas de checkout expiradas e devolve o stock
 * disponível ao respetivo armazém, registando o movimento em StockMovement.
 */
export async function releaseExpiredReservations(): Promise<number> {
  const now = new Date();
  const expired = await prisma.stockReservation.findMany({
    where: {
      status: "ACTIVE",
      expiresAt: { lte: now },
    },
    include: { stockItem: true, order: true },
  });

  if (expired.length === 0) return 0;

  let releasedCount = 0;
  for (const res of expired) {
    await prisma.$transaction(async (tx) => {
      const current = await tx.stockReservation.findUnique({ where: { id: res.id } });
      if (!current || current.status !== "ACTIVE") return;

      const item = await tx.stockItem.findUnique({ where: { id: current.stockItemId } });
      if (item) {
        const nextReserved = Math.max(0, item.reserved - current.quantity);
        await tx.stockItem.update({
          where: { id: item.id },
          data: { reserved: nextReserved },
        });
        await tx.stockMovement.create({
          data: {
            stockItemId: item.id,
            type: "RESERVATION_RELEASE",
            delta: 0,
            previousQty: item.quantity,
            newQty: item.quantity,
            reason: `Reserva expirada automaticamente (encomenda ${res.order.orderNumber ?? res.orderId})`,
            orderId: res.orderId,
          },
        });
      }

      await tx.stockReservation.update({
        where: { id: current.id },
        data: { status: "EXPIRED", releasedAt: now },
      });

      if (res.order.status === "PENDING" && res.order.paymentStatus === "UNPAID") {
        await tx.order.update({
          where: { id: res.orderId },
          data: { status: "CANCELLED", notes: "Cancelada por expiração de reserva de stock." },
        });
      }
      releasedCount += 1;
    });
  }

  return releasedCount;
}

/**
 * Reserva stock de forma atómica em transação PostgreSQL para uma encomenda.
 * Impede condições de corrida (race conditions) nas últimas unidades através de
 * UPDATE condicional `WHERE ("quantity" - "reserved") >= $qty`.
 */
export async function reserveOrderStockInTx(
  tx: Prisma.TransactionClient,
  params: {
    orderId: string;
    orderNumber: string;
    countryCode: MarketCode;
    items: { bookId: string; title: string; quantity: number; allowPreorder: boolean }[];
    actorEmail?: string | null;
  }
): Promise<{ expiresAt: Date }> {
  const expiresAt = new Date(Date.now() + RESERVATION_TTL_MINUTES * 60 * 1000);

  for (const reqItem of params.items) {
    // Procura armazéns ativos do país selecionado primeiro; se insuficiente e
    // pré-encomenda não autorizada, recusa sem vender acima do disponível.
    const candidateStocks = await tx.stockItem.findMany({
      where: {
        bookId: reqItem.bookId,
        warehouse: { countryCode: params.countryCode, active: true },
      },
      include: { warehouse: true },
      orderBy: [{ warehouse: { isPrimary: "desc" } }, { quantity: "desc" }],
    });

    let remaining = reqItem.quantity;

    for (const stock of candidateStocks) {
      if (remaining <= 0) break;
      const available = Math.max(0, stock.quantity - stock.reserved);
      if (available <= 0) continue;

      const toReserve = Math.min(remaining, available);
      const updatedRows = await tx.$executeRaw`
        UPDATE "StockItem"
        SET "reserved" = "reserved" + ${toReserve}, "updatedAt" = NOW()
        WHERE "id" = ${stock.id} AND ("quantity" - "reserved") >= ${toReserve}
      `;

      if (updatedRows > 0) {
        await tx.stockReservation.create({
          data: {
            orderId: params.orderId,
            stockItemId: stock.id,
            quantity: toReserve,
            status: "ACTIVE",
            expiresAt,
          },
        });
        await tx.stockMovement.create({
          data: {
            stockItemId: stock.id,
            type: "CHECKOUT_RESERVE",
            delta: 0,
            previousQty: stock.quantity,
            newQty: stock.quantity,
            reason: `Reserva de checkout (${toReserve} un.) para encomenda ${params.orderNumber}`,
            actorEmail: params.actorEmail ?? null,
            orderId: params.orderId,
          },
        });
        remaining -= toReserve;
      }
    }

    if (remaining > 0 && !reqItem.allowPreorder) {
      throw new Error(
        `Stock insuficiente no mercado ${params.countryCode} para "${reqItem.title}" (faltam ${remaining} unidade(s)). Solicite uma cotação comercial.`
      );
    }
  }

  return { expiresAt };
}

/**
 * Confirma definitivamente a saída de stock apenas quando o pagamento é confirmado.
 */
export async function commitOrderStockOnPaymentInTx(
  tx: Prisma.TransactionClient,
  orderId: string,
  actorEmail?: string | null
): Promise<
  {
    bookTitle: string;
    isbn: string | null;
    warehouseCode: string;
    warehouseName: string;
    available: number;
    threshold: number;
  }[]
> {
  const reservations = await tx.stockReservation.findMany({
    where: { orderId, status: "ACTIVE" },
    include: { stockItem: { include: { book: true, warehouse: true } } },
  });

  const lowStockAlerts: {
    bookTitle: string;
    isbn: string | null;
    warehouseCode: string;
    warehouseName: string;
    available: number;
    threshold: number;
  }[] = [];

  for (const res of reservations) {
    const item = await tx.stockItem.findUnique({ where: { id: res.stockItemId } });
    if (!item) continue;

    const newQty = Math.max(0, item.quantity - res.quantity);
    const newReserved = Math.max(0, item.reserved - res.quantity);

    await tx.stockItem.update({
      where: { id: item.id },
      data: { quantity: newQty, reserved: newReserved },
    });

    await tx.stockReservation.update({
      where: { id: res.id },
      data: { status: "COMMITTED" },
    });

    await tx.stockMovement.create({
      data: {
        stockItemId: item.id,
        type: "SALE_CONFIRMED",
        delta: -res.quantity,
        previousQty: item.quantity,
        newQty,
        reason: `Venda confirmada (encomenda ${orderId})`,
        actorEmail: actorEmail ?? null,
        orderId,
      },
    });

    const availableAfter = Math.max(0, newQty - newReserved);
    if (availableAfter <= item.lowStockThreshold) {
      lowStockAlerts.push({
        bookTitle: res.stockItem.book.title,
        isbn: res.stockItem.book.isbn,
        warehouseCode: res.stockItem.warehouse.code,
        warehouseName: res.stockItem.warehouse.name,
        available: availableAfter,
        threshold: item.lowStockThreshold,
      });
    }
  }

  return lowStockAlerts;
}

/**
 * Liberta reservas ou repõe stock em caso de cancelamento ou reembolso.
 */
export async function releaseOrRefundOrderStockInTx(
  tx: Prisma.TransactionClient,
  orderId: string,
  mode: "CANCEL" | "REFUND",
  actorEmail?: string | null
) {
  const reservations = await tx.stockReservation.findMany({
    where: { orderId },
  });

  for (const res of reservations) {
    const item = await tx.stockItem.findUnique({ where: { id: res.stockItemId } });
    if (!item) continue;

    if (res.status === "ACTIVE") {
      await tx.stockItem.update({
        where: { id: item.id },
        data: { reserved: Math.max(0, item.reserved - res.quantity) },
      });
      await tx.stockReservation.update({
        where: { id: res.id },
        data: { status: "RELEASED", releasedAt: new Date() },
      });
      await tx.stockMovement.create({
        data: {
          stockItemId: item.id,
          type: "RESERVATION_RELEASE",
          delta: 0,
          previousQty: item.quantity,
          newQty: item.quantity,
          reason: `Libertação de reserva por cancelamento (${orderId})`,
          actorEmail: actorEmail ?? null,
          orderId,
        },
      });
    } else if (res.status === "COMMITTED" && mode === "REFUND") {
      const nextQty = item.quantity + res.quantity;
      await tx.stockItem.update({
        where: { id: item.id },
        data: { quantity: nextQty },
      });
      await tx.stockReservation.update({
        where: { id: res.id },
        data: { status: "RELEASED", releasedAt: new Date() },
      });
      await tx.stockMovement.create({
        data: {
          stockItemId: item.id,
          type: "ORDER_REFUND",
          delta: res.quantity,
          previousQty: item.quantity,
          newQty: nextQty,
          reason: `Reposição de stock por reembolso (${orderId})`,
          actorEmail: actorEmail ?? null,
          orderId,
        },
      });
    }
  }
}

export async function dispatchLowStockAlerts(
  alerts: {
    bookTitle: string;
    isbn: string | null;
    warehouseCode: string;
    warehouseName: string;
    available: number;
    threshold: number;
  }[]
) {
  const adminEmail = process.env.ADMIN_ALERT_EMAIL?.trim() || "comercial@procapitalmz.com";
  for (const a of alerts) {
    await sendTransactionalEmail({
      template: "LOW_STOCK_ALERT",
      to: adminEmail,
      data: {
        bookTitle: a.bookTitle,
        isbn: a.isbn ?? undefined,
        warehouseCode: a.warehouseCode,
        warehouseName: a.warehouseName,
        available: a.available,
        threshold: a.threshold,
      },
    }).catch(() => {});
  }
}
