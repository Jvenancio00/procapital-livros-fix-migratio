import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPaymentWebhookSignature } from "@/lib/payments";
import {
  commitOrderStockOnPaymentInTx,
  dispatchLowStockAlerts,
  releaseOrRefundOrderStockInTx,
} from "@/lib/stock";
import { sendTransactionalEmail } from "@/lib/email";

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature =
    request.headers.get("x-webhook-signature") ??
    request.headers.get("stripe-signature");

  const signatureOk = verifyPaymentWebhookSignature(rawBody, signature);
  if (!signatureOk) {
    return NextResponse.json(
      { error: "Assinatura criptográfica do webhook inválida ou em falta." },
      { status: 401 }
    );
  }

  let payload: {
    eventId?: string;
    eventType?: string;
    provider?: string;
    orderId?: string;
    externalReference?: string;
  };
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Payload JSON inválido." }, { status: 400 });
  }

  const eventId = String(payload.eventId ?? "").trim();
  const eventType = String(payload.eventType ?? "").trim();
  const orderId = String(payload.orderId ?? "").trim();

  if (!eventId || !eventType || !orderId) {
    return NextResponse.json({ error: "Campos obrigatórios em falta." }, { status: 400 });
  }

  // Proteção idempotente contra eventos duplicados
  const alreadyProcessed = await prisma.paymentWebhookEvent.findUnique({
    where: { eventId },
  });
  if (alreadyProcessed) {
    return NextResponse.json({ ok: true, deduplicated: true });
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { user: true, items: true, payments: { orderBy: { createdAt: "desc" } } },
  });
  if (!order) {
    return NextResponse.json({ error: "Encomenda não encontrada." }, { status: 404 });
  }

  let lowStockAlerts: Awaited<ReturnType<typeof commitOrderStockOnPaymentInTx>> = [];

  await prisma.$transaction(async (tx) => {
    await tx.paymentWebhookEvent.create({
      data: {
        provider: payload.provider ?? "gateway",
        eventId,
        eventType,
        orderId,
        signatureOk: true,
        payloadJson: payload as object,
      },
    });

    if (eventType === "payment.succeeded") {
      lowStockAlerts = await commitOrderStockOnPaymentInTx(
        tx,
        order.id,
        `webhook:${payload.provider ?? "gateway"}`
      );

      await tx.order.update({
        where: { id: order.id },
        data: {
          status: "PAID",
          paymentStatus: "CONFIRMED",
          paymentReference: payload.externalReference ?? eventId,
        },
      });

      if (order.payments[0]) {
        await tx.paymentRecord.update({
          where: { id: order.payments[0].id },
          data: {
            status: "CONFIRMED",
            externalReference: payload.externalReference ?? eventId,
            confirmedAt: new Date(),
          },
        });
      }

      for (const item of order.items) {
        await tx.libraryItem.upsert({
          where: { userId_bookId: { userId: order.userId, bookId: item.bookId } },
          update: {},
          create: { userId: order.userId, bookId: item.bookId, source: "purchase" },
        });
      }
    } else if (eventType === "payment.refunded" || eventType === "payment.failed") {
      const nextStatus = eventType === "payment.refunded" ? "REFUNDED" : "CANCELLED";
      const nextPay = eventType === "payment.refunded" ? "REFUNDED" : "FAILED";
      await releaseOrRefundOrderStockInTx(
        tx,
        order.id,
        eventType === "payment.refunded" ? "REFUND" : "CANCEL",
        `webhook:${payload.provider ?? "gateway"}`
      );
      await tx.order.update({
        where: { id: order.id },
        data: { status: nextStatus, paymentStatus: nextPay },
      });
    }
  });

  if (lowStockAlerts.length > 0) {
    await dispatchLowStockAlerts(lowStockAlerts);
  }

  await sendTransactionalEmail({
    template: "PAYMENT_STATUS",
    to: order.user.email,
    data: {
      orderId: order.id,
      orderNumber: order.orderNumber ?? order.id,
      paymentStatusLabel:
        eventType === "payment.succeeded" ? "Pagamento confirmado" : eventType,
    },
  });

  return NextResponse.json({ ok: true, deduplicated: false });
}
