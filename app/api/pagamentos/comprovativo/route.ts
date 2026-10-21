import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendTransactionalEmail } from "@/lib/email";

export async function POST(request: Request) {
  const session = await auth();
  const email = session?.user?.email?.trim().toLowerCase();
  if (!email) {
    return NextResponse.json({ error: "Autenticação obrigatória." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const orderId = String(body?.orderId ?? "").trim();
  const transferProofRef = String(body?.transferProofRef ?? "").trim();
  const notes = body?.notes ? String(body.notes).trim() : null;

  if (!orderId || !transferProofRef) {
    return NextResponse.json(
      { error: "Indique o número de operação / comprovativo da transferência." },
      { status: 400 }
    );
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { user: true, payments: { orderBy: { createdAt: "desc" } } },
  });

  if (!order || order.user.email.toLowerCase() !== email) {
    return NextResponse.json({ error: "Encomenda não encontrada." }, { status: 404 });
  }

  // Importante: registar o comprovativo coloca o pagamento em "UNDER_REVIEW",
  // NUNCA como "PAID" até validação administrativa ou confirmação verificada!
  await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: "UNDER_REVIEW",
        paymentReference: transferProofRef,
        // Estende a reserva para 48h enquanto aguarda validação administrativa
        reservationExpiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
      },
    });

    await tx.stockReservation.updateMany({
      where: { orderId: order.id, status: "ACTIVE" },
      data: { expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000) },
    });

    if (order.payments[0]) {
      await tx.paymentRecord.update({
        where: { id: order.payments[0].id },
        data: {
          status: "UNDER_REVIEW",
          transferProofRef,
          notes,
        },
      });
    } else {
      await tx.paymentRecord.create({
        data: {
          orderId: order.id,
          provider: "bank_transfer",
          method: order.paymentMethod ?? "Transferência Bancária",
          amount: order.totalAmount,
          currency: order.currency,
          status: "UNDER_REVIEW",
          transferProofRef,
          notes,
        },
      });
    }
  });

  await sendTransactionalEmail({
    template: "PAYMENT_STATUS",
    to: order.user.email,
    data: {
      orderId: order.id,
      orderNumber: order.orderNumber ?? order.id,
      paymentStatusLabel: `Comprovativo recebido (${transferProofRef}) — Em validação administrativa`,
      notes: notes ?? undefined,
    },
  });

  return NextResponse.json({
    ok: true,
    paymentStatus: "UNDER_REVIEW",
  });
}
