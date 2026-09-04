import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, Download, BookOpen } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function BibliotecaPage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/loja/entrar");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      library: { include: { book: true }, orderBy: { acquiredAt: "desc" } },
    },
  });

  const items = user?.library ?? [];

  return (
    <div className="mx-auto max-w-5xl px-5 py-12 sm:px-8 sm:py-16">
      <h1 className="font-serif text-2xl font-semibold text-ink sm:text-3xl">
        Minha Biblioteca
      </h1>
      <p className="mt-2 text-foreground/60">
        Todos os livros que compraste ou obtiveste gratuitamente.
      </p>

      {items.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-line bg-cream-deep/60 p-10 text-center">
          <BookOpen size={32} className="mx-auto text-foreground/30" />
          <p className="mt-4 text-foreground/60">
            Ainda não tens livros na tua biblioteca.
          </p>
          <Link
            href="/catalogo"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-cream transition-colors hover:bg-brand-dark"
          >
            Explorar catálogo
            <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div className="mt-8 divide-y divide-line border-y border-line">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-4 py-4">
              <div>
                <p className="font-serif text-sm font-semibold text-ink">
                  {item.book.title}
                </p>
                <p className="text-xs text-foreground/55">{item.book.author}</p>
                <p className="mt-0.5 text-[11px] uppercase tracking-wide text-foreground/40">
                  {item.source === "free-download" ? "Download gratuito" : "Comprado"} ·{" "}
                  {new Date(item.acquiredAt).toLocaleDateString("pt-PT")}
                </p>
              </div>
              {item.book.pdfUrl && (
                <div className="flex items-center gap-2">
                  <Link
                    href={`/loja/leitor/${item.book.slug}`}
                    className="inline-flex items-center gap-1.5 rounded-full bg-brand px-4 py-2 text-xs font-semibold text-cream hover:bg-brand-dark"
                  >
                    <BookOpen size={13} />
                    Ler agora
                  </Link>
                  <a
                    href={item.book.pdfUrl}
                    download
                    className="inline-flex items-center gap-1.5 rounded-full border border-line px-4 py-2 text-xs font-semibold text-ink hover:border-brand/40"
                  >
                    <Download size={13} />
                    Baixar
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
