"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, ShoppingCart, LogOut, FileDown, RefreshCw } from "lucide-react";
import { BOOKS, type Book } from "@/data/books";
import { useClientAuth } from "@/hooks/useClientAuth";
import { useCurrency } from "@/context/CurrencyContext";
import { useCart } from "@/context/CartContext";
import { formatMoney } from "@/lib/currency";
import BookCover from "@/components/BookCover";
import PageHeader from "@/components/PageHeader";

function resolveBookPrice(
  book: Book,
  currency: "MT" | "KZ" | "EUR" | "BRL",
): number {
  if (currency === "KZ") return book.priceKZ;
  if (currency === "EUR") return book.priceEUR;
  if (currency === "BRL") return book.priceBRL;
  return book.price;
}

export default function ClientCatalogPage() {
  const router = useRouter();
  const { session, loading, logout } = useClientAuth();
  const { currency, market } = useCurrency();
  const mainCart = useCart();

  const [catalog, setCatalog] = useState<Book[]>(BOOKS);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("Todos");
  const [cart, setCart] = useState<Array<Book & { quantity: number }>>([]);
  const [lastOrder, setLastOrder] = useState<Array<Book & { quantity: number }> | null>(
    null,
  );

  useEffect(() => {
    if (!loading && !session) {
      router.push("/cliente/login");
    }
  }, [session, loading, router]);

  useEffect(() => {
    let active = true;
    fetch(`/api/livros/pesquisa?pais=${market}&limite=100`)
      .then((res) => (res.ok ? res.json() : null))
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

  useEffect(() => {
    if (!session) return;
    try {
      const stored = localStorage.getItem(`last-order-${session.id}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed.cart) && parsed.cart.length > 0) {
          setLastOrder(parsed.cart);
        }
      }
    } catch {
      // Sem encomenda anterior local
    }
  }, [session]);

  if (loading || !session) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-ink/65">A carregar área comercial B2B…</p>
      </div>
    );
  }

  const categories = [
    "Todos",
    ...Array.from(new Set(catalog.map((b) => b.category))).sort(),
  ];

  const term = search.trim().toLowerCase();
  const filteredBooks = catalog.filter((b) => {
    if (selectedCategory !== "Todos" && b.category !== selectedCategory) {
      return false;
    }
    if (!term) return true;
    return (
      b.title.toLowerCase().includes(term) ||
      b.author.toLowerCase().includes(term) ||
      (b.isbn ?? "").replace(/[-\s]/g, "").includes(term.replace(/[-\s]/g, "")) ||
      (b.editora ?? "").toLowerCase().includes(term)
    );
  });

  const updateQuantity = (book: Book, quantity: number) => {
    setCart((prev) => {
      if (quantity <= 0) return prev.filter((i) => i.slug !== book.slug);
      const existing = prev.find((i) => i.slug === book.slug);
      if (existing) {
        return prev.map((i) => (i.slug === book.slug ? { ...i, quantity } : i));
      }
      return [...prev, { ...book, quantity }];
    });
  };

  const cartTotal = cart.reduce((sum, item) => {
    const unit = resolveBookPrice(item, currency);
    const discounted = unit * (1 - session.discount / 100);
    return sum + discounted * item.quantity;
  }, 0);

  const handleCheckoutOnline = () => {
    for (const item of cart) {
      mainCart.addItem(item, item.quantity);
    }
    router.push("/checkout");
  };

  const handleExportSheet = () => {
    sessionStorage.setItem("client-cart", JSON.stringify(cart));
    router.push("/cliente/encomenda");
  };

  return (
    <main>
      <PageHeader
        eyebrow={`Portal B2B · ${session.company}`}
        title="Encomenda Rápida por Volume"
        description={`Condição comercial configurada na sua conta: ${session.discount}% de desconto B2B sobre preços oficiais confirmados.`}
      />

      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="relative min-w-[260px] flex-1">
            <Search
              size={16}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink/45"
            />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filtrar rapidamente por ISBN, título, autor ou editora…"
              className="w-full rounded-full border border-line bg-white py-2.5 pl-10 pr-4 text-xs text-ink"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {lastOrder && cart.length === 0 && (
              <button
                type="button"
                onClick={() => setCart(lastOrder)}
                className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-4 py-2 text-xs font-semibold text-ink hover:border-brand/40"
              >
                <RefreshCw size={13} />
                <span>Carregar última nota ({lastOrder.length})</span>
              </button>
            )}
            <a
              href={`/api/catalogo/pdf?pais=${market}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-4 py-2 text-xs font-semibold text-ink hover:border-brand/40"
            >
              <FileDown size={13} />
              <span>Catálogo PDF ({market})</span>
            </a>
            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-1.5 rounded-full border border-line px-4 py-2 text-xs font-semibold text-ink/70 hover:text-ink"
            >
              <LogOut size={13} />
              <span>Terminar sessão</span>
            </button>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                selectedCategory === cat
                  ? "bg-ink text-white"
                  : "border border-line bg-white text-ink/75 hover:border-ink/30"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
          <div className="overflow-x-auto rounded-2xl border border-line bg-white">
            <table className="w-full min-w-[680px] text-left text-xs">
              <thead className="border-b border-line bg-cream/70 uppercase text-ink/60">
                <tr>
                  <th className="px-4 py-3">Obra / Editora</th>
                  <th className="px-4 py-3">ISBN</th>
                  <th className="px-4 py-3">Stock</th>
                  <th className="px-4 py-3">Preço Líquido ({currency})</th>
                  <th className="px-4 py-3 text-right">Qtd.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/70">
                {filteredBooks.map((book) => {
                  const inCart =
                    cart.find((i) => i.slug === book.slug)?.quantity ?? 0;
                  const baseUnit = resolveBookPrice(book, currency);
                  const netUnit =
                    baseUnit > 0 ? baseUnit * (1 - session.discount / 100) : null;
                  const availableUnits = book.stockByMarket?.[market];

                  return (
                    <tr key={book.slug} className="hover:bg-cream/40">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-9 shrink-0 overflow-hidden rounded border border-line">
                            <BookCover book={book} sizes="36px" />
                          </div>
                          <div>
                            <p className="font-serif font-semibold text-ink">
                              {book.title}
                            </p>
                            <p className="text-[11px] text-ink/55">
                              {book.author}
                              {book.editora ? ` · ${book.editora}` : ""}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px] text-ink/75">
                        {book.isbn ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-ink/80">
                          {availableUnits != null
                            ? `${availableUnits} un.`
                            : "Sob consulta"}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-ink">
                        {netUnit != null
                          ? formatMoney(netUnit, currency)
                          : "Sob cotação"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <input
                          type="number"
                          min={0}
                          max={999}
                          value={inCart || ""}
                          placeholder="0"
                          onChange={(e) =>
                            updateQuantity(book, Number(e.target.value || 0))
                          }
                          className="w-20 rounded-xl border border-line px-2.5 py-1.5 text-right font-semibold text-ink"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <aside className="h-fit rounded-2xl border border-line bg-white p-6">
            <div className="flex items-center gap-2">
              <ShoppingCart size={17} className="text-brand" />
              <h2 className="font-serif text-lg font-semibold text-ink">
                Nota de Encomenda ({cart.reduce((s, i) => s + i.quantity, 0)} un.)
              </h2>
            </div>

            {cart.length === 0 ? (
              <p className="mt-4 text-xs text-ink/60">
                Indique as quantidades pretendidas na tabela ao lado para compor
                rapidamente o seu pedido institucional ou de livraria.
              </p>
            ) : (
              <>
                <ul className="mt-4 max-h-64 divide-y divide-line overflow-y-auto text-xs">
                  {cart.map((item) => (
                    <li
                      key={item.slug}
                      className="flex items-center justify-between gap-2 py-2"
                    >
                      <span className="line-clamp-1 font-medium text-ink">
                        {item.quantity}× {item.title}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item, 0)}
                        className="text-brand hover:underline"
                      >
                        Remover
                      </button>
                    </li>
                  ))}
                </ul>

                <div className="mt-4 border-t border-line pt-4">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-ink/65">Total Estimado:</span>
                    <span className="font-serif text-lg font-bold text-ink">
                      {formatMoney(cartTotal, currency)}
                    </span>
                  </div>

                  <div className="mt-4 space-y-2">
                    <button
                      type="button"
                      onClick={handleCheckoutOnline}
                      className="w-full rounded-full bg-brand py-2.5 text-xs font-semibold text-white hover:bg-brand-dark"
                    >
                      Finalizar no Checkout Oficial →
                    </button>
                    <button
                      type="button"
                      onClick={handleExportSheet}
                      className="w-full rounded-full border border-line py-2 text-xs font-semibold text-ink hover:border-brand/40"
                    >
                      Exportar Nota (PDF / Excel / Word)
                    </button>
                  </div>
                </div>
              </>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}
