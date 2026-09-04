"use client";

import Link from "next/link";
import { Heart, ShoppingCart, Download } from "lucide-react";
import type { Book } from "@/data/books";
import { formatBookPrice } from "@/lib/currency";
import BookCover from "@/components/BookCover";
import StarRating from "@/components/StarRating";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useCurrency } from "@/context/CurrencyContext";
import { useLanguage } from "@/context/LanguageContext";

export default function BookCard({ book, index = 0 }: { book: Book; index?: number }) {
  const { addItem } = useCart();
  const { toggle, isFavorite } = useWishlist();
  const { currency } = useCurrency();
  const { dict } = useLanguage();
  const favorite = isFavorite(book.slug);

  return (
    <div className="group flex flex-col rounded-2xl border border-line bg-cream p-3 transition-shadow hover:shadow-sm">
      <div className="relative">
        <Link href={`/livro/${book.slug}`}>
          <BookCover
            book={book}
            index={index}
            className="rounded-xl transition-transform group-hover:scale-[1.02]"
          />
        </Link>

        <button
          type="button"
          aria-label={favorite ? dict.bookCard.removeFromFavorites : dict.bookCard.addToFavorites}
          onClick={() => toggle(book.slug)}
          className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-cream/90 text-ink transition-colors hover:text-brand"
        >
          <Heart size={15} className={favorite ? "fill-brand text-brand" : ""} />
        </button>

        {book.free && (
          <span className="absolute left-2 bottom-2 z-10 rounded-full bg-ink px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-cream">
            {dict.bookCard.free}
          </span>
        )}
      </div>

      <Link href={`/livro/${book.slug}`}>
        <h3 className="mt-3 font-serif text-sm font-semibold leading-snug text-ink group-hover:text-brand">
          {book.title}
        </h3>
      </Link>
      <p className="mt-0.5 text-xs text-foreground/55">{book.author}</p>

      {book.description && (
        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-foreground/60">
          {book.description}
        </p>
      )}

      {typeof book.rating === "number" && (
        <div className="mt-2">
          <StarRating rating={book.rating} reviewCount={book.reviewCount} />
        </div>
      )}

      <div className="mt-2 flex items-center justify-between">
        <span className="text-xs text-foreground/50">{dict.categories[book.category]}</span>
        <span className="text-sm font-semibold text-brand">
          {formatBookPrice(book, currency)}
        </span>
      </div>

      <div className="mt-3 flex gap-2">
        {book.free ? (
          <a
            href={book.downloadUrl ?? "#"}
            download
            className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-ink px-3 py-2 text-xs font-semibold text-cream transition-colors hover:bg-ink/90"
          >
            <Download size={13} />
            {dict.bookCard.download}
          </a>
        ) : (
          <button
            type="button"
            onClick={() => addItem(book)}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-brand px-3 py-2 text-xs font-semibold text-cream transition-colors hover:bg-brand-dark"
          >
            <ShoppingCart size={13} />
            {dict.bookCard.addToCart}
          </button>
        )}
        <Link
          href={`/livro/${book.slug}`}
          className="flex flex-1 items-center justify-center rounded-full border border-line px-3 py-2 text-xs font-semibold text-ink transition-colors hover:border-brand/40"
        >
          {dict.bookCard.viewDetails}
        </Link>
      </div>
    </div>
  );
}
