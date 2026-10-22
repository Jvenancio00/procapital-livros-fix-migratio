import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import BookCard from "@/components/BookCard";
import BookCover from "@/components/BookCover";
import BookPurchasePanel from "@/components/BookPurchasePanel";
import BookReviews from "@/components/BookReviews";
import { SITE_URL } from "@/lib/site";
import {
  DEFAULT_OG_IMAGE,
  buildBreadcrumbJsonLd,
  getCategorySlugForName,
  getEditoraSlugForName,
} from "@/lib/seo";
import { prisma } from "@/lib/prisma";
import { getFrequentlyBoughtTogether } from "@/lib/cross-sell";
import { getAllCatalogBooks, getCatalogBookBySlug } from "@/lib/catalog";
import { EDUCATION_LEVEL_LABELS } from "@/lib/enums";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  if (slug === "livro-gratuito") {
    redirect("/livro-digital");
  }
  const book = await getCatalogBookBySlug(slug);

  if (!book) {
    notFound();
  }

  const description =
    book.description ??
    `${book.title}, de ${book.author} (${book.editora}), disponível no catálogo editorial da Pro Capital para Moçambique, Angola, Portugal e Brasil.`;

  return {
    title: `${book.title} — ${book.author}`,
    description,
    alternates: { canonical: `${SITE_URL}/livro/${book.slug}` },
    openGraph: {
      title: `${book.title} — ${book.author} | Pro Capital`,
      description,
      url: `${SITE_URL}/livro/${book.slug}`,
      siteName: "Pro Capital",
      type: "book",
      locale: "pt_MZ",
      images: book.coverUrl
        ? [
            {
              url: `${SITE_URL}${book.coverUrl}`,
              alt: `Capa do livro ${book.title} — ${book.editora}`,
            },
          ]
        : [DEFAULT_OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: `${book.title} — ${book.author} | Pro Capital`,
      description,
      images: book.coverUrl ? [`${SITE_URL}${book.coverUrl}`] : ["/og-image.jpg"],
    },
  };
}

