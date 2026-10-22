import type { Metadata } from "next";
import Link from "next/link";
import { FileDown, FileSpreadsheet } from "lucide-react";
import BookCard from "@/components/BookCard";
import PageHeader from "@/components/PageHeader";
import { getAllCatalogBooks } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Destaques Editoriais",
  description:
    "Seleção curada de manuais escolares, literatura lusófona e obras de referência em destaque na Pro Capital.",
};

export default async function DestaquesPage() {
  const allBooks = await getAllCatalogBooks();
  const featured = allBooks.filter((b) => b.featured);
  const books = featured.length > 0 ? featured : allBooks.slice(0, 12);

  return (
    <div className="pb-20">
      <PageHeader
        eyebrow="Curadoria Pro Capital"
        title="Livros em destaque"
        description="Seleção de manuais escolares prioritários, novidades editoriais e obras de referência disponíveis na nossa rede lusófona."
        breadcrumbs={[
          { label: "Início", href: "/" },
          { label: "Destaques" },
        ]}
        actions={
          <>
            <a
              href="/api/catalogo/pdf?pais=MZ"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2.5 text-xs font-semibold text-ink hover:border-brand/40 hover:text-brand"
            >
              <FileDown size={14} />
              <span>Exportar Catálogo PDF</span>
            </a>
            <Link
              href="/cotacoes"
              className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-xs font-semibold text-white hover:bg-brand-dark"
            >
              <FileSpreadsheet size={14} />
              <span>Pedir Cotação</span>
            </Link>
          </>
        }
      />

      <section className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {books.map((book, idx) => (
            <BookCard key={book.slug} book={book} index={idx} />
          ))}
        </div>
      </section>
    </div>
  );
}
