import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// O formulário de newsletter da homepage não submetia nada: o visitante
// escrevia o email, carregava em "Subscrever" e a página recarregava sem
// qualquer registo. Passa a gravar a subscrição (idempotente por email).

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(request: Request) {
  let body: { email?: unknown; source?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Pedido inválido." }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const source = typeof body.source === "string" ? body.source.slice(0, 40) : "homepage";

  if (!EMAIL_PATTERN.test(email)) {
    return NextResponse.json(
      { error: "Introduza um endereço de email válido." },
      { status: 400 }
    );
  }

  try {
    // Subscrever duas vezes não deve dar erro ao visitante — reativa a
    // subscrição caso ele se tenha removido antes.
    await prisma.newsletterSubscriber.upsert({
      where: { email },
      create: { email, source },
      update: { unsubscribed: false },
    });
  } catch (error) {
    console.error("[newsletter] falha ao gravar subscrição:", error);
    return NextResponse.json(
      { error: "Não foi possível registar a subscrição. Tente novamente." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
