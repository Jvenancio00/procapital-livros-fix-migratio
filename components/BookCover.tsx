"use client";

import { useState } from "react";
import { BookOpen } from "lucide-react";
import type { Book } from "@/data/books";

const COVER_GRADIENTS = [
  "from-wine to-brand",
  "from-brand to-orange",
  "from-orange to-accent",
  "from-ink to-brand",
];

export default function BookCover({
  book,
  index = 0,
  className = "",
}: {
  book: Book;
  index?: number;
  className?: string;
}) {
  const gradient = COVER_GRADIENTS[index % COVER_GRADIENTS.length];

  // Tenta a Open Library primeiro; se não existir capa lá, tenta a Google Books;
  // se nenhuma tiver, mostra o ícone ilustrado — nunca uma capa errada.
  const [src, setSrc] = useState<string | null>(
    book.isbn
      ? `https://covers.openlibrary.org/b/isbn/${book.isbn}-L.jpg?default=false`
      : null
  );
  const [triedGoogleBooks, setTriedGoogleBooks] = useState(false);
  const [failed, setFailed] = useState(false);

  const handleError = async () => {
    if (!triedGoogleBooks && book.isbn) {
      setTriedGoogleBooks(true);
      try {
        const res = await fetch(
          `https://www.googleapis.com/books/v1/volumes?q=isbn:${book.isbn}`
        );
        const data = await res.json();
        const thumbnail = data?.items?.[0]?.volumeInfo?.imageLinks?.thumbnail as
          | string
          | undefined;
        if (thumbnail) {
          setSrc(thumbnail.replace("http://", "https://"));
          return;
        }
      } catch {
        // sem resposta da Google Books
      }
      setFailed(true);
    } else {
      setFailed(true);
    }
  };

  const showRealCover = src && !failed;

  return (
    <div
      className={`relative flex aspect-[3/4] items-center justify-center overflow-hidden bg-gradient-to-br ${gradient} ${className}`}
    >
      {showRealCover && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={`Capa de ${book.title}`}
          className="absolute inset-0 h-full w-full object-cover"
          onError={handleError}
        />
      )}

      <span className="absolute left-2 top-2 z-10 rounded-full bg-cream/90 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide text-ink">
        {book.category}
      </span>

      {!showRealCover && (
        <BookOpen
          size={40}
          strokeWidth={1.5}
          className="text-white"
          style={{ filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.35))" }}
        />
      )}
    </div>
  );
}
