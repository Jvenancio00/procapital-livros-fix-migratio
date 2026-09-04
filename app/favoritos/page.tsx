"use client";

import Link from "next/link";
import { ArrowRight, TrendingDown } from "lucide-react";
import { BOOKS } from "@/data/books";
import { useWishlist } from "@/context/WishlistContext";
import { crossSellSuggestions } from "@/lib/cart-pricing";
import BookCard from "@/components/BookCard";

// Corrige "Problema 1 – Valor reduzido" e "Problema 2 – Inteligência" da
// secção Favoritos: mostra quando o preço desceu desde que o livro foi
// guardado, e sugere livros da mesma categoria/autor dos favoritos — em
// vez de guardar e não fazer mais nada com essa informação.
export default function FavoritosPage() {
  const { slugs, priceDropPercent } = useWishlist();
  const favorites = BOOKS.filter((book) => slugs.includes(book.slug));
  const recomendacoes = crossSellSuggestions(
    favorites.map((book) => ({ book, quantity: 1 })),
    4
  );

  return (
    <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
      <h1 className="font-serif text-2xl font-semibold text-ink sm:text-3xl">
        Os meus favoritos
      </h1>

      {favorites.length === 0 ? (
        <div className="mt-10 text-center">
          <p className="text-foreground/60">
            Ainda não guardaste nenhum livro nos favoritos.
          </p>
          <Link
            href="/catalogo"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-cream transition-colors hover:bg-brand-dark"
          >
            Ver catálogo
            <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <>
          <div className="mt-8 grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
            {favorites.map((book, index) => {
              const drop = priceDropPercent(book.slug);
              return (
                <div key={book.slug} className="relative">
                  {drop && (
                    <span className="absolute left-2 top-2 z-10 flex items-center gap-1 rounded-full bg-brand px-2.5 py-1 text-[10px] font-semibold text-cream">
                      <TrendingDown size={11} />
                      -{drop}% desde que guardaste
                    </span>
                  )}
                  <BookCard book={book} index={index} />
                </div>
              );
            })}
          </div>

          {recomendacoes.length > 0 && (
            <div className="mt-16 border-t border-line pt-10">
              <h2 className="font-serif text-lg font-semibold text-ink">
                Baseado nos teus favoritos
              </h2>
              <div className="mt-6 grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
                {recomendacoes.map((book, index) => (
                  <BookCard key={book.slug} book={book} index={index} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
