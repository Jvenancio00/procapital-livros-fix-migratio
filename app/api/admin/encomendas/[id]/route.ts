import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { recordAuditLog, requireAdminApi } from "@/lib/admin-auth";
import { OrderStatus } from "@/lib/enums";
import { ORDER_STATUS_LABELS } from "@/lib/markets";
import {
  commitOrderStockOnPaymentInTx,
  dispatchLowStockAlerts,
  releaseOrRefundOrderStockInTx,
} from "@/lib/stock";
import { sendTransactionalEmail } from "@/lib/email";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdminApi();
  if (guard.error) return guard.error;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const nextStatus = body?.status as OrderStatus | undefined;
  const adminNotes = body?.notes ? String(body.notes).trim() : undefined;

  if (!nextStatus || !(Object.values(OrderStatus) as string[]).includes(nextStatus)) {
    return NextResponse.json({ error: "Estado de encomenda inválido." }, { status: 400 });
  }

  const existing = await prisma.order.findUnique({
    where: { id },
    include: { user: true, items: true, payments: { orderBy: { createdAt: "desc" } } },
  });
  if (!existing) {
    return NextResponse.json({ error: "Encomenda não encontrada." }, { status: 404 });
  }

  let lowStockAlerts: Awaited<ReturnType<typeof commitOrderStockOnPaymentInTx>> = [];

  const updated = await prisma.$transaction(async (tx) => {
    let nextPaymentStatus = existing.paymentStatus;

    if (nextStatus === "PAID") {
      lowStockAlerts = await commitOrderStockOnPaymentInTx(
        tx,
        existing.id,
        guard.actor.email
      );
      nextPaymentStatus = "CONFIRMED";

      if (existing.payments[0]) {
        await tx.paymentRecord.update({
          where: { id: existing.payments[0].id },
          data: {
            status: "CONFIRMED",
            reviewedByEmail: guard.actor.email,
            reviewedAt: new Date(),
            confirmedAt: new Date(),
          },
        });
      }

      for (const item of existing.items) {
        await tx.libraryItem.upsert({
          where: { userId_bookId: { userId: existing.userId, bookId: item.bookId } },
          update: {},
          create: { userId: existing.userId, bookId: item.bookId, source: "purchase" },
        });
      }
    } else if (nextStatus === "CANCELLED" || nextStatus === "REFUNDED") {
      await releaseOrRefundOrderStockInTx(
        tx,
        existing.id,
        nextStatus === "REFUNDED" ? "REFUND" : "CANCEL",
        guard.actor.email
      );
      if (nextStatus === "REFUNDED") nextPaymentStatus = "REFUNDED";
    }

    return tx.order.update({
      where: { id },
      data: {
        status: nextStatus,
        paymentStatus: nextPaymentStatus,
        ...(adminNotes !== undefined ? { notes: adminNotes } : {}),
      },
    });
  });

  if (lowStockAlerts.length > 0) {
    await dispatchLowStockAlerts(lowStockAlerts);
  }

  const recipientEmail = existing.buyerEmail || existing.user.email;
  if (nextStatus === "SHIPPED") {
    await sendTransactionalEmail({
      template: "SHIPMENT_CONFIRMATION",
      to: recipientEmail,
      data: {
        orderId: existing.id,
        orderNumber: existing.orderNumber ?? existing.id,
        shippingAddress: existing.shippingAddress ?? existing.shippingCity ?? "Morada indicada",
      },
    });
  } else {
    await sendTransactionalEmail({
      template: "ORDER_STATUS_UPDATE",
      to: recipientEmail,
      data: {
        orderId: existing.id,
        orderNumber: existing.orderNumber ?? existing.id,
        statusLabel: ORDER_STATUS_LABELS[nextStatus] ?? nextStatus,
      },
    });
  }

  await recordAuditLog({
    action: "ORDER_STATUS_UPDATED",
    entityType: "Order",
    entityId: id,
    actorId: guard.actor.id,
    actorEmail: guard.actor.email,
    details: { previousStatus: existing.status, newStatus: nextStatus },
  });

  return NextResponse.json(updated);
}
