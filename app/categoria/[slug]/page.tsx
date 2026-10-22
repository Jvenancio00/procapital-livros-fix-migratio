import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { FileDown } from "lucide-react";
import BookCard from "@/components/BookCard";
import PageHeader from "@/components/PageHeader";
import { getCategoryBySlug } from "@/lib/categories";
import { getAllCatalogBooks } from "@/lib/catalog";
import { SITE_URL } from "@/lib/site";
import { DEFAULT_OG_IMAGE, getEditoraSlugForName } from "@/lib/seo";
import { toCatalogBook } from "@/lib/book-view";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

const MAIN_CATEGORY_LINKS = [
  { slug: "escolar", label: "Escolar" },
  { slug: "ficcao", label: "Ficção" },
  { slug: "infantil", label: "Infantil" },
  { slug: "nao-ficcao", label: "Não-ficção" },
];

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) {
    return {
      title: "Categoria não encontrada",
      description:
        "A categoria solicitada não foi encontrada no catálogo editorial da Pro Capital.",
      robots: { index: false, follow: true },
    };
  }

  const title = `${category.name} — Catálogo Editorial`;
  const description =
    category.description ??
    `Explore os livros da categoria ${category.name} distribuídos pela Pro Capital em Moçambique, Angola, Portugal e Brasil.`;

  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/categoria/${category.slug}` },
    openGraph: {
      title: `${title} | Pro Capital`,
      description,
      url: `${SITE_URL}/categoria/${category.slug}`,
      images: [DEFAULT_OG_IMAGE],
    },
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

  const uniquePublishers = Array.from(
    new Map(
      books.map((b) => [b.editora.toLowerCase(), { name: b.editora, slug: getEditoraSlugForName(b.editora) }]),
    ).values(),
  ).sort((a, b) => a.name.localeCompare(b.name, "pt"));

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
    numberOfItems: books.length,
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
        <div className="mb-6 flex flex-wrap items-center gap-2">
          {MAIN_CATEGORY_LINKS.map((item) => (
            <Link
              key={item.slug}
              href={`/categoria/${item.slug}`}
              className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition-colors ${
                item.slug === category.slug
                  ? "border-brand bg-brand text-white"
                  : "border-line bg-white text-ink hover:border-brand hover:text-brand"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {category.children.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-2">
            {category.children.map((sub) => (
              <Link
                key={sub.id}
                href={`/categoria/${sub.slug}`}
                className="rounded-full border border-line bg-cream/60 px-4 py-1.5 text-xs font-semibold text-ink transition-colors hover:border-brand hover:text-brand"
              >
                {sub.name}
              </Link>
            ))}
          </div>
        )}

        {uniquePublishers.length > 0 && (
          <div className="mb-8 rounded-2xl border border-line bg-white p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-ink/55">
                Editoras com títulos em {category.name}
              </span>
              <Link
                href="/editoras"
                className="text-xs font-semibold text-brand hover:underline"
              >
                Ver todas as editoras →
              </Link>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {uniquePublishers.map((ed) => (
                <Link
                  key={ed.slug}
                  href={`/editoras/${ed.slug}`}
                  className="rounded-full border border-line bg-cream/55 px-3.5 py-1 text-xs font-medium text-ink transition-colors hover:border-brand hover:text-brand"
                >
                  {ed.name}
                </Link>
              ))}
            </div>
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
