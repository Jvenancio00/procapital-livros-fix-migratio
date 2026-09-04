import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Check-in no dia do evento: a equipa (admin) lê/introduz o checkinCode do
// QR mostrado ao inscrito. Corrige "não existe check-in" da secção Eventos.
export async function POST(request: Request) {
  const session = await auth();
  if ((session?.user as { role?: string } | undefined)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  const { checkinCode } = await request.json();
  const inscricao = await prisma.inscricao.findUnique({ where: { checkinCode } });

  if (!inscricao) {
    return NextResponse.json({ error: "Código não encontrado." }, { status: 404 });
  }
  if (inscricao.checkedInAt) {
    return NextResponse.json({ error: "Já fez check-in anteriormente." }, { status: 409 });
  }
  if (inscricao.estado !== "CONFIRMADA") {
    return NextResponse.json({ error: "Inscrição não está confirmada." }, { status: 409 });
  }

  const updated = await prisma.inscricao.update({
    where: { id: inscricao.id },
    data: { checkedInAt: new Date() },
  });

  return NextResponse.json({ nome: updated.nome, checkedInAt: updated.checkedInAt });
}
