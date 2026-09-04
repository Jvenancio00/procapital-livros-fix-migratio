import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Corrige o achado de dois sistemas de cliente paralelos: já não existe
// uma lista fixa (data/authorized-clients.ts) só com 5 emails permitidos.
// Qualquer utilizador autenticado (via /loja/entrar, NextAuth) tem um
// ClientProfile — criado com desconto 0 na primeira vez que acede à área
// B2B — o que resolve também "se amanhã houver 20 000 clientes" (secção
// Área de Cliente, Problema 4 – Escalabilidade).
export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
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
    email: user.email,
    company: profile.companyName ?? user.name ?? user.email,
    type: profile.type.toLowerCase(),
    discount: profile.discountPercent,
    loginTime: new Date().toISOString(),
  });
}
