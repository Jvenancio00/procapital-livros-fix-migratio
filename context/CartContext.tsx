"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Book } from "@/data/books";

export interface CartItem {
  book: Book;
  quantity: number;
}

interface CartContextValue {
  items: CartItem[];
  addItem: (book: Book, quantity?: number) => void;
  removeItem: (slug: string) => void;
  setQuantity: (slug: string, quantity: number) => void;
  clear: () => void;
  subtotalKZ: number;
  discountedSubtotalKZ: number;
  discountPercent: number;
  totalItems: number;
}

// Desconto por volume — corrige "Problema 2 – Não existe lógica
// comercial: descontos por quantidade" da secção Carrinho. Regra simples
// e transparente: mais unidades no carrinho, maior o desconto global.
function quantityDiscountPercent(totalItems: number): number {
  if (totalItems >= 20) return 12;
  if (totalItems >= 10) return 8;
  if (totalItems >= 5) return 4;
  return 0;
}

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "procapital-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- hidratação única do carrinho a partir do localStorage
      if (stored) setItems(JSON.parse(stored));
    } catch {
      // sem carrinho guardado
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // armazenamento indisponível
    }
  }, [items, hydrated]);

  const addItem = (book: Book, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.book.slug === book.slug);
      if (existing) {
        return prev.map((item) =>
          item.book.slug === book.slug
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { book, quantity }];
    });
  };

  const removeItem = (slug: string) => {
    setItems((prev) => prev.filter((item) => item.book.slug !== slug));
  };

  const setQuantity = (slug: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(slug);
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item.book.slug === slug ? { ...item, quantity } : item
      )
    );
  };

  const clear = () => setItems([]);

  const subtotalKZ = items.reduce(
    (sum, item) => sum + item.book.priceKZ * item.quantity,
    0
  );
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const discountPercent = quantityDiscountPercent(totalItems);
  const discountedSubtotalKZ = subtotalKZ * (1 - discountPercent / 100);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        setQuantity,
        clear,
        subtotalKZ,
        discountedSubtotalKZ,
        discountPercent,
        totalItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart deve ser usado dentro de <CartProvider>");
  return ctx;
}
