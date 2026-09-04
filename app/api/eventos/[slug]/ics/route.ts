import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createEvent } from "ics";

// Exportação para o calendário (.ics, compatível com Google/Outlook/Apple
// Calendar) — corrige "não existe integração com calendário" da secção
// Eventos, sem precisar de conta/API de nenhum fornecedor de calendário.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const evento = await prisma.evento.findUnique({ where: { slug } });
  if (!evento) {
    return NextResponse.json({ error: "Evento não encontrado." }, { status: 404 });
  }

  const start = evento.dataInicio;
  const end = evento.dataFim ?? new Date(start.getTime() + 2 * 60 * 60 * 1000);

  const { error, value } = createEvent({
    title: evento.titulo,
    description: evento.descricao,
    location: evento.endereco ?? evento.local,
    start: [start.getFullYear(), start.getMonth() + 1, start.getDate(), start.getHours(), start.getMinutes()],
    end: [end.getFullYear(), end.getMonth() + 1, end.getDate(), end.getHours(), end.getMinutes()],
  });

  if (error || !value) {
    return NextResponse.json({ error: "Não foi possível gerar o calendário." }, { status: 500 });
  }

  return new NextResponse(value, {
    headers: {
      "Content-Type": "text/calendar",
      "Content-Disposition": `attachment; filename="${slug}.ics"`,
    },
  });
}
