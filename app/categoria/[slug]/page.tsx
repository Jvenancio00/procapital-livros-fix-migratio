import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import BookCard from "@/components/BookCard";
import { getCategoryBySlug } from "@/lib/categories";
import { SITE_URL } from "@/lib/site";
import type { Book as StaticBook } from "@/data/books";

// Página gerada automaticamente por categoria — corrige "Problema 4 – SEO
// perdido": cada categoria passa a ter a sua própria página com metadata,
// descrição, FAQ e Schema.org, sem precisar de código novo por categoria.

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return {};

  const title = `${category.name} | Catálogo Pro Capital`;
  const description =
    category.description ??
    `Explore os livros da categoria ${category.name} disponíveis na Pro Capital.`;

  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/categoria/${category.slug}` },
    openGraph: { title, description, url: `${SITE_URL}/categoria/${category.slug}` },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const faq = category.faq as { pergunta: string; resposta: string }[] | null;

  // Schema.org (CollectionPage + FAQPage quando há FAQ) — corrige a falta
  // de dados estruturados apontada no relatório.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: category.name,
    description: category.description ?? undefined,
    url: `${SITE_URL}/categoria/${category.slug}`,
  };
  const faqJsonLd = faq?.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faq.map((f) => ({
          "@type": "Question",
          name: f.pergunta,
          acceptedAnswer: { "@type": "Answer", text: f.resposta },
        })),
      }
    : null;

  return (
    <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}

      {category.parent && (
        <Link
          href={`/categoria/${category.parent.slug}`}
          className="text-xs font-medium text-brand hover:underline"
        >
          ← {category.parent.name}
        </Link>
      )}

      <h1 className="mt-2 font-serif text-2xl font-semibold text-ink sm:text-3xl">
        {category.name}
      </h1>
      {category.description && (
        <p className="mt-3 max-w-2xl text-foreground/70">{category.description}</p>
      )}

      {category.children.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {category.children.map((child) => (
            <Link
              key={child.id}
              href={`/categoria/${child.slug}`}
              className="rounded-full border border-line px-4 py-1.5 text-xs font-medium text-ink hover:border-brand/40"
            >
              {child.name}
            </Link>
          ))}
        </div>
      )}

      <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-4">
        {category.books.map((book, index) => (
          <BookCard
            key={book.slug}
            index={index}
            book={
              {
                slug: book.slug,
                title: book.title,
                author: book.author,
                editora: book.editoraRef?.name ?? book.editora,
                category: category.name as StaticBook["category"],
                price: Number(book.prices.find((p) => p.currency === "MT")?.amount ?? 0),
                priceKZ: Number(book.prices.find((p) => p.currency === "KZ")?.amount ?? 0),
                priceEUR: Number(book.prices.find((p) => p.currency === "EUR")?.amount ?? 0),
                priceBRL: Number(book.prices.find((p) => p.currency === "BRL")?.amount ?? 0),
                coverUrl: book.coverUrl ?? undefined,
                isbn: book.isbn ?? undefined,
                description: book.description ?? undefined,
                pages: book.pages ?? undefined,
                year: book.year ?? undefined,
                free: book.free,
              } as StaticBook
            }
          />
        ))}
      </div>

      {category.books.length === 0 && (
        <p className="mt-10 text-sm text-foreground/60">
          Ainda não há livros associados a esta categoria.
        </p>
      )}

      {faq && faq.length > 0 && (
        <div className="mt-16 border-t border-line pt-10">
          <h2 className="font-serif text-xl font-semibold text-ink">
            Perguntas frequentes
          </h2>
          <div className="mt-6 space-y-6">
            {faq.map((f) => (
              <div key={f.pergunta}>
                <p className="font-medium text-ink">{f.pergunta}</p>
                <p className="mt-1 text-sm text-foreground/70">{f.resposta}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
