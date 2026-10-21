import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { recordAuditLog, requireAdminApi } from "@/lib/admin-auth";
import { QuoteStatus } from "@/lib/enums";

export async function GET() {
  const guard = await requireAdminApi();
  if (guard.error) return guard.error;

  const quotes = await prisma.quoteRequest.findMany({
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ quotes });
}

export async function PATCH(request: Request) {
  const guard = await requireAdminApi();
  if (guard.error) return guard.error;

  const body = await request.json().catch(() => null);
  const id = String(body?.id ?? "").trim();
  const status = body?.status as QuoteStatus | undefined;

  if (!id || !status || !(Object.values(QuoteStatus) as string[]).includes(status)) {
    return NextResponse.json({ error: "Dados de cotação inválidos." }, { status: 400 });
  }

  const updated = await prisma.quoteRequest.update({
    where: { id },
    data: {
      status,
      ...(body.quotedTotal !== undefined
        ? { quotedTotal: body.quotedTotal === "" ? null : Number(body.quotedTotal) }
        : {}),
      ...(body.adminNotes !== undefined
        ? { adminNotes: String(body.adminNotes).trim() || null }
        : {}),
      ...(body.validUntil
        ? { validUntil: new Date(String(body.validUntil)) }
        : {}),
    },
  });

  await recordAuditLog({
    action: "QUOTE_UPDATED",
    entityType: "QuoteRequest",
    entityId: id,
    actorId: guard.actor.id,
    actorEmail: guard.actor.email,
    details: {
      quoteNumber: updated.quoteNumber,
      status: updated.status,
      quotedTotal: updated.quotedTotal ? Number(updated.quotedTotal) : null,
    },
  });

  return NextResponse.json({ ok: true, quote: updated });
}
