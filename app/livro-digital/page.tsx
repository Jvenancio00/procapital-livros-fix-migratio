import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  FileSpreadsheet,
  Heart,
  Library,
  ShieldCheck,
  ShoppingCart,
  UserPlus,
} from "lucide-react";
import PageHeader from "@/components/PageHeader";
import BookCard from "@/components/BookCard";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAllCatalogBooks } from "@/lib/catalog";
import DigitalWorkspaceClient, {
  type DigitalEditionOption,
} from "./DigitalWorkspaceClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Livro Digital & Biblioteca Online | Pro Capital",
  description:
    "Aceda à Biblioteca Digital Pro Capital, consulte edições digitais e catálogos oficiais em PDF com leitor integrado, marcadores e notas de estudo.",
};

const STEPS = [
  {
    icon: ShoppingCart,
    title: "1. Escolha obras no catálogo multi-país",
    description:
      "Consulte disponibilidade e preços comerciais oficiais em Kwanzas (KZ), Meticais (MT), Euros (€) ou Reais (R$).",
  },
  {
    icon: Heart,
    title: "2. Organize favoritos e listas escolares",
    description:
      "Guarde manuais escolares, títulos técnicos ou literários para compras individuais, bibliotecas ou cotações B2B.",
  },
  {
    icon: UserPlus,
    title: "3. Registe a sua conta Pro Capital",
    description:
      "Crie conta como leitor particular, escola, livraria, editora ou instituição para centralizar encomendas e acessos.",
  },
  {
    icon: BookOpen,
    title: "4. Leia e anote na Minha Biblioteca",
    description:
      "Abra edições digitais adquiridas ou gratuitas no leitor integrado com modo escuro, marcadores e notas por página.",
  },
];

