import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, Download, BookOpen } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/PageHeader";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "A Minha Biblioteca Digital",
  description:
    "Consulte e leia online os títulos digitais adquiridos ou disponibilizados gratuitamente na sua conta Pro Capital.",
  robots: { index: false, follow: false },
};

export default async function BibliotecaPage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/loja/entrar?callbackUrl=/loja/biblioteca");
  }

  let items: {
    id: string;
    source: string;
    acquiredAt: Date;
    book: { slug: string; title: string; author: string; pdfUrl: string | null };
  }[] = [];

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        library: { include: { book: true }, orderBy: { acquiredAt: "desc" } },
      },
    });
    items = user?.library ?? [];
  } catch {
    items = [];
  }

  return (
    <main>
      <PageHeader
        eyebrow="Acervo Digital Pessoal"
        title="A Minha Biblioteca"
        description="Aceda aos títulos digitais adquiridos ou disponibilizados gratuitamente na sua conta Pro Capital."
        breadcrumbs={[
          { label: "Início", href: "/" },
          { label: "Livro Digital", href: "/livro-digital" },
          { label: "A Minha Biblioteca" },
        ]}
      />

      <div className="mx-auto max-w-5xl px-5 py-12 sm:px-8 sm:py-16">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-ink/65">
            {items.length} obra(s) registada(s) na sua biblioteca.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/livro-digital"
              className="text-xs font-semibold text-ink/75 hover:text-brand hover:underline"
            >
              Secção Livro Digital →
            </Link>
            <Link
              href="/loja/encomendas"
              className="text-xs font-semibold text-brand hover:underline"
            >
              Ver encomendas e faturas proforma →
            </Link>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-line bg-white p-10 text-center">
            <BookOpen size={32} className="mx-auto text-ink/30" />
            <p className="mt-4 text-sm text-ink/65">
              Ainda não existem livros digitais associados a esta conta.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                href="/livro-digital"
                className="inline-flex items-center gap-2 rounded-full border border-line bg-cream/60 px-6 py-3 text-xs font-semibold text-ink transition-colors hover:border-brand/40"
              >
                <span>Ver Secção Livro Digital</span>
              </Link>
              <Link
                href="/catalogo"
                className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-xs font-semibold text-white transition-colors hover:bg-brand-dark"
              >
                <span>Explorar catálogo</span>
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-white p-5"
              >
                <div>
                  <p className="font-serif text-base font-semibold text-ink">
                    {item.book.title}
                  </p>
                  <p className="text-xs text-ink/60">{item.book.author}</p>
                  <p className="mt-1 text-[11px] uppercase tracking-wide text-ink/45">
                    {item.source === "free-download"
                      ? "Acesso editorial gratuito"
                      : "Adquirido"}{" "}
                    · {new Date(item.acquiredAt).toLocaleDateString("pt-PT")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/loja/leitor/${item.book.slug}`}
                    className="inline-flex items-center gap-1.5 rounded-full bg-brand px-4 py-2 text-xs font-semibold text-white hover:bg-brand-dark"
                  >
                    <BookOpen size={13} />
                    <span>Ler agora</span>
                  </Link>
                  {item.book.pdfUrl && (
                    <a
                      href={item.book.pdfUrl}
                      download
                      className="inline-flex items-center gap-1.5 rounded-full border border-line px-4 py-2 text-xs font-semibold text-ink hover:border-brand/40"
                    >
                      <Download size={13} />
                      <span>Descarregar</span>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
