import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const token = typeof body?.token === "string" ? body.token.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!token || password.length < 8) {
    return NextResponse.json(
      { error: "Token válido e nova palavra-passe (mínimo 8 caracteres) são obrigatórios." },
      { status: 400 }
    );
  }

  const record = await prisma.passwordResetToken.findUnique({
    where: { token },
  });

  if (!record || record.usedAt || record.expiresAt <= new Date()) {
    return NextResponse.json(
      { error: "Esta ligação de recuperação é inválida ou já expirou." },
      { status: 400 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { passwordHash },
    }),
    prisma.passwordResetToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
