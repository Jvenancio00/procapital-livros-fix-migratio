import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/admin-auth";
import { getConfiguredEmailProvider, sendTransactionalEmail } from "@/lib/email";

export async function GET() {
  const guard = await requireAdminApi();
  if (guard.error) return guard.error;

  const [emailLogs, auditLogs] = await Promise.all([
    prisma.emailLog.findMany({ orderBy: { createdAt: "desc" }, take: 50 }),
    prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 80 }),
  ]);

  return NextResponse.json({
    provider: getConfiguredEmailProvider(),
    emailLogs,
    auditLogs,
  });
}

export async function POST(request: Request) {
  const guard = await requireAdminApi();
  if (guard.error) return guard.error;

  const body = await request.json().catch(() => null);
  const to = String(body?.to ?? guard.actor.email).trim();

  const res = await sendTransactionalEmail({
    template: "COMMERCIAL_CONTACT",
    to,
    data: {
      name: guard.actor.name ?? "Administração Pro Capital",
      email: guard.actor.email,
      reason: "TESTE_DIAGNOSTICO_EMAIL",
      message: "Envio de verificação da configuração de notificações transacionais da Pro Capital.",
    },
  });

  return NextResponse.json(res, { status: res.sent ? 200 : 422 });
}
