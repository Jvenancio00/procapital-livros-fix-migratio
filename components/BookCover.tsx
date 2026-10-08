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
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-cream-deep px-4 py-5 text-center">
          <BookOpen
            size={28}
            strokeWidth={1.4}
            className="shrink-0 text-ink/35"
            aria-hidden="true"
          />
          <span className="line-clamp-4 font-serif text-sm font-semibold leading-snug text-ink">
            {book.title}
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
