"use client";

import { useState } from "react";
import Image from "next/image";
import type { Book } from "@/data/books";

type BookCoverProps = {
  book: Book;
  index?: number;
  className?: string;
  sizes?: string;
  preload?: boolean;
  showCategory?: boolean;
};

type BookCoverContentProps = Omit<BookCoverProps, "index">;

function BookCoverContent({
  book,
  className = "",
  sizes = "(max-width: 639px) 44vw, (max-width: 1023px) 24vw, 18vw",
  preload = false,
  showCategory = true,
}: BookCoverContentProps) {
  const localSrc = book.coverUrl?.trim() || null;
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const src = localSrc && !failed ? localSrc : null;

  return (
    <div
      className={`relative flex aspect-[3/4] items-center justify-center overflow-hidden bg-cream-deep/60 ${className}`}
    >
      {src ? (
        <>
          {!loaded && (
            <div
              aria-hidden="true"
              className="absolute inset-0 animate-pulse bg-cream-deep"
            />
          )}
          <Image
            src={src}
            alt={`Capa do livro ${book.title} — ${book.editora}`}
            fill
            sizes={sizes}
            preload={preload}
            onLoad={() => setLoaded(true)}
            onError={() => setFailed(true)}
            className={`object-cover transition-opacity duration-300 ${
              loaded ? "opacity-100" : "opacity-0"
            }`}
          />
        </>
      ) : (
        <div className="absolute inset-0 z-10 flex flex-col justify-between bg-ink p-4 text-center text-white">
          <div className="flex flex-col items-center gap-1.5">
            <span className="h-0.5 w-8 bg-accent" aria-hidden="true" />
            <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-accent">
              Edição Editorial
            </span>
          </div>
          <div className="px-1">
            <p className="line-clamp-4 font-serif text-sm font-semibold leading-snug text-white">
              {book.title}
            </p>
            <p className="mt-2 line-clamp-2 text-[11px] leading-snug text-white/75">
              {book.author}
            </p>
          </div>
          <div className="border-t border-white/15 pt-2">
            <span className="line-clamp-1 text-[10px] font-medium tracking-wide text-white/80">
              {book.editora}
            </span>
          </div>
        </div>
      )}

      {showCategory && (
        <span className="absolute left-2.5 top-2.5 z-20 rounded-full border border-ink/10 bg-white/95 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-ink shadow-2xs">
          {book.schoolGrade ? `${book.category} · ${book.schoolGrade}` : book.category}
        </span>
      )}
    </div>
  );
}

export default function BookCover(props: BookCoverProps) {
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
