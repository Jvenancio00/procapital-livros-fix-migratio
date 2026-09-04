import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { EstadoConvenio } from "@prisma/client";

// Corrige "Falta área exclusiva" / painel administrativo da secção
// Convénios: permite à equipa comercial mudar o estado de um pedido
// (PENDENTE -> EM_ANALISE -> APROVADO/REJEITADO) sem mexer na base de
// dados à mão.
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if ((session?.user as { role?: string } | undefined)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  const { id } = await params;
  const { estado } = await request.json();
  if (!Object.values(EstadoConvenio).includes(estado)) {
    return NextResponse.json({ error: "Estado inválido." }, { status: 400 });
  }

  const pedido = await prisma.convenioPedido.update({
    where: { id },
    data: { estado },
  });

  return NextResponse.json(pedido);
}
