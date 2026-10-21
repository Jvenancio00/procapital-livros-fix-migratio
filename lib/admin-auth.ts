import { NextResponse } from "next/server";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export interface AuthenticatedActor {
  id: string;
  email: string;
  name: string | null;
  role: "ADMIN" | "CUSTOMER";
}

export async function getAuthenticatedActor(): Promise<AuthenticatedActor | null> {
  const session = await auth();
  const email = session?.user?.email?.trim().toLowerCase();
  if (!email) return null;

  try {
    const dbUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true, role: true },
    });
    if (!dbUser) return null;
    const sessionRole = (session?.user as { role?: string } | undefined)?.role;
    const effectiveRole =
      dbUser.role === "ADMIN" || sessionRole === "ADMIN" ? "ADMIN" : "CUSTOMER";
    return {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      role: effectiveRole,
    };
  } catch {
    return null;
  }
}

export async function requireAdminApi(): Promise<
  { actor: AuthenticatedActor; error?: undefined } | { actor?: undefined; error: NextResponse }
> {
  const actor = await getAuthenticatedActor();
  if (!actor) {
    return {
      error: NextResponse.json(
        { error: "Autenticação obrigatória." },
        { status: 401 }
      ),
    };
  }
  if (actor.role !== "ADMIN") {
    return {
      error: NextResponse.json(
        { error: "Acesso restrito a administradores da Pro Capital." },
        { status: 403 }
      ),
    };
  }
  return { actor };
}

export async function requireAdminPage(callbackPath = "/admin"): Promise<AuthenticatedActor> {
  const actor = await getAuthenticatedActor();
  if (!actor || actor.role !== "ADMIN") {
    redirect(`/loja/entrar?callbackUrl=${encodeURIComponent(callbackPath)}`);
  }
  return actor;
}

export async function recordAuditLog(params: {
  action: string;
  entityType: string;
  entityId?: string | null;
  actorId?: string | null;
  actorEmail?: string | null;
  ip?: string | null;
  details?: Record<string, unknown>;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId ?? null,
        actorId: params.actorId ?? null,
        actorEmail: params.actorEmail ?? null,
        ip: params.ip ?? null,
        detailsJson: (params.details ?? {}) as object,
      },
    });
  } catch (err) {
    console.error("[audit] Falha ao gravar registo de auditoria:", err);
  }
}
