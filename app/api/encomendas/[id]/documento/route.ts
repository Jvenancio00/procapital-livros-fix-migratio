import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateOrderCommercialPdf } from "@/lib/pdf-invoice";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user?.email) {
    return NextResponse.json(
      { error: "Autenticação obrigatória para aceder ao documento comercial." },
      { status: 401 },
    );
  }

  const [order, dbUser] = await Promise.all([
    prisma.order.findUnique({
      where: { id },
      include: { user: true },
    }),
    prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, email: true, role: true },
    }),
  ]);

  if (!order || !dbUser) {
    return NextResponse.json(
      { error: "Encomenda não encontrada." },
      { status: 404 },
    );
  }

  const isOwner =
    order.userId === dbUser.id ||
    order.user.email.toLowerCase() === dbUser.email.toLowerCase() ||
    order.buyerEmail?.toLowerCase() === dbUser.email.toLowerCase();

  if (!isOwner && dbUser.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Sem permissão para aceder a este documento." },
      { status: 403 },
    );
  }

  const generated = await generateOrderCommercialPdf(order.id);
  if (!generated) {
    return NextResponse.json(
      { error: "Não foi possível gerar o documento PDF." },
      { status: 500 },
    );
  }

  if (!order.invoiceRequested) {
    await prisma.order
      .update({
        where: { id: order.id },
        data: { invoiceRequested: true },
      })
      .catch(() => {});
  }

  return new NextResponse(new Uint8Array(generated.buffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${generated.filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
