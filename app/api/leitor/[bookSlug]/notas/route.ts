import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NoteKind } from "@prisma/client";

// Marcadores e notas do leitor — corrige "Problema 3 – Leitor próprio" da
// secção Livro Digital (o relatório pedia marcadores, notas e pesquisa;
// aqui ficam marcadores/notas persistentes por utilizador e por livro).
async function getOwnedBook(userId: string, bookSlug: string) {
  const book = await prisma.book.findUnique({ where: { slug: bookSlug } });
  if (!book) return null;
  const owns = await prisma.libraryItem.findUnique({
    where: { userId_bookId: { userId, bookId: book.id } },
  });
  return owns ? book : null;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ bookSlug: string }> }
) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json([]);

  const { bookSlug } = await params;
  const book = await getOwnedBook(user.id, bookSlug);
  if (!book) return NextResponse.json({ error: "Livro não disponível na tua biblioteca." }, { status: 403 });

  const notes = await prisma.readingNote.findMany({
    where: { userId: user.id, bookId: book.id },
    orderBy: { page: "asc" },
  });
  return NextResponse.json(notes);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ bookSlug: string }> }
) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "Utilizador não encontrado." }, { status: 404 });

  const { bookSlug } = await params;
  const book = await getOwnedBook(user.id, bookSlug);
  if (!book) return NextResponse.json({ error: "Livro não disponível na tua biblioteca." }, { status: 403 });

  const { page, kind, content } = await request.json();
  if (!Object.values(NoteKind).includes(kind)) {
    return NextResponse.json({ error: "Tipo inválido." }, { status: 400 });
  }

  const note = await prisma.readingNote.create({
    data: { userId: user.id, bookId: book.id, page: Number(page) || 1, kind, content: content || null },
  });
  return NextResponse.json(note);
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "Utilizador não encontrado." }, { status: 404 });

  const { id } = await request.json();
  await prisma.readingNote.deleteMany({ where: { id, userId: user.id } });
  return NextResponse.json({ ok: true });
}
