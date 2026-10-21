"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Heart, TrendingDown } from "lucide-react";
import { BOOKS, type Book } from "@/data/books";
import { useWishlist } from "@/context/WishlistContext";
import { useCurrency } from "@/context/CurrencyContext";
import { crossSellSuggestions } from "@/lib/cart-pricing";
import BookCard from "@/components/BookCard";
import PageHeader from "@/components/PageHeader";

export default function FavoritosPage() {
  const { slugs, priceDropPercent } = useWishlist();
  const { market } = useCurrency();
  const [catalog, setCatalog] = useState<Book[]>(BOOKS);

  useEffect(() => {
    let active = true;
    fetch(`/api/livros/pesquisa?pais=${market}&limite=100`)
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (active && json && Array.isArray(json.items) && json.items.length > 0) {
          setCatalog(json.items);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [market]);

  const favorites = catalog.filter((book) => slugs.includes(book.slug));
  const recomendacoes = crossSellSuggestions(
    favorites.map((book) => ({ book, quantity: 1 })),
    4,
  );

  return (
    <main>
      <PageHeader
        eyebrow="Seleção Guardada"
        title="Os Meus Favoritos"
        description="Obras guardadas para consulta rápida, comparação de disponibilidade por mercado ou adição direta ao carrinho e cotações."
      />

      <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
        {favorites.length === 0 ? (
          <div className="rounded-2xl border border-line bg-white p-12 text-center">
            <Heart size={30} className="mx-auto text-ink/30" />
            <p className="mt-4 text-sm text-ink/65">
              Ainda não guardou nenhum título na sua lista de favoritos.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                href="/catalogo"
                className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-xs font-semibold text-white transition-colors hover:bg-brand-dark"
              >
                <span>Explorar catálogo</span>
                <ArrowRight size={15} />
              </Link>
              <Link
                href="/livros-escolares"
                className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-6 py-3 text-xs font-semibold text-ink hover:border-brand/40"
              >
                <span>Ver livros escolares</span>
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {favorites.map((book, index) => {
                const drop = priceDropPercent(book.slug);
                return (
                  <div key={book.slug} className="relative">
                    {drop && (
                      <span className="absolute left-2.5 top-2.5 z-10 flex items-center gap-1 rounded-full bg-brand px-2.5 py-1 text-[10px] font-semibold text-white">
                        <TrendingDown size={11} />-{drop}%
                      </span>
                    )}
                    <BookCard book={book} index={index} />
                  </div>
                );
              })}
            </div>

            {recomendacoes.length > 0 && (
              <section className="mt-16 border-t border-line pt-12">
                <h2 className="font-serif text-xl font-semibold text-ink">
                  Títulos Relacionados no Acervo
                </h2>
                <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {recomendacoes.map((book, index) => (
                    <BookCard key={book.slug} book={book} index={index} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </main>
  );
}
