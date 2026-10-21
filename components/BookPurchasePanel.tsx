"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Check,
  Download,
  FileSpreadsheet,
  Heart,
  ShoppingCart,
} from "lucide-react";
import type { Book } from "@/data/books";
import { formatMoney, getPriceInCurrency } from "@/lib/currency";
import StarRating from "@/components/StarRating";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useCurrency } from "@/context/CurrencyContext";
import { MARKET_LIST, MARKETS } from "@/lib/markets";

export default function BookPurchasePanel({ book }: { book: Book }) {
  const { addItem } = useCart();
  const { toggle, isFavorite } = useWishlist();
  const { currency, market, setMarket } = useCurrency();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const favorite = isFavorite(book.slug);
  const activePrice = getPriceInCurrency(book, currency);
  const availableStock = book.stockByMarket
    ? (book.stockByMarket[market] ?? 0)
    : 20;
  const isMarketActive =
    book.free ||
    (activePrice > 0 &&
      (!book.activeMarkets || book.activeMarkets.includes(market)));
  const canBuyNow =
    isMarketActive && (availableStock > 0 || Boolean(book.allowPreorder));

  function handleAdd() {
    const safeQty = Math.max(
      1,
      availableStock > 0 ? Math.min(qty, availableStock) : qty,
    );
    addItem(book, safeQty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  return (
    <div className="mt-6 rounded-2xl border border-line bg-white p-6">
      {typeof book.rating === "number" && (book.reviewCount ?? 0) > 0 && (
        <div className="mb-4">
          <StarRating
            rating={book.rating}
            reviewCount={book.reviewCount}
            size={15}
          />
        </div>
      )}

      {/* Preço Comercial & Disponibilidade Real no Mercado Selecionado */}
      <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-line/80 pb-5">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink/55">
            Preço Comercial · {MARKETS[market].name} ({MARKETS[market].isoCurrency})
          </p>
          <p className="mt-1 font-serif text-3xl font-bold text-ink">
            {book.free
              ? "Acesso Digital Gratuito"
              : isMarketActive
              ? formatMoney(activePrice, currency)
              : "Sob consulta comercial"}
          </p>
        </div>

        <span
          className={`rounded-full border px-3 py-1 text-xs font-semibold ${
            book.free || availableStock > 0
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : book.allowPreorder
              ? "border-sky-200 bg-sky-50 text-sky-800"
              : "border-amber-200 bg-amber-50 text-amber-800"
          }`}
        >
          {book.free
            ? "Disponível imediatamente"
            : availableStock > 0
            ? `Em stock em ${MARKETS[market].capitalHub} (${availableStock} un.)`
            : book.allowPreorder
            ? "Pré-encomenda autorizada"
            : "Sem stock local imediato · Pedido de cotação"}
        </span>
      </div>

      {/* Grelha Multi-Mercado Transparente */}
      {!book.free && (
        <div className="mt-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-ink/50">
            Disponibilidade e preço oficial por mercado
          </p>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {MARKET_LIST.map((m) => {
              const priceInM = getPriceInCurrency(book, m.currency);
              const stockInM = book.stockByMarket?.[m.code] ?? 0;
              const enabledInM =
                priceInM > 0 &&
                (!book.activeMarkets || book.activeMarkets.includes(m.code));
              const isSelected = market === m.code;

              return (
                <button
                  key={m.code}
                  type="button"
                  onClick={() => setMarket(m.code)}
                  className={`rounded-xl border p-2.5 text-left transition-colors ${
                    isSelected
                      ? "border-brand bg-cream/80 ring-1 ring-brand"
                      : "border-line/80 bg-cream/30 hover:border-ink/30"
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] font-semibold text-ink">
                    <span>{m.shortName}</span>
                    <span className="text-ink/50">{m.code}</span>
                  </div>
                  <p className="mt-1 font-serif text-sm font-bold text-ink">
                    {enabledInM
                      ? formatMoney(priceInM, m.currency)
                      : "Sob cotação"}
                  </p>
                  <p className="mt-0.5 text-[10px] text-ink/60">
                    {stockInM > 0 ? `${stockInM} un.` : "Sob consulta"}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Ações Principais */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        {book.free ? (
          <>
            {book.downloadUrl && (
              <a
                href={book.downloadUrl}
                download
                className="inline-flex items-center justify-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
              >
                <Download size={16} />
                Baixar PDF Gratuito
              </a>
            )}
            <Link
              href={`/loja/leitor/${book.slug}`}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-ink/90"
            >
              <BookOpen size={16} />
              Ler online com notas
            </Link>
          </>
        ) : canBuyNow ? (
          <>
            <div className="inline-flex items-center rounded-full border border-line bg-cream/50 px-2">
              <button
                type="button"
                aria-label="Diminuir quantidade"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="px-2.5 py-2 text-sm font-bold text-ink"
              >
                −
              </button>
              <input
                type="number"
                min={1}
                max={availableStock > 0 ? availableStock : 500}
                value={qty}
                onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
                aria-label="Quantidade"
                className="w-12 bg-transparent text-center text-sm font-semibold text-ink focus:outline-none"
              />
              <button
                type="button"
                aria-label="Aumentar quantidade"
                onClick={() =>
                  setQty((q) =>
                    availableStock > 0 ? Math.min(availableStock, q + 1) : q + 1,
                  )
                }
                className="px-2.5 py-2 text-sm font-bold text-ink"
              >
                +
              </button>
            </div>

            <button
              type="button"
              onClick={handleAdd}
              className={`inline-flex flex-1 items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white transition-colors sm:flex-none ${
                added ? "bg-emerald-700" : "bg-brand hover:bg-brand-dark"
              }`}
            >
              {added ? (
                <>
                  <Check size={16} />
                  Adicionado ao carrinho
                </>
              ) : (
                <>
                  <ShoppingCart size={16} />
                  Adicionar ao carrinho
                </>
              )}
            </button>
          </>
        ) : (
          <Link
            href={`/cotacoes?livro=${encodeURIComponent(book.slug)}&qtd=${qty}&pais=${market}`}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
          >
            <FileSpreadsheet size={16} />
            Solicitar cotação comercial
          </Link>
        )}

        <button
          type="button"
          onClick={() => toggle(book.slug)}
          className={`inline-flex items-center justify-center gap-2 rounded-full border px-5 py-3 text-sm font-semibold transition-colors ${
            favorite
              ? "border-brand bg-brand/5 text-brand"
              : "border-line text-ink hover:border-brand/40"
          }`}
        >
          <Heart size={16} className={favorite ? "fill-brand" : ""} />
          {favorite ? "Nos favoritos" : "Favoritar"}
        </button>
      </div>

      {/* Atalhos B2B / Escolares */}
      <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-line/70 pt-4 text-xs">
        <Link
          href={`/cotacoes?livro=${encodeURIComponent(book.slug)}&qtd=${Math.max(qty, 10)}&pais=${market}`}
          className="inline-flex items-center gap-1.5 font-semibold text-brand hover:underline"
        >
          <FileSpreadsheet size={14} />
          Pedir cotação para livraria, escola ou volume (+10 un.)
        </Link>
        <span className="text-ink/35">·</span>
        <span className="text-ink/60">{MARKETS[market].estimatedDeliveryDays}</span>
      </div>
    </div>
  );
}
