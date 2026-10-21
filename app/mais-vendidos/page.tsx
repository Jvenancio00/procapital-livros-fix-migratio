import type { Metadata } from "next";
import Link from "next/link";
import { FileDown, FileSpreadsheet } from "lucide-react";
import BookCard from "@/components/BookCard";
import PageHeader from "@/components/PageHeader";
import { getAllCatalogBooks } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Mais Vendidos | Pro Capital",
  description:
    "Títulos com maior procura por livrarias, escolas, universidades e leitores nos mercados de língua portuguesa.",
};

export default async function MaisVendidosPage() {
  const allBooks = await getAllCatalogBooks();
  const bestsellers = allBooks.filter((b) => b.bestseller || b.featured);
  const books = bestsellers.length > 0 ? bestsellers : allBooks.slice(0, 12);

  return (
    <div className="pb-20">
      <PageHeader
        eyebrow="Procura Comercial"
        title="Títulos mais vendidos e requisitados"
        description="Obras com maior rotação em encomendas confirmadas, livrarias parceiras e fornecimentos escolares."
        breadcrumbs={[
          { label: "Início", href: "/" },
          { label: "Mais Vendidos" },
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
              <span>Encomenda em Volume</span>
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
