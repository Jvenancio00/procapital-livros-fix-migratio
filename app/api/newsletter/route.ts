import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidEmailAddress, sendTransactionalEmail } from "@/lib/email";

export async function POST(request: Request) {
  let body: { email?: unknown; source?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Pedido inválido." }, { status: 400 });
  }

  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const source =
    typeof body.source === "string" ? body.source.slice(0, 40) : "homepage";

  if (!isValidEmailAddress(email)) {
    return NextResponse.json(
      { error: "Introduza um endereço de email válido." },
      { status: 400 },
    );
  }

  try {
    await prisma.newsletterSubscriber.upsert({
      where: { email },
      create: { email, source },
      update: { unsubscribed: false },
    });

    await sendTransactionalEmail({
      template: "REGISTRATION_WELCOME",
      to: email,
      data: { name: "Subscritor Editorial" },
    }).catch(() => {});
  } catch (error) {
    console.error("[newsletter] falha ao gravar subscrição:", error);
    return NextResponse.json(
      { error: "Não foi possível registar a subscrição. Tente novamente." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    ok: true,
    message: "Subscrição registada com sucesso no boletim editorial Pro Capital.",
  });
}
