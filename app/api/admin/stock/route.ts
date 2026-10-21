import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { recordAuditLog, requireAdminApi } from "@/lib/admin-auth";
import { dispatchLowStockAlerts, releaseExpiredReservations } from "@/lib/stock";

export async function GET() {
  const guard = await requireAdminApi();
  if (guard.error) return guard.error;

  await releaseExpiredReservations().catch(() => {});

  const [warehouses, stockItems, recentMovements] = await Promise.all([
    prisma.warehouse.findMany({ orderBy: { code: "asc" } }),
    prisma.stockItem.findMany({
      include: {
        book: { select: { id: true, slug: true, title: true, isbn: true, editora: true } },
        warehouse: { select: { id: true, code: true, name: true, countryCode: true } },
      },
      orderBy: [{ warehouse: { code: "asc" } }, { book: { title: "asc" } }],
    }),
    prisma.stockMovement.findMany({
      include: {
        stockItem: {
          include: {
            book: { select: { title: true, isbn: true } },
            warehouse: { select: { code: true, countryCode: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 60,
    }),
  ]);

  const lowStockItems = stockItems.filter(
    (s) => Math.max(0, s.quantity - s.reserved) <= s.lowStockThreshold
  );

  return NextResponse.json({
    warehouses,
    stockItems,
    lowStockCount: lowStockItems.length,
    lowStockItems,
    recentMovements,
  });
}

export async function POST(request: Request) {
  const guard = await requireAdminApi();
  if (guard.error) return guard.error;

  const body = await request.json().catch(() => null);
  const stockItemId = String(body?.stockItemId ?? "").trim();
  const delta = Number(body?.delta);
  const reason = String(body?.reason ?? "").trim();
  const lowStockThreshold =
    body?.lowStockThreshold !== undefined ? Number(body.lowStockThreshold) : undefined;

  if (!stockItemId || !Number.isInteger(delta) || !reason) {
    return NextResponse.json(
      { error: "Item de stock, ajuste inteiro (+/-) e motivo são obrigatórios." },
      { status: 400 }
    );
  }

  let alertPayload: {
    bookTitle: string;
    isbn: string | null;
    warehouseCode: string;
    warehouseName: string;
    available: number;
    threshold: number;
  } | null = null;

  const updated = await prisma.$transaction(async (tx) => {
    const item = await tx.stockItem.findUnique({
      where: { id: stockItemId },
      include: { book: true, warehouse: true },
    });
    if (!item) {
      throw new Error("Registo de stock não encontrado.");
    }

    const nextQty = item.quantity + delta;
    if (nextQty < item.reserved) {
      throw new Error(
        `A nova quantidade (${nextQty}) não pode ser inferior ao stock reservado em checkout (${item.reserved}).`
      );
    }

    const nextThreshold =
      lowStockThreshold !== undefined && Number.isInteger(lowStockThreshold) && lowStockThreshold >= 0
        ? lowStockThreshold
        : item.lowStockThreshold;

    const saved = await tx.stockItem.update({
      where: { id: item.id },
      data: {
        quantity: nextQty,
        lowStockThreshold: nextThreshold,
      },
    });

    await tx.stockMovement.create({
      data: {
        stockItemId: item.id,
        type: "MANUAL_ADJUSTMENT",
        delta,
        previousQty: item.quantity,
        newQty: nextQty,
        reason,
        actorId: guard.actor.id,
        actorEmail: guard.actor.email,
      },
    });

    const avail = Math.max(0, nextQty - saved.reserved);
    if (avail <= nextThreshold) {
      alertPayload = {
        bookTitle: item.book.title,
        isbn: item.book.isbn,
        warehouseCode: item.warehouse.code,
        warehouseName: item.warehouse.name,
        available: avail,
        threshold: nextThreshold,
      };
    }

    return saved;
  });

  if (alertPayload) {
    await dispatchLowStockAlerts([alertPayload]);
  }

  await recordAuditLog({
    action: "STOCK_MANUAL_ADJUSTMENT",
    entityType: "StockItem",
    entityId: updated.id,
    actorId: guard.actor.id,
    actorEmail: guard.actor.email,
    details: { delta, newQuantity: updated.quantity, reason },
  });

  return NextResponse.json({ ok: true, stockItem: updated });
}
