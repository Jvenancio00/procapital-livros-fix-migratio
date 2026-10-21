import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidEmailAddress, sendTransactionalEmail } from "@/lib/email";
import { SITE_URL } from "@/lib/site";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";

  if (!isValidEmailAddress(email)) {
    return NextResponse.json({ error: "Indique um endereço de email válido." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    // Não revela se o email existe por segurança, mas informa honestamente sobre o estado do serviço de email
    return NextResponse.json({
      ok: true,
      message:
        "Se existir uma conta associada a este email, o pedido de recuperação foi registado.",
    });
  }

  const token = crypto.randomBytes(24).toString("hex");
  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      token,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    },
  });

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() || SITE_URL;
  const emailResult = await sendTransactionalEmail({
    template: "PASSWORD_RESET",
    to: user.email,
    data: {
      email: user.email,
      resetUrl: `${baseUrl}/loja/recuperar-senha?token=${token}`,
    },
  });

  return NextResponse.json({
    ok: true,
    emailSent: emailResult.sent,
    emailStatus: emailResult.status,
  });
}
