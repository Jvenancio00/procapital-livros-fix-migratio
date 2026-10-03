import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Check-in no dia do evento: a equipa (admin) lê/introduz o checkinCode do
// QR mostrado ao inscrito. Corrige "não existe check-in" da secção Eventos.
export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await auth();
  if ((session?.user as { role?: string } | undefined)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  const { slug } = await params;
  const evento = await prisma.evento.findUnique({ where: { slug } });
  if (!evento) {
    return NextResponse.json({ error: "Evento não encontrado." }, { status: 404 });
  }

  const { checkinCode } = await request.json();
  const inscricao = await prisma.inscricao.findUnique({ where: { checkinCode } });

  if (!inscricao) {
    return NextResponse.json({ error: "Código não encontrado." }, { status: 404 });
  }
  // Sem esta verificação, um código válido de OUTRO evento seria aceite
  // aqui sem aviso — importante quando a mesma equipa gere vários eventos.
  if (inscricao.eventoId !== evento.id) {
    return NextResponse.json(
      { error: "Este código pertence a outro evento." },
      { status: 409 }
    );
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
