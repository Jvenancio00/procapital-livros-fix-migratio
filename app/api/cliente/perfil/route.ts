import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ClientType, MarketCode } from "@/lib/enums";

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email.toLowerCase() },
    include: { clientProfile: true },
  });
  if (!user) {
    return NextResponse.json({ error: "Utilizador não encontrado." }, { status: 404 });
  }

  const profile =
    user.clientProfile ??
    (await prisma.clientProfile.create({
      data: { userId: user.id },
    }));

  return NextResponse.json({
    id: user.id,
    name: user.name,
    email: user.email,
    company: profile.companyName ?? user.name ?? user.email,
    companyName: profile.companyName ?? "",
    type: profile.type.toLowerCase(),
    clientType: profile.type,
    discount: profile.approvedB2B ? profile.discountPercent : 0,
    discountPercent: profile.discountPercent,
    approvedB2B: profile.approvedB2B,
    paymentTermsDays: profile.paymentTermsDays,
    taxId: profile.taxId ?? "",
    countryCode: profile.countryCode,
    phone: profile.phone ?? "",
    billingAddress: profile.billingAddress ?? "",
    city: profile.city ?? "",
    contactRole: profile.contactRole ?? "",
    loginTime: new Date().toISOString(),
  });
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email.toLowerCase() },
  });
  if (!user) {
    return NextResponse.json({ error: "Utilizador não encontrado." }, { status: 404 });
  }

  const body = await request.json().catch(() => ({}));
  const type = (Object.values(ClientType) as string[]).includes(body.clientType)
    ? (body.clientType as ClientType)
    : undefined;
  const countryCode = (Object.values(MarketCode) as string[]).includes(body.countryCode)
    ? (body.countryCode as MarketCode)
    : undefined;

  if (typeof body.name === "string" && body.name.trim()) {
    await prisma.user.update({
      where: { id: user.id },
      data: { name: body.name.trim() },
    });
  }

  // Importante: descontos e aprovação de crédito B2B NUNCA podem ser alterados
  // pelo próprio utilizador — apenas por regras administrativas explícitas.
  const updated = await prisma.clientProfile.upsert({
    where: { userId: user.id },
    update: {
      ...(type ? { type } : {}),
      ...(countryCode ? { countryCode } : {}),
      companyName: body.companyName !== undefined ? String(body.companyName).trim() || null : undefined,
      taxId: body.taxId !== undefined ? String(body.taxId).trim() || null : undefined,
      phone: body.phone !== undefined ? String(body.phone).trim() || null : undefined,
      billingAddress:
        body.billingAddress !== undefined ? String(body.billingAddress).trim() || null : undefined,
      city: body.city !== undefined ? String(body.city).trim() || null : undefined,
      contactRole:
        body.contactRole !== undefined ? String(body.contactRole).trim() || null : undefined,
    },
    create: {
      userId: user.id,
      type: type ?? "PARTICULAR",
      countryCode: countryCode ?? "MZ",
      companyName: body.companyName ? String(body.companyName).trim() : null,
      taxId: body.taxId ? String(body.taxId).trim() : null,
      phone: body.phone ? String(body.phone).trim() : null,
      billingAddress: body.billingAddress ? String(body.billingAddress).trim() : null,
      city: body.city ? String(body.city).trim() : null,
      contactRole: body.contactRole ? String(body.contactRole).trim() : null,
    },
  });

  return NextResponse.json({ ok: true, profile: updated });
}
