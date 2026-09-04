"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BOOKS } from "@/data/books";
import { useClientAuth } from "@/hooks/useClientAuth";
import { ShoppingCart, LogOut } from "lucide-react";
import type { Book } from "@/data/books";

export default function ClientCatalogPage() {
  const router = useRouter();
  const { session, loading, logout } = useClientAuth();
  const [cart, setCart] = useState<Array<Book & { quantity: number }>>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("Todos");
  const [lastOrder, setLastOrder] = useState<Array<Book & { quantity: number }> | null>(null);

  useEffect(() => {
    if (!loading && !session) {
      router.push("/cliente/login");
    }
  }, [session, loading, router]);

  useEffect(() => {
    if (!session) return;
    try {
      const stored = localStorage.getItem(`last-order-${session.id}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed.cart) && parsed.cart.length > 0) {
          // eslint-disable-next-line react-hooks/set-state-in-effect -- hidratação única de dados do localStorage no cliente
          setLastOrder(parsed.cart);
        }
      }
    } catch {
      // Sem encomenda anterior guardada
    }
  }, [session]);

  if (loading || !session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand mx-auto mb-4" />
          <p className="text-foreground/60">A carregar...</p>
        </div>
      </div>
    );
  }

  const categories = ["Todos", "Escolar", "Ficção", "Infantil", "Não-ficção"];
  const filteredBooks =
    selectedCategory === "Todos" ? BOOKS : BOOKS.filter((b) => b.category === selectedCategory);

  const addToCart = (book: Book) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.slug === book.slug);
      if (existing) {
        return prev.map((item) =>
          item.slug === book.slug ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...book, quantity: 1 }];
    });
  };

  const removeFromCart = (slug: string) => {
    setCart((prev) => prev.filter((item) => item.slug !== slug));
  };

  const repeatLastOrder = () => {
    if (lastOrder) {
      setCart(lastOrder);
    }
  };

  const updateQuantity = (slug: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(slug);
    } else {
      setCart((prev) =>
        prev.map((item) => (item.slug === slug ? { ...item, quantity } : item))
      );
    }
  };

  const cartTotal = cart.reduce((sum, item) => {
    const originalPrice = item.price;
    const discountedPrice = originalPrice * (1 - session.discount / 100);
    return sum + discountedPrice * item.quantity;
  }, 0);

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <div className="bg-white border-b border-brand/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-serif font-bold text-ink">{session.company}</h1>
            <p className="text-sm text-foreground/60">
              Desconto aplicado: <span className="font-semibold text-brand">{session.discount}%</span>
            </p>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 text-foreground/60 hover:text-ink hover:bg-cream rounded-lg transition-colors"
          >
            <LogOut size={18} />
            <span className="text-sm font-medium">Sair</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {lastOrder && cart.length === 0 && (
          <div className="mb-8 flex flex-col gap-3 rounded-xl border border-brand/20 bg-brand/5 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-ink">Encomenda expresso</p>
              <p className="text-sm text-foreground/60">
                Tem uma encomenda anterior com {lastOrder.length}{" "}
                {lastOrder.length === 1 ? "artigo" : "artigos"}. Repita-a com um clique.
              </p>
            </div>
            <button
              onClick={repeatLastOrder}
              className="shrink-0 rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
            >
              Repetir última encomenda
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Catálogo */}
          <div className="lg:col-span-3">
            {/* Filtros */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-ink mb-4">Categorias</h2>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      selectedCategory === cat
                        ? "bg-brand text-white"
                        : "bg-white text-ink border border-brand/20 hover:border-brand"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid de livros */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {filteredBooks.map((book) => {
                const originalPrice = book.price;
                const discountedPrice = originalPrice * (1 - session.discount / 100);
                const savings = originalPrice - discountedPrice;

                return (
                  <div key={book.slug} className="bg-white rounded-xl border border-cream p-6">
                    {/* Capa placeholder */}
                    <div className="w-full h-40 bg-gradient-to-br from-wine via-brand to-accent rounded-lg mb-4" />

                    <h3 className="font-semibold text-ink mb-1">{book.title}</h3>
                    <p className="text-sm text-foreground/60 mb-4">{book.author}</p>

                    {/* Preços */}
                    <div className="mb-4 p-3 bg-cream rounded-lg">
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-2xl font-bold text-brand">
                          {discountedPrice.toFixed(2)} MT
                        </span>
                        <span className="text-sm text-foreground/50 line-through">
                          {originalPrice} MT
                        </span>
                      </div>
                      <p className="text-xs text-green-600 font-medium">
                        Economia: {savings.toFixed(2)} MT ({session.discount}%)
                      </p>
                    </div>

                    <button
                      onClick={() => addToCart(book)}
                      className="w-full bg-brand hover:bg-brand-dark text-white font-medium py-2 rounded-lg transition-colors"
                    >
                      Adicionar ao Carrinho
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Carrinho */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-cream p-6 sticky top-24">
              <div className="flex items-center gap-2 mb-6">
                <ShoppingCart size={20} className="text-brand" />
                <h2 className="font-semibold text-ink">Carrinho</h2>
                <span className="ml-auto bg-brand text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
                  {cart.length}
                </span>
              </div>

              {cart.length === 0 ? (
                <p className="text-sm text-foreground/60">Carrinho vazio</p>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => {
                    const discountedPrice = item.price * (1 - session.discount / 100);
                    return (
                      <div key={item.slug} className="border-b border-cream/50 pb-4">
                        <p className="text-sm font-medium text-ink mb-2">{item.title}</p>
                        <div className="flex items-center gap-2 mb-2">
                          <button
                            onClick={() => updateQuantity(item.slug, item.quantity - 1)}
                            className="px-2 py-1 text-xs bg-cream hover:bg-brand/10 rounded"
                          >
                            −
                          </button>
                          <span className="text-sm font-semibold flex-1 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.slug, item.quantity + 1)}
                            className="px-2 py-1 text-xs bg-cream hover:bg-brand/10 rounded"
                          >
                            +
                          </button>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-foreground/60">
                            {(discountedPrice * item.quantity).toFixed(2)} MT
                          </span>
                          <button
                            onClick={() => removeFromCart(item.slug)}
                            className="text-red-600 hover:text-red-700 text-xs font-medium"
                          >
                            Remover
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  <div className="pt-4 space-y-3">
                    <div className="flex justify-between font-semibold text-ink">
                      <span>Total:</span>
                      <span className="text-xl text-brand">{cartTotal.toFixed(2)} MT</span>
                    </div>
                    <button
                      onClick={() => {
                        sessionStorage.setItem("client-cart", JSON.stringify(cart));
                        router.push("/cliente/encomenda");
                      }}
                      disabled={cart.length === 0}
                      className="w-full bg-brand hover:bg-brand-dark text-white font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Gerar Encomenda
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
