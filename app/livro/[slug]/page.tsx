import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BOOKS, getBookBySlug, getRelatedBooks } from "@/data/books";
import BookCard from "@/components/BookCard";
import BookCover from "@/components/BookCover";
import BookPurchasePanel from "@/components/BookPurchasePanel";
import BookReviews from "@/components/BookReviews";
import { SITE_URL } from "@/lib/site";

export function generateStaticParams() {
  return BOOKS.map((book) => ({ slug: book.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const book = getBookBySlug(slug);

  if (!book) {
    return { title: "Livro não encontrado | Pro Capital" };
  }

  return {
    title: `${book.title} | Pro Capital`,
    description:
      book.description ??
      `${book.title}, de ${book.author}, disponível no catálogo da Pro Capital.`,
    alternates: { canonical: `/livro/${book.slug}` },
  };
}

export default async function LivroPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const book = getBookBySlug(slug);

  if (!book) {
    notFound();
  }

  const related = getRelatedBooks(book);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Book",
    name: book.title,
    author: { "@type": "Person", name: book.author },
    isbn: book.isbn,
    bookFormat: "https://schema.org/Paperback",
    inLanguage: "pt",
    numberOfPages: book.pages,
    datePublished: book.year ? String(book.year) : undefined,
    description: book.description,
    publisher: { "@type": "Organization", name: book.editora },
    aggregateRating:
      book.rating && book.reviewCount
        ? {
            "@type": "AggregateRating",
            ratingValue: book.rating,
            reviewCount: book.reviewCount,
          }
        : undefined,
    offers: {
      "@type": "Offer",
      price: book.free ? 0 : book.priceKZ,
      priceCurrency: "AOA",
      availability: "https://schema.org/InStock",
      url: `${SITE_URL}/livro/${book.slug}`,
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Início", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Catálogo", item: `${SITE_URL}/catalogo` },
      {
        "@type": "ListItem",
        position: 3,
        name: book.title,
        item: `${SITE_URL}/livro/${book.slug}`,
      },
    ],
  };

  return (
    <div>
      {/* Dados estruturados para motores de busca — melhora a apresentação nos
          resultados (preço, avaliação) e é um canal de aquisição de baixo custo */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <section className="border-b border-line bg-cream-deep/60">
        <div className="mx-auto max-w-6xl px-5 py-6 sm:px-8">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs font-medium text-foreground/60">
            <Link href="/" className="transition-colors hover:text-brand">
              Início
            </Link>
            <span aria-hidden="true">/</span>
            <Link href="/catalogo" className="transition-colors hover:text-brand">
              Catálogo
            </Link>
            <span aria-hidden="true">/</span>
            <span className="text-ink" aria-current="page">
              {book.title}
            </span>
          </nav>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
        <div className="grid gap-10 sm:grid-cols-[280px_1fr] sm:gap-14">
          <div className="mx-auto w-full max-w-[280px] sm:mx-0">
            <BookCover book={book} index={0} className="rounded-2xl" />
          </div>

          <div>
            <span className="inline-block rounded-full bg-cream px-3 py-1 text-xs font-medium uppercase tracking-wide text-ink">
              {book.category}
            </span>

            <h1 className="mt-4 font-serif text-2xl font-semibold leading-tight text-ink sm:text-3xl">
              {book.title}
            </h1>
            <p className="mt-2 text-base text-foreground/60">{book.author}</p>

            {book.description && (
              <p className="mt-6 max-w-2xl text-sm leading-relaxed text-foreground/75 sm:text-base">
                {book.description}
              </p>
            )}

            <BookPurchasePanel book={book} />

            <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-line pt-6 text-sm sm:max-w-md">
              <div>
                <dt className="text-xs uppercase tracking-wide text-foreground/45">
                  Editora
                </dt>
                <dd className="mt-1 font-medium text-ink">{book.editora}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-foreground/45">
                  Categoria
                </dt>
                <dd className="mt-1 font-medium text-ink">{book.category}</dd>
              </div>
              {book.year && (
                <div>
                  <dt className="text-xs uppercase tracking-wide text-foreground/45">
                    Ano de publicação
                  </dt>
                  <dd className="mt-1 font-medium text-ink">{book.year}</dd>
                </div>
              )}
              {book.pages && (
                <div>
                  <dt className="text-xs uppercase tracking-wide text-foreground/45">
                    Páginas
                  </dt>
                  <dd className="mt-1 font-medium text-ink">{book.pages}</dd>
                </div>
              )}
              <div>
                <dt className="text-xs uppercase tracking-wide text-foreground/45">
                  Idioma
                </dt>
                <dd className="mt-1 font-medium text-ink">Português</dd>
              </div>
              {book.isbn && (
                <div>
                  <dt className="text-xs uppercase tracking-wide text-foreground/45">
                    ISBN
                  </dt>
                  <dd className="mt-1 font-medium text-ink">{book.isbn}</dd>
                </div>
              )}
            </dl>

            <BookReviews slug={book.slug} />
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="border-t border-line bg-cream-deep/60">
          <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-16">
            <span className="text-xs font-semibold uppercase tracking-widest text-brand">
              Continuar a explorar
            </span>
            <h2 className="mt-2 font-serif text-xl font-semibold text-ink sm:text-2xl">
              Também em {book.category}
            </h2>

            <div className="mt-8 grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-4">
              {related.map((relatedBook, index) => (
                <BookCard key={relatedBook.slug} book={relatedBook} index={index} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
