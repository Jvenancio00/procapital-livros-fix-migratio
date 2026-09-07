/**
 * Tipos de leitura das entidades usadas pela UI.
 *
 * Espelham `prisma/schema.prisma` mas não dependem do client gerado — ver
 * a explicação em `lib/enums.ts`. Só os campos consumidos pelos componentes
 * são obrigatórios, para que tanto o Prisma real como o mock em memória de
 * `lib/prisma.ts` satisfaçam a mesma forma.
 */
import type { TipoEvento } from "./enums";

export type EventoView = {
  id: string;
  slug: string;
  titulo: string;
  tipo: TipoEvento | string;
  descricao: string;
  local: string;
  endereco?: string | null;
  imageUrl?: string | null;
  dataInicio: Date;
  dataFim?: Date | null;
  capacidade?: number | null;
  editora?: string | null;
  livroSlug?: string | null;
};

export type PriceView = {
  currency: string;
  amount: number | string | { toString(): string };
};

export type BookView = {
  id?: string;
  slug: string;
  title: string;
  author?: string | null;
  isbn?: string | null;
  coverUrl?: string | null;
  synopsis?: string | null;
  prices?: PriceView[];
};

export type CategoryView = {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  parentId?: string | null;
  children?: CategoryView[];
  books?: BookView[];
  _count?: { books?: number };
};

/** Livro tal como devolvido pelas queries com `include: { prices: true }`. */
export type BookWithPrices = {
  id: string;
  slug: string;
  title: string;
  author: string;
  editora: string | null;
  editoraRef?: { name: string } | null;
  description?: string | null;
  isbn?: string | null;
  coverUrl?: string | null;
  pdfUrl?: string | null;
  pages?: number | null;
  year?: number | null;
  free?: boolean | null;
  featured?: boolean | null;
  prices: { currency: string; amount: unknown }[];
};

/** Categoria com filhos e livros (ver `getCategoryBySlug`). */
export type CategoryWithBooks = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  faq: unknown;
  parent: { slug: string; name: string } | null;
  children: { id: string; slug: string; name: string }[];
  books: BookWithPrices[];
};

/** Evento com a contagem de inscrições confirmadas. */
export type EventoComVagas = EventoView & {
  _count: { inscricoes: number };
};

/** Item da biblioteca pessoal de um leitor. */
export type LibraryItemView = {
  id: string;
  source: string;
  acquiredAt: Date | string;
  book: {
    slug: string;
    title: string;
    author: string;
    pdfUrl?: string | null;
  };
};

/** Avaliação de um livro, com o autor incluído. */
export type ReviewView = {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: Date;
  user: { name: string | null };
};
