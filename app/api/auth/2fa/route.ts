import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateTotpSecret, getTotpUri, verifyTotpToken } from "@/lib/totp";
import QRCode from "qrcode";

// POST: gera um novo segredo TOTP e devolve o QR Code para o utilizador
// escanear numa app de autenticação (Google Authenticator, Authy...).
// Ainda não ativa o 2FA — só depois de PUT com o código correto.
export async function POST() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const secret = generateTotpSecret();
  await prisma.user.update({
    where: { email: session.user.email },
    data: { totpSecret: secret, totpEnabled: false },
  });

  const uri = getTotpUri(secret, session.user.email);
  const qrCodeDataUrl = await QRCode.toDataURL(uri);

  return NextResponse.json({ secret, qrCodeDataUrl });
}

// PUT: confirma o código gerado pela app de autenticação e ativa o 2FA.
export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const { token } = await request.json();
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user?.totpSecret) {
    return NextResponse.json({ error: "Nenhum código pendente. Peça um novo QR." }, { status: 400 });
  }

  if (!verifyTotpToken(user.totpSecret, token)) {
    return NextResponse.json({ error: "Código inválido." }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { totpEnabled: true },
  });

  return NextResponse.json({ enabled: true });
}

// DELETE: desativa o 2FA.
export async function DELETE() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  await prisma.user.update({
    where: { email: session.user.email },
    data: { totpEnabled: false, totpSecret: null },
  });

  return NextResponse.json({ enabled: false });
}
