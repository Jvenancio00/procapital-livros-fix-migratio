"use client";

import Link from "next/link";
import { Minus, Plus, Trash2, ArrowRight } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useCurrency } from "@/context/CurrencyContext";
import { formatMoney, getPriceInCurrency } from "@/lib/currency";
import { quantityDiscountRate, crossSellSuggestions } from "@/lib/cart-pricing";
import BookCover from "@/components/BookCover";
import BookCard from "@/components/BookCard";

export default function CarrinhoPage() {
  const { items, setQuantity, removeItem } = useCart();
  const { currency } = useCurrency();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-20 text-center sm:px-8">
        <h1 className="font-serif text-2xl font-semibold text-ink">
          O seu carrinho está vazio
        </h1>
        <p className="mt-3 text-foreground/60">
          Explore o catálogo e adicione livros ao carrinho.
        </p>
        <Link
          href="/catalogo"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-cream transition-colors hover:bg-brand-dark"
        >
          Ver catálogo
          <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  const subtotalSemDesconto = items.reduce(
    (sum, item) => sum + getPriceInCurrency(item.book, currency) * item.quantity,
    0
  );
  const desconto = items.reduce((sum, item) => {
    const rate = quantityDiscountRate(item.quantity);
    return sum + getPriceInCurrency(item.book, currency) * item.quantity * rate;
  }, 0);
  const subtotal = subtotalSemDesconto - desconto;
  const sugestoes = crossSellSuggestions(items);

  return (
    <div className="mx-auto max-w-5xl px-5 py-12 sm:px-8 sm:py-16">
      <h1 className="font-serif text-2xl font-semibold text-ink sm:text-3xl">
        Carrinho
      </h1>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col divide-y divide-line border-y border-line">
          {items.map((item) => (
            <div key={item.book.slug} className="flex gap-4 py-5">
              <div className="w-16 shrink-0">
                <BookCover book={item.book} className="rounded-lg" />
              </div>

              <div className="flex flex-1 flex-col">
                <Link
                  href={`/livro/${item.book.slug}`}
                  className="font-serif text-sm font-semibold text-ink hover:text-brand"
                >
                  {item.book.title}
                </Link>
                <span className="mt-0.5 text-xs text-foreground/55">
                  {item.book.author}
                </span>

                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 rounded-full border border-line px-2 py-1">
                    <button
                      type="button"
                      aria-label="Diminuir quantidade"
                      onClick={() =>
                        setQuantity(item.book.slug, item.quantity - 1)
                      }
                      className="flex h-6 w-6 items-center justify-center rounded-full text-ink hover:bg-cream-deep"
                    >
                      <Minus size={13} />
                    </button>
                    <span className="w-5 text-center text-sm font-medium text-ink">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      aria-label="Aumentar quantidade"
                      onClick={() =>
                        setQuantity(item.book.slug, item.quantity + 1)
                      }
                      className="flex h-6 w-6 items-center justify-center rounded-full text-ink hover:bg-cream-deep"
                    >
                      <Plus size={13} />
                    </button>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end">
                      {quantityDiscountRate(item.quantity) > 0 && (
                        <span className="text-[10px] font-medium uppercase tracking-wide text-brand">
                          -{quantityDiscountRate(item.quantity) * 100}% por quantidade
                        </span>
                      )}
                      <span className="text-sm font-semibold text-brand">
                        {formatMoney(
                          getPriceInCurrency(item.book, currency) *
                            item.quantity *
                            (1 - quantityDiscountRate(item.quantity)),
                          currency
                        )}
                      </span>
                    </div>
                    <button
                      type="button"
                      aria-label="Remover"
                      onClick={() => removeItem(item.book.slug)}
                      className="text-foreground/40 hover:text-brand"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="h-fit rounded-2xl border border-line bg-cream-deep/60 p-6">
          <h2 className="font-serif text-base font-semibold text-ink">
            Resumo da compra
          </h2>
          <div className="mt-4 flex justify-between text-sm text-foreground/70">
            <span>Subtotal</span>
            <span>{formatMoney(subtotalSemDesconto, currency)}</span>
          </div>
          {desconto > 0 && (
            <div className="mt-2 flex justify-between text-sm text-brand">
              <span>Desconto por quantidade</span>
              <span>-{formatMoney(desconto, currency)}</span>
            </div>
          )}
          <div className="mt-2 flex justify-between text-sm text-foreground/50">
            <span>Portes</span>
            <span>Calculado no checkout</span>
          </div>
          <div className="mt-4 flex justify-between border-t border-line pt-4 font-serif text-base font-semibold text-ink">
            <span>Total</span>
            <span>{formatMoney(subtotal, currency)}</span>
          </div>

          <Link
            href="/contactos"
            className="mt-6 flex items-center justify-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-cream transition-colors hover:bg-brand-dark"
          >
            Finalizar Compra
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      {sugestoes.length > 0 && (
        <div className="mt-16 border-t border-line pt-10">
          <h2 className="font-serif text-lg font-semibold text-ink">
            Quem comprou estes livros também gostou
          </h2>
          <div className="mt-6 grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-4">
            {sugestoes.map((book, index) => (
              <BookCard key={book.slug} book={book} index={index} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
