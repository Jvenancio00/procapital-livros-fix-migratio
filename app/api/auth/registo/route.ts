import crypto from "node:crypto";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { ClientType, MarketCode } from "@/lib/enums";
import { CLIENT_TYPE_LABELS } from "@/lib/markets";
import { isValidEmailAddress, sendTransactionalEmail } from "@/lib/email";
import { SITE_URL } from "@/lib/site";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Dados de registo inválidos." }, { status: 400 });
  }

  const name = body.name ? String(body.name).trim() : null;
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!isValidEmailAddress(email) || password.length < 8) {
    return NextResponse.json(
      { error: "Indique um email válido e uma palavra-passe com pelo menos 8 caracteres." },
      { status: 400 }
    );
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "Já existe uma conta registada com este email." },
      { status: 409 }
    );
  }

  const clientType = (Object.values(ClientType) as string[]).includes(body.clientType)
    ? (body.clientType as ClientType)
    : "PARTICULAR";
  const countryCode = (Object.values(MarketCode) as string[]).includes(body.countryCode)
    ? (body.countryCode as MarketCode)
    : "MZ";

  const passwordHash = await bcrypt.hash(password, 12);
  const verifyToken = crypto.randomBytes(24).toString("hex");

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      clientProfile: {
        create: {
          type: clientType,
          countryCode,
          companyName: body.companyName ? String(body.companyName).trim() : null,
          taxId: body.taxId ? String(body.taxId).trim() : null,
          phone: body.phone ? String(body.phone).trim() : null,
        },
      },
      emailVerificationTokens: {
        create: {
          token: verifyToken,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      },
    },
  });

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() || SITE_URL;
  await sendTransactionalEmail({
    template: "REGISTRATION_WELCOME",
    to: user.email,
    data: {
      name: user.name ?? "Utilizador",
      email: user.email,
      profileLabel: CLIENT_TYPE_LABELS[clientType] ?? clientType,
    },
  });
  const verificationEmail = await sendTransactionalEmail({
    template: "EMAIL_VERIFICATION",
    to: user.email,
    data: {
      name: user.name ?? "Utilizador",
      verifyUrl: `${baseUrl}/api/auth/verificar-email?token=${verifyToken}`,
    },
  });

  return NextResponse.json({
    id: user.id,
    email: user.email,
    emailVerificationSent: verificationEmail.sent,
  });
}
