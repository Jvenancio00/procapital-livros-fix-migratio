import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { FileDown } from "lucide-react";
import BookCard from "@/components/BookCard";
import PageHeader from "@/components/PageHeader";
import { getCategoryBySlug } from "@/lib/categories";
import { getAllCatalogBooks } from "@/lib/catalog";
import { SITE_URL } from "@/lib/site";
import { toCatalogBook } from "@/lib/book-view";

export const dynamic = "force-dynamic";

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
  const [category, catalogBooks] = await Promise.all([
    getCategoryBySlug(slug),
    getAllCatalogBooks(),
  ]);
  if (!category) notFound();

  const faq = category.faq as { pergunta: string; resposta: string }[] | null;
  const enrichedMap = new Map(catalogBooks.map((b) => [b.slug, b]));

  const books = category.books.map(
    (b) => enrichedMap.get(b.slug) ?? toCatalogBook(b, category.name),
  );

  const breadcrumbs = [
    { label: "Início", href: "/" },
    { label: "Catálogo", href: "/catalogo" },
    ...(category.parent
      ? [
          {
            label: category.parent.name,
            href: `/categoria/${category.parent.slug}`,
          },
        ]
      : []),
    { label: category.name },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: category.name,
    description: category.description ?? undefined,
    url: `${SITE_URL}/categoria/${category.slug}`,
  };

  return (
    <div className="pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <PageHeader
        eyebrow="Categoria Editorial"
        title={category.name}
        description={category.description ?? undefined}
        breadcrumbs={breadcrumbs}
        actions={
          <a
            href={`/api/catalogo/pdf?categoria=${encodeURIComponent(category.name)}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2.5 text-xs font-semibold text-ink hover:border-brand/40 hover:text-brand"
          >
            <FileDown size={14} />
            <span>Exportar PDF ({category.name})</span>
          </a>
        }
      />

      <section className="mx-auto max-w-7xl px-5 sm:px-8">
        {category.children.length > 0 && (
          <div className="mb-8 flex flex-wrap gap-2">
            {category.children.map((sub) => (
              <Link
                key={sub.id}
                href={`/categoria/${sub.slug}`}
                className="rounded-full border border-line bg-white px-4 py-1.5 text-xs font-semibold text-ink transition-colors hover:border-brand hover:text-brand"
              >
                {sub.name}
              </Link>
            ))}
          </div>
        )}

        {books.length === 0 ? (
          <div className="rounded-2xl border border-line bg-white p-12 text-center">
            <p className="font-serif text-xl font-semibold text-ink">
              Nenhum título ativo nesta subcategoria no momento
            </p>
            <p className="mt-2 text-sm text-ink/65">
              Consulte o catálogo geral ou solicite cotação comercial por ISBN.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {books.map((book, idx) => (
              <BookCard key={book.slug} book={book} index={idx} />
            ))}
          </div>
        )}

        {faq && faq.length > 0 && (
          <div className="mt-16 rounded-2xl border border-line bg-white p-8">
            <h2 className="font-serif text-2xl font-semibold text-ink">
               Perguntas frequentes
            </h2>
            <dl className="mt-6 space-y-5 divide-y divide-line/70">
              {faq.map((f) => (
                <div key={f.pergunta} className="pt-5 first:pt-0">
                  <dt className="font-semibold text-ink">{f.pergunta}</dt>
                  <dd className="mt-1.5 text-sm leading-relaxed text-ink/70">
                    {f.resposta}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </section>
    </div>
  );
}
