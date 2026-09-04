import type { Metadata } from "next";
import { Suspense } from "react";
import { BOOKS } from "@/data/books";
import BookCard from "@/components/BookCard";
import CatalogGrid from "@/components/CatalogGrid";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Catálogo | Pro Capital",
  description:
    "Catálogo de livros da Pro Capital, com preços, para livrarias, escolas e público em geral em Moçambique e na CPLP.",
  alternates: { canonical: "/catalogo" },
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Início", item: SITE_URL },
    { "@type": "ListItem", position: 2, name: "Catálogo", item: `${SITE_URL}/catalogo` },
  ],
};

const FEATURED = BOOKS.filter((book) => book.featured);

export default function CatalogoPage() {
  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <section className="border-b border-line bg-cream-deep/60">
        <div className="mx-auto max-w-4xl px-5 py-16 sm:px-8 sm:py-24">
          <span className="inline-block rounded-full bg-cream px-4 py-1.5 text-xs font-medium uppercase tracking-wide text-ink">
            Catálogo
          </span>
          <h1 className="mt-6 font-serif text-3xl font-semibold leading-tight text-ink sm:text-4xl">
            Encontre o seu próximo livro.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-foreground/70 sm:text-lg">
            Preços de referência para livrarias, escolas e público em geral.
            Para encomendas em maior quantidade, contacte-nos para condições
            comerciais.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
        <h2 className="font-serif text-2xl font-semibold text-ink sm:text-3xl">
          Livros do mês
        </h2>
        <p className="mt-3 max-w-2xl text-foreground/70">
          Uma seleção em destaque, escolhida pela nossa equipa.
        </p>

        <div className="mt-8 grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-4">
          {FEATURED.map((book, index) => (
            <BookCard key={book.slug} book={book} index={index} />
          ))}
        </div>
      </section>

      <section className="border-t border-line bg-cream-deep/60">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
          <h2 className="font-serif text-2xl font-semibold text-ink sm:text-3xl">
            Catálogo completo
          </h2>
          <p className="mt-3 max-w-2xl text-foreground/70">
            Explore por categoria ou pesquise por título e autor.
          </p>

          <div className="mt-8">
            <Suspense fallback={null}>
              <CatalogGrid books={BOOKS} />
            </Suspense>
          </div>
        </div>
      </section>
    </div>
  );
}
