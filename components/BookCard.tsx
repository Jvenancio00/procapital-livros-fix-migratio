"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Check,
  Download,
  FileSpreadsheet,
  Heart,
  MapPin,
  ShoppingCart,
} from "lucide-react";
import type { Book } from "@/data/books";
import { formatMoney, getPriceInCurrency } from "@/lib/currency";
import BookCover from "@/components/BookCover";
import StarRating from "@/components/StarRating";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useCurrency } from "@/context/CurrencyContext";
import { useLanguage } from "@/context/LanguageContext";
import { MARKETS } from "@/lib/markets";

export default function BookCard({
  book,
  index = 0,
}: {
  book: Book;
  index?: number;
}) {
  const { addItem } = useCart();
  const { toggle, isFavorite } = useWishlist();
  const { currency, market } = useCurrency();
  const { dict } = useLanguage();
  const [justAdded, setJustAdded] = useState(false);

  const favorite = isFavorite(book.slug);
  const marketPrice = getPriceInCurrency(book, currency);
  const availableStock = book.stockByMarket
    ? (book.stockByMarket[market] ?? 0)
    : 20;
  const isMarketEnabled =
    book.free ||
    (marketPrice > 0 && (!book.activeMarkets || book.activeMarkets.includes(market)));
  const canBuyNow =
    isMarketEnabled && (availableStock > 0 || Boolean(book.allowPreorder));

  const handleAdd = () => {
    addItem(book);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1600);
  };

  const availabilityBadge = book.free
    ? { label: "Acesso digital gratuito", tone: "text-emerald-700 bg-emerald-50 border-emerald-200" }
    : !isMarketEnabled
    ? { label: "Sob cotação comercial", tone: "text-amber-800 bg-amber-50 border-amber-200" }
    : availableStock > 10
    ? { label: `Disponível · ${MARKETS[market].shortName}`, tone: "text-emerald-800 bg-emerald-50/90 border-emerald-200" }
    : availableStock > 0
    ? { label: `Últimas ${availableStock} un. (${MARKETS[market].code})`, tone: "text-amber-800 bg-amber-50 border-amber-200" }
    : book.allowPreorder
    ? { label: "Pré-encomenda autorizada", tone: "text-sky-800 bg-sky-50 border-sky-200" }
    : { label: "Sem stock imediato · Cotação", tone: "text-ink/70 bg-cream-deep border-line" };

  return (
    <article className="group flex h-full flex-col rounded-2xl border border-line/90 bg-white p-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:border-ink/25 hover:shadow-md motion-reduce:transform-none">
      <div className="relative">
        <Link href={`/livro/${book.slug}`} className="block overflow-hidden rounded-xl">
          <BookCover
            book={book}
            index={index}
            preload={index < 2}
            className="rounded-xl transition-transform duration-300 group-hover:scale-[1.025] motion-reduce:transform-none"
          />
        </Link>

        <button
          type="button"
          aria-label={
            favorite
              ? dict.bookCard.removeFromFavorites
              : dict.bookCard.addToFavorites
          }
          onClick={() => toggle(book.slug)}
          className="absolute right-2.5 top-2.5 z-20 flex h-8 w-8 items-center justify-center rounded-full border border-line/70 bg-white/95 text-ink shadow-2xs transition-colors hover:border-brand/40 hover:text-brand"
        >
          <Heart
            size={15}
            className={favorite ? "fill-brand text-brand" : "text-ink/75"}
          />
        </button>
      </div>

      {/* Cabeçalho textual: Editora, Título, Autor */}
      <div className="mt-3.5 flex flex-1 flex-col">
        <div className="flex items-center justify-between gap-2 text-[11px]">
          <span className="line-clamp-1 font-semibold uppercase tracking-wider text-brand/90">
            {book.editora}
          </span>
          <span className="inline-flex shrink-0 items-center gap-0.5 text-[10px] font-medium text-ink/50">
            <MapPin size={10} aria-hidden="true" />
            {MARKETS[market].code}
          </span>
        </div>

        <Link href={`/livro/${book.slug}`} className="mt-1">
          <h3 className="line-clamp-2 font-serif text-[15px] font-semibold leading-snug text-ink transition-colors group-hover:text-brand">
            {book.title}
          </h3>
        </Link>

        <p className="mt-1 line-clamp-1 text-xs text-ink/60">{book.author}</p>

        {/* ISBN real quando disponível */}
        {book.isbn && (
          <p className="mt-1.5 font-mono text-[10px] tracking-tight text-ink/50">
            ISBN {book.isbn}
          </p>
        )}

        {/* Avaliações apenas quando existirem avaliações reais registadas na BD */}
        {typeof book.rating === "number" && (book.reviewCount ?? 0) > 0 && (
          <div className="mt-2">
            <StarRating rating={book.rating} reviewCount={book.reviewCount} />
          </div>
        )}

        {/* Espaçador empurra disponibilidade, preço e botões para o fundo alinhado */}
        <div className="mt-auto pt-3">
          <div className="flex items-center justify-between gap-2 border-t border-line/70 pt-2.5">
            <span
              className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${availabilityBadge.tone}`}
            >
              {availabilityBadge.label}
            </span>

            <span className="shrink-0 font-serif text-base font-bold text-ink">
              {book.free
                ? dict.bookCard.free
                : isMarketEnabled
                ? formatMoney(marketPrice, currency)
                : "Sob consulta"}
            </span>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <Link
              href={`/livro/${book.slug}`}
              className="inline-flex min-h-9 items-center justify-center rounded-full border border-line bg-cream/60 px-2.5 py-2 text-center text-xs font-semibold text-ink transition-colors hover:border-ink/35 hover:bg-cream-deep/70"
            >
              {dict.bookCard.viewDetails}
            </Link>

            {book.free ? (
              <a
                href={book.downloadUrl ?? `/livro/${book.slug}`}
                download={Boolean(book.downloadUrl)}
                className="inline-flex min-h-9 items-center justify-center gap-1 rounded-full bg-ink px-2.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-ink/90"
              >
                <Download size={13} />
                {dict.bookCard.download}
              </a>
            ) : canBuyNow ? (
              <button
                type="button"
                onClick={handleAdd}
                className={`inline-flex min-h-9 items-center justify-center gap-1 rounded-full px-2.5 py-2 text-xs font-semibold text-white transition-colors ${
                  justAdded
                    ? "bg-emerald-700"
                    : "bg-brand hover:bg-brand-dark"
                }`}
              >
                {justAdded ? (
                  <>
                    <Check size={13} />
                    Adicionado
                  </>
                ) : (
                  <>
                    <ShoppingCart size={13} />
                    Carrinho
                  </>
                )}
              </button>
            ) : (
              <Link
                href={`/cotacoes?livro=${encodeURIComponent(book.slug)}`}
                className="inline-flex min-h-9 items-center justify-center gap-1 rounded-full bg-ink px-2.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-ink/90"
              >
                <FileSpreadsheet size={13} />
                Cotação
              </Link>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
