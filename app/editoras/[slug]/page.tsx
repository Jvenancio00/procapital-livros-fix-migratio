import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { FileDown, FileSpreadsheet, Globe, Mail, MapPin, Phone } from "lucide-react";
import { prisma } from "@/lib/prisma";
import BookCard from "@/components/BookCard";
import EditoraMark from "@/components/EditoraMark";
import PageHeader from "@/components/PageHeader";
import { getAllCatalogBooks } from "@/lib/catalog";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

async function getEditora(slug: string) {
  try {
    const dbRow = await prisma.editora.findUnique({ where: { slug } });
    if (dbRow) return dbRow;
  } catch {
    // Fallback para lista de editoras de catálogo
  }
  const { EDITORAS } = await import("@/data/editoras");
  const fb = EDITORAS.find((e) => e.slug === slug);
  if (!fb) return null;
  return {
    id: fb.slug,
    slug: fb.slug,
    name: fb.name,
    country: fb.country ?? null,
    logo: fb.logo ?? null,
    phone: fb.phone ?? null,
    email: fb.email ?? null,
    address: fb.address ?? null,
    website: fb.website ?? null,
    description: null,
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const editora = await getEditora(slug);
  if (!editora) return { title: "Editora não encontrada | Pro Capital" };
  return {
    title: `${editora.name} | Editoras Pro Capital`,
    description: `Catálogo editorial de ${editora.name} distribuído pela Pro Capital.`,
  };
}

export default async function EditoraPage({ params }: Props) {
  const { slug } = await params;
  const [editora, allBooks] = await Promise.all([
    getEditora(slug),
    getAllCatalogBooks(),
  ]);

  if (!editora) notFound();

  const publisherBooks = allBooks.filter(
    (b) => b.editora.toLowerCase() === editora.name.toLowerCase(),
  );

  return (
    <div className="pb-20">
      <PageHeader
        eyebrow={`Editora Parceira${editora.country ? ` · ${editora.country}` : ""}`}
        title={editora.name}
        description="Obras, manuais escolares e edições literárias distribuídas comercialmente pela Pro Capital."
        breadcrumbs={[
          { label: "Início", href: "/" },
          { label: "Editoras", href: "/editoras" },
          { label: editora.name },
        ]}
        actions={
          <>
            <a
              href={`/api/catalogo/pdf?editora=${encodeURIComponent(editora.name)}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2.5 text-xs font-semibold text-ink hover:border-brand/40 hover:text-brand"
            >
              <FileDown size={14} />
              <span>Exportar Catálogo PDF</span>
            </a>
            <Link
              href={`/cotacoes`}
              className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-xs font-semibold text-white hover:bg-brand-dark"
            >
              <FileSpreadsheet size={14} />
              <span>Pedir Cotação desta Editora</span>
            </Link>
          </>
        }
      />

      <section className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="mb-10 flex flex-wrap items-center justify-between gap-6 rounded-2xl border border-line bg-white p-6">
          <div className="flex items-center gap-5">
            <div className="flex h-20 w-40 items-center justify-center rounded-xl border border-line/70 bg-cream/60 px-3">
              {editora.logo ? (
                <Image
                  src={editora.logo}
                  alt={editora.name}
                  width={180}
                  height={72}
                  className="max-h-14 w-auto object-contain"
                />
              ) : (
                <EditoraMark name={editora.name} country={editora.country ?? undefined} />
              )}
            </div>
            <div className="space-y-1.5 text-xs text-ink/70">
              {editora.address && (
                <p className="flex items-center gap-2">
                  <MapPin size={14} className="text-brand" />
                  <span>{editora.address}</span>
                </p>
              )}
              {editora.phone && (
                <p className="flex items-center gap-2">
                  <Phone size={14} className="text-brand" />
                  <span>{editora.phone}</span>
                </p>
              )}
              {editora.email && (
                <p className="flex items-center gap-2">
                  <Mail size={14} className="text-brand" />
                  <span>{editora.email}</span>
                </p>
              )}
              {editora.website && (
                <p className="flex items-center gap-2">
                  <Globe size={14} className="text-brand" />
                  <a
                    href={editora.website}
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium text-brand hover:underline"
                  >
                    {editora.website}
                  </a>
                </p>
              )}
            </div>
          </div>

          <div className="text-right">
            <p className="font-serif text-3xl font-semibold text-ink">
              {publisherBooks.length}
            </p>
            <p className="text-xs text-ink/55">
              {publisherBooks.length === 1 ? "título ativo" : "títulos ativos"}
            </p>
          </div>
        </div>

        {publisherBooks.length === 0 ? (
          <div className="rounded-2xl border border-line bg-white p-10 text-center">
            <p className="font-serif text-xl font-semibold text-ink">
              Catálogo desta chancela em preparação para venda online
            </p>
            <p className="mt-2 text-sm text-ink/65">
              Pode solicitar desde já cotação ou reposição por lista ISBN junto da
              equipa comercial Pro Capital.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {publisherBooks.map((book, idx) => (
              <BookCard key={book.slug} book={book} index={idx} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
