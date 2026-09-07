"use client";

import {
  createContext,
  startTransition,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { BOOKS } from "@/data/books";

interface WishlistEntry {
  addedAt: string;
  priceKZAtSave: number;
}

interface WishlistContextValue {
  slugs: string[];
  toggle: (slug: string) => void;
  isFavorite: (slug: string) => boolean;
  // Corrige "Problema 1 – Valor reduzido" da secção Favoritos: dá para
  // saber se o preço desceu desde que o livro foi guardado.
  priceDropPercent: (slug: string) => number | null;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);
const STORAGE_KEY = "procapital-wishlist";

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<Record<string, WishlistEntry>>({});
  const [hydrated, setHydrated] = useState(false);

  // O localStorage só existe no browser, por isso a leitura tem de ficar
  // num efeito (o servidor renderiza sempre a lista vazia). Fazemos uma
  // única atualização de estado com o resultado já normalizado, em vez de
  // vários setState encadeados.
  useEffect(() => {
    function readStoredEntries(): Record<string, WishlistEntry> {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return {};
        const parsed: unknown = JSON.parse(stored);

        // Formato antigo (apenas uma lista de slugs) — migra sem preço de
        // referência, para que o alerta de descida de preço só comece a
        // contar a partir de agora.
        if (Array.isArray(parsed)) {
          const migrated: Record<string, WishlistEntry> = {};
          for (const slug of parsed) {
            migrated[String(slug)] = {
              addedAt: new Date().toISOString(),
              priceKZAtSave: 0,
            };
          }
          return migrated;
        }

        if (parsed && typeof parsed === "object") {
          return parsed as Record<string, WishlistEntry>;
        }
      } catch {
        // sem favoritos guardados ou armazenamento indisponível
      }
      return {};
    }

    const stored = readStoredEntries();
    startTransition(() => {
      setEntries(stored);
      setHydrated(true);
    });
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch {
      // armazenamento indisponível
    }
  }, [entries, hydrated]);

  const toggle = (slug: string) => {
    setEntries((prev) => {
      if (prev[slug]) {
        const rest = { ...prev };
        delete rest[slug];
        return rest;
      }
      const book = BOOKS.find((b) => b.slug === slug);
      return {
        ...prev,
        [slug]: { addedAt: new Date().toISOString(), priceKZAtSave: book?.priceKZ ?? 0 },
      };
    });
  };

  const isFavorite = (slug: string) => Boolean(entries[slug]);

  const priceDropPercent = (slug: string) => {
    const entry = entries[slug];
    const book = BOOKS.find((b) => b.slug === slug);
    if (!entry || !book || !entry.priceKZAtSave) return null;
    const diff = entry.priceKZAtSave - book.priceKZ;
    if (diff <= 0) return null;
    return Math.round((diff / entry.priceKZAtSave) * 100);
  };

  return (
    <WishlistContext.Provider
      value={{ slugs: Object.keys(entries), toggle, isFavorite, priceDropPercent }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist deve ser usado dentro de <WishlistProvider>");
  return ctx;
}
