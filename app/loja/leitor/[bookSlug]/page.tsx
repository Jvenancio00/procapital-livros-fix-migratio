import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ReaderClient from "./ReaderClient";

// Leitor integrado — corrige "Problema 3 – Leitor próprio" da secção
// Livro Digital (marcadores, notas, modo escuro, fonte ajustável).
// Continua a não ser DRM real: o PDF pode sempre ser guardado pelo
// browser. A camada de licenciamento (Problema 4) fica no modelo
// `License`, verificado aqui, mas sem impedir tecnicamente a cópia — isso
// exigiria um serviço de DRM comercial (Adobe Content Server, Readium
// LCP), que não foi ligado por depender de conta externa.
export default async function LeitorPage({
  params,
}: {
  params: Promise<{ bookSlug: string }>;
}) {
  const { bookSlug } = await params;
  const session = await auth();
  if (!session?.user?.email) {
    redirect(`/loja/entrar?callbackUrl=%2Floja%2Fleitor%2F${bookSlug}`);
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email! } });
  const book = await prisma.book.findUnique({ where: { slug: bookSlug } });
  if (!user || !book) notFound();

  const owns = await prisma.libraryItem.findUnique({
    where: { userId_bookId: { userId: user.id, bookId: book.id } },
  });
  if (!owns) {
    redirect("/loja/biblioteca");
  }

  // Licença: se existirem licenças emitidas para este livro/comprador,
  // valida número de dispositivos e validade (sem bloquear quando não há
  // nenhuma licença registada, para não partir o download gratuito).
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
