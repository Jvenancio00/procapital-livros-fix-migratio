import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Corrige o placeholder "rating"/"reviewCount" da secção Livro (o próprio
// código dizia "placeholder até existirem avaliações reais"): passa a
// existir um endpoint real para submeter e listar avaliações, ligado ao
// modelo Review que já existia no schema mas não estava ligado a nada.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const book = await prisma.book.findUnique({ where: { slug } });
  if (!book) return NextResponse.json({ average: null, count: 0, reviews: [] });

  const reviews = await prisma.review.findMany({
    where: { bookId: book.id },
    include: { user: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  const average =
    reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : null;

  return NextResponse.json({
    average,
    count: reviews.length,
    reviews: reviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt,
      authorName: r.user.name ?? "Leitor Pro Capital",
    })),
  });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "É preciso iniciar sessão para avaliar." }, { status: 401 });
  }

  const { slug } = await params;
  const book = await prisma.book.findUnique({ where: { slug } });
  if (!book) return NextResponse.json({ error: "Livro não encontrado." }, { status: 404 });

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "Utilizador não encontrado." }, { status: 404 });

  const { rating, comment } = await request.json();
  if (!rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Avaliação deve ser entre 1 e 5." }, { status: 400 });
  }

  const review = await prisma.review.upsert({
    where: { userId_bookId: { userId: user.id, bookId: book.id } },
    update: { rating, comment: comment || null },
    create: { userId: user.id, bookId: book.id, rating, comment: comment || null },
  });

  return NextResponse.json(review);
}
