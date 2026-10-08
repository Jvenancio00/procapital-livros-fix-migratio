"use client";

import { useState } from "react";
import Image from "next/image";
import type { Book } from "@/data/books";
import { editoraInitials } from "@/components/EditoraMark";

type BookCoverProps = {
  book: Book;
  index?: number;
  className?: string;
  sizes?: string;
  preload?: boolean;
  showCategory?: boolean;
};

type BookCoverContentProps = Omit<BookCoverProps, "index">;

// Paleta da marca. Cada editora tem sempre a mesma cor (hash do nome), por isso
// as capas em falta de uma editora formam um conjunto coerente no catálogo.
const PLACEHOLDER_PALETTE = [
  "linear-gradient(160deg, #7a1636 0%, #c8142f 100%)",
  "linear-gradient(160deg, #123a44 0%, #0b262d 100%)",
  "linear-gradient(160deg, #e8752f 0%, #c8142f 100%)",
  "linear-gradient(160deg, #9c6b1f 0%, #d9a441 100%)",
  "linear-gradient(160deg, #1f5b66 0%, #123a44 100%)",
];

function placeholderGradient(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return PLACEHOLDER_PALETTE[hash % PLACEHOLDER_PALETTE.length];
}

function BookCoverContent({
  book,
  className = "",
  sizes = "(max-width: 639px) 42vw, (max-width: 1023px) 22vw, 18vw",
  preload = false,
  showCategory = true,
}: BookCoverContentProps) {
  // Só há um tipo de fonte de capa: o ficheiro local em /public/covers,
  // normalizado a 3:4 por `scripts/build-covers.sh`. O catálogo não faz
  // pedidos a serviços externos (Open Library, Google Books) para desenhar um
  // cartão: além de depender de terceiros em cada visita, essas capas falham
  // em muitos ISBN e deixavam o cartão preso no bloco de cor.
  const localSrc = book.coverUrl?.trim() || null;
  const [failed, setFailed] = useState(false);

  const src = localSrc && !failed ? localSrc : null;

  return (
    <div
      // As capas normalizadas já trazem a moldura branca (3:4) gravada no
      // ficheiro; o fundo é branco para essa moldura não contrastar com a
      // página, e as fotografias que enchem o cartão ficam iguais às restantes.
      className={`relative flex aspect-[3/4] items-center justify-center overflow-hidden bg-white ${className}`}
    >
      {src ? (
        <Image
          src={src}
          alt={book.title}
          fill
          sizes={sizes}
          preload={preload}
          className="object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <div
          className="absolute inset-0 z-10 flex flex-col justify-between px-4 py-5 text-center text-cream"
          style={{ background: placeholderGradient(book.editora || book.title) }}
        >
          <span className="mx-auto h-px w-10 bg-cream/50" aria-hidden="true" />
          <div className="flex flex-col items-center gap-2">
            <span
              aria-hidden="true"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-cream/30 font-serif text-xs font-semibold tracking-wide text-cream/85"
            >
              {editoraInitials(book.editora || book.title)}
            </span>
            <span className="line-clamp-4 font-serif text-sm font-semibold leading-snug text-white">
              {book.title}
            </span>
            <span className="line-clamp-2 text-[11px] leading-snug text-cream/80">
              {book.author}
            </span>
          </div>
          <span className="line-clamp-1 text-[9px] font-medium uppercase tracking-[0.18em] text-cream/65">
            {book.editora}
          </span>
        </div>
      )}

      {showCategory && (
        <span className="absolute left-2 top-2 z-20 rounded-full bg-cream/90 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide text-ink">
          {book.category}
        </span>
      )}
    </div>
  );
}

export default function BookCover(props: BookCoverProps) {
  // Reset do estado de falha se este componente reutilizável receber outro livro.
  return (
    <BookCoverContent
      key={props.book.slug}
      book={props.book}
      className={props.className}
      sizes={props.sizes}
      preload={props.preload}
      showCategory={props.showCategory}
    />
  );
}
