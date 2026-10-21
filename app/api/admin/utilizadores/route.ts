import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { recordAuditLog, requireAdminApi } from "@/lib/admin-auth";
import { ClientType, Role } from "@/lib/enums";

export async function GET() {
  const guard = await requireAdminApi();
  if (guard.error) return guard.error;

  const users = await prisma.user.findMany({
    include: {
      clientProfile: true,
      _count: { select: { orders: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ users });
}

export async function PATCH(request: Request) {
  const guard = await requireAdminApi();
  if (guard.error) return guard.error;

  const body = await request.json().catch(() => null);
  const userId = String(body?.userId ?? "").trim();
  if (!userId) {
    return NextResponse.json({ error: "Utilizador não especificado." }, { status: 400 });
  }

  if (body?.role && (Object.values(Role) as string[]).includes(body.role)) {
    await prisma.user.update({
      where: { id: userId },
      data: { role: body.role as Role },
    });
  }

  const discountPercent = Math.min(
    60,
    Math.max(0, Math.floor(Number(body?.discountPercent) || 0))
  );
  const paymentTermsDays = Math.min(
    180,
    Math.max(0, Math.floor(Number(body?.paymentTermsDays) || 0))
  );
  const clientType = (Object.values(ClientType) as string[]).includes(body?.clientType)
    ? (body.clientType as ClientType)
    : undefined;

  const profile = await prisma.clientProfile.upsert({
    where: { userId },
    update: {
      ...(clientType ? { type: clientType } : {}),
      approvedB2B: Boolean(body?.approvedB2B),
      discountPercent,
      paymentTermsDays,
    },
    create: {
      userId,
      type: clientType ?? "PARTICULAR",
      approvedB2B: Boolean(body?.approvedB2B),
      discountPercent,
      paymentTermsDays,
    },
  });

  await recordAuditLog({
    action: "USER_PERMISSIONS_OR_B2B_UPDATED",
    entityType: "User",
    entityId: userId,
    actorId: guard.actor.id,
    actorEmail: guard.actor.email,
    details: {
      role: body?.role,
      approvedB2B: profile.approvedB2B,
      discountPercent: profile.discountPercent,
      paymentTermsDays: profile.paymentTermsDays,
    },
  });

  return NextResponse.json({ ok: true, profile });
}
