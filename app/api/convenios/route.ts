import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { TipoInstituicao } from "@prisma/client";

export async function POST(request: Request) {
  const body = await request.json();
  const { nome, instituicao, tipo, email, telefone, numAlunos, mensagem } = body;

  if (!nome || !instituicao || !tipo || !email) {
    return NextResponse.json(
      { error: "Nome, instituição, tipo e email são obrigatórios." },
      { status: 400 }
    );
  }

  if (!Object.values(TipoInstituicao).includes(tipo)) {
    return NextResponse.json({ error: "Tipo de instituição inválido." }, { status: 400 });
  }

  const pedido = await prisma.convenioPedido.create({
    data: {
      nome,
      instituicao,
      tipo,
      email,
      telefone: telefone || null,
      numAlunos: numAlunos ? Number(numAlunos) : null,
      mensagem: mensagem || null,
    },
  });

  return NextResponse.json({ id: pedido.id });
}
