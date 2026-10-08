"use client";

import { useState } from "react";
import Image from "next/image";
import { BookOpen } from "lucide-react";
import type { Book } from "@/data/books";

type CoverSource = {
  kind: "local" | "openLibrary" | "googleBooks";
  url: string;
};

type GoogleBooksResponse = {
  items?: {
    volumeInfo?: {
      imageLinks?: {
        thumbnail?: string;
      };
    };
  }[];
};

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
  const localSrc = book.coverUrl?.trim() || null;
  const isbn = book.isbn?.trim() || null;
  const openLibrarySrc = isbn
    ? `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg?default=false`
    : null;

  const [localFailed, setLocalFailed] = useState(false);
  const [openLibraryFailed, setOpenLibraryFailed] = useState(false);
  const [googleBooksSrc, setGoogleBooksSrc] = useState<string | null>(null);
  const [googleBooksFailed, setGoogleBooksFailed] = useState(false);
  const [googleBooksAttempted, setGoogleBooksAttempted] = useState(false);

  // Prefer a real local cover, then known ISBN sources, and finally a neutral
  // editorial placeholder. A missing remote cover never becomes a color block.
  const source: CoverSource | null =
    localSrc && !localFailed
      ? { kind: "local", url: localSrc }
      : openLibrarySrc && !openLibraryFailed
        ? { kind: "openLibrary", url: openLibrarySrc }
        : googleBooksSrc && !googleBooksFailed
          ? { kind: "googleBooks", url: googleBooksSrc }
          : null;

  const handleImageError = () => {
    if (!source) return;

    if (source.kind === "local") {
      setLocalFailed(true);
      return;
    }

    if (source.kind === "openLibrary") {
      setOpenLibraryFailed(true);
      if (!isbn || googleBooksAttempted) return;

      setGoogleBooksAttempted(true);
      void fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`)
        .then(async (response) => {
          if (!response.ok) return null;
          const data = (await response.json()) as GoogleBooksResponse;
          return (data.items ?? [])
            .map((item) => item.volumeInfo?.imageLinks?.thumbnail)
            .find((thumbnail): thumbnail is string => Boolean(thumbnail));
        })
        .then((thumbnail) => {
          if (thumbnail) {
            setGoogleBooksSrc(thumbnail.replace(/^http:/i, "https:"));
          }
        })
        .catch(() => {
          // If the remote lookup is unavailable, the neutral placeholder is used.
        });
      return;
    }

    setGoogleBooksFailed(true);
  };

  return (
    <div
      className={`relative flex aspect-[3/4] items-center justify-center overflow-hidden bg-cream-deep ${className}`}
    >
      {source ? (
        <Image
          src={source.url}
          alt={book.title}
          fill
          sizes={sizes}
          preload={preload}
          className="object-cover"
          onError={handleImageError}
        />
      ) : (
        <div
          className="absolute inset-0 z-10 flex flex-col justify-between px-4 py-5 text-center text-cream"
          style={{ background: placeholderGradient(book.editora || book.title) }}
        >
          <span className="mx-auto h-px w-10 bg-cream/50" aria-hidden="true" />
          <div className="flex flex-col items-center gap-2">
            <BookOpen
              size={22}
              strokeWidth={1.4}
              className="shrink-0 text-cream/70"
              aria-hidden="true"
            />
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
  // Reset image-failure state if this reusable component receives another book.
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