export default async function LivroDigitalPage() {
  const [session, allBooks] = await Promise.all([auth(), getAllCatalogBooks()]);

  const digitalBooks = allBooks.filter(
    (b) => Boolean(b.free) || Boolean(b.downloadUrl),
  );
  const featuredCatalogBooks = allBooks
    .filter((b) => b.featured || b.bestseller)
    .slice(0, 4);

  let userLibraryCount = 0;
  if (session?.user?.email) {
    try {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { _count: { select: { library: true } } },
      });
      userLibraryCount = user?._count.library ?? 0;
    } catch {
      userLibraryCount = 0;
    }
  }

  const bookEditions: DigitalEditionOption[] = digitalBooks
    .filter((b) => Boolean(b.downloadUrl))
    .map((b) => ({
      id: `book-${b.slug}`,
      label: b.title,
      subtitle: `${b.author} · ${b.editora}${
        b.free ? " · Acesso Digital Gratuito" : " · Edição Digital"
      }`,
      pdfUrl: b.downloadUrl!,
      bookSlug: b.slug,
    }));

  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <main className="pb-20">
      <PageHeader
        eyebrow="Leitura & Acervo Digital"
        title="Secção Livro Digital & Biblioteca Online"
        description="Acesso direto à sua Biblioteca Digital pessoal, edições digitais autorizadas pelas editoras parceiras e consulta interativa dos catálogos oficiais Pro Capital em PDF."
        breadcrumbs={[
          { label: "Início", href: "/" },
          { label: "Livro Digital" },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/loja/biblioteca"
              className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-brand-dark"
            >
              <Library size={14} />
              <span>
                {session
                  ? `Abrir Minha Biblioteca (${userLibraryCount})`
                  : "Abrir Minha Biblioteca"}
              </span>
            </Link>

            <Link
              href="/catalogo"
              className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-5 py-2.5 text-xs font-semibold text-ink transition-colors hover:border-brand/40 hover:text-brand"
            >
              <span>Explorar Catálogo</span>
              <ArrowRight size={14} />
            </Link>

            {isAdmin ? (
              <Link
                href="/admin/livros"
                className="inline-flex items-center gap-1.5 rounded-full border border-brand/30 bg-brand/5 px-4 py-2.5 text-xs font-semibold text-brand hover:bg-brand/10"
              >
                <ShieldCheck size={14} />
                <span>Gerir Edições Digitais</span>
              </Link>
            ) : !session ? (
              <Link
                href="/loja/registo"
                className="inline-flex items-center gap-1.5 rounded-full border border-line bg-cream px-4 py-2.5 text-xs font-semibold text-ink hover:border-brand/40"
              >
                <UserPlus size={14} />
                <span>Criar Conta</span>
              </Link>
            ) : null}
          </div>
        }
      />

      {/* Obras Digitais / Acesso Gratuito Ativas no Catálogo */}
      <section className="mx-auto max-w-7xl px-5 sm:px-8">
        {digitalBooks.length > 0 ? (
          <div className="mb-14">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand">
                  Distribuição Digital Autorizada
                </span>
                <h2 className="mt-1 font-serif text-2xl font-semibold text-ink sm:text-3xl">
                  Edições Digitais &amp; Acesso Gratuito ({digitalBooks.length})
                </h2>
              </div>
              <Link
                href="/loja/biblioteca"
                className="text-xs font-semibold text-brand hover:underline"
              >
                Ir para A Minha Biblioteca →
              </Link>
            </div>

            <div className="mt-7 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {digitalBooks.map((book, idx) => (
                <BookCard key={book.slug} book={book} index={idx} />
              ))}
            </div>
          </div>
        ) : (
          <div className="mb-10 flex flex-col justify-between gap-4 rounded-2xl border border-line bg-white p-6 sm:flex-row sm:items-center">
            <div>
              <span className="inline-block rounded-full bg-cream-deep px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-brand">
                Acervo Digital Verificado
              </span>
              <h2 className="mt-2 font-serif text-lg font-semibold text-ink sm:text-xl">
                Biblioteca Digital Pessoal &amp; Catálogos Oficiais em PDF
              </h2>
              <p className="mt-1 max-w-3xl text-xs leading-relaxed text-ink/70 sm:text-sm">
                As edições digitais gratuitas ou adquiridas com direitos confirmados
                pelas editoras parceiras ficam disponíveis automaticamente nesta
                secção e em{" "}
                <Link
                  href="/loja/biblioteca"
                  className="font-semibold text-brand hover:underline"
                >
                  A Minha Biblioteca
                </Link>
                . Abaixo pode consultar e anotar diretamente os catálogos editoriais
                oficiais da Pro Capital em PDF.
              </p>
            </div>

            <div className="flex shrink-0 flex-wrap gap-2.5">
              <Link
                href="/loja/biblioteca"
                className="inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2.5 text-xs font-semibold text-white hover:bg-ink/90"
              >
                <BookOpen size={14} />
                <span>Minha Biblioteca</span>
              </Link>
              <Link
                href="/cotacoes"
                className="inline-flex items-center gap-1.5 rounded-full border border-line px-4 py-2.5 text-xs font-semibold text-ink hover:border-brand/40"
              >
                <FileSpreadsheet size={14} />
                <span>Licenciamento Institucional</span>
              </Link>
            </div>
          </div>
        )}

        {/* Leitor Integrado & Catálogos PDF Oficiais */}
        <DigitalWorkspaceClient
          bookEditions={bookEditions}
          isAuthenticated={Boolean(session?.user)}
        />

        {/* Como Funciona */}
        <div className="mt-16">
          <div className="max-w-2xl">
            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand">
              Fluxo Digital &amp; Conta
            </span>
            <h2 className="mt-1 font-serif text-2xl font-semibold text-ink sm:text-3xl">
              Como funciona a experiência digital na Pro Capital
            </h2>
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="flex flex-col rounded-2xl border border-line bg-white p-6"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand/10 text-brand">
                  <Icon size={20} />
                </span>
                <h3 className="mt-4 font-serif text-base font-semibold text-ink">
                  {title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-ink/70">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Obras em Destaque no Catálogo Geral */}
        {featuredCatalogBooks.length > 0 && (
          <div className="mt-16 border-t border-line/80 pt-14">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand">
                  Catálogo Pro Capital
                </span>
                <h2 className="mt-1 font-serif text-2xl font-semibold text-ink sm:text-3xl">
                  Obras em Destaque para Encomenda ou Cotação
                </h2>
              </div>
              <Link
                href="/catalogo"
                className="text-sm font-semibold text-brand hover:underline"
              >
                Ver todos os títulos ({allBooks.length}) →
              </Link>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {featuredCatalogBooks.map((book, idx) => (
                <BookCard key={book.slug} book={book} index={idx} />
              ))}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
