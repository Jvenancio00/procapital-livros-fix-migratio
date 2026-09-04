"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Currency } from "@/lib/currency";

interface CurrencyContextValue {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null);
const STORAGE_KEY = "procapital-currency";

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>("KZ");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as Currency | null;
      // eslint-disable-next-line react-hooks/set-state-in-effect -- hidratação única da preferência de moeda a partir do localStorage
      if (stored) setCurrencyState(stored);
    } catch {
      // sem preferência guardada
    }
  }, []);

  const setCurrency = (value: Currency) => {
    setCurrencyState(value);
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {
      // armazenamento indisponível
    }
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency deve ser usado dentro de <CurrencyProvider>");
  return ctx;
}