export default async function LivroPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (slug === "livro-gratuito") {
    redirect("/livro-digital");
  }

  const [book, allBooks] = await Promise.all([
    getCatalogBookBySlug(slug),
    getAllCatalogBooks(),
  ]);

  if (!book) {
    notFound();
  }

  const categorySlug = getCategorySlugForName(book.category);
  const editoraSlug = getEditoraSlugForName(book.editora);

  let crossSellSlugs: string[] = [];
  let soldLast30Days = 0;
  try {
    if (book.id) {
      const boughtTogether = await getFrequentlyBoughtTogether(book.id);
      crossSellSlugs = boughtTogether.map((b) => b.slug);

      const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const sales = await prisma.orderItem.aggregate({
        where: {
          bookId: book.id,
          order: {
            status: { in: ["PAID", "PROCESSING", "SHIPPED", "COMPLETED"] },
            createdAt: { gte: since },
          },
        },
        _sum: { quantity: true },
      });
      soldLast30Days = sales._sum.quantity ?? 0;
    }
  } catch {
    // fallback silencioso
  }

  const sameCategory = allBooks
    .filter((b) => b.slug !== book.slug && b.category === book.category)
    .slice(0, 4);

  const samePublisher = allBooks
    .filter(
      (b) =>
        b.slug !== book.slug &&
        b.editora.toLowerCase() === book.editora.toLowerCase(),
    )
    .slice(0, 4);

  const relatedBooks =
    crossSellSlugs.length > 0
      ? crossSellSlugs
          .map((s) => allBooks.find((b) => b.slug === s))
          .filter((b): b is (typeof allBooks)[number] => Boolean(b))
      : sameCategory;

  const relatedHeading =
    crossSellSlugs.length > 0 ? "Compre também" : `Também em ${book.category}`;

  const breadcrumbs = [
    { label: "Início", href: "/" },
    { label: "Catálogo", href: "/catalogo" },
    { label: book.category, href: `/categoria/${categorySlug}` },
    { label: book.title },
  ];

  const breadcrumbJsonLd = buildBreadcrumbJsonLd(
    breadcrumbs,
    `/livro/${book.slug}`,
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Book",
    name: book.title,
    url: `${SITE_URL}/livro/${book.slug}`,
    image: book.coverUrl ? `${SITE_URL}${book.coverUrl}` : undefined,
    author: { "@type": "Person", name: book.author },
    isbn: book.isbn,
    bookFormat: "https://schema.org/Paperback",
    inLanguage: "pt",
    numberOfPages: book.pages,
    datePublished: book.year ? String(book.year) : undefined,
    description: book.description,
    genre: book.category,
    publisher: {
      "@type": "Organization",
      name: book.editora,
      url: `${SITE_URL}/editoras/${editoraSlug}`,
    },
    offers: {
      "@type": "Offer",
      price: book.free ? 0 : book.price,
      priceCurrency: "MZN",
      availability: "https://schema.org/InStock",
      url: `${SITE_URL}/livro/${book.slug}`,
      seller: { "@id": `${SITE_URL}/#organization` },
    },
  };

  return (
    <div className="pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-7xl px-5 pt-8 sm:px-8">
        <nav
          aria-label="Navegação estrutural"
          className="flex flex-wrap items-center gap-1.5 text-xs font-medium text-ink/55"
        >
          <Link href="/" className="hover:text-brand">
            Início
          </Link>
          <span aria-hidden="true">/</span>
          <Link href="/catalogo" className="hover:text-brand">
            Catálogo
          </Link>
          <span aria-hidden="true">/</span>
          <Link href={`/categoria/${categorySlug}`} className="hover:text-brand">
            {book.category}
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-ink/85" aria-current="page">
            {book.title}
          </span>
        </nav>
      </div>

      <section className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-12">
        <div className="grid gap-10 lg:grid-cols-[320px_1fr] lg:gap-14">
          <div className="mx-auto w-full max-w-[320px] lg:mx-0">
            <div className="overflow-hidden rounded-2xl border border-line bg-white p-3 shadow-sm">
              <BookCover
                book={book}
                preload
                sizes="(max-width: 1024px) 320px, 320px"
                className="rounded-xl"
              />
            </div>
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={`/categoria/${categorySlug}`}
                className="rounded-full border border-line bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wider text-ink transition-colors hover:border-brand hover:text-brand"
              >
                {book.category}
              </Link>
              {book.educationLevel && (
                <Link
                  href={`/livros-escolares?nivelEnsino=${book.educationLevel}`}
                  className="rounded-full bg-cream-deep px-3 py-1 text-xs font-semibold text-brand transition-opacity hover:opacity-85"
                >
                  {EDUCATION_LEVEL_LABELS[book.educationLevel]}
                </Link>
              )}
              {book.schoolGrade && (
                <span className="rounded-full bg-cream-deep px-3 py-1 text-xs font-medium text-ink/80">
                  {book.schoolGrade}
                </span>
              )}
            </div>

            <h1 className="mt-4 font-serif text-3xl font-semibold leading-tight text-ink sm:text-4xl">
              {book.title}
            </h1>
            <p className="mt-2 text-base font-medium text-ink/70">
              {book.author} ·{" "}
              <Link
                href={`/editoras/${editoraSlug}`}
                className="text-brand underline-offset-4 hover:underline"
              >
                {book.editora}
              </Link>
            </p>

            {book.description && (
              <p className="mt-5 max-w-3xl text-base leading-relaxed text-ink/75">
                {book.description}
              </p>
            )}

            {soldLast30Days >= 3 && (
              <p className="mt-3 text-xs font-semibold text-brand">
                {soldLast30Days} exemplares vendidos nos últimos 30 dias
              </p>
            )}

            <BookPurchasePanel book={book} />

            {/* Ficha Técnica Editorial Completa */}
            <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-4 rounded-2xl border border-line bg-white p-6 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-wider text-ink/45">
                  Editora
                </dt>
                <dd className="mt-1 font-medium text-ink">
                  <Link
                    href={`/editoras/${editoraSlug}`}
                    className="text-brand hover:underline"
                  >
                    {book.editora}
                  </Link>
                </dd>
              </div>
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-wider text-ink/45">
                  Categoria
                </dt>
                <dd className="mt-1 font-medium text-ink">
                  <Link
                    href={`/categoria/${categorySlug}`}
                    className="hover:text-brand hover:underline"
                  >
                    {book.category}
                  </Link>
                </dd>
              </div>
              {book.isbn && (
                <div>
                  <dt className="text-[11px] font-semibold uppercase tracking-wider text-ink/45">
                    ISBN
                  </dt>
                  <dd className="mt-1 font-mono text-xs font-semibold text-ink">
                    {book.isbn}
                  </dd>
                </div>
              )}
              {book.year && (
                <div>
                  <dt className="text-[11px] font-semibold uppercase tracking-wider text-ink/45">
                    Ano de Edição
                  </dt>
                  <dd className="mt-1 font-medium text-ink">{book.year}</dd>
                </div>
              )}
              {book.pages && (
                <div>
                  <dt className="text-[11px] font-semibold uppercase tracking-wider text-ink/45">
                    Páginas
                  </dt>
                  <dd className="mt-1 font-medium text-ink">{book.pages}</dd>
                </div>
              )}
              {book.subject && (
                <div>
                  <dt className="text-[11px] font-semibold uppercase tracking-wider text-ink/45">
                    Disciplina
                  </dt>
                  <dd className="mt-1 font-medium text-ink">{book.subject}</dd>
                </div>
              )}
              {book.schoolGrade && (
                <div>
                  <dt className="text-[11px] font-semibold uppercase tracking-wider text-ink/45">
                    Classe / Ano
                  </dt>
                  <dd className="mt-1 font-medium text-ink">{book.schoolGrade}</dd>
                </div>
              )}
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-wider text-ink/45">
                  Idioma
                </dt>
                <dd className="mt-1 font-medium text-ink">Português</dd>
              </div>
              {book.countryOrigin && (
                <div>
                  <dt className="text-[11px] font-semibold uppercase tracking-wider text-ink/45">
                    País de Origem
                  </dt>
                  <dd className="mt-1 font-medium text-ink">{book.countryOrigin}</dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <BookReviews slug={book.slug} />
      </div>

      {samePublisher.length > 0 && (
        <section className="mx-auto mt-16 max-w-7xl border-t border-line/80 px-5 pt-14 sm:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand">
                Mesma Chancela Editorial
              </span>
              <h2 className="mt-1 font-serif text-2xl font-semibold text-ink sm:text-3xl">
                Mais títulos de {book.editora}
              </h2>
            </div>
            <Link
              href={`/editoras/${editoraSlug}`}
              className="text-sm font-semibold text-brand hover:underline"
            >
              Ver catálogo completo de {book.editora} →
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {samePublisher.map((item, idx) => (
              <BookCard key={item.slug} book={item} index={idx} />
            ))}
          </div>
        </section>
      )}

      {relatedBooks.length > 0 && (
        <section className="mx-auto mt-16 max-w-7xl border-t border-line/80 px-5 pt-14 sm:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="font-serif text-2xl font-semibold text-ink sm:text-3xl">
              {relatedHeading}
            </h2>
            <div className="flex flex-wrap items-center gap-4 text-sm font-semibold">
              <Link
                href={`/categoria/${categorySlug}`}
                className="text-brand hover:underline"
              >
                Ver categoria {book.category} →
              </Link>
              <Link
                href="/catalogo"
                className="text-ink/70 hover:text-brand hover:underline"
              >
                Catálogo completo →
              </Link>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {relatedBooks.map((item, idx) => (
              <BookCard key={item.slug} book={item} index={idx} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
