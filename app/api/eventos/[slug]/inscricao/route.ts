import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { EstadoInscricao } from "@prisma/client";
import QRCode from "qrcode";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const body = await request.json();
  const { nome, email, telefone } = body;

  if (!nome || !email) {
    return NextResponse.json(
      { error: "Nome e email são obrigatórios." },
      { status: 400 }
    );
  }

  const evento = await prisma.evento.findUnique({ where: { slug } });
  if (!evento) {
    return NextResponse.json({ error: "Evento não encontrado." }, { status: 404 });
  }

  const existente = await prisma.inscricao.findUnique({
    where: { eventoId_email: { eventoId: evento.id, email } },
  });
  if (existente) {
    return NextResponse.json(
      {
        error:
          existente.estado === "LISTA_ESPERA"
            ? "Já está na lista de espera deste evento."
            : "Já tem uma inscrição confirmada neste evento.",
      },
      { status: 409 }
    );
  }

  const inscricao = await prisma.$transaction(async (tx) => {
    let estado: EstadoInscricao = "CONFIRMADA";

    if (evento.capacidade != null) {
      const confirmadas = await tx.inscricao.count({
        where: { eventoId: evento.id, estado: "CONFIRMADA" },
      });
      if (confirmadas >= evento.capacidade) {
        estado = "LISTA_ESPERA";
      }
    }

    return tx.inscricao.create({
      data: { eventoId: evento.id, nome, email, telefone: telefone || null, estado },
    });
  });

  const qrCodeDataUrl =
    inscricao.estado === "CONFIRMADA"
      ? await QRCode.toDataURL(inscricao.checkinCode)
      : null;

  return NextResponse.json({
    id: inscricao.id,
    estado: inscricao.estado,
    checkinCode: inscricao.checkinCode,
    qrCodeDataUrl,
  });
}
