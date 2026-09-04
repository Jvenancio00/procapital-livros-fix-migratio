"use client";

import Link from "next/link";
import { ArrowRight, Heart, ShoppingCart, Download } from "lucide-react";
import type { Book } from "@/data/books";
import { formatBookPrice } from "@/lib/currency";
import StarRating from "@/components/StarRating";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useCurrency } from "@/context/CurrencyContext";

export default function BookPurchasePanel({ book }: { book: Book }) {
  const { addItem } = useCart();
  const { toggle, isFavorite } = useWishlist();
  const { currency } = useCurrency();
  const favorite = isFavorite(book.slug);

  return (
    <div>
      {typeof book.rating === "number" && (
        <div className="mt-3">
          <StarRating rating={book.rating} reviewCount={book.reviewCount} size={15} />
        </div>
      )}

      <div className="mt-6 flex items-baseline gap-3">
        <span className="font-serif text-2xl font-semibold text-brand">
          {formatBookPrice(book, currency)}
        </span>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        {book.free ? (
          <a
            href={book.downloadUrl ?? "#"}
            download
            className="inline-flex items-center justify-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-cream transition-colors hover:bg-ink/90"
          >
            <Download size={16} />
            Baixar gratuitamente
          </a>
        ) : (
          <button
            type="button"
            onClick={() => addItem(book)}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-cream transition-colors hover:bg-brand-dark"
          >
            <ShoppingCart size={16} />
            Adicionar ao Carrinho
          </button>
        )}
        <button
          type="button"
          onClick={() => toggle(book.slug)}
          className={`inline-flex items-center justify-center gap-2 rounded-full border px-6 py-3 text-sm font-semibold transition-colors ${
            favorite
              ? "border-brand bg-brand/5 text-brand"
              : "border-line text-ink hover:border-brand/40"
          }`}
        >
          <Heart size={16} className={favorite ? "fill-brand" : ""} />
          {favorite ? "Nos favoritos" : "Adicionar aos favoritos"}
        </button>
      </div>

      <div className="mt-3 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/contactos"
          className="inline-flex items-center justify-center gap-2 rounded-full border border-line px-6 py-3 text-sm font-semibold text-ink transition-colors hover:border-brand/40"
        >
          Pedir para livraria/escola
          <ArrowRight size={16} />
        </Link>
        <Link
          href="/cliente/login"
          className="inline-flex items-center justify-center gap-2 rounded-full border border-line px-6 py-3 text-sm font-semibold text-ink transition-colors hover:border-brand/40"
        >
          Encomendar via Área de Cliente
        </Link>
      </div>
    </div>
  );
}
