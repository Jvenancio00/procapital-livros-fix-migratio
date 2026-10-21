import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token")?.trim() ?? "";

  if (!token) {
    return NextResponse.redirect(new URL("/loja/entrar?verified=invalid", request.url));
  }

  const record = await prisma.emailVerificationToken.findUnique({
    where: { token },
  });

  if (!record || record.verifiedAt || record.expiresAt <= new Date()) {
    return NextResponse.redirect(new URL("/loja/entrar?verified=expired", request.url));
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { emailVerified: new Date() },
    }),
    prisma.emailVerificationToken.update({
      where: { id: record.id },
      data: { verifiedAt: new Date() },
    }),
  ]);

  return NextResponse.redirect(new URL("/loja/entrar?verified=1", request.url));
}
