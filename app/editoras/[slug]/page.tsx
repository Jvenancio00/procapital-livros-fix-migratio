import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { BookOpen, Mail, MapPin, Phone } from "lucide-react";
import { prisma } from "@/lib/prisma";
import BookCard from "@/components/BookCard";
import type { Book as StaticBook } from "@/data/books";

// Corrige "Editoras – não há página de perfil por editora nem ligação
// automática aos livros que publica": os livros agora ligam-se à editora
// por chave estrangeira (Book.editoraId -> Editora.id) em vez de apenas
// repetir o mesmo texto em dois sítios.

interface Props {
  params: Promise<{ slug: string }>;
}

async function getEditora(slug: string) {
  return prisma.editora.findUnique({
    where: { slug },
    include: { books: { include: { prices: true }, take: 40 } },
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const editora = await getEditora(slug);
  if (!editora) return {};
  return {
    title: `${editora.name} | Editoras Pro Capital`,
    description: `Catálogo de ${editora.name} distribuído pela Pro Capital.`,
  };
}

export default async function EditoraPage({ params }: Props) {
  const { slug } = await params;
  const editora = await getEditora(slug);
  if (!editora) notFound();

  return (
    <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
      <div className="flex flex-wrap items-center gap-6 border-b border-line pb-8">
        <div className="flex h-20 w-32 items-center justify-center rounded-xl bg-cream-deep/60">
          {editora.logo ? (
            <Image src={editora.logo} alt={editora.name} width={120} height={48} className="max-h-12 w-auto object-contain" />
          ) : (
            <BookOpen size={24} className="text-foreground/40" />
          )}
        </div>
        <div>
          <h1 className="font-serif text-2xl font-semibold text-ink sm:text-3xl">{editora.name}</h1>
          {editora.country && <p className="text-sm text-foreground/60">{editora.country}</p>}
          <ul className="mt-2 flex flex-wrap gap-4 text-xs text-foreground/60">
            {editora.phone && (
              <li className="flex items-center gap-1.5">
                <Phone size={12} /> {editora.phone}
              </li>
            )}
            {editora.email && (
              <li className="flex items-center gap-1.5">
                <Mail size={12} /> {editora.email}
              </li>
            )}
            {editora.address && (
              <li className="flex items-center gap-1.5">
                <MapPin size={12} /> {editora.address}
              </li>
            )}
          </ul>
        </div>
      </div>

      <h2 className="mt-10 font-serif text-lg font-semibold text-ink">
        Catálogo desta editora ({editora.books.length})
      </h2>

      <div className="mt-6 grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-4">
        {editora.books.map((book, index) => (
          <BookCard
            key={book.slug}
            index={index}
            book={
              {
                slug: book.slug,
                title: book.title,
                author: book.author,
                editora: editora.name,
                category: "Não-ficção" as StaticBook["category"],
                price: Number(book.prices.find((p) => p.currency === "MT")?.amount ?? 0),
                priceKZ: Number(book.prices.find((p) => p.currency === "KZ")?.amount ?? 0),
                priceEUR: Number(book.prices.find((p) => p.currency === "EUR")?.amount ?? 0),
                priceBRL: Number(book.prices.find((p) => p.currency === "BRL")?.amount ?? 0),
                coverUrl: book.coverUrl ?? undefined,
                free: book.free,
              } as StaticBook
            }
          />
        ))}
      </div>

      {editora.books.length === 0 && (
        <p className="mt-6 text-sm text-foreground/60">
          Ainda não há livros associados a esta editora na base de dados.
        </p>
      )}
    </div>
  );
}
