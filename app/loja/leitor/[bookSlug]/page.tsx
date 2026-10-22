import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ReaderClient from "./ReaderClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Leitor Digital Online",
  description:
    "Leitor integrado Pro Capital com marcadores e anotações sincronizadas na conta do leitor.",
  robots: { index: false, follow: false },
};

export default async function LeitorPage({
  params,
}: {
  params: Promise<{ bookSlug: string }>;
}) {
  const { bookSlug } = await params;
  const session = await auth();
  if (!session?.user?.email) {
    redirect(`/loja/entrar?callbackUrl=%2Floja%2Fleitor%2F${encodeURIComponent(bookSlug)}`);
  }

  let user: { id: string; email: string } | null = null;
  let book: { id: string; slug: string; title: string; pdfUrl: string | null; free: boolean } | null = null;

  try {
    user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, email: true },
    });
    book = await prisma.book.findUnique({
      where: { slug: bookSlug },
      select: { id: true, slug: true, title: true, pdfUrl: true, free: true },
    });
  } catch {
    redirect("/loja/biblioteca");
  }

  if (!user || !book) notFound();

  let owns = await prisma.libraryItem.findUnique({
    where: { userId_bookId: { userId: user.id, bookId: book.id } },
  });

  // Se o livro tiver distribuição digital gratuita confirmada (book.free === true),
  // regista automaticamente o acesso na Biblioteca Digital pessoal do leitor.
  if (!owns && book.free) {
    owns = await prisma.libraryItem.upsert({
      where: { userId_bookId: { userId: user.id, bookId: book.id } },
      update: {},
      create: {
        userId: user.id,
        bookId: book.id,
        source: "free-download",
      },
    });
  }

  if (!owns) {
    redirect("/loja/biblioteca");
  }

  const license = await prisma.license.findFirst({
    where: { bookId: book.id, buyerEmail: user.email },
  });
  const licenseExpired = Boolean(license?.expiresAt && license.expiresAt < new Date());

  return (
    <ReaderClient
      bookSlug={book.slug}
      title={book.title}
      pdfUrl={book.pdfUrl}
      licenseExpired={licenseExpired}
    />
  );
}
